import AsyncStorage from '@react-native-async-storage/async-storage';

import { dbReady, deleteWhere, findRow, insertRow, setCurrentUserId, uuid } from './db';

// Offline stand-in for supabase.auth. Accounts live on the device only.
// Passwords are stored as typed: this build never leaves the phone and exists
// for offline demos, so there is nothing to protect them from.

const USERS_KEY = 'vectorfit-local-auth:users';
const SESSION_KEY = 'vectorfit-local-auth:session';

export const DEMO_EMAIL = 'demo@vectorfit.app';
export const DEMO_PASSWORD = 'demo123';

interface AuthUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
  user_metadata: Record<string, unknown>;
}

export interface LocalSession {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    aud: 'authenticated';
    role: 'authenticated';
    app_metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
    created_at: string;
  };
}

type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED';
type Listener = (event: AuthEvent, session: LocalSession | null) => void;

interface AuthError {
  message: string;
  name: string;
  status: number;
}

const authError = (message: string, status = 400): AuthError => ({ message, name: 'AuthApiError', status });

let users: AuthUser[] = [];
let currentId: string | null = null;
const listeners = new Set<Listener>();

const saveUsers = () => AsyncStorage.setItem(USERS_KEY, JSON.stringify(users)).catch(() => undefined);
const saveSession = () =>
  (currentId ? AsyncStorage.setItem(SESSION_KEY, currentId) : AsyncStorage.removeItem(SESSION_KEY)).catch(
    () => undefined
  );

function toSession(user: AuthUser): LocalSession {
  return {
    access_token: `local.${user.id}`,
    refresh_token: `local.${user.id}`,
    token_type: 'bearer',
    expires_in: 3600 * 24 * 365,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
    user: {
      id: user.id,
      email: user.email,
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: user.user_metadata,
      created_at: user.created_at,
    },
  };
}

function currentSession(): LocalSession | null {
  const user = users.find((u) => u.id === currentId);
  return user ? toSession(user) : null;
}

function emit(event: AuthEvent) {
  const session = currentSession();
  listeners.forEach((l) => l(event, session));
}

// Mirrors the on_auth_user_created trigger (handle_new_user): every new auth
// user gets a matching public.users profile row.
function createProfile(user: AuthUser) {
  insertRow('users', {
    id: user.id,
    full_name: (user.user_metadata.full_name as string) ?? null,
    avatar_url: null,
  });
}

const ready: Promise<void> = (async () => {
  await dbReady;
  const [[, rawUsers], [, rawSession]] = await AsyncStorage.multiGet([USERS_KEY, SESSION_KEY]);
  try {
    users = rawUsers ? JSON.parse(rawUsers) : [];
  } catch {
    users = [];
  }

  // Ready-made account so the app can be shown without going through
  // sign-up and onboarding first.
  if (!users.some((u) => u.email === DEMO_EMAIL)) {
    const demo: AuthUser = {
      id: uuid(),
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      created_at: new Date().toISOString(),
      user_metadata: { full_name: 'Demo User' },
    };
    users.push(demo);
    createProfile(demo);
    const profile = findRow('users', (r) => r.id === demo.id);
    if (profile) {
      Object.assign(profile, {
        age: 25,
        gender: 'other',
        height_cm: 175,
        weight_kg: 70,
        primary_goal: 'general_fitness',
        experience_level: 'intermediate',
        workout_frequency_days: 4,
        onboarding_completed: true,
      });
    }
    void saveUsers();
  }

  currentId = rawSession && users.some((u) => u.id === rawSession) ? rawSession : null;
  setCurrentUserId(currentId);
})();

export const auth = {
  async getSession() {
    await ready;
    return { data: { session: currentSession() }, error: null };
  },

  onAuthStateChange(callback: Listener) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners.delete(callback);
          },
        },
      },
    };
  },

  async signUp({ email, password }: { email: string; password: string }) {
    await ready;
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      return { data: { user: null, session: null }, error: authError('User already registered', 422) };
    }
    const user: AuthUser = {
      id: uuid(),
      email: normalized,
      password,
      created_at: new Date().toISOString(),
      user_metadata: {},
    };
    users.push(user);
    createProfile(user);
    await saveUsers();
    // Same as production, where email confirmation was off: signing up
    // also signs you in.
    currentId = user.id;
    setCurrentUserId(currentId);
    await saveSession();
    emit('SIGNED_IN');
    return { data: { user: currentSession()!.user, session: currentSession() }, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await ready;
    const normalized = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalized && u.password === password);
    if (!user) {
      return { data: { user: null, session: null }, error: authError('Invalid login credentials') };
    }
    currentId = user.id;
    setCurrentUserId(currentId);
    await saveSession();
    emit('SIGNED_IN');
    return { data: { user: currentSession()!.user, session: currentSession() }, error: null };
  },

  async signOut() {
    await ready;
    currentId = null;
    setCurrentUserId(null);
    await saveSession();
    emit('SIGNED_OUT');
    return { error: null };
  },

  async updateUser({ password }: { password?: string }) {
    await ready;
    const user = users.find((u) => u.id === currentId);
    if (!user) return { data: { user: null }, error: authError('Not authenticated', 401) };
    if (password) user.password = password;
    await saveUsers();
    emit('USER_UPDATED');
    return { data: { user: currentSession()!.user }, error: null };
  },

  // No mail server offline — pretend the reset email went out.
  async resetPasswordForEmail(_email: string) {
    return { data: {}, error: null as AuthError | null };
  },

  /** Backs functions.invoke('delete-account'). */
  async deleteCurrentUser() {
    await ready;
    if (!currentId) return { error: authError('Not authenticated', 401) };
    const id = currentId;
    deleteWhere('users', (r) => r.id === id); // cascades to every user-owned table
    users = users.filter((u) => u.id !== id);
    await saveUsers();
    return { error: null };
  },
};
