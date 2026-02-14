/**
 * Ссылки и payload при открытии приложения по ссылке.
 *
 * Типы: registration (регистрация на мероприятие), shop (код покупки).
 * Формат: "reg-CODE" (регистрация), "shop-CODE" (покупка). Код — 5 цифр.
 */

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? "";
const WEB_APP_SHORT_NAME = import.meta.env.VITE_TELEGRAM_WEB_APP_SHORT_NAME ?? "";
const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? "";

const EVENT_CODE_LENGTH = 5;
const EVENT_CODE_REGEX = /^\d{5}$/;

const PAYLOAD_REG = "reg";
const PAYLOAD_SHOP = "shop";
const PAYLOAD_PRIZE = "prize"; // для getPrizeDeepLink (админ/сертификаты)

/** Прямая ссылка на Mini App: startapp=reg-CODE (код — 5 цифр). */
export function getEventCodeDeepLink(code: string): string {
	if (!code || typeof code !== "string") return "";
	const normalized = code.trim().replace(/\D/g, "");
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
	const normalized = code.trim().replace(/\D/g, "");
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	if (!BOT_USERNAME) return "";
	const payload = `${PAYLOAD_REG}-${normalized}`;
	return `https://t.me/${BOT_USERNAME.replace(/^@/, "")}?start=${payload}`;
}

/** URL приложения с payload в query (для кнопки Web App в ответе бота на /start reg-CODE). */
export function getEventCodeAppUrl(code: string): string {
	if (!APP_BASE_URL) return "";
	const normalized = (code ?? "").trim().replace(/\D/g, "");
	if (normalized.length !== EVENT_CODE_LENGTH) return "";
	const payload = `${PAYLOAD_REG}-${normalized}`;
	return `${APP_BASE_URL.replace(/\/$/, "")}?code=${encodeURIComponent(payload)}`;
}

/** Проверяет, что строка похожа на код мероприятия (5 цифр). */
export function isEventCodeLike(value: string): boolean {
	return EVENT_CODE_REGEX.test(String(value).trim().replace(/\D/g, ""));
}

/** Код покупки каталога: 5 цифр. */
export const SHOP_CODE_REGEX_5 = /^\d{5}$/;

export function isShopCodeLike(value: string): boolean {
	const t = (value ?? "").trim().replace(/\D/g, "");
	return t.length === 5 && SHOP_CODE_REGEX_5.test(t);
}

export function normalizeShopCode(input: string): string {
	const t = (input ?? "").trim().replace(/\D/g, "");
	if (t.length === 5) return t;
	return (input ?? "").trim();
}

/**
 * Тип действия в payload: регистрация на мероприятие или код покупки.
 */
export type StartPayloadType = "registration" | "shop";

export interface ParsedStartPayload {
	type: StartPayloadType;
	value: string;
}

const SEP = "-";
const REG_PREFIX = "registration-";
const REG_PREFIX_SHORT = "reg-";
const SHOP_PREFIX = "shop-";
const SHOP_PREFIX_SHORT = "c-";

/**
 * Разбирает сырой payload: "reg-CODE" → registration, "shop-CODE" → shop.
 * Голые 5 букв/цифр: сначала пробуем как event, иначе как shop (определяет вызывающий код).
 */
export function parseStartPayload(raw: string | undefined): ParsedStartPayload | null {
	if (!raw || typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const lower = trimmed.toLowerCase();
	if (lower.startsWith(REG_PREFIX) || lower.startsWith(REG_PREFIX_SHORT)) {
		const idx = trimmed.indexOf(SEP);
		const value = (idx >= 0 ? trimmed.slice(idx + 1) : "").trim().replace(/\D/g, "");
		if (value.length === 5) return { type: "registration", value };
		return null;
	}
	if (lower.startsWith(SHOP_PREFIX) || lower.startsWith(SHOP_PREFIX_SHORT)) {
		const idx = trimmed.indexOf(SEP);
		const value = (idx >= 0 ? trimmed.slice(idx + 1) : trimmed).trim().replace(/\D/g, "");
		if (value.length === 5) return { type: "shop", value };
		return null;
	}
	if (isShopCodeLike(trimmed)) return { type: "shop", value: normalizeShopCode(trimmed) };
	if (isEventCodeLike(trimmed)) return { type: "registration", value: trimmed.trim().replace(/\D/g, "").slice(0, 5) };
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
	if (normalized.length !== 5) return "";
	if (!BOT_USERNAME || !WEB_APP_SHORT_NAME) return "";
	const appSlug = WEB_APP_SHORT_NAME.replace(/^@/, "").replace(/\s+/g, "_");
	const base = `https://t.me/${BOT_USERNAME.replace(/^@/, "")}/${appSlug}`;
	const payload = `${PAYLOAD_SHOP}-${normalized}`;
	return `${base}?startapp=${payload}`;
}

/**
 * Ссылка на бота с кодом покупки: t.me/bot?start=shop-CODE.
 * Пользователь открывает чат с ботом (отправляет /start), после чего бот может писать ему в ЛС (в т.ч. подтверждение покупки).
 * В QR лучше использовать эту ссылку, чтобы после погашения кода пришло сообщение в ЛС.
 */
export function getShopBotStartLink(code: string): string {
	if (!code || typeof code !== "string") return "";
	const normalized = normalizeShopCode(code);
	if (normalized.length !== 5) return "";
	if (!BOT_USERNAME) return "";
	const payload = `${PAYLOAD_SHOP}-${normalized}`;
	return `https://t.me/${BOT_USERNAME.replace(/^@/, "")}?start=${payload}`;
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
	if (isEventCodeLike(trimmed)) return { type: "registration", value: trimmed.trim().replace(/\D/g, "").slice(0, 5) };
	try {
		const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, "https://t.me");
		const startapp = url.searchParams.get("startapp");
		if (startapp) {
			const p = parseStartPayload(startapp);
			if (p) return p;
			if (isEventCodeLike(startapp)) return { type: "registration", value: startapp.trim().replace(/\D/g, "").slice(0, 5) };
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
