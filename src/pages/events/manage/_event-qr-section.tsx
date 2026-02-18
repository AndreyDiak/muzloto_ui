import { QrCode } from "lucide-react";

interface EventQRSectionProps {
  onShowQR: () => void;
}

import { btnBase, btnCyan } from "./_button-styles";

export function EventQRSection({ onShowQR }: EventQRSectionProps) {
  return (
    <div className="bg-card-neutral rounded-2xl p-5 border border-white/6">
      <h2 className="text-lg text-white mb-3 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-neon-cyan" />
        Код мероприятия
      </h2>
      <button
        type="button"
        onClick={onShowQR}
        className={`${btnBase} ${btnCyan}`}
      >
        <QrCode className="w-5 h-5" />
        Показать QR код
      </button>
    </div>
  );
}
