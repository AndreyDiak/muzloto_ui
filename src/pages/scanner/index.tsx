import type { ScanTicketItem, ScanTicketParticipant, ScanTicketSuccess } from "@/actions/scan-ticket";
import { scanTicket } from "@/actions/scan-ticket";
import { useSession } from "@/app/context/session";
import { useTelegram } from "@/app/context/telegram";
import { useToast } from "@/app/context/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard, QrCode, User } from "lucide-react";
import { useRef, useState } from "react";
import { Navigate } from "react-router";

const CODE_LENGTH = 5;

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

export function Scanner() {
	const { isRoot } = useSession();
	const { showToast } = useToast();
	const { tg } = useTelegram();
	const [result, setResult] = useState<ScanTicketSuccess | null>(null);
	const [isManualOpen, setIsManualOpen] = useState(false);
	const [codeInputs, setCodeInputs] = useState<string[]>(Array(CODE_LENGTH).fill(""));
	const [isProcessing, setIsProcessing] = useState(false);
	const isProcessingRef = useRef(false);

	if (!isRoot) {
		return <Navigate to="/" replace />;
	}

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
							onSuccess: (data) => {
								setResult(data);
								showToast("Билет успешно отсканирован", "success");
								isProcessingRef.current = false;
							},
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
				setResult(data);
				setIsManualOpen(false);
				setCodeInputs(Array(CODE_LENGTH).fill(""));
				showToast("Билет успешно отсканирован", "success");
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
		if (char && index === CODE_LENGTH - 1) {
			const full = next.join("");
			if (full.length === CODE_LENGTH) handleManualSubmit(full);
		}
	};

	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	return (
		<>
			<div className="p-4 space-y-6">
				<h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b829ff]">
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
						<div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#b829ff] flex items-center justify-center shadow-lg shadow-[#00f0ff]/30">
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
						className="shrink-0 w-12 rounded-r-2xl bg-gradient-to-br from-[#b829ff] to-[#00f0ff] flex items-center justify-center shadow-lg shadow-[#b829ff]/30 hover:scale-105 transition-transform active:scale-95"
						title="Ввести код вручную"
					>
						<Keyboard className="w-5 h-5 text-white" />
					</button>
				</div>
			</div>

			<Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
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
		</>
	);
}
