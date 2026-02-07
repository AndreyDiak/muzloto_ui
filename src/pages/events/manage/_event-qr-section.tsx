import { QrCode } from "lucide-react";

interface EventQRSectionProps {
  onShowQR: () => void;
}

export function EventQRSection({ onShowQR }: EventQRSectionProps) {
  return (
    <div className="bg-[#16161d] rounded-2xl p-5 border border-[#00f0ff]/20">
      <h2 className="text-lg text-white mb-3 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-[#00f0ff]" />
        Код мероприятия
      </h2>
      <button
        type="button"
        onClick={onShowQR}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 font-medium"
      >
        <QrCode className="w-5 h-5" />
        Показать QR код
      </button>
    </div>
  );
}
