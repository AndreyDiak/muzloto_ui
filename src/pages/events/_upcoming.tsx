import type { SEvent } from "@/entities/event";
import { Banknote, Calendar, Clock, MapPin, Settings } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { formatEventDate, useEventColors } from "./_utils";

interface Props {
  event: SEvent;
  isRoot?: boolean;
}

export const UpcomingEvent = memo(
  ({ event, isRoot }: Props) => {
    const eventColors = useEventColors();
    const cyanColor = eventColors.cyan;
    const eventDate = formatEventDate(event.event_date);

    return (
      <div className="bg-surface-card rounded-2xl overflow-hidden border border-neon-cyan/20 neon-glow">
        {event.location_href ? (
          <div className="aspect-[1.75/1] w-full overflow-hidden relative">
            <img
              src={event.location_href}
              className="w-full h-full object-cover object-center block
											 brightness-90 contrast-110 saturate-125"
            />

            {/* неоновый тинт */}
            <div
              className="absolute inset-0 bg-linear-to-t 
													from-neon-cyan/35 
													via-black/30 
													to-transparent"
            />

            {/* лёгкий неоновый glow */}
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_40%_10%,rgba(0,240,255,0.25),transparent_40%)]"
            />
          </div>
        ) : (
          <div
            className="h-48 bg-linear-to-br opacity-30"
            style={{
              background: `linear-gradient(135deg, ${cyanColor} 0%, var(--color-surface-dark) 100%)`,
            }}
          />
        )}

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-neon-cyan/20 text-neon-cyan text-xs rounded-full border border-neon-cyan/30">
              Скоро
            </span>
          </div>
          <h3 className="text-xl text-white mb-1">{event.title}</h3>
					{event.description && <h4 className="text-sm text-gray-400 mb-4">{event.description}</h4>}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Calendar className="w-4 h-4" style={{ color: cyanColor }} />
              <span>{eventDate.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock className="w-4 h-4" style={{ color: cyanColor }} />
              <span>{eventDate.time}</span>
            </div>
						<div className="flex items-center gap-2 text-gray-300 text-sm">
							<Banknote className="w-4 h-4" style={{ color: cyanColor }}/>
							<span>{event.price} ₽</span>
						</div>
            {event.location && (
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4" style={{ color: cyanColor }} />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {isRoot && (
            <div className="pb-5">
              <Link
                to={`/events/${event.id}/manage`}
                className="flex items-center justify-center gap-2 w-full px-6 py-2.5 rounded-lg font-medium transition-all text-white border border-neon-cyan/40 bg-neon-cyan/10 hover:bg-neon-cyan/20"
              >
                <Settings className="w-4 h-4" />
                Управление
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  },
);
