import { useToast } from "@/app/context/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { useCallback, useEffect, useRef, useState } from "react";

const NEON_CYAN = "#00f0ff";
const NEON_PURPLE = "#b829ff";
const LOGO_URL = "/logo_for_qr.png";
const SVG_NS = "http://www.w3.org/2000/svg";

/** Размер QR на экране (px) */
const QR_DISPLAY_SIZE = 240;
/** Размер QR при скачивании по умолчанию (билеты, коды покупки) */
const QR_DEFAULT_SIZE = 240;
/** Размер QR при скачивании для кода мероприятия (печать) */
const QR_EVENT_REGISTRATION_SIZE = 1024;

/** Делает центральное изображение в QR круглым через clipPath */
function makeQrLogoRound(container: HTMLDivElement) {
	const svg = container.querySelector("svg");
	const img = container.querySelector("svg image");
	if (!svg || !img) return;
	const id = "qr-logo-circle-" + Math.random().toString(36).slice(2, 9);
	const defs = document.createElementNS(SVG_NS, "defs");
	const clipPath = document.createElementNS(SVG_NS, "clipPath");
	clipPath.setAttribute("id", id);
	clipPath.setAttribute("clipPathUnits", "objectBoundingBox");
	const circle = document.createElementNS(SVG_NS, "circle");
	circle.setAttribute("cx", "0.5");
	circle.setAttribute("cy", "0.5");
	circle.setAttribute("r", "0.5");
	clipPath.appendChild(circle);
	defs.appendChild(clipPath);
	svg.insertBefore(defs, svg.firstChild);
	img.setAttribute("clip-path", `url(#${id})`);
}

export interface TicketQRModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Код билета (для QR и ручного ввода) */
	code: string;
	/** Название позиции для отображения в шапке модалки */
	itemName: string;
	/** Показывать подпись «Билет сохранится у вас в разделе «Профиль»». По умолчанию true */
	showProfileHint?: boolean;
	/** Заголовок модального окна. По умолчанию «Ваш билет» */
	dialogTitle?: string;
	/** Данные для QR (например ссылка t.me/...?startapp=CODE). Если не задано — в QR кодируется code */
	qrData?: string;
	/** true = высокое разрешение при скачивании (для кода мероприятия на печать). По умолчанию false */
	highResolutionDownload?: boolean;
}

export function TicketQRModal({
	open,
	onOpenChange,
	code,
	itemName,
	showProfileHint = true,
	dialogTitle = "Ваш билет",
	qrData,
	highResolutionDownload = false,
}: TicketQRModalProps) {
	const { showToast } = useToast();
	const qrInstanceRef = useRef<InstanceType<typeof QRCodeStyling> | null>(null);
	const dataForQr = (qrData ?? code).trim() || code;
	const [isQrReady, setIsQrReady] = useState(false);
	const qrPixelSize = highResolutionDownload ? QR_EVENT_REGISTRATION_SIZE : QR_DEFAULT_SIZE;

	useEffect(() => {
		if (open) setIsQrReady(false);
	}, [open]);

	const setQrContainer = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return;
			if (!dataForQr) {
				qrInstanceRef.current = null;
				setIsQrReady(true);
				return;
			}
			setIsQrReady(false);
			node.replaceChildren();
			const qr = new QRCodeStyling({
				width: qrPixelSize,
				height: qrPixelSize,
				type: "svg",
				data: dataForQr,
				qrOptions: { errorCorrectionLevel: "H" },
				// rounded — лёгкое закругление (extra-rounded даёт слишком большой радиус)
				dotsOptions: {
					color: NEON_CYAN,
					type: "rounded",
					gradient: {
						type: "linear",
						rotation: 135,
						colorStops: [
							{ offset: 0, color: NEON_CYAN },
							{ offset: 1, color: NEON_PURPLE },
						],
					},
				},
				cornersSquareOptions: {
					color: NEON_PURPLE,
					type: "rounded",
				},
				cornersDotOptions: { color: NEON_CYAN, type: "rounded" },
				backgroundOptions: { color: "#16161d" },
				image: LOGO_URL,
				// До 30% площади при Level H — иначе часть сканеров не читает. 0.25 даёт запас
				imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.25 },
			});
			qr.append(node);
			qrInstanceRef.current = qr;
			// Центральное изображение — круглое; даём отрисовку (и загрузку картинки) завершиться
			requestAnimationFrame(() => {
				makeQrLogoRound(node);
				setTimeout(() => makeQrLogoRound(node), 80);
			});
			setTimeout(() => setIsQrReady(true), 350);
		},
		[dataForQr, qrPixelSize],
	);

	const handleCopyCode = useCallback(() => {
		navigator.clipboard.writeText(code);
		showToast("Код скопирован", "success");
	}, [code, showToast]);

	const handleDownloadQr = useCallback(async () => {
		const qr = qrInstanceRef.current;
		if (!qr) {
			showToast("QR-код ещё генерируется", "info");
			return;
		}
		const fileName = `event-${code}.png`;

		const blob = await qr.getRawData("png");
		if (!blob || !(blob instanceof Blob)) {
			showToast("Не удалось сформировать изображение", "error");
			return;
		}
		const url = URL.createObjectURL(blob);

		try {
			// Всегда прямой скачивание по ссылке — не используем navigator.share(),
			// иначе на Windows/Telegram Desktop открывается диалог «Поделиться»
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			a.rel = "noopener";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(url), 500);
			showToast("QR-код сохранён", "success");
		} catch (e) {
			console.error(e);
			URL.revokeObjectURL(url);
			showToast("Не удалось сохранить QR-код. Скопируйте код вручную.", "error");
		}
	}, [code, showToast]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-surface-card border border-white/[0.08] max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-white text-center">{dialogTitle}</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col items-center gap-4">
					<p className="text-sm text-center text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple font-semibold">
						{itemName}
					</p>
					<div className="relative" style={{ width: QR_DISPLAY_SIZE, height: QR_DISPLAY_SIZE }}>
						<div
							ref={setQrContainer}
							className="rounded-lg overflow-hidden size-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-full [&>svg]:h-auto"
							style={{ maxWidth: QR_DISPLAY_SIZE, maxHeight: QR_DISPLAY_SIZE }}
							aria-hidden
						/>
						{!isQrReady && (
							<div
								className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface-card"
								aria-hidden
							>
								<Skeleton className="size-[200px] rounded-lg shrink-0" />
								<span className="sr-only">Генерация QR-кода…</span>
							</div>
						)}
					</div>
					<div className="text-center w-full">
						<p className="text-gray-400 text-xs mb-1">Код для ручного ввода</p>
						<div className="flex items-center justify-center gap-2">
							<p className="text-2xl font-mono font-bold tracking-widest text-neon-cyan">
								{code}
							</p>
							<button
								type="button"
								onClick={handleCopyCode}
								className="p-2 rounded-lg bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
								title="Скопировать код"
								aria-label="Скопировать код"
							>
								<Copy className="w-5 h-5" />
							</button>
						</div>
					</div>
					{showProfileHint && (
						<p className="text-gray-500 text-xs text-center">
							Билет сохранится у вас в разделе «Профиль»
						</p>
					)}
					<button
						type="button"
						onClick={handleDownloadQr}
						disabled={!isQrReady}
						className="w-full py-2.5 rounded-xl bg-neon-cyan text-black font-medium hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Скачать QR
					</button>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="w-full py-2.5 rounded-xl bg-neon-cyan/25 text-white font-medium hover:bg-neon-cyan/30 transition-colors"
					>
						Закрыть
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
