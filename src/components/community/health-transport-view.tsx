"use client";

import { useMemo } from "react";
import {
  HeartPulse,
  Clock,
  Users,
  Baby,
  Syringe,
  PhoneCall,
  Droplets,
  Pill,
  Hospital,
  Bus,
  Ship,
  Truck,
  Route,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { InfoRow } from "@/lib/types";
import { telHref } from "@/lib/format";

const ICONS: Record<string, LucideIcon> = {
  nom: Hospital,
  horaires: Clock,
  equipe: Users,
  cpn: Baby,
  pev: Syringe,
  urgence_tel: PhoneCall,
  orientation: Route,
  eau: Droplets,
  pharmacie: Pill,
  sept_places: Bus,
  dakar: Bus,
  pirogue: Ship,
  piste: Route,
  hivernage: Truck,
  charrette: Info,
};

export default function HealthTransportView({ rows }: { rows: InfoRow[] }) {
  const sante = useMemo(
    () => rows.filter((r) => r.section === "sante" && r.key !== "urgence_tel"),
    [rows]
  );
  const transport = useMemo(() => rows.filter((r) => r.section === "transport"), [rows]);
  const tel = rows.find((r) => r.key === "urgence_tel")?.value ?? "77 428 67 90";

  return (
    <div className="space-y-8">
      {/* ── Santé ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="titre-sante">
        <h2 id="titre-sante" className="mb-4 flex items-center gap-2 font-display text-2xl font-bold text-vert-deep">
          <HeartPulse className="h-6 w-6 text-vert" aria-hidden />
          La Case de santé de Diaranguel
        </h2>

        {/* Bouton d'urgence en très grand format */}
        <div className="mb-4 rounded-2xl border-2 border-destructive/50 bg-destructive/10 p-4 sm:p-5">
          <p className="text-sm font-extrabold uppercase tracking-wide text-destructive">
            Urgence médicale au village
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground/80">
            Un seul numéro pour l'agent de garde — appel direct, jour et nuit :
          </p>
          <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <a
              href={telHref(tel)}
              className="flex h-16 flex-1 items-center justify-center gap-3 rounded-2xl bg-destructive px-6 text-xl font-black text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-95"
              aria-label={`Appel d'urgence au ${tel}`}
            >
              <PhoneCall className="h-7 w-7" aria-hidden />
              {tel}
            </a>
            <div className="text-xs font-semibold text-foreground/70 sm:max-w-[220px]">
              Cas graves : orienter vers <strong>Pété (12 km)</strong> puis l'hôpital de{" "}
              <strong>Ndioum (45 km)</strong>.
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {sante.map((row) => {
            const Icon = ICONS[row.key] ?? Info;
            return (
              <article
                key={row.id}
                className="dgr-rise rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vert-pale text-vert">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-vert-deep">{row.label}</h3>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground/90">{row.value}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Transport ─────────────────────────────────────────────────── */}
      <section aria-labelledby="titre-transport">
        <h2 id="titre-transport" className="mb-4 flex items-center gap-2 font-display text-2xl font-bold text-vert-deep">
          <Bus className="h-6 w-6 text-vert" aria-hidden />
          Transport & déplacements
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {transport.map((row) => {
            const Icon = ICONS[row.key] ?? Info;
            const praticable = row.value.toUpperCase().includes("PRATICABLE");
            const difficile = row.value.toUpperCase().includes("DIFFICILE");
            return (
              <article
                key={row.id}
                className="dgr-rise rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vert-pale text-vert">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-vert-deep">{row.label}</h3>
                      {praticable && (
                        <span className="rounded-full bg-vert px-2.5 py-1 text-[11px] font-black uppercase text-white">
                          Praticable
                        </span>
                      )}
                      {difficile && (
                        <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-black uppercase text-white">
                          Difficile — Hivernage
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground/90">{row.value}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-4 rounded-xl bg-or/15 px-4 py-3 text-sm font-semibold leading-relaxed text-or-dark">
          Conseil du CVD : entre juillet et septembre (hivernage), toujours confirmer les départs de
          sept-places et l'état de la piste Pété ↔ Diaranguel avant de voyager. La traversée du Doué
          se fait au pont ou à l'embarcadère selon la crue.
        </p>
      </section>
    </div>
  );
}
