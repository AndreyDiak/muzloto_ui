import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { SEvent } from "@/entities/event";
import { http } from "@/http";
import { authFetch } from "@/lib/auth-fetch";
import {
	getEventCodeBotStartLink,
	getEventCodeDeepLink,
} from "@/lib/event-deep-link";
import { prettifyCoins } from "@/lib/utils";
import {
	type ApiRaffleResponse,
	type ApiRegistrationsResponse,
	parseJson,
} from "@/types/api";
import { ChevronLeft, Coins, Gift, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router";
import { EventQRSection } from "./_event-qr-section";
import { ParticipantsSection } from "./_participants-section";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

export default function EventManage() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isRoot } = useSession();
  const { showToast } = useToast();
  const [event, setEvent] = useState<SEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [registrations, setRegistrations] = useState<
    ApiRegistrationsResponse["registrations"]
  >([]);
  const [regsLoading, setRegsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [participantsPage, setParticipantsPage] = useState(1);

  const [raffleWinner, setRaffleWinner] = useState<ApiRaffleResponse["winner"]>(null);
  const [raffleWinnerCoins, setRaffleWinnerCoins] = useState<number | null>(null);

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

  const fetchRaffle = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/api/events/${eventId}/raffle`);
      if (!res.ok) return;
      const json = await parseJson<ApiRaffleResponse>(res);
      setRaffleWinner(json.winner ?? null);
      setRaffleWinnerCoins(json.winner_coins ?? null);
    } catch {
      setRaffleWinner(null);
      setRaffleWinnerCoins(null);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    fetchEvent();
    if (isRoot) {
      fetchRegistrations();
      fetchRaffle();
    }
  }, [eventId, isRoot, fetchEvent, fetchRegistrations, fetchRaffle]);

  useEffect(() => {
    if (location.state?.raffleConfirmed && eventId) {
      fetchRaffle();
      navigate(`/events/${eventId}/manage`, { replace: true, state: {} });
    }
  }, [location.state?.raffleConfirmed, eventId, fetchRaffle, navigate]);

  if (!isRoot) {
    return <Navigate to="/events" replace />;
  }

  if (eventLoading || !event) {
    return (
      <div className="p-3 space-y-4">
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
    <div className="p-3 space-y-4">
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

      {/* ——— Участники ——— */}
      <div className="bg-card-neutral rounded-2xl overflow-hidden border border-white/[0.06]">
        <Accordion type="single" collapsible className="w-full">
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
        {raffleWinner ? (
          <div className="flex items-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border-2 border-neon-gold/40 shrink-0">
              {raffleWinner.avatar_url ? (
                <img
                  src={raffleWinner.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-white/50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-lg">{raffleWinner.first_name || "—"}</p>
              {raffleWinner.username && (
                <p className="text-gray-400 text-sm mt-0.5">@{raffleWinner.username}</p>
              )}
            </div>
            {raffleWinnerCoins != null && raffleWinnerCoins > 0 && (
              <div className="shrink-0 flex items-center gap-1.5 text-neon-gold text-sm">
                <Coins className="w-4 h-4" />
                <span>{prettifyCoins(raffleWinnerCoins)} монет</span>
              </div>
            )}
          </div>
        ) : (
          <Link
            to={`/events/${eventId}/raffle`}
            className="block w-full py-3 rounded-xl bg-neon-gold/15 text-neon-gold font-medium border border-neon-gold/30 hover:bg-neon-gold/25 transition-colors text-center"
          >
            Провести розыгрыш
          </Link>
        )}
      </div>

      <EventQRSection onShowQR={() => setShowQR(true)} />

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

    </div>
  );
}
