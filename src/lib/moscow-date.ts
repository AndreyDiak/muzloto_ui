/** Часовой пояс Москвы для единообразия дат мероприятий */
const MOSCOW_TZ = "Europe/Moscow";

/**
 * Возвращает начало текущего дня (00:00) в Москве как Date.
 * Используется для фильтрации: не показывать мероприятия, у которых день уже прошёл в Москве.
 */
export function getStartOfTodayMoscow(): Date {
  const now = new Date();
  const moscowDateStr = now.toLocaleDateString("sv-SE", { timeZone: MOSCOW_TZ });
  return new Date(`${moscowDateStr}T00:00:00+03:00`);
}

/**
 * Парсит строку datetime-local (YYYY-MM-DDTHH:mm) как время в Москве и возвращает ISO UTC.
 */
export function moscowDateTimeLocalToISO(dateTimeLocal: string): string {
  return new Date(`${dateTimeLocal}+03:00`).toISOString();
}

/**
 * Возвращает дату события в Москве как YYYY-MM-DD (для сравнения по дню).
 */
export function getEventDateInMoscow(eventDateIso: string): string {
  return new Date(eventDateIso).toLocaleDateString("sv-SE", { timeZone: MOSCOW_TZ });
}

/**
 * «Сегодня» в Москве (YYYY-MM-DD).
 */
export function getTodayMoscow(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: MOSCOW_TZ });
}

/**
 * Следующий день после даты YYYY-MM-DD (календарно).
 */
function addDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const next = new Date(y, m - 1, d + 1);
  return next.getFullYear() + "-" + String(next.getMonth() + 1).padStart(2, "0") + "-" + String(next.getDate()).padStart(2, "0");
}

/**
 * Проверяет, является ли день события в Москве «завтра».
 */
export function isTomorrowInMoscow(eventDateIso: string): boolean {
  const eventDay = getEventDateInMoscow(eventDateIso);
  const today = getTodayMoscow();
  const tomorrowStr = addDay(today);
  return eventDay === tomorrowStr;
}

/**
 * Проверяет, является ли день события в Москве «сегодня».
 */
export function isTodayInMoscow(eventDateIso: string): boolean {
  return getEventDateInMoscow(eventDateIso) === getTodayMoscow();
}

/**
 * ISO-неделя (Пн–Вс) для даты YYYY-MM-DD.
 * Неделя 1 = неделя с первым четвергом года.
 */
function getISOWeek(dateStr: string): { year: number; week: number } {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

/**
 * «На этой неделе» = мероприятие в той же календарной неделе (Пн–Вс), что и сегодня.
 * Пример: сегодня вс 15 фев, игра пт 20 фев — следующая неделя (16–22 фев), тег «через 5 дней».
 */
export function isThisWeekInMoscow(eventDateIso: string): boolean {
  const today = getTodayMoscow();
  const eventDay = getEventDateInMoscow(eventDateIso);
  const a = getISOWeek(today);
  const b = getISOWeek(eventDay);
  return a.year === b.year && a.week === b.week;
}

/**
 * Количество дней от сегодня (Москва) до дня мероприятия.
 */
export function getDaysUntilInMoscow(eventDateIso: string): number {
  const eventDay = getEventDateInMoscow(eventDateIso);
  const today = getTodayMoscow();
  const todayDate = new Date(today + "T12:00:00Z");
  const eventDateOnly = new Date(eventDay + "T12:00:00Z");
  return Math.round((eventDateOnly.getTime() - todayDate.getTime()) / 86400000);
}
