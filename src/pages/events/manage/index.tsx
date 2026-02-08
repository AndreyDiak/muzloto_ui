import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
import type { SEvent } from "@/entities/event";
import { http } from "@/http";
import { authFetch } from "@/lib/auth-fetch";
import {
  getEventCodeBotStartLink,
  getEventCodeDeepLink,
  getPrizeDeepLink,
} from "@/lib/event-deep-link";
import { useBingoConfig } from "@/hooks/use-bingo-config";
import {
  type ApiAwardCoinsResponse,
  type ApiBingoWinnersResponse,
  type ApiError,
  type ApiEventTeam,
  type ApiPersonalWinner,
  type ApiPersonalWinnerSlot,
  type ApiPrizeCodesResponse,
  type ApiRegistrationsResponse,
  type ApiTeamWinnerSlot,
  type ApiTeamsResponse,
  parseJson,
} from "@/types/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Loader2, Plus, User, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { BingoWinnersSection } from "./_bingo-winners-section";
import { EventQRSection } from "./_event-qr-section";
import { ParticipantsSection } from "./_participants-section";
import { TeamsSection } from "./_teams-section";
import { WinnerPickerModal } from "./_winner-picker-modal";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");
const PERSONAL_BINGO_COUNT = 4;
const TEAM_BINGO_COUNT = 3;

export default function EventManage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { isRoot, isSupabaseSessionReady } = useSession();
  const { personalSlots, teamSlots } = useBingoConfig();
  const { showToast } = useToast();
  const [event, setEvent] = useState<SEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [registrations, setRegistrations] = useState<
    ApiRegistrationsResponse["registrations"]
  >([]);
  const [regsLoading, setRegsLoading] = useState(true);
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [prizeQRCode, setPrizeQRCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [pickerParticipantsPage, setPickerParticipantsPage] = useState(1);
  const [personalWinners, setPersonalWinners] = useState<
    ApiPersonalWinnerSlot[]
  >(Array(PERSONAL_BINGO_COUNT).fill(null));
  const [teamWinners, setTeamWinners] = useState<ApiTeamWinnerSlot[]>(
    Array(TEAM_BINGO_COUNT).fill(null),
  );
  const [eventTeams, setEventTeams] = useState<ApiEventTeam[]>([]);
  const [pickerSlot, setPickerSlot] = useState<
    { type: "personal"; index: number } | { type: "team"; index: number } | null
  >(null);
  const [awardingWinner, setAwardingWinner] = useState<number | null>(null);

  // — Add-team modal state —
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);

  const handleAddTeam = useCallback(async () => {
    const trimmed = newTeamName.trim();
    if (!trimmed || !eventId) return;
    setAddingTeam(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/api/events/${eventId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error ?? "Ошибка", "error");
        return;
      }
      setEventTeams((prev) =>
        [...prev, json.team as ApiEventTeam].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setNewTeamName("");
      setAddTeamOpen(false);
      showToast(`Команда «${trimmed}» создана`);
    } catch {
      showToast("Ошибка сети", "error");
    } finally {
      setAddingTeam(false);
    }
  }, [newTeamName, eventId, showToast]);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    setEventLoading(true);
    try {
      const { data, error } = await http
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (error) throw new Error(error.message);
      setEvent(data as SEvent);
    } catch (e) {
      showToast("Мероприятие не найдено", "error");
      setEvent(null);
    } finally {
      setEventLoading(false);
    }
  }, [eventId, showToast]);

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;
    setRegsLoading(true);
    try {
      const res = await authFetch(
        `${BACKEND_URL}/api/events/${eventId}/registrations`,
      );
      if (!res.ok) {
        setRegistrations([]);
        return;
      }
      const json = await parseJson<ApiRegistrationsResponse>(res);
      setRegistrations(json.registrations ?? []);
    } catch {
      setRegistrations([]);
    } finally {
      setRegsLoading(false);
    }
  }, [eventId]);

  const fetchEventTeams = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await authFetch(
        `${BACKEND_URL}/api/events/${eventId}/teams`,
      );
      if (!res.ok) return;
      const json = await parseJson<ApiTeamsResponse>(res);
      setEventTeams(json.teams ?? []);
    } catch {
      // ignore
    }
  }, [eventId]);

  const fetchBingoWinners = useCallback(async () => {
    if (!eventId) return;
    setWinnersLoading(true);
    try {
      const res = await authFetch(
        `${BACKEND_URL}/api/events/${eventId}/bingo-winners`,
      );
      if (!res.ok) return;
      const json = await parseJson<ApiBingoWinnersResponse>(res);
      const personal = Array(PERSONAL_BINGO_COUNT)
        .fill(null)
        .map((_, i) => json.personal?.[i] ?? null);
      const team = Array(TEAM_BINGO_COUNT)
        .fill(null)
        .map((_, i) => json.team?.[i] ?? null);
      setPersonalWinners(personal);
      setTeamWinners(team);
    } catch {
      // ignore
    } finally {
      setWinnersLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    // Запускаем все запросы параллельно — они независимы друг от друга
    fetchEvent();
    if (isRoot) {
      fetchRegistrations();
      fetchBingoWinners();
      fetchEventTeams();
    }
  }, [eventId, isRoot, fetchEvent, fetchRegistrations, fetchBingoWinners, fetchEventTeams]);

  // Realtime: при погашении кода приза обновляем данные победителей
  useEffect(() => {
    if (!eventId || !isRoot || !isSupabaseSessionReady) return;

    const channel = http
      .channel(`manage-prize-codes-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "event_prize_codes",
          filter: `event_id=eq.${eventId}`,
        },
        (payload: { new?: { telegram_id?: number | null; used_at?: string | null } }) => {
          // Код был только что погашен — обновляем данные
          if (payload.new?.telegram_id != null && payload.new?.used_at != null) {
            fetchBingoWinners();
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId, isRoot, isSupabaseSessionReady, fetchBingoWinners]);

  useEffect(() => {
    setPickerParticipantsPage(1);
  }, [pickerSlot]);

  const saveBingoWinners = useCallback(
    async (personal: ApiPersonalWinnerSlot[], team: ApiTeamWinnerSlot[]) => {
      if (!eventId) return;
      try {
        await authFetch(`${BACKEND_URL}/api/events/${eventId}/bingo-winners`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personal: personal.map((p) =>
              p == null ? null : "code" in p ? { code: p.code } : p.telegram_id,
            ),
            team: team.map((t) =>
              t == null ? null : "code" in t ? { code: t.code } : { id: t.id, name: t.name },
            ),
          }),
        });
      } catch {
        // ignore
      }
    },
    [eventId],
  );

  const handleSelectPersonalWinner = useCallback(
    async (r: ApiPersonalWinner, slotIndex: number) => {
      if (!eventId) return;
      setAwardingWinner(r.telegram_id);
      try {
        const res = await authFetch(`${BACKEND_URL}/api/events/award-coins`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventId,
            telegram_id: r.telegram_id,
            reward_type: personalSlots[slotIndex]?.rewardType ?? "personal_bingo_horizontal",
          }),
        });
        const data = await parseJson<ApiAwardCoinsResponse | ApiError>(
          res,
        ).catch(() => ({}) as ApiError);
        if (!res.ok) {
          showToast(
            "error" in data ? data.error : "Ошибка начисления монет",
            "error",
          );
          return;
        }
        const newPersonal = [...personalWinners];
        newPersonal[slotIndex] = r;
        setPersonalWinners(newPersonal);
        setPickerSlot(null);
        showToast(
          `Победитель отмечен. Начислено ${"amount" in data ? data.amount : 0} монет`,
          "success",
        );
        await saveBingoWinners(newPersonal, teamWinners);
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Нет сессии", "error");
      } finally {
        setAwardingWinner(null);
      }
    },
    [eventId, showToast, personalWinners, teamWinners, saveBingoWinners, personalSlots],
  );

  const handleGeneratePrizeCodeForSlot = useCallback(
    async (slotIndex: number) => {
      if (!eventId) return;
      setGeneratingCode(true);
      try {
        const res = await authFetch(
          `${BACKEND_URL}/api/events/${eventId}/prize-codes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reward_type: personalSlots[slotIndex]?.rewardType ?? "personal_bingo_horizontal",
            }),
          },
        );
        const data = await parseJson<ApiPrizeCodesResponse | ApiError>(
          res,
        ).catch(() => ({}) as ApiError);
        if (!res.ok) {
          showToast(
            "error" in data ? data.error : "Ошибка генерации кода",
            "error",
          );
          return;
        }
        const payload = data as ApiPrizeCodesResponse;
        if (payload.code) {
          const newPersonal = [...personalWinners];
          newPersonal[slotIndex] = { code: payload.code, redeemed: false, redeemed_at: null, redeemed_by: null };
          setPersonalWinners(newPersonal);
          setPickerSlot(null);
          showToast("Код создан", "success");
          await saveBingoWinners(newPersonal, teamWinners);
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Нет сессии", "error");
      } finally {
        setGeneratingCode(false);
      }
    },
    [eventId, showToast, personalWinners, teamWinners, saveBingoWinners, personalSlots],
  );

  const handleTeamSubmit = useCallback(
    async (index: number, team: ApiEventTeam) => {
      if (!eventId) return;
      const newTeam = [...teamWinners];
      newTeam[index] = team;
      setTeamWinners(newTeam);
      setPickerSlot(null);
      await saveBingoWinners(personalWinners, newTeam);

      try {
        const res = await authFetch(`${BACKEND_URL}/api/events/award-team-coins`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventId,
            team_id: team.id,
            reward_type: teamSlots[index]?.rewardType ?? "team_bingo_horizontal",
          }),
        });
        const data = await parseJson<{ success?: boolean; perMember?: number; membersCount?: number } | ApiError>(
          res,
        ).catch(() => ({} as ApiError));
        if (!res.ok) {
          showToast("error" in data ? data.error : "Ошибка начисления монет команде", "error");
          return;
        }
        const payload = data as { perMember: number; membersCount: number };
        showToast(
          `Монеты начислены: ${payload.perMember} каждому из ${payload.membersCount} участников`,
          "success",
        );
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Ошибка начисления", "error");
      }
    },
    [eventId, teamWinners, personalWinners, saveBingoWinners, showToast, teamSlots],
  );

  const handleGenerateTeamPrizeCodeForSlot = useCallback(
    async (slotIndex: number) => {
      if (!eventId) return;
      setGeneratingCode(true);
      try {
        const res = await authFetch(
          `${BACKEND_URL}/api/events/${eventId}/prize-codes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reward_type: teamSlots[slotIndex]?.rewardType ?? "team_bingo_horizontal" }),
          },
        );
        const data = await parseJson<ApiPrizeCodesResponse | ApiError>(
          res,
        ).catch(() => ({}) as ApiError);
        if (!res.ok) {
          showToast(
            "error" in data ? data.error : "Ошибка генерации кода",
            "error",
          );
          return;
        }
        const payload = data as ApiPrizeCodesResponse;
        if (payload.code) {
          const newTeam = [...teamWinners];
          newTeam[slotIndex] = { code: payload.code, redeemed: false, redeemed_at: null, redeemed_by: null };
          setTeamWinners(newTeam);
          setPickerSlot(null);
          showToast("Код создан", "success");
          await saveBingoWinners(personalWinners, newTeam);
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Нет сессии", "error");
      } finally {
        setGeneratingCode(false);
      }
    },
    [eventId, showToast, personalWinners, teamWinners, saveBingoWinners, teamSlots],
  );

  const handleClosePicker = useCallback(() => {
    setPickerSlot(null);
    setPickerParticipantsPage(1);
  }, []);

  if (!isRoot) {
    return <Navigate to="/events" replace />;
  }

  if (eventLoading || !event) {
    return (
      <div className="p-4 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-6 w-48 rounded-lg" />
        </div>
        {/* Personal bingo skeleton */}
        <div className="bg-surface-card rounded-2xl p-5 border border-neon-cyan/20">
          <Skeleton className="h-5 w-44 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] rounded-xl" />
            ))}
          </div>
        </div>
        {/* Team bingo skeleton */}
        <div className="bg-surface-card rounded-2xl p-5 border border-neon-purple/20">
          <Skeleton className="h-5 w-40 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[56px] rounded-xl" />
            ))}
          </div>
        </div>
        {/* Accordion skeleton */}
        <div className="bg-surface-card rounded-2xl p-5 border border-neon-cyan/20">
          <Skeleton className="h-5 w-32 rounded-lg mb-3" />
          <Skeleton className="h-12 rounded-xl" />
          <div className="mt-3 pt-3 border-t border-neon-cyan/10">
            <Skeleton className="h-5 w-36 rounded-lg mb-3" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
        {/* QR section skeleton */}
        <div className="bg-surface-card rounded-2xl p-5 border border-neon-cyan/20">
          <Skeleton className="h-5 w-36 rounded-lg mb-3" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/events"
          className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-neon-cyan/60 bg-neon-cyan/20 text-white hover:bg-neon-cyan/30 hover:border-neon-cyan transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white truncate flex-1">
          {event.title}
        </h1>
      </div>

      <BingoWinnersSection
        personalWinners={personalWinners}
        teamWinners={teamWinners}
        loading={winnersLoading}
        onSelectPersonal={(i) => setPickerSlot({ type: "personal", index: i })}
        onSelectTeam={(i) => setPickerSlot({ type: "team", index: i })}
        onShowPrizeQR={(code) => setPrizeQRCode(code)}
      />
      
      {/* ——— Accordion: Команды + Участники ——— */}
      <div className="bg-surface-card rounded-2xl border border-neon-cyan/20 overflow-hidden">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="teams" className="border-b border-neon-cyan/10">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-2 text-white text-base font-medium">
                <Users className="w-5 h-5 text-neon-purple" />
                Команды
                {eventTeams.length > 0 && (
                  <span className="text-sm font-normal text-gray-400">
                    ({eventTeams.length})
                  </span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <TeamsSection
                teams={eventTeams}
                registrations={registrations}
                loading={regsLoading}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="participants" className="border-b-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="flex items-center gap-2 text-white text-base font-medium">
                <User className="w-5 h-5 text-neon-cyan" />
                Участники
                {!regsLoading && registrations.length > 0 && (
                  <span className="text-sm font-normal text-gray-400">
                    ({registrations.length})
                  </span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <ParticipantsSection
                registrations={registrations}
                loading={regsLoading}
                page={participantsPage}
                onPageChange={setParticipantsPage}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <EventQRSection onShowQR={() => setShowQR(true)} />

      {/* — Кнопка добавления команды (временное решение) — */}
      <button
        type="button"
        onClick={() => setAddTeamOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-neon-purple/40 bg-neon-purple/5 text-neon-purple text-sm font-medium hover:bg-neon-purple/10 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Зарегистрировать команду
      </button>

      <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
        <DialogContent className="bg-surface-card border-neon-purple/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              Новая команда
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTeamName.trim()) handleAddTeam();
              }}
              placeholder="Название команды"
              className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-neon-purple/30 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-neon-purple/60"
              autoFocus
              disabled={addingTeam}
            />
            <button
              type="button"
              disabled={!newTeamName.trim() || addingTeam}
              onClick={handleAddTeam}
              className="w-full py-3 rounded-xl bg-neon-purple text-white font-medium text-sm hover:bg-neon-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {addingTeam && <Loader2 className="w-4 h-4 animate-spin" />}
              Создать
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <WinnerPickerModal
        pickerSlot={pickerSlot}
        registrations={registrations}
        personalSlots={personalSlots}
        teamSlots={teamSlots}
        personalWinners={personalWinners}
        teamWinners={teamWinners}
        eventTeams={eventTeams}
        pickerPage={pickerParticipantsPage}
        awardingWinner={awardingWinner}
        generatingCode={generatingCode}
        onClose={handleClosePicker}
        onPickerPageChange={setPickerParticipantsPage}
        onSelectPersonalWinner={handleSelectPersonalWinner}
        onGenerateCodeForSlot={handleGeneratePrizeCodeForSlot}
        onTeamSubmit={handleTeamSubmit}
        onGenerateTeamCodeForSlot={handleGenerateTeamPrizeCodeForSlot}
      />

      {event && (
        <TicketQRModalLazy
          open={showQR}
          onOpenChange={setShowQR}
          code={event.code}
          itemName={event.title}
          showProfileHint={false}
          dialogTitle="Код мероприятия"
          qrData={
            getEventCodeDeepLink(event.code) ||
            getEventCodeBotStartLink(event.code) ||
            undefined
          }
        />
      )}

      {prizeQRCode && (
        <TicketQRModalLazy
          open={!!prizeQRCode}
          onOpenChange={(open) => {
            if (!open) setPrizeQRCode(null);
          }}
          code={prizeQRCode}
          itemName="Приз за бинго"
          showProfileHint={false}
          dialogTitle="Код приза"
          qrData={getPrizeDeepLink(prizeQRCode) || undefined}
        />
      )}
    </div>
  );
}
