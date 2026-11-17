"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  List,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Download,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime, eventKindFor, googleCalendarUrl, downloadIcs } from "@/lib/format";
import type { VillageEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState, SectionHeader } from "./widgets";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function AgendaView({ events }: { events: VillageEvent[] }) {
  const [mode, setMode] = useState<"liste" | "calendrier">("liste");
  const [kindFilter, setKindFilter] = useState<string | "tout">("tout");

  const filtered = useMemo(
    () => (kindFilter === "tout" ? events : events.filter((e) => e.kind === kindFilter)),
    [events, kindFilter]
  );

  const kinds = useMemo(() => {
    const set = new Map<string, number>();
    events.forEach((e) => set.set(e.kind, (set.get(e.kind) ?? 0) + 1));
    return Array.from(set.keys());
  }, [events]);

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={CalendarDays}
        title="Agenda du village"
        subtitle="Cérémonies, réunions, fêtes et rendez-vous de Diaranguel"
        right={
          <div className="hidden sm:flex rounded-xl border border-border bg-white p-1">
            <ModeButton active={mode === "liste"} onClick={() => setMode("liste")} icon={List} label="Liste" />
            <ModeButton active={mode === "calendrier"} onClick={() => setMode("calendrier")} icon={Calendar} label="Calendrier" />
          </div>
        }
      />

      {/* Sélecteur liste / calendrier — mobile */}
      <div className="flex sm:hidden rounded-xl border border-border bg-white p-1">
        <ModeButton active={mode === "liste"} onClick={() => setMode("liste")} icon={List} label="Liste" />
        <ModeButton active={mode === "calendrier"} onClick={() => setMode("calendrier")} icon={Calendar} label="Calendrier" />
      </div>

      {/* Filtres de catégorie */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setKindFilter("tout")}
          className={cn(
            "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all",
            kindFilter === "tout" ? "border-vert bg-vert text-white" : "border-border bg-white text-muted-foreground hover:text-vert"
          )}
        >
          Tout ({events.length})
        </button>
        {kinds.map((k) => {
          const meta = eventKindFor(k);
          const count = events.filter((e) => e.kind === k).length;
          return (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all"
              style={
                kindFilter === k
                  ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
                  : { borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--muted-foreground)" }
              }
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: kindFilter === k ? "#fff" : meta.color }} aria-hidden />
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {mode === "liste" ? <ListeView events={filtered} /> : <CalendarView events={filtered} />}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all",
        active ? "bg-vert text-white shadow-sm" : "text-muted-foreground hover:text-vert"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

// ─── Vue liste ───────────────────────────────────────────────────────────────

function ListeView({ events }: { events: VillageEvent[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, VillageEvent[]>();
    events.forEach((e) => {
      const d = new Date(e.startAt);
      const key = `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  if (events.length === 0) {
    return <EmptyState icon={CalendarDays} title="Aucun événement" hint="Aucun rendez-vous dans cette catégorie pour l'instant." />;
  }

  return (
    <div className="space-y-6">
      {groups.map(([month, list]) => (
        <div key={month}>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold capitalize text-vert-deep">
            <span className="h-2 w-2 rounded-full bg-or" aria-hidden />
            {month}
          </h3>
          <div className="space-y-3">
            {list.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EventCard({ e }: { e: VillageEvent }) {
  const meta = eventKindFor(e.kind);
  const start = new Date(e.startAt);
  const day = String(start.getUTCDate()).padStart(2, "0");

  return (
    <article className="dgr-rise overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex">
        <div
          className="flex w-16 shrink-0 flex-col items-center justify-center border-r text-white"
          style={{ backgroundColor: meta.color }}
          aria-hidden
        >
          <span className="text-2xl font-black leading-none">{day}</span>
          <span className="mt-0.5 text-[11px] font-bold uppercase">{MONTHS[start.getUTCMonth()].slice(0, 4)}</span>
        </div>
        <div className="min-w-0 flex-1 p-4">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
          <h4 className="mt-1.5 text-[17px] font-extrabold leading-snug">{e.title}</h4>

          <div className="mt-2 grid gap-1 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-vert" aria-hidden />
              {formatTime(e.startAt)}
              {e.endAt ? ` – ${formatTime(e.endAt)}` : ""}
              <span className="font-medium text-muted-foreground/70">(heure du Sénégal)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-vert" aria-hidden />
              {e.location} <span className="text-border">|</span> {e.quartier}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-vert" aria-hidden />
              {e.family}
            </span>
          </div>

          {e.notes && <p className="mt-2.5 text-sm leading-relaxed text-foreground/85">{e.notes}</p>}

          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/70 pt-3">
            <Button asChild size="sm" className="h-10 gap-1.5 bg-vert hover:bg-vert-deep font-bold">
              <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer">
                <PlusCircle className="h-4 w-4" aria-hidden />
                Google Agenda
              </a>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10 gap-1.5 border-vert text-vert hover:bg-vert-pale font-bold"
              onClick={() => downloadIcs(e)}
            >
              <Download className="h-4 w-4" aria-hidden />
              Fichier .ics
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Vue calendrier ──────────────────────────────────────────────────────────

function CalendarView({ events }: { events: VillageEvent[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getUTCFullYear(), month: today.getUTCMonth() });
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getUTCDate());

  const byDay = useMemo(() => {
    const map = new Map<number, VillageEvent[]>();
    events.forEach((e) => {
      const d = new Date(e.startAt);
      if (d.getUTCFullYear() !== cursor.year || d.getUTCMonth() !== cursor.month) return;
      const day = d.getUTCDate();
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(e);
    });
    return map;
  }, [events, cursor]);

  const firstDow = (new Date(Date.UTC(cursor.year, cursor.month, 1)).getUTCDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();

  const shift = (delta: number) => {
    setSelectedDay(null);
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const monthEvents = events
    .filter((e) => {
      const d = new Date(e.startAt);
      return d.getUTCFullYear() === cursor.year && d.getUTCMonth() === cursor.month;
    })
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));

  const selectedEvents = selectedDay ? (byDay.get(selectedDay) ?? []) : monthEvents;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => shift(-1)} aria-label="Mois précédent" className="rounded-full p-2 text-vert hover:bg-vert-pale">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <h3 className="font-display text-lg font-bold capitalize">
            {MONTHS[cursor.month]} {cursor.year}
          </h3>
          <button onClick={() => shift(1)} aria-label="Mois suivant" className="rounded-full p-2 text-vert hover:bg-vert-pale">
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold uppercase text-muted-foreground">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="py-1">{w}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: firstDow }).map((_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const evts = byDay.get(day) ?? [];
            const isToday =
              day === today.getUTCDate() && cursor.month === today.getUTCMonth() && cursor.year === today.getUTCFullYear();
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative flex h-11 flex-col items-center justify-center rounded-xl text-sm font-bold transition-all",
                  isSelected ? "bg-vert text-white shadow" : isToday ? "bg-or/20 text-vert-deep" : "text-foreground hover:bg-vert-pale"
                )}
                aria-label={`${day} ${MONTHS[cursor.month]} : ${evts.length} événement(s)`}
              >
                {day}
                {evts.length > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {evts.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: isSelected ? "#e9b949" : eventKindFor(ev.kind).color }}
                        aria-hidden
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {selectedEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Pas d'événement cette sélection" hint="Choisissez un autre jour ou un autre mois." />
        ) : (
          selectedEvents.map((e) => <EventCard key={e.id} e={e} />)
        )}
      </div>
    </div>
  );
}
