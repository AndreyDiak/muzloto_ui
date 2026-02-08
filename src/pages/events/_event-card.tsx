import type { SEvent } from "@/entities/event";
import {
  Banknote,
  Calendar,
  Clock,
  Eye,
  MapPin,
  Settings,
} from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { formatEventDate, useEventColors } from "./_utils";

interface Props {
  event: SEvent;
  isRoot?: boolean;
  isUpcoming?: boolean;
  /** Индекс для цвета в списке (0 = cyan, 1+ = циклически из палитры) */
  colorIndex?: number;
}

function getEventColor(
  index: number,
  colors: { cyan: string; colors: string[] },
): string {
  if (index === 0) {
    return colors.cyan;
  }
  return colors.colors[(index - 1) % colors.colors.length];
}

const iconCls = (upcoming: boolean) =>
  upcoming ? "w-4 h-4" : "w-3 h-3 shrink-0";
const metaCls = (upcoming: boolean) =>
  upcoming
    ? "space-y-2 text-gray-300 text-sm"
    : "space-y-1 text-gray-400 text-sm";
const metaItemCls = () => "flex items-center gap-2";
const btnCls = (upcoming: boolean) =>
  upcoming
    ? "flex items-center justify-center gap-2 flex-1 px-6 py-2.5 rounded-lg font-medium text-white"
    : "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap text-neon-cyan";

const linkBase =
  "transition-all border border-neon-cyan/40 bg-neon-cyan/10 hover:bg-neon-cyan/20";

export const EventCard = memo(({ event, isRoot, isUpcoming, colorIndex = 0 }: Props) => {
  const eventColors = useEventColors();
  const eventColor = getEventColor(colorIndex, eventColors);
  const eventDate = formatEventDate(event.event_date);
  const u = !!isUpcoming;

  return (
    <div
      className={
        u
          ? "bg-surface-card rounded-2xl overflow-hidden border border-neon-cyan/20 neon-glow"
          : "bg-surface-card rounded-xl border border-neon-cyan/10 transition-all hover:border-neon-cyan/20"
      }
    >
      {u && (
        <>
          {event.location_href ? (
            <div className="aspect-[1.75/1] w-full overflow-hidden relative">
              <img
                src={event.location_href}
                alt=""
                className="w-full h-full object-cover object-center block brightness-90 contrast-110 saturate-125"
              />
              <div className="absolute inset-0 bg-linear-to-t from-neon-cyan/35 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_10%,rgba(0,240,255,0.25),transparent_40%)]" />
            </div>
          ) : (
            <div
              className="h-48 bg-linear-to-br opacity-30"
              style={{
                background: `linear-gradient(135deg, ${eventColor} 0%, var(--color-surface-dark) 100%)`,
              }}
            />
          )}
        </>
      )}

      <div className="p-5 flex flex-col gap-5">
        <div>
          {u && (
            <span className="inline-block px-2 py-1 bg-neon-cyan/20 text-neon-cyan text-xs rounded-full border border-neon-cyan/30 mb-2">
              Скоро
            </span>
          )}
          <h3
            className={
              u ? "text-xl text-white mb-1" : "text-white mb-2"
            }
          >
            {event.title}
          </h3>
          {u && event.description && (
            <h4 className="text-sm text-gray-400 mb-4">{event.description}</h4>
          )}
          <div className={metaCls(u)}>
            <span className={metaItemCls()}>
              <Calendar className={iconCls(u)} style={{ color: eventColor }} />
              {eventDate.date}
            </span>
            <span className={metaItemCls()}>
              <Clock className={iconCls(u)} style={{ color: eventColor }} />
              {eventDate.time}
            </span>
            {u && (
              <>
                <span className={metaItemCls()}>
                  <Banknote className={iconCls(u)} style={{ color: eventColor }} />
                  {event.price} ₽
                </span>
                {event.location && (
                  <span className={metaItemCls()}>
                    <MapPin className={iconCls(u)} style={{ color: eventColor }} />
                    {event.location}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div
          className={
            u ? `flex flex-col gap-2 ${isRoot ? "pb-5" : "pt-2"}` : "flex flex-col gap-2"
          }
        >
          {(u || isRoot) && (
            <Link
              to={`/events/${event.id}/overview`}
              className={`${btnCls(u)} ${linkBase}`}
            >
              <Eye className={u ? "w-4 h-4" : "w-3.5 h-3.5"} />
              Обзор
            </Link>
          )}
          {isRoot && (
            <Link
              to={`/events/${event.id}/manage`}
              className={`${btnCls(u)} transition-all border-2 border-neon-purple/60 bg-neon-purple/25 hover:bg-neon-purple/40 hover:border-neon-purple ${u ? "text-white" : "text-neon-purple"}`}
            >
              <Settings className={u ? "w-4 h-4" : "w-3.5 h-3.5"} />
              Управление
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});
