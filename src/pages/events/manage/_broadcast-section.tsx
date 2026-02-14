import { MessageCircle, Megaphone } from "lucide-react";
import { btnBase, btnCyan, btnPurple } from "./_button-styles";

interface BroadcastSectionProps {
  registrationsCount: number;
  broadcastSending: boolean;
  onBroadcastFeedback: () => void;
  onAnnounceClick: () => void;
}

export function BroadcastSection({
  registrationsCount,
  broadcastSending,
  onBroadcastFeedback,
  onAnnounceClick,
}: BroadcastSectionProps) {
  return (
    <div className="bg-card-neutral rounded-2xl p-5 border border-white/6">
      <div className="flex items-center gap-2 text-white text-base font-medium mb-2">
        <MessageCircle className="w-5 h-5 text-neon-cyan" />
        Рассылка участникам
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Отправить всем зарегистрированным сообщение с просьбой об обратной связи (от бота в личку).
      </p>
      <button
        type="button"
        onClick={onBroadcastFeedback}
        disabled={broadcastSending || registrationsCount === 0}
        className={`${btnBase} ${btnCyan}`}
      >
        <MessageCircle className="w-5 h-5 shrink-0" />
        {broadcastSending ? "Отправка…" : "Получить обратную связь!"}
      </button>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-gray-400 text-sm mb-3">
          Разослать анонс мероприятия в личку выбранным пользователям (для тестов — выберите аккаунты, чтобы не беспокоить всех).
        </p>
        <button
          type="button"
          onClick={onAnnounceClick}
          className={`${btnBase} ${btnPurple}`}
        >
          <Megaphone className="w-5 h-5" />
          Рассылка анонса
        </button>
      </div>
    </div>
  );
}
