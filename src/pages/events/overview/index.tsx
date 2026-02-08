import type { SEvent } from "@/entities/event";
import { http } from "@/http";
import { authFetch } from "@/lib/auth-fetch";
import {
  type ApiBingoWinnersResponse,
  type ApiEventTeam,
  type ApiPersonalWinnerSlot,
  type ApiTeamWinnerSlot,
  type ApiTeamsResponse,
  parseJson,
} from "@/types/api";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { BingoOverview } from "./_bingo-overview";
import { TeamsOverview } from "./_teams-overview";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");
const PERSONAL_BINGO_COUNT = 4;
const TEAM_BINGO_COUNT = 3;

export default function EventOverview() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<SEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [personalWinners, setPersonalWinners] = useState<
    ApiPersonalWinnerSlot[]
  >(Array(PERSONAL_BINGO_COUNT).fill(null));
  const [teamWinners, setTeamWinners] = useState<ApiTeamWinnerSlot[]>(
    Array(TEAM_BINGO_COUNT).fill(null),
  );
  const [eventTeams, setEventTeams] = useState<ApiEventTeam[]>([]);
  const [winnersLoading, setWinnersLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);

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
    } catch {
      setEvent(null);
    } finally {
      setEventLoading(false);
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

  const fetchEventTeams = useCallback(async () => {
    if (!eventId) return;
    setTeamsLoading(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/api/events/${eventId}/teams`);
      if (!res.ok) return;
      const json = await parseJson<ApiTeamsResponse>(res);
      setEventTeams(json.teams ?? []);
    } catch {
      setEventTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    fetchEvent();
    fetchBingoWinners();
    fetchEventTeams();
  }, [eventId, fetchEvent, fetchBingoWinners, fetchEventTeams]);

  if (eventLoading || !event) {
    return (
      <div className="p-4">
        <div className="h-10 w-10 rounded-lg bg-surface-dark animate-pulse mb-4" />
        <div className="h-6 w-48 bg-surface-dark animate-pulse rounded" />
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

      <BingoOverview
        personalWinners={personalWinners}
        teamWinners={teamWinners}
        loading={winnersLoading}
      />

      <TeamsOverview teams={eventTeams} loading={teamsLoading} />
    </div>
  );
}
