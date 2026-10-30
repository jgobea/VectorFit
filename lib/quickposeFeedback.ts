// QuickPose's live feedback strings are English only, built inside the SDK
// (quickpose-core's PoseFeedback.getDisplayString) from a small grammar:
//   - a fixed body-position sentence ("Stand facing camera"), or
//   - "<Action> <body part>[ <direction>]", where the action is one of
//     Move/Lean/Straighten/Raise/Lower/Place/Bend, the body part a landmark
//     group lowercased ("wholebody", "left arm") or a joint ("left elbow"),
//     and the direction one of up/down/.../into view/into box/on floor.
// This translates that grammar piece by piece. Anything that doesn't parse
// is shown as QuickPose sent it, never dropped.

const BODY_SENTENCES_ES: Record<string, string> = {
  'stand facing camera': 'Ponte de pie de frente a la cámara',
  'sit facing camera': 'Siéntate de frente a la cámara',
  'sit facing camera, with crossed legs': 'Siéntate de frente a la cámara con las piernas cruzadas',
  'stand side on': 'Ponte de pie de lado a la cámara',
  'stand up': 'Ponte de pie',
  'get on floor': 'Ponte en el suelo',
  'get on your front, facing camera': 'Ponte boca abajo, de frente a la cámara',
  'get on your front, side on': 'Ponte boca abajo, de lado a la cámara',
  'get on your back, side on': 'Ponte boca arriba, de lado a la cámara',
};

const ACTIONS_ES: Record<string, string> = {
  move: 'Mueve',
  lean: 'Inclina',
  straighten: 'Endereza',
  raise: 'Sube',
  lower: 'Baja',
  place: 'Coloca',
  bend: 'Dobla',
};

const DIRECTIONS_ES: Record<string, string> = {
  up: 'hacia arriba',
  down: 'hacia abajo',
  left: 'a la izquierda',
  right: 'a la derecha',
  forward: 'hacia adelante',
  back: 'hacia atrás',
  apart: 'hacia afuera',
  'into view': 'dentro del encuadre',
  'into box': 'dentro del recuadro',
  'on floor': 'en el suelo',
};

// Body part without its side, as QuickPose lowercases it (groups have no
// spaces: "wholebody", "armtowrist").
const PARTS_ES: Record<string, { es: string; feminine: boolean }> = {
  wholebody: { es: 'todo el cuerpo', feminine: false },
  wholebodyandhead: { es: 'todo el cuerpo y la cabeza', feminine: false },
  upperbody: { es: 'la parte superior del cuerpo', feminine: true },
  lowerbody: { es: 'la parte inferior del cuerpo', feminine: true },
  straightarmsupperbody: { es: 'la parte superior del cuerpo', feminine: true },
  towristsupperbody: { es: 'la parte superior del cuerpo', feminine: true },
  arms: { es: 'los brazos', feminine: false },
  legs: { es: 'las piernas', feminine: true },
  shoulders: { es: 'los hombros', feminine: false },
  hips: { es: 'la cadera', feminine: true },
  knees: { es: 'las rodillas', feminine: true },
  elbows: { es: 'los codos', feminine: false },
  head: { es: 'la cabeza', feminine: true },
  nose: { es: 'la cabeza', feminine: true },
  arm: { es: 'el brazo', feminine: false },
  armtowrist: { es: 'el brazo', feminine: false },
  armnoelbow: { es: 'el brazo', feminine: false },
  straightarm: { es: 'el brazo', feminine: false },
  leg: { es: 'la pierna', feminine: true },
  hand: { es: 'la mano', feminine: true },
  shoulder: { es: 'el hombro', feminine: false },
  elbow: { es: 'el codo', feminine: false },
  wrist: { es: 'la muñeca', feminine: true },
  hip: { es: 'la cadera', feminine: true },
  knee: { es: 'la rodilla', feminine: true },
  ankle: { es: 'el tobillo', feminine: false },
  heel: { es: 'el talón', feminine: false },
  'foot index': { es: 'el pie', feminine: false },
  footindex: { es: 'el pie', feminine: false },
  'mid hip': { es: 'la cadera', feminine: true },
  midhip: { es: 'la cadera', feminine: true },
  'mid shoulder': { es: 'los hombros', feminine: false },
  midshoulder: { es: 'los hombros', feminine: false },
};

const ACTION_RE = /^(move|lean|straighten|raise|lower|place|bend)\s+(.+?)(?:\s+(up|down|left|right|forward|back|apart|into view|into box|on floor))?$/i;

function translatePart(raw: string): string | null {
  const words = raw.trim().toLowerCase();
  const side = /^(left|right)\s+/.exec(words)?.[1];
  const base = side ? words.slice(side.length).trim() : words;
  const part = PARTS_ES[base] ?? PARTS_ES[base.replace(/\s+/g, '')];
  if (!part) return null;
  if (!side) return part.es;
  const adjective = side === 'left' ? (part.feminine ? 'izquierda' : 'izquierdo') : part.feminine ? 'derecha' : 'derecho';
  return `${part.es} ${adjective}`;
}

function toSpanish(text: string): string | null {
  const sentence = BODY_SENTENCES_ES[text.trim().toLowerCase()];
  if (sentence) return sentence;

  const match = ACTION_RE.exec(text.trim());
  if (!match) return null;
  const [, action, partRaw, direction] = match;
  const part = translatePart(partRaw);
  if (!part) return null;
  const dir = direction?.toLowerCase();

  // Getting a body part into the camera's view reads naturally as "put it
  // in frame", not "move it into the frame".
  if (dir === 'into view') return `Pon ${part} dentro del encuadre`;
  if (dir === 'into box') return `Pon ${part} dentro del recuadro`;
  if (dir === 'on floor') return `Apoya ${part} en el suelo`;

  const verb = ACTIONS_ES[action.toLowerCase()];
  return dir ? `${verb} ${part} ${DIRECTIONS_ES[dir]}` : `${verb} ${part}`;
}

/** QuickPose feedback in the app's UI language (English passes through). */
export function translateQuickPoseFeedback(text: string, language: string): string {
  if (!language.startsWith('es')) return text;
  return toSpanish(text) ?? text;
}
