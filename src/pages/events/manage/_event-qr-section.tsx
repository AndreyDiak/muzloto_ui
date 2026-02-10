import { QrCode } from "lucide-react";

interface EventQRSectionProps {
  onShowQR: () => void;
}

export function EventQRSection({ onShowQR }: EventQRSectionProps) {
  return (
    <div className="bg-card-neutral rounded-2xl p-5">
      <h2 className="text-lg text-white mb-3 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-neon-cyan" />
        Код мероприятия
      </h2>
      <button
        type="button"
        onClick={onShowQR}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 font-medium border border-white/[0.06]"
      >
        <QrCode className="w-5 h-5" />
        Показать QR код
      </button>
    </div>
  );
}
