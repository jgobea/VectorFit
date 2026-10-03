import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildExerciseSeed } from './seed';
import { TABLES, uuid, type Row } from './schema';

// Tiny in-process Postgres stand-in: every table lives in memory and is
// mirrored to AsyncStorage (one key per table), so data survives app restarts
// with no network at all. Supports exactly the PostgREST query surface this
// app uses — see QueryBuilder below.

const KEY_PREFIX = 'vectorfit-local-db:';

const data: Record<string, Row[]> = {};
const dirty = new Set<string>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;

export interface DbError {
  message: string;
  code: string;
  details: string | null;
  hint: string | null;
}

function dbError(message: string, code: string): DbError {
  return { message, code, details: null, hint: null };
}

function persistSoon(table: string) {
  dirty.add(table);
  if (persistTimer) return;
  persistTimer = setTimeout(flush, 80);
}

async function flush() {
  persistTimer = null;
  const tables = [...dirty];
  dirty.clear();
  await Promise.all(
    tables.map((t) => AsyncStorage.setItem(KEY_PREFIX + t, JSON.stringify(data[t])).catch(() => undefined))
  );
}

export const dbReady: Promise<void> = (async () => {
  const names = Object.keys(TABLES);
  const entries = await AsyncStorage.multiGet(names.map((n) => KEY_PREFIX + n));
  for (const [i, name] of names.entries()) {
    const raw = entries[i][1];
    try {
      data[name] = raw ? JSON.parse(raw) : [];
    } catch {
      data[name] = [];
    }
  }
  // First launch: the shared exercise catalog (no created_by).
  if (!entries[names.indexOf('exercises')][1]) {
    data.exercises = buildExerciseSeed();
    persistSoon('exercises');
  }
})();

// ---------------------------------------------------------------------------
// Current user — only used to mimic the exercises RLS policy (shared
// catalog + the signed-in user's own custom exercises).
// ---------------------------------------------------------------------------
let currentUserId: string | null = null;
export function setCurrentUserId(id: string | null) {
  currentUserId = id;
}

// ---------------------------------------------------------------------------
// Direct helpers used by the auth shim (bypass the query builder).
// ---------------------------------------------------------------------------
export function insertRow(table: string, row: Row): Row {
  const def = TABLES[table];
  const full = { ...def.defaults(), ...row };
  data[table].push(full);
  persistSoon(table);
  return full;
}

export function deleteWhere(table: string, pred: (row: Row) => boolean): Row[] {
  const removed = data[table].filter(pred);
  if (removed.length === 0) return removed;
  data[table] = data[table].filter((r) => !pred(r));
  persistSoon(table);
  const ids = new Set(removed.map((r) => r.id));
  // ON DELETE CASCADE
  for (const [childName, child] of Object.entries(TABLES)) {
    for (const [col, fk] of Object.entries(child.fks)) {
      if (fk.table === table && fk.onDelete === 'cascade') {
        deleteWhere(childName, (r) => ids.has(r[col]));
      }
    }
  }
  return removed;
}

export function findRow(table: string, pred: (row: Row) => boolean): Row | undefined {
  return data[table].find(pred);
}

// ---------------------------------------------------------------------------
// select() string parsing: "*", "a, b", "*, alias:table ( ... )" — nested.
// ---------------------------------------------------------------------------
interface SelectNode {
  star: boolean;
  cols: string[];
  embeds: { alias: string; table: string; node: SelectNode }[];
}

function splitTop(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseSelect(s: string | undefined): SelectNode {
  const node: SelectNode = { star: false, cols: [], embeds: [] };
  if (!s || !s.trim()) {
    node.star = true;
    return node;
  }
  for (const part of splitTop(s)) {
    const open = part.indexOf('(');
    if (open === -1) {
      if (part === '*') node.star = true;
      else node.cols.push(part);
      continue;
    }
    const head = part.slice(0, open).trim();
    const inner = part.slice(open + 1, part.lastIndexOf(')'));
    const [alias, table] = head.includes(':') ? head.split(':').map((x) => x.trim()) : [head, head];
    node.embeds.push({ alias, table: table.replace(/!.*$/, ''), node: parseSelect(inner) });
  }
  return node;
}

function visibleRows(table: string): Row[] {
  if (table === 'exercises') {
    return data.exercises.filter((e) => e.created_by == null || e.created_by === currentUserId);
  }
  return data[table];
}

function project(table: string, row: Row, node: SelectNode): Row {
  const out: Row = node.star ? { ...row } : {};
  for (const c of node.cols) out[c] = row[c] ?? null;
  for (const embed of node.embeds) {
    const childDef = TABLES[embed.table];
    const parentDef = TABLES[table];
    const reverseCol = Object.entries(childDef.fks).find(([, fk]) => fk.table === table)?.[0];
    if (reverseCol) {
      // one-to-many: children pointing at this row
      out[embed.alias] = visibleRows(embed.table)
        .filter((c) => c[reverseCol] === row.id)
        .map((c) => project(embed.table, c, embed.node));
      continue;
    }
    const forwardCol = Object.entries(parentDef.fks).find(([, fk]) => fk.table === embed.table)?.[0];
    if (forwardCol) {
      const target = visibleRows(embed.table).find((c) => c.id === row[forwardCol]);
      out[embed.alias] = target ? project(embed.table, target, embed.node) : null;
    } else {
      out[embed.alias] = null;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Query builder
// ---------------------------------------------------------------------------
type Filter = (row: Row) => boolean;

function cmp(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // Postgres: NULLs sort last ascending
  if (b == null) return -1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

type Op = 'select' | 'insert' | 'update' | 'delete' | 'upsert';

class QueryBuilder<T = any[]> implements PromiseLike<{ data: T | null; error: DbError | null }> {
  private op: Op = 'select';
  private payload: Row | Row[] | null = null;
  private filters: Filter[] = [];
  private orders: { col: string; ascending: boolean }[] = [];
  private limitN: number | null = null;
  private selectStr: string | undefined;
  private returning = true; // plain select() always returns rows
  private mode: 'many' | 'single' | 'maybeSingle' = 'many';
  private onConflict: string[] | null = null;

  constructor(private table: string) {
    if (!TABLES[table]) throw new Error(`Unknown local table "${table}"`);
  }

  select(columns?: string) {
    this.selectStr = columns;
    this.returning = true;
    return this;
  }
  insert(values: Row | Row[]) {
    this.op = 'insert';
    this.payload = values;
    this.returning = false;
    return this;
  }
  upsert(values: Row | Row[], options?: { onConflict?: string }) {
    this.op = 'upsert';
    this.payload = values;
    this.returning = false;
    this.onConflict = options?.onConflict ? options.onConflict.split(',').map((c) => c.trim()) : null;
    return this;
  }
  update(values: Row) {
    this.op = 'update';
    this.payload = values;
    this.returning = false;
    return this;
  }
  delete() {
    this.op = 'delete';
    this.returning = false;
    return this;
  }

  eq(col: string, value: any) {
    this.filters.push((r) => r[col] === value);
    return this;
  }
  neq(col: string, value: any) {
    this.filters.push((r) => r[col] !== value);
    return this;
  }
  gt(col: string, value: any) {
    this.filters.push((r) => r[col] != null && r[col] > value);
    return this;
  }
  gte(col: string, value: any) {
    this.filters.push((r) => r[col] != null && r[col] >= value);
    return this;
  }
  lt(col: string, value: any) {
    this.filters.push((r) => r[col] != null && r[col] < value);
    return this;
  }
  lte(col: string, value: any) {
    this.filters.push((r) => r[col] != null && r[col] <= value);
    return this;
  }
  in(col: string, values: any[]) {
    this.filters.push((r) => values.includes(r[col]));
    return this;
  }
  is(col: string, value: null | boolean) {
    this.filters.push((r) => (value === null ? r[col] == null : r[col] === value));
    return this;
  }
  not(col: string, operator: string, value: any) {
    if (operator === 'is') this.filters.push((r) => (value === null ? r[col] != null : r[col] !== value));
    else if (operator === 'eq') this.filters.push((r) => r[col] !== value);
    else if (operator === 'in') this.filters.push((r) => !value.includes(r[col]));
    else throw new Error(`Local DB: not(${operator}) is not supported`);
    return this;
  }
  order(col: string, options?: { ascending?: boolean }) {
    this.orders.push({ col, ascending: options?.ascending !== false });
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single(): QueryBuilder<any> {
    this.mode = 'single';
    return this as unknown as QueryBuilder<any>;
  }
  maybeSingle(): QueryBuilder<any> {
    this.mode = 'maybeSingle';
    return this as unknown as QueryBuilder<any>;
  }

  then<R1 = { data: T | null; error: DbError | null }, R2 = never>(
    onfulfilled?: ((value: { data: T | null; error: DbError | null }) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2> {
    return (this.execute() as Promise<{ data: T | null; error: DbError | null }>).then(onfulfilled, onrejected);
  }

  private matches(): Row[] {
    const base = this.op === 'select' ? visibleRows(this.table) : data[this.table];
    return base.filter((r) => this.filters.every((f) => f(r)));
  }

  private checkUnique(candidate: Row, ignore?: Row): DbError | null {
    for (const cols of TABLES[this.table].unique) {
      const clash = data[this.table].find((r) => r !== ignore && cols.every((c) => r[c] === candidate[c]));
      if (clash) {
        return dbError(
          `duplicate key value violates unique constraint "${this.table}_${cols.join('_')}_key"`,
          '23505'
        );
      }
    }
    return null;
  }

  private checkConstraints(row: Row): DbError | null {
    if (this.table === 'routine_exercises' && row.sets != null && row.sets <= 0) {
      return dbError('new row violates check constraint "routine_exercises_sets_positive"', '23514');
    }
    if (this.table === 'exercises' && row.measurement_type !== 'time' && row.time_mode != null) {
      return dbError('new row violates check constraint "exercises_time_mode_only_when_time"', '23514');
    }
    return null;
  }

  private shape(rows: Row[]): { data: any; error: DbError | null } {
    const node = parseSelect(this.selectStr);
    const projected = rows.map((r) => project(this.table, r, node));
    if (this.mode === 'many') return { data: projected, error: null };
    if (projected.length === 1) return { data: projected[0], error: null };
    if (projected.length === 0 && this.mode === 'maybeSingle') return { data: null, error: null };
    return {
      data: null,
      error: dbError('JSON object requested, multiple (or no) rows returned', 'PGRST116'),
    };
  }

  private async execute(): Promise<{ data: any; error: DbError | null }> {
    await dbReady;
    try {
      return this.run();
    } catch (err) {
      return { data: null, error: dbError(err instanceof Error ? err.message : String(err), 'LOCAL') };
    }
  }

  private run(): { data: any; error: DbError | null } {
    const def = TABLES[this.table];
    const fail = (error: DbError) => ({ data: null, error });

    if (this.op === 'select') {
      let rows = this.matches();
      if (this.orders.length) {
        rows = [...rows].sort((a, b) => {
          for (const { col, ascending } of this.orders) {
            const c = cmp(a[col], b[col]);
            if (c !== 0) return ascending ? c : -c;
          }
          return 0;
        });
      }
      if (this.limitN != null) rows = rows.slice(0, this.limitN);
      return this.shape(rows);
    }

    if (this.op === 'insert' || this.op === 'upsert') {
      const incoming = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      const written: Row[] = [];
      for (const raw of incoming) {
        const conflictCols = this.onConflict ?? ['id'];
        const existing =
          this.op === 'upsert' && conflictCols.every((c) => raw[c] !== undefined)
            ? data[this.table].find((r) => conflictCols.every((c) => r[c] === raw[c]))
            : undefined;

        if (existing) {
          Object.assign(existing, raw);
          written.push(existing);
          continue;
        }

        const row = { ...def.defaults(), ...raw };
        for (const [col, fk] of Object.entries(def.fks)) {
          if (col === 'created_by') continue; // nullable
          if (row[col] == null) return fail(dbError(`null value in column "${col}" violates not-null constraint`, '23502'));
          if (!data[fk.table].some((r) => r.id === row[col])) {
            return fail(dbError(`insert on "${this.table}" violates foreign key constraint on "${col}"`, '23503'));
          }
        }
        const bad = this.checkConstraints(row) ?? this.checkUnique(row);
        if (bad) return fail(bad);
        data[this.table].push(row);
        written.push(row);
      }
      persistSoon(this.table);
      return this.returning ? this.shape(written) : { data: null, error: null };
    }

    if (this.op === 'update') {
      const targets = this.matches();
      const patch = this.payload as Row;
      for (const row of targets) {
        const next = { ...row, ...patch };
        if (def.touchOnUpdate) next[def.touchOnUpdate] = new Date().toISOString();
        const bad = this.checkConstraints(next) ?? this.checkUnique(next, row);
        if (bad) return fail(bad);
      }
      for (const row of targets) {
        Object.assign(row, patch);
        if (def.touchOnUpdate) row[def.touchOnUpdate] = new Date().toISOString();
      }
      if (targets.length) persistSoon(this.table);
      return this.returning ? this.shape(targets) : { data: null, error: null };
    }

    // delete
    const targets = this.matches();
    const ids = new Set(targets.map((r) => r.id));
    for (const [childName, child] of Object.entries(TABLES)) {
      for (const [col, fk] of Object.entries(child.fks)) {
        if (fk.table === this.table && fk.onDelete === 'restrict' && data[childName].some((r) => ids.has(r[col]))) {
          return fail(
            dbError(
              `update or delete on table "${this.table}" violates foreign key constraint on table "${childName}"`,
              '23503'
            )
          );
        }
      }
    }
    deleteWhere(this.table, (r) => ids.has(r.id));
    return this.returning ? this.shape(targets) : { data: null, error: null };
  }
}

export function from(table: string) {
  return new QueryBuilder(table);
}

export { uuid };
