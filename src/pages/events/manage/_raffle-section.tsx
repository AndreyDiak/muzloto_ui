import type { ApiRaffleResponse } from "@/types/api";
import { prettifyCoins } from "@/lib/utils";
import { Coins, Gift, User } from "lucide-react";
import { Link } from "react-router";
import { btnBase, btnGold } from "./_button-styles";

interface RaffleSectionProps {
  eventId: string;
  winner: ApiRaffleResponse["winner"];
  winnerCoins: number | null;
}

export function RaffleSection({ eventId, winner, winnerCoins }: RaffleSectionProps) {
  return (
    <div className="bg-card-neutral rounded-2xl p-5 border border-white/6">
      <div className="flex items-center gap-2 text-white text-base font-medium mb-2">
        <Gift className="w-5 h-5 text-neon-cyan" />
        Розыгрыш
        {winner && (
          <span className="text-sm font-normal text-gray-400">(проведён)</span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Один победитель среди зарегистрированных. Розыгрыш проводится один раз.
      </p>
      {winner ? (
        <div className="flex items-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border-2 border-neon-gold/40 shrink-0">
            {winner.avatar_url ? (
              <img
                src={winner.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-white/50" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-lg">{winner.first_name || "—"}</p>
            {winner.username && (
              <p className="text-gray-400 text-sm mt-0.5">@{winner.username}</p>
            )}
          </div>
          {winnerCoins != null && winnerCoins > 0 && (
            <div className="shrink-0 flex items-center gap-1.5 text-neon-gold text-sm">
              <Coins className="w-4 h-4" />
              <span>{prettifyCoins(winnerCoins)} монет</span>
            </div>
          )}
        </div>
      ) : (
        <Link
          to={`/events/${eventId}/raffle`}
          className={`${btnBase} ${btnGold}`}
        >
          <Gift className="w-5 h-5 shrink-0" />
          Провести розыгрыш
        </Link>
      )}
    </div>
  );
}
