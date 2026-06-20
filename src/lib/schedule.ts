// =====================================================================
//  Утиліти робочого графіка та слотів бронювання.
//  Робочі години зберігаються як рядок "HH:MM-HH:MM" у User.workingHours.
// =====================================================================

/** Парсити "09:00-18:00" → { start: 9, end: 18 }. Безпечний до undefined/бруду. */
export function parseWorkingHours(wh: string | null | undefined): { start: number; end: number } {
  if (!wh || typeof wh !== "string") return { start: 9, end: 18 };
  const m = wh.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return { start: 9, end: 18 };
  const start = Number(m[1]);
  const end = Number(m[3]);
  if (isNaN(start) || isNaN(end) || end <= start) return { start: 9, end: 18 };
  return { start, end };
}

/** Згенерувати годинні слоти "HH:MM" від start до end-1 (наступний — перший зайнятий). */
export function generateSlots(start: number, end: number): string[] {
  const slots: string[] = [];
  for (let h = start; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

/** Усі слоти для фахівця (з workingHours). */
export function slotsFor(workingHours: string | null | undefined): string[] {
  const { start, end } = parseWorkingHours(workingHours);
  return generateSlots(start, end);
}

export interface DayChip {
  date: string; // YYYY-MM-DD
  dow: number; // 0=Нд ... 6=Сб
  day: number; // 15
  month: number; // 0-11
  iso: string; // повний Date.toISOString для порівняння
  isPast: boolean;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Наступні N днів від сьогодні (вкл. сьогодні). */
export function nextDays(count: number): DayChip[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: DayChip[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    out.push({
      date: toISODate(d),
      dow: d.getDay(),
      day: d.getDate(),
      month: d.getMonth(),
      iso: d.toISOString(),
      isPast: i === 0 ? isPastForToday() : false,
    });
  }
  return out;
}

/** Чи вже минув сьогоднішній робочий день (поточний час >= end). */
function isPastForToday(): boolean {
  const now = new Date();
  return now.getHours() >= 20; // консервативно: після 20:00 день вважаємо закритим
}

/** Короткі назви днів тижня. */
export const DOW_SHORT_UK = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
export const DOW_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Короткі назви місяців. */
export const MONTH_SHORT_UK = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
export const MONTH_SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
