import { getCSSVariable } from "@/lib/utils";
import { useMemo } from "react";

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
	return useMemo(() => {
		const cyan = getCSSVariable('--accent-cyan');
		const colors = EVENT_COLOR_VARS.map(varName => getCSSVariable(varName));
		return { cyan, colors };
	}, []);
}