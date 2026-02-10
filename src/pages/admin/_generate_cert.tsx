import { useToast } from "@/app/context/toast";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/lib/auth-fetch";
import { prettifyCoins } from "@/lib/utils";
import { Gift, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ADMIN_BACKEND_URL } from "./constants";
import type { PrizeCert } from "./types";
import { formatAdminDate } from "./utils";

const DEFAULT_AMOUNT = 2_500;

export function GenerateCertSection() {
	const { showToast } = useToast();
	const [codes, setCodes] = useState<PrizeCert[]>([]);
	const [loading, setLoading] = useState(true);
	const [amount, setAmount] = useState(DEFAULT_AMOUNT);
	const [generating, setGenerating] = useState(false);

	const load = useCallback(async () => {
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/prize-codes`);
			const data = await res.json();
			if (res.ok) setCodes(data.codes ?? []);
			else showToast(data.error ?? "Ошибка загрузки кодов", "error");
		} catch (e) {
			showToast(e instanceof Error ? e.message : "Ошибка", "error");
		} finally {
			setLoading(false);
		}
	}, [showToast]);

	useEffect(() => {
		load();
	}, [load]);

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		const coinsAmount = Math.max(1, Math.floor(amount));
		setGenerating(true);
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/prize-codes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ coins_amount: coinsAmount }),
			});
			const data = await res.json();
			if (!res.ok) {
				showToast(data.error ?? "Ошибка генерации", "error");
				return;
			}
			showToast(`Код ${data.code} создан — ${prettifyCoins(data.coins_amount)} монет`, "success");
			await load();
		} catch (err) {
			showToast(err instanceof Error ? err.message : "Ошибка", "error");
		} finally {
			setGenerating(false);
		}
	};

	return (
		<AccordionItem
			value="prize"
			className="bg-surface-card border border-white/[0.06] rounded-xl overflow-hidden"
		>
			<AccordionTrigger className="px-4 py-3 text-white hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-white/[0.06]">
				<span className="flex items-center gap-2">
					<Gift className="w-5 h-5 text-neon-cyan" />
					Коды сертификатов
				</span>
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-4 pt-2">
				<p className="text-gray-400 text-xs mb-3">
					Пользователь вводит код в разделе «Профиль» → ввод кода и получает указанное количество монет. После активации код скрывается.
				</p>
				<form onSubmit={handleGenerate} className="flex gap-2 mb-4">
					<Input
						type="number"
						min={1}
						value={amount}
						onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
						className="flex-1 px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white text-sm"
					/>
					<button
						type="submit"
						disabled={generating}
						className="py-2 px-4 rounded-lg bg-neon-gold/20 border border-neon-gold/40 text-neon-gold font-medium text-sm hover:bg-neon-gold/30 disabled:opacity-50 flex items-center gap-2 shrink-0"
					>
						{generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
						Сгенерировать
					</button>
				</form>
				<div className="space-y-2">
					{loading ? (
						<p className="text-gray-400 text-sm">Загрузка...</p>
					) : codes.length === 0 ? (
						<p className="text-gray-400 text-sm">Нет сертификатных кодов</p>
					) : (
						codes.map((pc) => (
							<div
								key={pc.id}
								className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-surface-dark border border-white/[0.06]"
							>
								<div className="min-w-0">
									{pc.used_at ? (
										<>
											<p className="text-gray-400 text-sm">Использован</p>
											<p className="text-gray-500 text-xs">
												{prettifyCoins(pc.coins_amount)} монет · {formatAdminDate(pc.used_at)}
											</p>
										</>
									) : (
										<>
											<p className="text-neon-cyan font-mono font-medium">{pc.code}</p>
											<p className="text-gray-400 text-xs">{prettifyCoins(pc.coins_amount)} монет</p>
										</>
									)}
								</div>
							</div>
						))
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
