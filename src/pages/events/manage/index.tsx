import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
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
import type { SEvent } from "@/entities/event";
import { http } from "@/http";
import { authFetch } from "@/lib/auth-fetch";
import {
	getEventCodeBotStartLink,
	getEventCodeDeepLink,
} from "@/lib/event-deep-link";
import {
	type ApiEventTeam,
	type ApiRaffleResponse,
	type ApiRegistrationsResponse,
	type ApiTeamsResponse,
	parseJson,
} from "@/types/api";
import { ChevronLeft, Gift, Loader2, Plus, User, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { EventQRSection } from "./_event-qr-section";
import { ParticipantsSection } from "./_participants-section";
import { RaffleModal } from "./_raffle-modal";
import { TeamsSection } from "./_teams-section";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

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
  const [showQR, setShowQR] = useState(false);
  const [eventTeams, setEventTeams] = useState<ApiEventTeam[]>([]);

  // — Add-team modal state —
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);
  const [participantsPage, setParticipantsPage] = useState(1);

  const [raffleWinner, setRaffleWinner] = useState<ApiRaffleResponse["winner"]>(null);
  const [raffleOpen, setRaffleOpen] = useState(false);

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

  const fetchRaffle = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/api/events/${eventId}/raffle`);
      if (!res.ok) return;
      const json = await parseJson<ApiRaffleResponse>(res);
      setRaffleWinner(json.winner ?? null);
    } catch {
      setRaffleWinner(null);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    fetchEvent();
    if (isRoot) {
      fetchRegistrations();
      fetchEventTeams();
      fetchRaffle();
    }
  }, [eventId, isRoot, fetchEvent, fetchRegistrations, fetchEventTeams, fetchRaffle]);

  if (!isRoot) {
    return <Navigate to="/events" replace />;
  }

  if (eventLoading || !event) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-6 w-48 rounded-lg" />
        </div>
        <div className="bg-surface-card rounded-2xl p-5 border border-neon-cyan/20">
          <Skeleton className="h-5 w-32 rounded-lg mb-3" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
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
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon-cyan/25 text-white hover:bg-neon-cyan/35 transition-colors border border-white/[0.06]"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white truncate flex-1">
          {event.title}
        </h1>
      </div>

      {/* ——— Команды и участники ——— */}
      <div className="bg-card-neutral rounded-2xl overflow-hidden border border-white/[0.06]">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="teams" className="border-b border-white/[0.06]">
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

      {/* ——— Розыгрыш ——— */}
      <div className="bg-card-neutral rounded-2xl p-5 border border-white/[0.06]">
        <div className="flex items-center gap-2 text-white text-base font-medium mb-2">
          <Gift className="w-5 h-5 text-neon-cyan" />
          Розыгрыш
          {raffleWinner && (
            <span className="text-sm font-normal text-gray-400">(проведён)</span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Один победитель среди зарегистрированных. Розыгрыш проводится один раз.
        </p>
        <button
          type="button"
          onClick={() => setRaffleOpen(true)}
          className="w-full py-3 rounded-xl bg-neon-gold/15 text-neon-gold font-medium border border-neon-gold/30 hover:bg-neon-gold/25 transition-colors"
        >
          {raffleWinner ? "Посмотреть победителя" : "Провести розыгрыш"}
        </button>
      </div>

      <EventQRSection onShowQR={() => setShowQR(true)} />

      {/* — Кнопка добавления команды (временное решение) — */}
      <button
        type="button"
        onClick={() => setAddTeamOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-purple/15 text-neon-purple text-sm font-medium hover:bg-neon-purple/25 transition-colors border border-white/[0.06]"
      >
        <Plus className="w-4 h-4" />
        Зарегистрировать команду
      </button>

      <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
        <DialogContent className="bg-surface-card border border-white/[0.08] text-white max-w-sm">
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
              className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-neon-purple/30"
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

      {eventId && (
        <RaffleModal
          eventId={eventId}
          registrations={registrations}
          open={raffleOpen}
          onOpenChange={setRaffleOpen}
          existingWinner={raffleWinner}
          onRaffleDone={fetchRaffle}
        />
      )}
    </div>
  );
}
