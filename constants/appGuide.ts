import type { Feather } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

interface GuideStepText {
  title: string;
  body: string;
}

export interface GuideStep {
  icon: keyof typeof Feather.glyphMap;
  accentColor: string;
  es: GuideStepText;
  en: GuideStepText;
}

// The app-guide modal's content — deliberately NOT routed through i18next:
// only the current UI locale's text is shown (see
// components/features/dashboard/AppGuideModal.tsx), but both language
// versions need to exist as plain data either way, so this stays outside
// the normal translation-key system rather than duplicating every string
// under two near-identical keys.
export const GUIDE_STEPS: GuideStep[] = [
  {
    icon: 'home',
    accentColor: Colors.cyanVivid,
    es: {
      title: 'Inicio',
      body: 'Tu punto de partida cada día: un resumen con tus entrenamientos de la semana, tu carga de hoy, tu racha de días activos y tu minutos activos. Debajo verás la rutina de hoy, con cada ejercicio y un botón para marcarlo como hecho, iniciarlo con la cámara o con el temporizador. Más abajo aparecen tus próximos días programados y accesos directos al chat, a Live Review y a tu progreso.',
    },
    en: {
      title: 'Home',
      body: "Your starting point every day: a summary with this week's workouts, today's load, your active-day streak, and your active minutes. Below that is today's workout, with every exercise and a button to mark it done, start it with the camera, or start it with the timer. Further down you'll find your upcoming scheduled days and shortcuts to chat, Live Review, and your progress.",
    },
  },
  {
    icon: 'message-circle',
    accentColor: Colors.warning,
    es: {
      title: 'Entrenador IA',
      body: 'Un chat con tu entrenador personal impulsado por inteligencia artificial. Puedes preguntarle sobre técnica, nutrición o cómo ajustar tu rutina, y responde teniendo en cuenta tu perfil y tus ejercicios disponibles en Live Review. A veces te sugiere un ejercicio concreto dentro del propio chat, con sus series, repeticiones o peso, y puedes agregarlo a cualquier día de tu rutina con un solo toque. También puedes borrar el historial del chat desde tu perfil cuando quieras.',
    },
    en: {
      title: 'AI Trainer',
      body: "A chat with your personal AI-powered trainer. You can ask about technique, nutrition, or how to adjust your routine, and it replies taking your profile and your Live Review-available exercises into account. Sometimes it suggests a specific exercise right inside the chat, with its sets, reps, or weight, and you can add it to any day of your routine with a single tap. You can also clear the chat history from your profile whenever you want.",
    },
  },
  {
    icon: 'camera',
    accentColor: Colors.error,
    es: {
      title: 'Live Review',
      body: 'Elige un ejercicio, tus repeticiones, series y descanso, y usa la cámara frontal de tu teléfono para que la app cuente tus repeticiones y evalúe tu forma en tiempo real mientras entrenas. Entre series tienes un temporizador de descanso y tu entrenador IA te deja una nota sobre cómo te fue. Al terminar ves un resumen con tus repeticiones totales, tu puntaje de forma promedio y tu mejor repetición, y puedes guardar la sesión o descartarla si solo estabas probando.',
    },
    en: {
      title: 'Live Review',
      body: "Pick an exercise, your reps, sets, and rest, then use your phone's front camera so the app counts your reps and evaluates your form in real time as you train. Between sets you get a rest timer, and your AI trainer leaves you a note on how that set went. When you finish you see a summary with your total reps, your average form score, and your best rep, and you can save the session or discard it if you were just testing.",
    },
  },
  {
    icon: 'bar-chart-2',
    accentColor: Colors.greenNeon,
    es: {
      title: 'Progreso',
      body: 'Estadísticas de todo tu recorrido: cuántos entrenamientos completaste por semana, la tendencia de tu puntaje de forma en Live Review a lo largo del tiempo, y un gráfico circular que muestra cómo se reparten tus sesiones entre tren superior, tren inferior, core y cuerpo completo. También hay una franja de actividad diaria para ver de un vistazo qué días entrenaste recientemente.',
    },
    en: {
      title: 'Progress',
      body: 'Statistics for your whole journey: how many workouts you completed per week, your Live Review form-score trend over time, and a pie chart showing how your sessions split across upper body, lower body, core, and full body. There is also a daily activity strip so you can see at a glance which days you trained recently.',
    },
  },
  {
    icon: 'edit-3',
    accentColor: Colors.warning,
    es: {
      title: 'Rutina',
      body: 'Aquí construyes tu rutina semanal, día por día. Agrega ejercicios del catálogo o crea uno propio, define series, repeticiones, peso, duración y descanso, y reordénalos arrastrándolos. Puedes ponerle nombre a cada día (por ejemplo "Día de pierna"), marcarlo como día de descanso, o copiar los ejercicios de un día a otro para no repetir el trabajo. Si no tienes rutina todavía, la app te ayuda a crear una desde cero.',
    },
    en: {
      title: 'Routine',
      body: "This is where you build your weekly routine, day by day. Add exercises from the catalog or create your own, set sets, reps, weight, duration, and rest, and reorder them by dragging. You can name each day (e.g. \"Leg Day\"), mark it as a rest day, or copy one day's exercises to another so you don't have to redo the work. If you don't have a routine yet, the app helps you create one from scratch.",
    },
  },
  {
    icon: 'user',
    accentColor: Colors.cyanVivid,
    es: {
      title: 'Perfil',
      body: 'Toca cualquier ajuste para editarlo al instante: tu edad, altura, peso, género y tipo de cuerpo; tu objetivo principal, nivel de experiencia, frecuencia de entrenamiento y lesiones; y cómo se comporta tu entrenador IA — su intensidad de feedback, si te habla en voz alta (con volumen ajustable), su idioma y su estilo de coaching. También cambias el idioma de toda la app, ves tu historial de entrenamientos, y desde ahí cierras sesión, cambias tu contraseña o eliminas tu cuenta.',
    },
    en: {
      title: 'Profile',
      body: "Tap any setting to edit it instantly: your age, height, weight, gender, and body type; your primary goal, experience level, training frequency, and injuries; and how your AI trainer behaves — its feedback intensity, whether it speaks out loud (with adjustable volume), its language, and its coaching style. You also change the whole app's language here, see your workout history, and log out, change your password, or delete your account.",
    },
  },
];
