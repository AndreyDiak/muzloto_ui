import { useToast } from "@/app/context/toast";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/lib/auth-fetch";
import { ADMIN_BACKEND_URL } from "./constants";
import type { AdminEvent } from "./types";
import { formatAdminDate } from "./utils";
import { Calendar, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function EventsSection() {
	const { showToast } = useToast();
	const [events, setEvents] = useState<AdminEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [date, setDate] = useState("");
	const [location, setLocation] = useState("");
	const [locationHref, setLocationHref] = useState("");
	const [price, setPrice] = useState(0);
	const [creating, setCreating] = useState(false);

	const load = useCallback(async () => {
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/events`);
			const data = await res.json();
			if (res.ok) setEvents(data.events ?? []);
			else showToast(data.error ?? "Ошибка загрузки мероприятий", "error");
		} catch (e) {
			showToast(e instanceof Error ? e.message : "Ошибка", "error");
		} finally {
			setLoading(false);
		}
	}, [showToast]);

	useEffect(() => {
		load();
	}, [load]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = title.trim();
		if (!trimmed) {
			showToast("Введите название мероприятия", "error");
			return;
		}
		setCreating(true);
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/events`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: trimmed,
					event_date: date || undefined,
					location: location.trim() || undefined,
					location_href: locationHref.trim() || undefined,
					price: price >= 0 ? price : undefined,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				showToast(data.error ?? "Ошибка", "error");
				return;
			}
			showToast(`Мероприятие «${data.title}» создано. Код: ${data.code ?? "—"}`, "success");
			setTitle("");
			setDate("");
			setLocation("");
			setLocationHref("");
			setPrice(0);
			await load();
		} catch (err) {
			showToast(err instanceof Error ? err.message : "Ошибка", "error");
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (id: string, eventTitle: string) => {
		if (!confirm(`Удалить мероприятие «${eventTitle}»?`)) return;
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/events/${id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (!res.ok) {
				showToast(data.error ?? "Ошибка удаления", "error");
				return;
			}
			showToast("Мероприятие удалено", "success");
			await load();
		} catch (err) {
			showToast(err instanceof Error ? err.message : "Ошибка", "error");
		}
	};

	return (
		<AccordionItem
			value="events"
			className="bg-surface-card border border-white/[0.06] rounded-xl overflow-hidden"
		>
			<AccordionTrigger className="px-4 py-3 text-white hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-white/[0.06]">
				<span className="flex items-center gap-2">
					<Calendar className="w-5 h-5 text-neon-cyan" />
					Мероприятия
				</span>
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-4 pt-2">
				<form onSubmit={handleCreate} className="space-y-3 mb-4">
					<Input
						type="text"
						placeholder="Название"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm"
					/>
					<Input
						type="datetime-local"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white text-sm"
					/>
					<Input
						type="text"
						placeholder="Место"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm"
					/>
					<Input
						type="url"
						placeholder="Ссылка на обложку"
						value={locationHref}
						onChange={(e) => setLocationHref(e.target.value)}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm"
					/>
					<Input
						type="number"
						placeholder="Цена (₽)"
						min={0}
						value={price || ""}
						onChange={(e) => setPrice(Number(e.target.value) || 0)}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm"
					/>
					<button
						type="submit"
						disabled={creating}
						className="w-full py-2.5 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-medium text-sm hover:bg-neon-cyan/30 disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
						Создать мероприятие
					</button>
				</form>
				<div className="space-y-2">
					{loading ? (
						<p className="text-gray-400 text-sm">Загрузка...</p>
					) : events.length === 0 ? (
						<p className="text-gray-400 text-sm">Нет мероприятий</p>
					) : (
						events.map((ev) => (
							<div
								key={ev.id}
								className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-surface-dark border border-white/[0.06]"
							>
								<div className="min-w-0">
									<p className="text-white font-medium truncate">{ev.title}</p>
									<p className="text-gray-400 text-xs">
										{ev.code ? `Код: ${ev.code}` : ""} · {formatAdminDate(ev.event_date)}
									</p>
								</div>
								<button
									type="button"
									onClick={() => handleDelete(ev.id, ev.title)}
									className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 shrink-0"
									aria-label="Удалить"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
						))
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
