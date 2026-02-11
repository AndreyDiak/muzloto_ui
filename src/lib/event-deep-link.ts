/**
 * Ссылки и payload при открытии приложения по ссылке.
 *
 * В payload всегда указывается тип: registration | prize.
 * Разделитель — дефис (-): в startapp разрешены только A–Z, a–z, 0–9, _, - (двоеточие нельзя).
 * Формат: "reg-CODE" (регистрация), "prize-TOKEN" или "p-TOKEN" (приз).
 * Обратная совместимость: голые 5 символов считаются registration.
 *
 * Примеры:
 *   ?startapp=reg-ABC12   — регистрация
 *   ?startapp=prize-xyz   — приз
 */

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? "";
const WEB_APP_SHORT_NAME = import.meta.env.VITE_TELEGRAM_WEB_APP_SHORT_NAME ?? "";
const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? "";

const EVENT_CODE_LENGTH = 5;
const EVENT_CODE_REGEX = /^[A-Za-z0-9]{5}$/;

const PAYLOAD_REG = "reg";
const PAYLOAD_PRIZE = "prize";
const PAYLOAD_SHOP = "shop";

/** Прямая ссылка на Mini App: startapp=reg-CODE (только допустимые символы для Telegram). */
export function getEventCodeDeepLink(code: string): string {
	if (!code || typeof code !== "string") return "";
	const normalized = code.trim().toUpperCase();
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	if (!BOT_USERNAME || !WEB_APP_SHORT_NAME) return "";
	const appSlug = WEB_APP_SHORT_NAME.replace(/^@/, "").replace(/\s+/g, "_");
	const base = `https://t.me/${BOT_USERNAME.replace(/^@/, "")}/${appSlug}`;
	const payload = `${PAYLOAD_REG}-${normalized}`;
	return `${base}?startapp=${payload}`;
}

/** Ссылка на чат с ботом: ?start=reg-CODE. Бот отвечает кнопкой Web App → [APP_BASE_URL]?code=reg-CODE. */
export function getEventCodeBotStartLink(code: string): string {
	if (!code || typeof code !== "string") return "";
	const normalized = code.trim().toUpperCase();
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	if (!BOT_USERNAME) return "";
	const payload = `${PAYLOAD_REG}-${normalized}`;
	return `https://t.me/${BOT_USERNAME.replace(/^@/, "")}?start=${payload}`;
}

/** URL приложения с payload в query (для кнопки Web App в ответе бота на /start reg-CODE). */
export function getEventCodeAppUrl(code: string): string {
	if (!APP_BASE_URL) return "";
	const normalized = (code ?? "").trim().toUpperCase();
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	const payload = `${PAYLOAD_REG}-${normalized}`;
	return `${APP_BASE_URL.replace(/\/$/, "")}?code=${encodeURIComponent(payload)}`;
}

/** Проверяет, что строка похожа на код мероприятия (5 букв/цифр). */
export function isEventCodeLike(value: string): boolean {
	return EVENT_CODE_REGEX.test(String(value).trim());
}

/** Код бинго: 5 символов, первый B. */
export const BINGO_CODE_REGEX = /^B[A-Za-z0-9]{4}$/;

export function isBingoCodeLike(value: string): boolean {
	return BINGO_CODE_REGEX.test(String(value).trim().toUpperCase());
}

/** Код покупки каталога: 6 символов (C + 5) или 5 символов. */
export const SHOP_CODE_REGEX = /^C[A-Za-z0-9]{5}$/;
const SHOP_CODE_REGEX_5 = /^[A-Za-z0-9]{5}$/;

export function isShopCodeLike(value: string): boolean {
	const t = (value ?? "").trim().toUpperCase();
	return SHOP_CODE_REGEX.test(t) || (t.length === 5 && SHOP_CODE_REGEX_5.test(t));
}

export function normalizeShopCode(input: string): string {
	const t = (input ?? "").trim().toUpperCase();
	if (t.length === 6 && t[0] === "C") return t;
	if (t.length === 5) return "C" + t;
	return t;
}

/**
 * Тип действия в payload: 'registration' | 'prize' | 'shop'.
 */
export type StartPayloadType = "registration" | "prize" | "shop";

export interface ParsedStartPayload {
	type: StartPayloadType;
	value: string;
}

const SEP = "-";
const REG_PREFIX = "registration-";
const REG_PREFIX_SHORT = "reg-";
const PRIZE_PREFIX = "prize-";
const PRIZE_PREFIX_SHORT = "p-";
const SHOP_PREFIX = "shop-";
const SHOP_PREFIX_SHORT = "c-";

/**
 * Разбирает сырой payload: тип и значение через дефис (допустимо в Telegram startapp).
 * "reg-CODE" | "registration-CODE" → registration, "prize-TOKEN" | "p-TOKEN" → prize.
 * Обратная совместимость: голые 5 букв/цифр → registration; код вида Bxxxx → prize.
 */
export function parseStartPayload(raw: string | undefined): ParsedStartPayload | null {
	if (!raw || typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const lower = trimmed.toLowerCase();
	if (lower.startsWith(REG_PREFIX) || lower.startsWith(REG_PREFIX_SHORT)) {
		const idx = trimmed.indexOf(SEP);
		const value = (idx >= 0 ? trimmed.slice(idx + 1) : "").trim().toUpperCase();
		if (value && isEventCodeLike(value)) return { type: "registration", value };
		return null;
	}
	if (lower.startsWith(PRIZE_PREFIX) || lower.startsWith(PRIZE_PREFIX_SHORT)) {
		const idx = trimmed.indexOf(SEP);
		const value = idx >= 0 ? trimmed.slice(idx + 1).trim() : "";
		if (value) return { type: "prize", value };
		return null;
	}
	if (lower.startsWith(SHOP_PREFIX) || lower.startsWith(SHOP_PREFIX_SHORT)) {
		const idx = trimmed.indexOf(SEP);
		const value = (idx >= 0 ? trimmed.slice(idx + 1) : trimmed).trim().toUpperCase();
		if (value && (value.length === 5 || (value.length === 6 && value[0] === "C"))) return { type: "shop", value: normalizeShopCode(value) };
		return null;
	}
	if (isBingoCodeLike(trimmed)) return { type: "prize", value: trimmed.toUpperCase() };
	if (isShopCodeLike(trimmed)) return { type: "shop", value: normalizeShopCode(trimmed) };
	if (isEventCodeLike(trimmed)) return { type: "registration", value: trimmed.toUpperCase() };
	return null;
}

/** Прямая ссылка для получения приза: t.me/bot/app?startapp=prize-TOKEN (только A–Z, a–z, 0–9, _, -). */
export function getPrizeDeepLink(token: string): string {
	if (!token || typeof token !== "string") return "";
	const trimmed = token.trim();
	if (!trimmed) return "";
	if (!BOT_USERNAME || !WEB_APP_SHORT_NAME) return "";
	const appSlug = WEB_APP_SHORT_NAME.replace(/^@/, "").replace(/\s+/g, "_");
	const base = `https://t.me/${BOT_USERNAME.replace(/^@/, "")}/${appSlug}`;
	const payload = `${PAYLOAD_PRIZE}-${trimmed.replace(/[^A-Za-z0-9_-]/g, "")}`;
	return `${base}?startapp=${payload}`;
}

/** Прямая ссылка для кода покупки каталога: t.me/bot/app?startapp=shop-CODE. */
export function getShopDeepLink(code: string): string {
	if (!code || typeof code !== "string") return "";
	const normalized = normalizeShopCode(code);
	if (normalized.length !== 6) return "";
	if (!BOT_USERNAME || !WEB_APP_SHORT_NAME) return "";
	const appSlug = WEB_APP_SHORT_NAME.replace(/^@/, "").replace(/\s+/g, "_");
	const base = `https://t.me/${BOT_USERNAME.replace(/^@/, "")}/${appSlug}`;
	const payload = `${PAYLOAD_SHOP}-${normalized}`;
	return `${base}?startapp=${payload}`;
}

/**
 * Извлекает payload из произвольного ввода: raw payload, URL с startapp=..., или 5-символьный код.
 * Возвращает ParsedStartPayload (registration | prize) или null.
 */
export function extractPayloadFromInput(input: string): ParsedStartPayload | null {
	if (!input || typeof input !== "string") return null;
	const trimmed = input.trim();
	const parsed = parseStartPayload(trimmed);
	if (parsed) return parsed;
	if (isEventCodeLike(trimmed)) return { type: "registration", value: trimmed.toUpperCase() };
	try {
		const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, "https://t.me");
		const startapp = url.searchParams.get("startapp");
		if (startapp) {
			const p = parseStartPayload(startapp);
			if (p) return p;
			if (isEventCodeLike(startapp)) return { type: "registration", value: startapp.toUpperCase() };
		}
	} catch {
		// не URL
	}
	return null;
}

/**
 * Извлекает код мероприятия из ввода (для сканера / ручного ввода).
 * Поддерживает: "ABC12", "reg-ABC12", URL с startapp=reg-ABC12 или startapp=ABC12.
 */
export function extractEventCodeFromInput(input: string): string | null {
	const payload = extractPayloadFromInput(input);
	if (payload && payload.type === "registration") return payload.value;
	return null;
}
