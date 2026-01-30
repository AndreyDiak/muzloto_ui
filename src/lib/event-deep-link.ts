/**
 * Ссылки и payload при открытии приложения по ссылке.
 *
 * В payload всегда указывается тип: registration | prize.
 * Формат: "registration:CODE" | "reg:CODE" (регистрация на мероприятие), "prize:TOKEN" | "p:TOKEN" (приз).
 * Обратная совместимость: голые 5 символов считаются registration.
 *
 * Примеры:
 *   ?startapp=reg:ABC12   — регистрация, код ABC12
 *   ?startapp=prize:xyz   — получение приза, токен xyz
 */

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? "";
const WEB_APP_SHORT_NAME = import.meta.env.VITE_TELEGRAM_WEB_APP_SHORT_NAME ?? "";
const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? "";

const EVENT_CODE_LENGTH = 5;
const EVENT_CODE_REGEX = /^[A-Za-z0-9]{5}$/;

const PAYLOAD_REG = "reg";
const PAYLOAD_PRIZE = "prize";

/** Прямая ссылка на Mini App с типом payload: startapp=reg:CODE (регистрация). */
export function getEventCodeDeepLink(code: string): string {
	if (!code || typeof code !== "string") return "";
	const normalized = code.trim().toUpperCase();
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	if (!BOT_USERNAME || !WEB_APP_SHORT_NAME) return "";
	const appSlug = WEB_APP_SHORT_NAME.replace(/^@/, "").replace(/\s+/g, "_");
	const base = `https://t.me/${BOT_USERNAME.replace(/^@/, "")}/${appSlug}`;
	const payload = `${PAYLOAD_REG}:${normalized}`;
	return `${base}?startapp=${encodeURIComponent(payload)}`;
}

/**
 * Ссылка на чат с ботом (?start=reg:CODE). Бот должен ответить кнопкой Web App → [APP_BASE_URL]?code=reg:CODE.
 */
export function getEventCodeBotStartLink(code: string): string {
	if (!code || typeof code !== "string") return "";
	const normalized = code.trim().toUpperCase();
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	if (!BOT_USERNAME) return "";
	const payload = `${PAYLOAD_REG}:${normalized}`;
	return `https://t.me/${BOT_USERNAME.replace(/^@/, "")}?start=${encodeURIComponent(payload)}`;
}

/** URL приложения с payload в query (для кнопки Web App в ответе бота на /start reg:CODE). */
export function getEventCodeAppUrl(code: string): string {
	if (!APP_BASE_URL) return "";
	const normalized = (code ?? "").trim().toUpperCase();
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	const payload = `${PAYLOAD_REG}:${normalized}`;
	return `${APP_BASE_URL.replace(/\/$/, "")}?code=${encodeURIComponent(payload)}`;
}

/** Проверяет, что строка похожа на код мероприятия (5 букв/цифр). */
export function isEventCodeLike(value: string): boolean {
	return EVENT_CODE_REGEX.test(String(value).trim());
}

/**
 * Тип действия в payload: 'registration' | 'prize'.
 */
export type StartPayloadType = "registration" | "prize";

export interface ParsedStartPayload {
	type: StartPayloadType;
	value: string;
}

const REG_PREFIX = "registration:";
const REG_PREFIX_SHORT = "reg:";
const PRIZE_PREFIX = "prize:";
const PRIZE_PREFIX_SHORT = "p:";

/**
 * Разбирает сырой payload: тип явно задан в строке.
 * "registration:CODE" | "reg:CODE" → registration, "prize:TOKEN" | "p:TOKEN" → prize.
 * Обратная совместимость: голые 5 букв/цифр → registration.
 */
export function parseStartPayload(raw: string | undefined): ParsedStartPayload | null {
	if (!raw || typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const lower = trimmed.toLowerCase();
	if (lower.startsWith(REG_PREFIX) || lower.startsWith(REG_PREFIX_SHORT)) {
		const value = trimmed.slice(trimmed.indexOf(":") + 1).trim().toUpperCase();
		if (value && isEventCodeLike(value)) return { type: "registration", value };
		return null;
	}
	if (lower.startsWith(PRIZE_PREFIX) || lower.startsWith(PRIZE_PREFIX_SHORT)) {
		const value = trimmed.slice(trimmed.indexOf(":") + 1).trim();
		if (value) return { type: "prize", value };
		return null;
	}
	if (isEventCodeLike(trimmed)) return { type: "registration", value: trimmed.toUpperCase() };
	return null;
}

/** Прямая ссылка для получения приза: t.me/bot/app?startapp=prize:TOKEN */
export function getPrizeDeepLink(token: string): string {
	if (!token || typeof token !== "string") return "";
	const trimmed = token.trim();
	if (!trimmed) return "";
	if (!BOT_USERNAME || !WEB_APP_SHORT_NAME) return "";
	const appSlug = WEB_APP_SHORT_NAME.replace(/^@/, "").replace(/\s+/g, "_");
	const base = `https://t.me/${BOT_USERNAME.replace(/^@/, "")}/${appSlug}`;
	const payload = `${PAYLOAD_PRIZE}:${encodeURIComponent(trimmed)}`;
	return `${base}?startapp=${payload}`;
}

/**
 * Извлекает код мероприятия из ввода (для сканера / ручного ввода).
 * Поддерживает: "ABC12", "reg:ABC12", URL с startapp=reg:ABC12 или startapp=ABC12.
 */
export function extractEventCodeFromInput(input: string): string | null {
	if (!input || typeof input !== "string") return null;
	const trimmed = input.trim();
	const parsed = parseStartPayload(trimmed);
	if (parsed && parsed.type === "registration") return parsed.value;
	if (isEventCodeLike(trimmed)) return trimmed.toUpperCase();
	try {
		const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, "https://t.me");
		const startapp = url.searchParams.get("startapp");
		if (startapp) {
			const p = parseStartPayload(startapp);
			if (p && p.type === "registration") return p.value;
			if (isEventCodeLike(startapp)) return startapp.toUpperCase();
		}
	} catch {
		// не URL
	}
	return null;
}
