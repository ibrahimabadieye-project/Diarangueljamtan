"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  Megaphone,
  AlertTriangle,
  X,
  ChevronDown,
  Landmark,
  MapPin,
  Plane,
  type LucideIcon,
} from "lucide-react";
import { badgeFor, formatLongDate, formatRelative } from "@/lib/format";
import { BADGE_STYLES, type Announcement, type AlertState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShareButton } from "./widgets";

const FILTERS: { id: string | "tout"; label: string }[] = [
  { id: "tout", label: "Tout le tableau" },
  { id: "communique", label: BADGE_STYLES.communique.label },
  { id: "conseil", label: BADGE_STYLES.conseil.label },
  { id: "deces", label: BADGE_STYLES.deces.label },
  { id: "naissance", label: BADGE_STYLES.naissance.label },
  { id: "mariage", label: BADGE_STYLES.mariage.label },
  { id: "diaspora", label: BADGE_STYLES.diaspora.label },
];

export default function HomeView({
  announcements,
  alert,
  focusId,
}: {
  announcements: Announcement[];
  alert: AlertState;
  focusId?: string | null;
}) {
  const [filter, setFilter] = useState<string | "tout">("tout");
  const [alertDismissed, setAlertDismissed] = useState(false);

  const filtered = useMemo(
    () => (filter === "tout" ? announcements : announcements.filter((a) => a.kind === filter)),
    [announcements, filter]
  );

  return (
    <div className="space-y-6">
      {/* ── Hero du village ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl shadow-lg" aria-label="Présentation du village">
        <img
          src="/images/fleuve-seneegal.jpg"
          alt="Les rives du fleuve Sénégal à Diaranguel — l'île à Morphil"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vert-dark via-vert-dark/70 to-vert-dark/20" />
        <div className="relative px-5 pb-6 pt-14 sm:px-8 sm:pb-8 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-or/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-vert-deep shadow">
            Village du Fouta-Toro
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Diaranguel
          </h1>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-emerald-50 sm:text-base">
            Le village du fleuve — entre le Sénégal et le Doué. Solidarité des habitants,
            voix de la diaspora : tout le village tient dans cette application.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <HeroChip icon={MapPin} text="Île à Morphil — Saldé, Podor (Saint-Louis)" />
            <HeroChip icon={Plane} text="≈ 415 km au nord-est de Dakar" />
            <HeroChip icon={Landmark} text="Jumelage JAD — Saint-Pierre-de-Bœuf depuis 1988" />
          </div>
        </div>
      </section>

      {/* ── Bandeau d'alerte urgente ────────────────────────────────────── */}
      {alert.active && !alertDismissed && alert.message && (
        <div
          role="alert"
          className="dgr-alert-pulse flex items-start gap-3 rounded-2xl border-2 border-destructive/60 bg-destructive/10 px-4 py-3.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold uppercase tracking-wide text-destructive">
              Alerte urgente — Case de santé
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">
              {alert.message}
            </p>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            aria-label="Fermer l'alerte"
            className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      {/* ── Filtres par catégorie ───────────────────────────────────────── */}
      <section aria-label="Filtres du tableau d'affichage">
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-all",
                filter === f.id
                  ? "border-vert bg-vert text-white shadow"
                  : "border-border bg-white text-muted-foreground hover:border-vert/40 hover:text-vert"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Flux des annonces ───────────────────────────────────────────── */}
      <section aria-label="Annonces officielles du village" className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white/70 px-6 py-10 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-vert/60" aria-hidden />
            <p className="mt-3 font-bold">Aucune annonce dans cette catégorie</p>
            <p className="text-sm text-muted-foreground">Le CVD publiera bientôt une information ici.</p>
          </div>
        )}
        {filtered.map((a) => (
          <AnnouncementCard key={a.id} a={a} isFocus={focusId === a.id} />
        ))}
      </section>
    </div>
  );
}

function HeroChip({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-or" aria-hidden />
      {text}
    </span>
  );
}

function AnnouncementCard({ a, isFocus = false }: { a: Announcement; isFocus?: boolean }) {
  const [expanded, setExpanded] = useState(isFocus);
  const ref = useRef<HTMLElement | null>(null);
  const badge = badgeFor(a.kind);
  const isDeath = a.kind === "deces";

  // Lien profond (/\?tab=accueil&a=<id>) : la carte ciblée s'ouvre et est visible
  useEffect(() => {
    if (isFocus) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isFocus]);

  return (
    <article
      ref={ref}
      tabIndex={-1}
      className={cn(
        "dgr-rise overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        isDeath ? "border-anthracite/50" : "border-border",
        isFocus && "ring-2 ring-vert ring-offset-2"
      )}
    >
      <div className={cn("h-1.5 w-full", isDeath ? "bg-anthracite" : "bg-vert/80")} />
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide",
              badge.className
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
            {badge.label}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {formatLongDate(a.date)} · {formatRelative(a.date)}
          </span>
        </div>

        <h3 className={cn("mt-2.5 text-lg font-extrabold leading-snug sm:text-xl", isDeath && "text-anthracite")}>
          {a.title}
        </h3>
        <p className="mt-1 text-sm font-bold text-vert">{a.author}</p>

        <div
          className={cn(
            "mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground/90",
            !expanded && "line-clamp-4"
          )}
        >
          {a.body}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-vert hover:text-vert-deep"
          aria-expanded={expanded}
        >
          {expanded ? "Réduire" : "Lire tout le communiqué"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>

        <div className="mt-4 border-t border-border/70 pt-3">
          <ShareButton
            title={a.title}
            body={a.body}
            path={`/?tab=accueil&a=${a.id}`}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </article>
  );
}
