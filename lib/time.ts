// Training-time preference is a Postgres `time` column ("HH:MM:SS"). Offered
// as a preset list in 30-minute increments rather than free text or a native
// time-picker dependency — consistent with this app's "tap, don't type"
// picker style (Live Review's exercise/rest pickers).
export interface TimeOption {
  value: string;
  label: string;
}

function formatLabel(hour24: number, minute: number): string {
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

export function generateTimeOptions(): TimeOption[] {
  const options: TimeOption[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
      options.push({ value, label: formatLabel(hour, minute) });
    }
  }
  return options;
}

export function formatTime12h(value: string | null): string | null {
  if (!value) return null;
  const [hourStr, minuteStr] = value.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return formatLabel(hour, minute);
}
