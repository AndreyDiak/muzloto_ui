import { useToast } from "@/app/context/toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authFetch } from "@/lib/auth-fetch";
import { useCallback, useEffect, useState } from "react";
import { btnOutline, btnPurple, btnSecondary } from "./_button-styles";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

interface Profile {
  telegram_id: number;
  first_name: string | null;
  username: string | null;
}

interface AnnounceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export function AnnounceModal({ open, onOpenChange, eventId }: AnnounceModalProps) {
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [selectedTelegramIds, setSelectedTelegramIds] = useState<Set<number>>(new Set());
  const [announceSending, setAnnounceSending] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setProfilesLoading(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/profiles`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setProfiles(data.profiles ?? []);
      else setProfiles([]);
    } catch {
      setProfiles([]);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && profiles.length === 0 && !profilesLoading) fetchProfiles();
  }, [open, profiles.length, profilesLoading, fetchProfiles]);

  const selectAllProfiles = () => {
    setSelectedTelegramIds(new Set(profiles.map((p) => p.telegram_id)));
  };

  const clearSelection = () => setSelectedTelegramIds(new Set());

  const handleSendAnnounce = useCallback(async () => {
    if (!eventId || selectedTelegramIds.size === 0 || announceSending) return;
    setAnnounceSending(true);
    try {
      const res = await authFetch(
        `${BACKEND_URL}/api/events/${eventId}/broadcast-announce`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegram_ids: Array.from(selectedTelegramIds) }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data?.error ?? "Ошибка рассылки", "error");
        return;
      }
      const { sent = 0, total = 0, failed = 0 } = data;
      if (failed === 0) {
        showToast(`Анонс отправлен ${sent} из ${total}`, "success");
        onOpenChange(false);
        setSelectedTelegramIds(new Set());
      } else {
        showToast(`Отправлено ${sent} из ${total}, не доставлено: ${failed}`, "success");
      }
    } catch {
      showToast("Ошибка рассылки", "error");
    } finally {
      setAnnounceSending(false);
    }
  }, [eventId, selectedTelegramIds, announceSending, showToast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-card border-white/10 text-white max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Рассылка анонса</DialogTitle>
        </DialogHeader>
        <p className="text-gray-400 text-sm mb-2">
          Выберите получателей (сообщение уйдёт в личку от бота):
        </p>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={selectAllProfiles}
            className={btnSecondary}
          >
            Выбрать всех
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className={btnSecondary}
          >
            Снять выбор
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 border border-white/10 rounded-lg p-2">
          {profilesLoading ? (
            <p className="text-gray-400 text-sm py-4 text-center">Загрузка профилей…</p>
          ) : profiles.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Нет профилей</p>
          ) : (
            profiles.map((p) => (
              <label
                key={p.telegram_id}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <Checkbox
                  checked={selectedTelegramIds.has(p.telegram_id)}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      setSelectedTelegramIds((prev) => new Set([...prev, p.telegram_id]));
                    } else {
                      setSelectedTelegramIds((prev) => {
                        const next = new Set(prev);
                        next.delete(p.telegram_id);
                        return next;
                      });
                    }
                  }}
                  className="border-white/30 data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                />
                <span className="text-white truncate">
                  {p.first_name || "—"}
                  {p.username ? ` @${p.username}` : ""}
                </span>
                <span className="text-gray-500 text-xs shrink-0">id {p.telegram_id}</span>
              </label>
            ))
          )}
        </div>
        <div className="flex gap-2 pt-3 mt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`flex-1 py-2.5 rounded-xl font-medium ${btnOutline}`}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSendAnnounce}
            disabled={selectedTelegramIds.size === 0 || announceSending}
            className={`flex-1 py-2.5 rounded-xl font-medium border border-neon-purple/40 ${btnPurple} disabled:opacity-50`}
          >
            {announceSending ? "Отправка…" : `Отправить (${selectedTelegramIds.size})`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
