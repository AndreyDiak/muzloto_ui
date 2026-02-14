import { useCssColor } from "@/hooks/use-css-color";
import {
	getDaysUntilInMoscow,
	isThisWeekInMoscow,
	isTodayInMoscow,
	isTomorrowInMoscow,
} from "@/lib/moscow-date";
import { getCSSVariable } from "@/lib/utils";

const MOSCOW_TZ = "Europe/Moscow";

export function formatEventDate(dateString: string): { date: string; time: string } {
	const date = new Date(dateString);
	const dateStr = date.toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: MOSCOW_TZ,
	});
	const timeStr = date.toLocaleTimeString("ru-RU", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: MOSCOW_TZ,
	});
	return { date: dateStr, time: timeStr };
}

/** Подпись для тега «скоро» и класс для цвета: сегодня / завтра / на этой неделе / через N дней */
export function getEventSoonLabel(eventDateIso: string): { label: string; className: string } {
	if (isTodayInMoscow(eventDateIso)) {
		return {
			label: "Сегодня",
			className:
				"bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white font-semibold shadow-[0_0_12px_rgba(251,191,36,0.4)]",
		};
	}
	if (isTomorrowInMoscow(eventDateIso)) {
		return {
			label: "Завтра",
			className: "bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/40",
		};
	}
	if (isThisWeekInMoscow(eventDateIso)) {
		return {
			label: "На этой неделе",
			className: "bg-white/10 text-gray-300 border border-white/20",
		};
	}
	const days = getDaysUntilInMoscow(eventDateIso);
	const dayWord =
		days === 1 ? "день" : days >= 2 && days <= 4 ? "дня" : "дней";
	return {
		label: `Через ${days} ${dayWord}`,
		className: "bg-white/5 text-gray-400 border border-white/10",
	};
}

const EVENT_COLOR_VARS = [
	'--accent-purple',
	'--accent-pink',
	'--accent-gold',
]

export function useEventColors() {
	const colors = useCssColor(EVENT_COLOR_VARS);
	const cyan = getCSSVariable('--accent-cyan');
	return { cyan, colors };
}