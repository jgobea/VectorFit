// OFFLINE BUILD: canned, rule-based stand-ins for the two Gemini-backed Edge
// Functions (`chat` and `live-review-feedback`). No model, no network: replies
// are picked by keyword and keep the same output contract as the real ones
// (the ```exercise fenced JSON blocks that ChatBubble turns into cards).

export type CoachLang = 'en' | 'es';

interface ExerciseBlock {
  name: string;
  sets: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  rest_seconds: number;
}

const FENCE = '```';
const block = (e: ExerciseBlock) => `${FENCE}exercise\n${JSON.stringify(e)}\n${FENCE}`;

const ex = (name: string, sets: number, reps: number, rest = 60): ExerciseBlock => ({
  name,
  sets,
  reps,
  weight_kg: null,
  duration_seconds: null,
  rest_seconds: rest,
});

interface Topic {
  keywords: RegExp;
  text: Record<CoachLang, string>;
  exercises: ExerciseBlock[];
}

const TOPICS: Topic[] = [
  {
    keywords: /leg|glute|squat|lunge|pierna|gl[uú]teo|sentadilla|zancada/i,
    text: {
      en: 'For lower body, build around a squat pattern and a hinge. Keep your chest up and drive through your heels.',
      es: 'Para tren inferior, apóyate en una sentadilla y una bisagra de cadera. Mantén el pecho arriba y empuja con los talones.',
    },
    exercises: [ex('Squats', 3, 12), ex('Lunges', 3, 10), ex('Glute Bridge', 3, 15)],
  },
  {
    keywords: /chest|push|pecho|flexion|flexión/i,
    text: {
      en: 'For chest, start with a pressing movement and finish with a bodyweight push. Lower with control and keep your elbows around 45 degrees.',
      es: 'Para pecho, empieza con un press y termina con un movimiento de peso corporal. Baja con control y mantén los codos a unos 45 grados.',
    },
    exercises: [ex('Push Ups', 3, 12), ex('Bench Press', 3, 8, 90)],
  },
  {
    keywords: /back|espalda|row|remo|pull/i,
    text: {
      en: 'For back, mix a vertical pull with a horizontal row. Think about driving your elbows back, not just pulling with your hands.',
      es: 'Para espalda, combina un jalón vertical con un remo horizontal. Piensa en llevar los codos hacia atrás, no solo jalar con las manos.',
    },
    exercises: [ex('Lat Pulldown', 3, 10, 75), ex('Barbell Row', 3, 8, 90)],
  },
  {
    keywords: /arm|bicep|tricep|brazo|b[ií]ceps|tr[ií]ceps|shoulder|hombro/i,
    text: {
      en: 'For arms and shoulders, keep the reps controlled and avoid swinging the weight.',
      es: 'Para brazos y hombros, controla cada repetición y evita balancear el peso.',
    },
    exercises: [ex('Bicep Curls', 3, 12), ex('Tricep Pushdown', 3, 12), ex('Lateral Raises', 3, 12)],
  },
  {
    keywords: /core|abs|abdom|plank|plancha|six.?pack/i,
    text: {
      en: 'Core strength comes from bracing, not just crunching. Keep your ribs down and breathe steadily.',
      es: 'La fuerza del core viene de estabilizar, no solo de hacer abdominales. Mantén las costillas abajo y respira con calma.',
    },
    exercises: [
      { name: 'Plank', sets: 3, reps: null, weight_kg: null, duration_seconds: 30, rest_seconds: 45 },
      ex('Leg Raises', 3, 12, 45),
      ex('Russian Twist', 3, 20, 45),
    ],
  },
  {
    keywords: /cardio|fat|lose|weight loss|grasa|bajar|peso|adelgaz|correr|run/i,
    text: {
      en: 'For fat loss, combine regular strength training with some cardio you can sustain, and stay consistent week to week.',
      es: 'Para perder grasa, combina entrenamiento de fuerza regular con cardio que puedas sostener, y sé constante semana a semana.',
    },
    exercises: [ex('Jumping Jacks', 3, 30, 30), ex('Kettlebell Swing', 3, 15, 45)],
  },
  {
    keywords: /muscle|gain|bulk|m[uú]sculo|masa|hipertrofia|strong|fuerza/i,
    text: {
      en: 'To build muscle, train each muscle group about twice a week, add load gradually, and keep 1 to 2 reps in reserve on most sets.',
      es: 'Para ganar músculo, entrena cada grupo unas dos veces por semana, sube la carga poco a poco y deja 1 o 2 repeticiones de reserva en la mayoría de series.',
    },
    exercises: [ex('Squats', 4, 8, 90), ex('Bench Press', 4, 8, 90), ex('Barbell Row', 4, 8, 90)],
  },
  {
    keywords: /form|technique|t[eé]cnica|postura|posture|live review|c[aá]mara|camera/i,
    text: {
      en: 'Good form means a controlled tempo and a full range of motion. Live Review can count your reps and flag form issues through the camera, give it a try on squats or push ups.',
      es: 'Buena técnica significa ritmo controlado y rango completo de movimiento. Live Review puede contar tus repeticiones y avisarte de fallos de forma con la cámara, pruébalo con sentadillas o flexiones.',
    },
    exercises: [],
  },
  {
    keywords: /rest|recover|sleep|sore|descans|recuper|dormir|agujetas|dolor/i,
    text: {
      en: 'Recovery is where progress happens. Aim for 7 to 9 hours of sleep and at least one full rest day per week. Mild soreness is normal, sharp pain is not.',
      es: 'La recuperación es donde ocurre el progreso. Busca dormir de 7 a 9 horas y al menos un día completo de descanso a la semana. Una molestia leve es normal, un dolor agudo no.',
    },
    exercises: [],
  },
  {
    keywords: /plan|routine|rutina|program|week|semana/i,
    text: {
      en: 'A simple starting week: three full-body days with a rest day between each. Here is a sample day to begin with.',
      es: 'Una semana sencilla para empezar: tres días de cuerpo completo con un día de descanso entre cada uno. Aquí tienes un día de ejemplo.',
    },
    exercises: [ex('Squats', 3, 10), ex('Push Ups', 3, 10), ex('Barbell Row', 3, 10, 75)],
  },
  {
    keywords: /^(hi|hello|hey|hola|buenas|buenos)\b/i,
    text: {
      en: 'Ready when you are. Ask me about a muscle group, a routine, or your form.',
      es: 'Listo cuando tú lo estés. Pregúntame por un grupo muscular, una rutina o tu técnica.',
    },
    exercises: [],
  },
];

const FALLBACK: Record<CoachLang, string> = {
  en: 'I am running in offline demo mode, so my answers are limited. Try asking about legs, chest, back, core, cardio, muscle gain, form, recovery or a routine.',
  es: 'Estoy en modo demo sin conexión, así que mis respuestas son limitadas. Prueba a preguntar por piernas, pecho, espalda, core, cardio, ganar músculo, técnica, descanso o una rutina.',
};

export function offlineChatReply(userText: string, lang: CoachLang): string {
  const topic = TOPICS.find((t) => t.keywords.test(userText.trim()));
  if (!topic) return FALLBACK[lang];
  return [topic.text[lang], ...topic.exercises.map(block)].join('\n\n');
}

// ---------------------------------------------------------------------------
// Live Review between-set note (stand-in for supabase/functions/live-review-feedback)
// ---------------------------------------------------------------------------
interface SetNoteInput {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  repsCompleted: number;
  targetReps: number;
  feedbackCounts: { text: string; count: number }[];
  isWorkoutComplete: boolean;
}

// QuickPose's camera-framing hints fire constantly even when the person is
// fully visible (see HANDOFF.md) — never worth surfacing as coaching.
const FRAMING_NOISE = /frame|step back|visible|closer|further|camera|encuadre|cuerpo entero|aléjate|acércate/i;

export function offlineSetNote(input: SetNoteInput, lang: CoachLang): string {
  const formTips = input.feedbackCounts.filter((f) => !FRAMING_NOISE.test(f.text));
  const topTip = [...formTips].sort((a, b) => b.count - a.count)[0]?.text;
  const hitTarget = input.repsCompleted >= input.targetReps;

  const parts: string[] = [];
  if (lang === 'es') {
    parts.push(
      hitTarget
        ? `Buen trabajo, completaste ${input.repsCompleted} repeticiones.`
        : `Hiciste ${input.repsCompleted} de ${input.targetReps} repeticiones.`
    );
    if (topTip) parts.push(`Lo que más se repitió: "${topTip}". Concéntrate en eso.`);
    parts.push(
      input.isWorkoutComplete
        ? 'Entrenamiento terminado, hidrátate y descansa.'
        : 'Respira y prepárate para la siguiente serie.'
    );
  } else {
    parts.push(
      hitTarget
        ? `Nice work, you got ${input.repsCompleted} reps.`
        : `You got ${input.repsCompleted} of ${input.targetReps} reps.`
    );
    if (topTip) parts.push(`The most frequent cue was "${topTip}". Focus on that.`);
    parts.push(
      input.isWorkoutComplete
        ? 'Workout done, hydrate and rest up.'
        : 'Take a breath and get ready for your next set.'
    );
  }
  return parts.join(' ');
}
