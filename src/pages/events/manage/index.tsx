import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { SEvent } from "@/entities/event";
import { http } from "@/http";
import { authFetch } from "@/lib/auth-fetch";
import {
  getEventCodeBotStartLink,
  getEventCodeDeepLink,
} from "@/lib/event-deep-link";
import {
  type ApiRaffleResponse,
  type ApiRegistrationsResponse,
  parseJson,
} from "@/types/api";
import { User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { AnnounceModal } from "./_announce-modal";
import { BroadcastSection } from "./_broadcast-section";
import { EventManageHeader } from "./_event-manage-header";
import { EventManageSkeleton } from "./_event-manage-skeleton";
import { EventQRSection } from "./_event-qr-section";
import { ParticipantsSection } from "./_participants-section";
import { RaffleSection } from "./_raffle-section";

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

  const [raffleWinner, setRaffleWinner] =
    useState<ApiRaffleResponse["winner"]>(null);
  const [raffleWinnerCoins, setRaffleWinnerCoins] = useState<number | null>(
    null,
  );
  const [broadcastSending, setBroadcastSending] = useState(false);

  const [showAnnounceModal, setShowAnnounceModal] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    setEventLoading(true);
    try {
      const [eventResult, adminRes] = await Promise.all([
        http.from("events").select("*").eq("id", eventId).single(),
        authFetch(`${BACKEND_URL}/api/admin/events`),
      ]);

      const { data, error } = eventResult;
      if (error) throw new Error(error.message);

      let codeFromAdmin: string | null = null;
      try {
        const adminJson = await adminRes.json();
        const events = Array.isArray(adminJson?.events) ? adminJson.events : [];
        const matched = events.find(
          (e: { id?: string }) => e.id === data.id,
        ) as { code?: string | null } | undefined;
        if (matched && typeof matched.code === "string") {
          codeFromAdmin = matched.code;
        }
      } catch {
        // если админский эндпоинт недоступен, просто оставим код пустым
      }

      setEvent({ ...(data as SEvent), code: codeFromAdmin ?? "" });
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
      const res = await authFetch(
        `${BACKEND_URL}/api/events/${eventId}/raffle`,
      );
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

  const handleBroadcastFeedback = useCallback(async () => {
    if (!eventId || broadcastSending) return;
    setBroadcastSending(true);
    try {
      const res = await authFetch(
        `${BACKEND_URL}/api/events/${eventId}/broadcast-feedback`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data?.error ?? "Ошибка рассылки", "error");
        return;
      }
      const { total = 0, sent = 0, failed = 0 } = data;
      if (total === 0) {
        showToast("Нет зарегистрированных участников для рассылки", "info");
      } else if (failed === 0) {
        showToast(`Разослано ${sent} из ${total} участникам`, "success");
      } else {
        showToast(
          `Разослано ${sent} из ${total}, не доставлено: ${failed}`,
          "success",
        );
      }
    } catch {
      showToast("Ошибка рассылки", "error");
    } finally {
      setBroadcastSending(false);
    }
  }, [eventId, broadcastSending, showToast]);

  if (!isRoot) {
    return <Navigate to="/events" replace />;
  }

  if (eventLoading || !event) {
    return <EventManageSkeleton />;
  }

  return (
    <div className="p-3 space-y-4">
      <EventManageHeader title={event.title} />

      {/* ——— Участники ——— */}
      <div className="bg-card-neutral rounded-2xl overflow-hidden border border-white/6">
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

      {eventId && (
        <RaffleSection
          eventId={eventId}
          winner={raffleWinner}
          winnerCoins={raffleWinnerCoins}
        />
      )}

      <EventQRSection onShowQR={() => setShowQR(true)} />

      {event && (
        <TicketQRModalLazy
          open={showQR}
          onOpenChange={setShowQR}
          code={event.code ?? ""}
          itemName={event.title}
          showProfileHint={false}
          dialogTitle="Код мероприятия"
          highResolutionDownload
          qrData={
            getEventCodeDeepLink(event.code ?? "") ||
            getEventCodeBotStartLink(event.code ?? "") ||
            undefined
          }
        />
      )}

      <BroadcastSection
        registrationsCount={registrations.length}
        broadcastSending={broadcastSending}
        onBroadcastFeedback={handleBroadcastFeedback}
        onAnnounceClick={() => setShowAnnounceModal(true)}
      />
      
      {eventId && (
        <AnnounceModal
          open={showAnnounceModal}
          onOpenChange={setShowAnnounceModal}
          eventId={eventId}
        />
      )}
    </div>
  );
}
