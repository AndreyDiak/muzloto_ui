import type { ScanTicketItem, ScanTicketParticipant, ScanTicketSuccess } from "@/actions/scan-ticket";
import { scanTicket } from "@/actions/scan-ticket";
import { useSession } from "@/app/context/session";
import { useTelegram } from "@/app/context/telegram";
import { useToast } from "@/app/context/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RecentScannedItem } from "@/hooks/use-recent-scanned";
import { useRecentScanned } from "@/hooks/use-recent-scanned";
import { Clock, Keyboard, QrCode, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router";

const CODE_LENGTH = 5;

function formatUsedAt(iso: string): string {
	const d = new Date(iso);
	const now = new Date();
	const isToday = d.toDateString() === now.toDateString();
	if (isToday) {
		return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
	}
	return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function ParticipantInfo({ participant }: { participant: ScanTicketParticipant; }) {
	const name = participant.first_name ?? "—";
	const username = participant.username ? `@${participant.username}` : null;
	return (
		<div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/20">
			<div className="w-10 h-10 rounded-full bg-[#00f0ff]/10 flex items-center justify-center shrink-0 overflow-hidden">
				{participant.avatar_url ? (
					<img src={participant.avatar_url} alt="" className="w-full h-full object-cover" />
				) : (
					<User className="w-5 h-5 text-[#00f0ff]" />
				)}
			</div>
			<div className="min-w-0">
				<p className="text-white font-medium truncate">{name}</p>
				{username && <p className="text-sm text-gray-400 truncate">{username}</p>}
			</div>
		</div>
	);
}

function ItemInfo({ item }: { item: ScanTicketItem; }) {
	return (
		<div className="flex gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#b829ff]/20">
			{item.photo && (
				<div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#16161d]">
					<img src={item.photo} alt="" className="w-full h-full object-cover" />
				</div>
			)}
			<div className="min-w-0 flex-1">
				<p className="text-white font-medium">{item.name}</p>
				{item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>}
			</div>
		</div>
	);
}

function RecentRow({ row, onClick }: { row: RecentScannedItem; onClick: () => void; }) {
	const name = row.participant?.first_name ?? "—";
	const itemName = row.item?.name ?? "—";
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/10 text-left hover:border-[#00f0ff]/30 hover:bg-[#0f0f16] transition-colors active:opacity-90"
		>
			<div className="flex items-center gap-1.5 text-gray-400 text-xs shrink-0 w-14">
				<Clock className="w-3.5 h-3.5" />
				{formatUsedAt(row.used_at)}
			</div>
			<div className="font-mono text-[#00f0ff] text-sm shrink-0">{row.code}</div>
			<div className="min-w-0 flex-1 truncate text-white text-sm">{name}</div>
			<div className="min-w-0 flex-1 truncate text-gray-400 text-sm">{itemName}</div>
		</button>
	);
}

export function Scanner() {
	const { isRoot } = useSession();
	const { showToast } = useToast();
	const { tg } = useTelegram();
	const { items: recentItems, isLoading: recentLoading, refetch: refetchRecent } = useRecentScanned(!!isRoot);
	const [result, setResult] = useState<ScanTicketSuccess | null>(null);
	const [selectedRecent, setSelectedRecent] = useState<RecentScannedItem | null>(null);
	const [isManualOpen, setIsManualOpen] = useState(false);
	const [codeInputs, setCodeInputs] = useState<string[]>(Array(CODE_LENGTH).fill(""));
	const [isProcessing, setIsProcessing] = useState(false);
	const isProcessingRef = useRef(false);

	if (!isRoot) {
		return <Navigate to="/" replace />;
	}

	const onScanSuccess = (data: ScanTicketSuccess) => {
		setResult(data);
		showToast("Билет успешно отсканирован", "success");
		isProcessingRef.current = false;
		void refetchRecent();
	};

	const handleScanQR = () => {
		if (tg?.showScanQrPopup) {
			isProcessingRef.current = false;
			try {
				tg.showScanQrPopup(
					{ text: "Отсканируйте QR код билета" },
					(text: string) => {
						if (isProcessingRef.current) return true;
						const trimmed = typeof text === "string" ? text.trim() : "";
						if (!trimmed) {
							showToast("QR код не распознан. Попробуйте еще раз.", "error");
							return false;
						}
						if (trimmed.length !== CODE_LENGTH) {
							showToast(`Ожидается код из ${CODE_LENGTH} символов.`, "error");
							return false;
						}
						isProcessingRef.current = true;
						scanTicket({
							code: trimmed.toUpperCase(),
							onSuccess: onScanSuccess,
							onError: (msg) => {
								showToast(msg, "error");
								isProcessingRef.current = false;
							},
						});
						return true;
					}
				);
			} catch {
				showToast("Не удалось открыть сканер", "error");
			}
		} else {
			showToast("Сканер доступен в мобильном приложении. Введите код вручную.", "info");
			setIsManualOpen(true);
		}
	};

	const handleManualSubmit = (code: string) => {
		if (code.length !== CODE_LENGTH || isProcessing) return;
		setIsProcessing(true);
		scanTicket({
			code: code.toUpperCase(),
			onSuccess: (data) => {
				onScanSuccess(data);
				setIsManualOpen(false);
				setCodeInputs(Array(CODE_LENGTH).fill(""));
				setIsProcessing(false);
			},
			onError: (msg) => {
				showToast(msg, "error");
				setIsProcessing(false);
			},
		});
	};

	const handleInputChange = (index: number, value: string) => {
		const char = value.length > 0 ? value.slice(-1).toUpperCase() : "";
		const next = [...codeInputs];
		next[index] = char;
		setCodeInputs(next);
		if (char && index < CODE_LENGTH - 1) {
			setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
		}
		if (char && index === CODE_LENGTH - 1) {
			const full = next.join("");
			if (full.length === CODE_LENGTH) handleManualSubmit(full);
		}
	};

	const handleInputKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
			const next = [...codeInputs];
			next[index - 1] = "";
			setCodeInputs(next);
			setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
		} else if (e.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1]?.focus();
		} else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (isManualOpen) setTimeout(() => inputRefs.current[0]?.focus(), 100);
	}, [isManualOpen]);

	return (
		<>
			<div className="p-4 space-y-6">
				<h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#00f0ff] to-[#b829ff]">
					Сканер билетов
				</h2>
				<p className="text-gray-400 text-sm">
					Отсканируйте QR на билете участника. После сканирования билет станет неактивен, на экране отобразятся данные участника и предмет к выдаче.
				</p>
				<div className="bg-linear-to-r from-[#00f0ff]/20 to-[#b829ff]/20 rounded-2xl p-0 border border-[#00f0ff]/30 flex items-stretch overflow-hidden">
					<button
						type="button"
						onClick={handleScanQR}
						className="flex-1 flex items-center gap-3 p-4 hover:opacity-90 transition-opacity active:scale-[0.98] rounded-l-2xl"
					>
						<div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-[#00f0ff] to-[#b829ff] flex items-center justify-center shadow-lg shadow-[#00f0ff]/30">
							<QrCode className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1 text-left">
							<h3 className="text-base font-semibold text-white mb-0.5">Сканировать билет</h3>
							<p className="text-xs text-gray-400">Открыть сканер QR</p>
						</div>
					</button>
					<button
						type="button"
						onClick={() => setIsManualOpen(true)}
						className="shrink-0 w-12 rounded-r-2xl bg-linear-to-br from-[#b829ff] to-[#00f0ff] flex items-center justify-center shadow-lg shadow-[#b829ff]/30 hover:scale-105 transition-transform active:scale-95"
						title="Ввести код вручную"
					>
						<Keyboard className="w-5 h-5 text-white" />
					</button>
				</div>

				<section className="space-y-2">
					<h3 className="text-lg font-semibold text-white flex items-center gap-2">
						<Clock className="w-5 h-5 text-[#00f0ff]" />
						Отсканированные за 24 ч
					</h3>
					{recentLoading ? (
						<div className="text-sm text-gray-400 py-4 text-center">Загрузка…</div>
					) : recentItems.length === 0 ? (
						<div className="text-sm text-gray-500 py-4 text-center">Пока нет отсканированных билетов</div>
					) : (
						<div className="space-y-2">
							{recentItems.map((row) => (
								<RecentRow key={row.id} row={row} onClick={() => setSelectedRecent(row)} />
							))}
						</div>
					)}
				</section>
			</div>

			<Dialog
				open={isManualOpen}
				onOpenChange={(open) => {
					setIsManualOpen(open);
					if (!open) setCodeInputs(Array(CODE_LENGTH).fill(""));
				}}
			>
				<DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-white text-center">Введите код билета</DialogTitle>
					</DialogHeader>
					<div className="flex gap-2 justify-center mb-4">
						{Array.from({ length: CODE_LENGTH }).map((_, i) => (
							<input
								key={i}
								ref={(el) => { inputRefs.current[i] = el; }}
								type="text"
								inputMode="text"
								value={codeInputs[i] || ""}
								onChange={(e) => handleInputChange(i, e.target.value)}
								onKeyDown={(e) => handleInputKeyDown(i, e)}
								maxLength={1}
								className="w-12 h-14 rounded-xl border-2 border-[#00f0ff]/30 bg-[#0a0a0f] text-center text-xl font-bold text-white focus:border-[#00f0ff] focus:outline-none"
							/>
						))}
					</div>
					<p className="text-center text-gray-400 text-xs mb-4">Код из {CODE_LENGTH} символов</p>
					<button
						type="button"
						disabled={codeInputs.join("").length !== CODE_LENGTH || isProcessing}
						onClick={() => handleManualSubmit(codeInputs.join(""))}
						className="w-full py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#b829ff] rounded-xl text-white font-semibold disabled:opacity-50"
					>
						{isProcessing ? "Проверка…" : "Подтвердить"}
					</button>
				</DialogContent>
			</Dialog>

			<Dialog open={!!result} onOpenChange={(open) => !open && setResult(null)}>
				<DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-white text-center">Билет отсканирован</DialogTitle>
					</DialogHeader>
					{result && (
						<div className="space-y-4">
							<div>
								<p className="text-xs text-gray-400 mb-2">Участник</p>
								<ParticipantInfo participant={result.participant} />
							</div>
							<div>
								<p className="text-xs text-gray-400 mb-2">Предмет к выдаче</p>
								<ItemInfo item={result.item} />
							</div>
							<button
								type="button"
								onClick={() => setResult(null)}
								className="w-full py-2.5 rounded-xl bg-[#00f0ff]/20 text-white font-medium border border-[#00f0ff]/50"
							>
								Закрыть
							</button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={!!selectedRecent} onOpenChange={(open) => !open && setSelectedRecent(null)}>
				<DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-white text-center">
							Билет {selectedRecent?.code}
						</DialogTitle>
					</DialogHeader>
					{selectedRecent && (
						<div className="space-y-4">
							<div>
								<p className="text-xs text-gray-400 mb-2">Участник</p>
								{selectedRecent.participant ? (
									<ParticipantInfo participant={selectedRecent.participant} />
								) : (
									<div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/20 text-gray-500 text-sm">
										Нет данных
									</div>
								)}
							</div>
							<div>
								<p className="text-xs text-gray-400 mb-2">Обменял на</p>
								{selectedRecent.item ? (
									<ItemInfo item={selectedRecent.item} />
								) : (
									<div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#b829ff]/20 text-gray-500 text-sm">
										Нет данных
									</div>
								)}
							</div>
							<button
								type="button"
								onClick={() => setSelectedRecent(null)}
								className="w-full py-2.5 rounded-xl bg-[#00f0ff]/20 text-white font-medium border border-[#00f0ff]/50"
							>
								Закрыть
							</button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
