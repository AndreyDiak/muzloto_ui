import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ApiPersonalWinner,
  ApiPersonalWinnerSlot,
  ApiRegistrationsResponse,
} from "@/types/api";
import { PERSONAL_BINGO_SLOTS } from "@/types/api";
import { ChevronLeft, ChevronRight, Loader2, User } from "lucide-react";
import { TeamNameForm } from "./_team-name-form";

const PAGE_SIZE = 5;

type PickerSlot =
  | { type: "personal"; index: number }
  | { type: "team"; index: number }
  | null;

interface WinnerPickerModalProps {
  pickerSlot: PickerSlot;
  registrations: ApiRegistrationsResponse["registrations"];
  personalWinners: ApiPersonalWinnerSlot[];
  teamWinners: (string | null)[];
  pickerPage: number;
  awardingWinner: number | null;
  generatingCode: boolean;
  onClose: () => void;
  onPickerPageChange: (page: number) => void;
  onSelectPersonalWinner: (r: ApiPersonalWinner, slotIndex: number) => void;
  onGenerateCodeForSlot: (slotIndex: number) => void;
  onTeamSubmit: (index: number, name: string) => void;
}

export function WinnerPickerModal({
  pickerSlot,
  registrations,
  personalWinners,
  teamWinners,
  pickerPage,
  awardingWinner,
  generatingCode,
  onClose,
  onPickerPageChange,
  onSelectPersonalWinner,
  onGenerateCodeForSlot,
  onTeamSubmit,
}: WinnerPickerModalProps) {
  const totalPages = Math.ceil(registrations.length / PAGE_SIZE);
  const slice = registrations.slice(
    (pickerPage - 1) * PAGE_SIZE,
    pickerPage * PAGE_SIZE
  );

  return (
    <Dialog
      open={!!pickerSlot}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm max-h-[90vh] min-h-[400px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">
            {pickerSlot?.type === "personal"
              ? PERSONAL_BINGO_SLOTS[pickerSlot.index ?? 0]?.label ?? `Победитель ${(pickerSlot.index ?? 0) + 1}`
              : `Команда ${(pickerSlot?.index ?? 0) + 1}`}
          </DialogTitle>
        </DialogHeader>
        {pickerSlot?.type === "personal" && pickerSlot.index !== undefined && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">Выберите участника</p>
              <ul className="space-y-1 -mx-1 pr-2">
                {slice.map((r) => (
                  <li key={r.telegram_id}>
                    <button
                      type="button"
                      disabled={awardingWinner !== null}
                      onClick={() =>
                        onSelectPersonalWinner(r, pickerSlot.index)
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/10 hover:border-[#00f0ff]/30 text-left disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#00f0ff]/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {r.avatar_url ? (
                          <img
                            src={r.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-[#00f0ff]" />
                        )}
                      </div>
                      <span className="text-white truncate flex-1">
                        {r.first_name || "—"}
                      </span>
                      {r.username && (
                        <span className="text-xs text-gray-400 truncate">
                          @{r.username}
                        </span>
                      )}
                      {awardingWinner === r.telegram_id && (
                        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[#00f0ff]" />
                      )}
                    </button>
                  </li>
                ))}
                {registrations.length === 0 && (
                  <p className="text-gray-400 text-sm py-4 text-center">
                    Нет участников
                  </p>
                )}
              </ul>
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#00f0ff]/10">
                  <button
                    type="button"
                    disabled={pickerPage <= 1}
                    onClick={() => onPickerPageChange(pickerPage - 1)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#00f0ff] border border-[#00f0ff]/30 bg-[#0a0a0f] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3 h-3" /> Назад
                  </button>
                  <span className="text-xs text-gray-400">
                    {pickerPage} из {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={pickerPage >= totalPages}
                    onClick={() => onPickerPageChange(pickerPage + 1)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded text-xs text-[#00f0ff] border border-[#00f0ff]/30 bg-[#0a0a0f] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Далее <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={generatingCode}
              onClick={() => onGenerateCodeForSlot(pickerSlot.index)}
              className="w-full py-2.5 rounded-lg border border-[#00f0ff]/25 bg-[#0a0a0f] text-[#00f0ff] hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/40 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {generatingCode ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Сгенерировать код"
              )}
            </button>
          </div>
        )}
        {pickerSlot?.type === "team" && pickerSlot.index !== undefined && (
          <TeamNameForm
            initialValue={teamWinners[pickerSlot.index] ?? ""}
            onSubmit={(name) => onTeamSubmit(pickerSlot.index, name)}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
