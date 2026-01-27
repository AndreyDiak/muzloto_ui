import { useCssColor } from "@/hooks/use-css-color";
import { getCSSVariable } from "@/lib/utils";

export function formatEventDate(dateString: string): { date: string; time: string; } {
	const date = new Date(dateString);
	const dateStr = date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
	const timeStr = date.toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	});
	return { date: dateStr, time: timeStr };
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