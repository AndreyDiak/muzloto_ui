import { useToast } from "@/app/context/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { useCallback, useRef } from "react";

const NEON_CYAN = "#00f0ff";
const NEON_PURPLE = "#b829ff";
const LOGO_URL = "/logo_for_qr.png";
const SVG_NS = "http://www.w3.org/2000/svg";

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
}

export function TicketQRModal({
	open,
	onOpenChange,
	code,
	itemName,
	showProfileHint = true,
}: TicketQRModalProps) {
	const { showToast } = useToast();
	const qrInstanceRef = useRef<InstanceType<typeof QRCodeStyling> | null>(null);

	const setQrContainer = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node || !code) {
				qrInstanceRef.current = null;
				return;
			}
			node.replaceChildren();
			const qr = new QRCodeStyling({
				width: 200,
				height: 200,
				type: "svg",
				data: code,
				qrOptions: { errorCorrectionLevel: "H" },
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
					type: "extra-rounded",
				},
				cornersDotOptions: { color: NEON_CYAN, type: "dot" },
				backgroundOptions: { color: "#16161d" },
				image: LOGO_URL,
				imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.4 },
			});
			qr.append(node);
			qrInstanceRef.current = qr;
			// Центральное изображение — круглое; даём отрисовку (и загрузку картинки) завершиться
			requestAnimationFrame(() => {
				makeQrLogoRound(node);
				setTimeout(() => makeQrLogoRound(node), 80);
			});
		},
		[code],
	);

	const handleCopyCode = useCallback(() => {
		navigator.clipboard.writeText(code);
		showToast("Код скопирован", "success");
	}, [code, showToast]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-white text-center">Ваш билет</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col items-center gap-4">
					<p className="text-sm text-center text-transparent bg-clip-text bg-linear-to-r from-[#00f0ff] to-[#b829ff] font-semibold">
						{itemName}
					</p>
					<div
						ref={setQrContainer}
						className="rounded-lg overflow-hidden [&>svg]:max-w-[200px] [&>svg]:max-h-[200px] [&>svg]:w-full [&>svg]:h-auto"
						style={{ width: 200, height: 200 }}
						aria-hidden
					/>
					<div className="text-center w-full">
						<p className="text-gray-400 text-xs mb-1">Код для ручного ввода</p>
						<div className="flex items-center justify-center gap-2">
							<p className="text-2xl font-mono font-bold tracking-widest text-[#00f0ff]">
								{code}
							</p>
							<button
								type="button"
								onClick={handleCopyCode}
								className="p-2 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-colors"
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
						onClick={() => onOpenChange(false)}
						className="w-full py-2.5 rounded-xl bg-[#00f0ff]/20 text-white font-medium border border-[#00f0ff]/50"
					>
						Закрыть
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
