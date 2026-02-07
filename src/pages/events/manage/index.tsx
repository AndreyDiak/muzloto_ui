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
import {
  type ApiAwardCoinsResponse,
  type ApiBingoWinnersResponse,
  type ApiError,
  type ApiPersonalWinner,
  type ApiPersonalWinnerSlot,
  type ApiPrizeCodesResponse,
  type ApiRegistrationsResponse,
  PERSONAL_BINGO_SLOTS,
  parseJson,
} from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { BingoWinnersSection } from "./_bingo-winners-section";
import { EventQRSection } from "./_event-qr-section";
import { ParticipantsSection } from "./_participants-section";
import { WinnerPickerModal } from "./_winner-picker-modal";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");
const PERSONAL_BINGO_COUNT = 4;
const TEAM_BINGO_COUNT = 3;

export default function EventManage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { isRoot } = useSession();
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
  const [teamWinners, setTeamWinners] = useState<(string | null)[]>(
    Array(TEAM_BINGO_COUNT).fill(null),
  );
  const [pickerSlot, setPickerSlot] = useState<
    { type: "personal"; index: number } | { type: "team"; index: number } | null
  >(null);
  const [awardingWinner, setAwardingWinner] = useState<number | null>(null);

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
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (eventId && isRoot) {
      fetchRegistrations();
      fetchBingoWinners();
    }
  }, [eventId, isRoot, fetchRegistrations, fetchBingoWinners]);

  useEffect(() => {
    setPickerParticipantsPage(1);
  }, [pickerSlot]);

  const saveBingoWinners = useCallback(
    async (personal: ApiPersonalWinnerSlot[], team: (string | null)[]) => {
      if (!eventId) return;
      try {
        await authFetch(`${BACKEND_URL}/api/events/${eventId}/bingo-winners`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personal: personal.map((p) =>
              p == null ? null : "code" in p ? { code: p.code } : p.telegram_id,
            ),
            team,
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
            reward_type: PERSONAL_BINGO_SLOTS[slotIndex].rewardType,
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
    [eventId, showToast, personalWinners, teamWinners, saveBingoWinners],
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
              reward_type: PERSONAL_BINGO_SLOTS[slotIndex].rewardType,
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
          newPersonal[slotIndex] = { code: payload.code };
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
    [eventId, showToast, personalWinners, teamWinners, saveBingoWinners],
  );

  const handleTeamSubmit = useCallback(
    async (index: number, name: string) => {
      const newTeam = [...teamWinners];
      newTeam[index] = name.trim() || null;
      setTeamWinners(newTeam);
      setPickerSlot(null);
      await saveBingoWinners(personalWinners, newTeam);
    },
    [teamWinners, personalWinners, saveBingoWinners],
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
        <div className="bg-[#16161d] rounded-2xl p-5 border border-[#00f0ff]/20">
          <Skeleton className="h-5 w-44 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] rounded-xl" />
            ))}
          </div>
        </div>
        {/* Team bingo skeleton */}
        <div className="bg-[#16161d] rounded-2xl p-5 border border-[#b829ff]/20">
          <Skeleton className="h-5 w-40 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[56px] rounded-xl" />
            ))}
          </div>
        </div>
        {/* Participants skeleton */}
        <div className="bg-[#16161d] rounded-2xl p-5 border border-[#00f0ff]/20">
          <Skeleton className="h-5 w-48 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/10">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* QR section skeleton */}
        <div className="bg-[#16161d] rounded-2xl p-5 border border-[#00f0ff]/20">
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
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#00f0ff]/30 bg-[#0a0a0f] text-white hover:bg-[#00f0ff]/10"
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
      
      <ParticipantsSection
        registrations={registrations}
        loading={regsLoading}
        page={participantsPage}
        onPageChange={setParticipantsPage}
      />


      <EventQRSection onShowQR={() => setShowQR(true)} />

      <WinnerPickerModal
        pickerSlot={pickerSlot}
        registrations={registrations}
        personalWinners={personalWinners}
        teamWinners={teamWinners}
        pickerPage={pickerParticipantsPage}
        awardingWinner={awardingWinner}
        generatingCode={generatingCode}
        onClose={handleClosePicker}
        onPickerPageChange={setPickerParticipantsPage}
        onSelectPersonalWinner={handleSelectPersonalWinner}
        onGenerateCodeForSlot={handleGeneratePrizeCodeForSlot}
        onTeamSubmit={handleTeamSubmit}
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
