"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  Map as MapIcon,
  Route,
  Save,
  CheckCircle2,
  Stethoscope,
  GraduationCap,
  Landmark,
  Flag,
  Droplets,
  Ship,
  Wheat,
  Navigation,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RouteStep } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { OfflineChip, SectionHeader } from "./widgets";

// ─── Repères du village (île à Morphil, face à la rive mauritanienne) ────────

interface MarkerDef {
  id: string;
  name: string;
  desc: string;
  lat: number;
  lng: number;
  icon: LucideIcon;
}

const VILLAGE_CENTER: [number, number] = [16.5033, -14.3];
const MARKERS: MarkerDef[] = [
  { id: "sante", name: "Case de santé", desc: "Quartier de l'école — premier recours", lat: 16.5042, lng: -14.2987, icon: Stethoscope },
  { id: "ecole", name: "École primaire publique", desc: "Soutenue par le jumelage JAD", lat: 16.5026, lng: -14.3014, icon: GraduationCap },
  { id: "mosquee", name: "Mosquée centrale", desc: "Cœur spirituel du village", lat: 16.5036, lng: -14.3001, icon: Landmark },
  { id: "place", name: "Place publique", desc: "Lutte, réunions du CVD, marchés", lat: 16.5031, lng: -14.2993, icon: Flag },
  { id: "eau", name: "Château d'eau", desc: "Réseau d'eau potable (JAD 1988)", lat: 16.5046, lng: -14.2996, icon: Droplets },
  { id: "embarcadere", name: "Embarcadère", desc: "Pirogues — fleuve Sénégal & Doué", lat: 16.5061, lng: -14.3006, icon: Ship },
  { id: "walo", name: "Périmètre rizicole du Walo", desc: "Terres de décrue — or blanc du village", lat: 16.4958, lng: -14.3019, icon: Wheat },
];

const STORAGE_KEY = "diaranguel_route_offline";

export default function MapRouteView({ steps }: { steps: RouteStep[] }) {
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const [saved, setSaved] = useState(false);
  const [offline, setOffline] = useState(false);
  const [savedSteps, setSavedSteps] = useState<RouteStep[] | null>(null);

  // État enregistré + copie hors-ligne RELUE depuis l'appareil
  useEffect(() => {
    const readSaved = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (Array.isArray(data?.steps) && data.steps.length > 0) {
          setSaved(true);
          return data.steps as RouteStep[];
        }
      } catch {
        /* ignore */
      }
      return null;
    };

    readSaved();
    const update = () => {
      const isOffline = !navigator.onLine;
      setOffline(isOffline);
      setSavedSteps(isOffline ? readSaved() : null);
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Carte Leaflet (chargée uniquement côté client)
  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapHostRef.current) return;

      map = L.map(mapHostRef.current, { scrollWheelZoom: false }).setView(VILLAGE_CENTER, 16);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      MARKERS.forEach((m) => {
        const html = `
          <div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#166534;border:3px solid #fff;box-shadow:0 3px 10px rgba(15,61,34,.45);color:#fff">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${markerSvg(m.id)}</svg>
          </div>`;
        const icon = L.divIcon({ html, className: "", iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -18] });
        L.marker([m.lat, m.lng], { icon })
          .addTo(map!)
          .bindPopup(`<b>${m.name}</b><br/>${m.desc}`);
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  const saveForOffline = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          savedAt: new Date().toISOString(),
          village: "Diaranguel — île à Morphil (Saldé, Podor)",
          steps,
          markers: MARKERS.map(({ id, name, desc, lat, lng }) => ({ id, name, desc, lat, lng })),
        })
      );
      setSaved(true);
      toast({
        title: "Guide enregistré sur l'appareil",
        description: "Le trajet Dakar → Diaranguel reste consultable hors-ligne, même sans réseau sur la piste.",
      });
    } catch {
      toast({ title: "Impossible d'enregistrer", description: "Vérifiez l'espace de stockage du navigateur.", variant: "destructive" });
    }
  };

  const removeOffline = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSaved(false);
      toast({ title: "Guide hors-ligne supprimé" });
    } catch {
      /* ignore */
    }
  };

  const totalKm = steps.reduce((s, x) => s + x.distanceKm, 0);
  // Hors-ligne : on relit la copie enregistrée sur l'appareil plutôt que les données serveur
  const displaySteps = offline && savedSteps ? savedSteps : steps;

  return (
    <div className="space-y-8">
      {/* ── Carte du village ──────────────────────────────────────────── */}
      <section aria-labelledby="titre-carte">
        <SectionHeader icon={MapIcon} title="Carte du village" subtitle="Les lieux qui comptent à Diaranguel" />
        <div
          ref={mapHostRef}
          className="h-[380px] w-full overflow-hidden rounded-2xl border border-border shadow-sm sm:h-[440px]"
          role="img"
          aria-label="Carte du village de Diaranguel avec ses lieux essentiels"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {MARKERS.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border px-2.5 py-1 text-xs font-bold text-foreground/80">
              <m.icon className="h-3.5 w-3.5 text-vert" aria-hidden />
              {m.name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Guide de route Dakar → Diaranguel ─────────────────────────── */}
      <section aria-labelledby="titre-route">
        <SectionHeader
          icon={Route}
          title="Dakar → Diaranguel"
          subtitle={`Guide routier par étapes — ≈ ${totalKm} km, 6 à 7 heures`}
          right={<OfflineChip />}
        />

        {offline && savedSteps && (
          <p className="mb-3 flex items-center gap-2 rounded-xl bg-vert-pale px-4 py-3 text-sm font-bold text-vert-deep">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            Mode hors-ligne — guide chargé depuis la copie enregistrée sur cet appareil.
          </p>
        )}

        <ol className="relative ml-4 space-y-4 border-l-2 border-vert-pale pl-6 sm:ml-6 sm:pl-8">
          {displaySteps.map((s) => (
            <li key={s.id} className="dgr-rise relative">
              <span className="absolute -left-[35px] sm:-left-[43px] flex h-8 w-8 items-center justify-center rounded-full bg-vert text-sm font-black text-white shadow ring-4 ring-background">
                {s.stepNumber}
              </span>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-vert-deep">{s.landmark}</h3>
                  <span className="rounded-full bg-or/20 px-3 py-1 text-sm font-black text-or-dark">
                    {s.distanceKm} km
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/90">{s.instruction}</p>
                {s.tip && (
                  <p className="mt-2.5 flex items-start gap-2 rounded-xl bg-vert-pale px-3 py-2 text-sm font-semibold leading-relaxed text-vert-deep">
                    <Navigation className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {s.tip}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-foreground/85">
            <Ship className="mt-0.5 h-4 w-4 shrink-0 text-vert" aria-hidden />
            Dernier tronçon : depuis la gare de Ndioum ou de Pété, prendre un sept-places, un 4x4 ou une
            charrette ; à l'embarcadère, les pirogues de Moussa Dieye « le vieux » traversent les bras du
            fleuve vers la rive mauritanienne (Kaédi).
          </p>
          {saved ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-2 rounded-xl bg-vert px-4 py-3 font-bold text-white">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                Guide enregistré sur cet appareil — prêt pour le trajet
              </span>
              <Button variant="outline" onClick={removeOffline} className="h-12 font-bold">
                Supprimer
              </Button>
            </div>
          ) : (
            <Button
              onClick={saveForOffline}
              size="lg"
              className="mt-3 h-14 w-full gap-2 bg-vert text-base font-black hover:bg-vert-deep sm:w-auto sm:px-8"
            >
              <Save className="h-5 w-5" aria-hidden />
              Sauvegarder pour le trajet hors-ligne
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

// Petits tracés SVG inline (compatible lucide) pour chaque type de lieu
function markerSvg(id: string): string {
  switch (id) {
    case "sante":
      return '<path d="M12 5v14"/><path d="M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4" fill="none"/>';
    case "ecole":
      return '<path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v4"/>';
    case "mosquee":
      return '<path d="M12 2v2"/><path d="M5 10c0-4 3-6 7-6s7 2 7 6"/><path d="M3 21h18"/><path d="M5 21v-9m14 9v-9"/><path d="M9 21v-5h6v5"/>';
    case "place":
      return '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/><line x1="20" x2="20" y1="22" y2="15"/>';
    case "eau":
      return '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>';
    case "embarcadere":
      return '<path d="M12 10.189V4.5a1.5 1.5 0 0 1 3 0v6.36l5 1.792a4 4 0 0 1 2.49 3.715l-.07 1.697a7 7 0 0 1-6.796 6.736A38.9 38.9 0 0 1 12 24.5a38.9 38.9 0 0 1-3.624-.11 7 7 0 0 1-6.796-6.736l-.07-1.697A4 4 0 0 1 4 12.65z"/>';
    case "walo":
      return '<path d="M2 22 12 2l10 20"/><path d="M6 15h12"/><path d="M4 19h16"/>';
    default:
      return '<circle cx="12" cy="12" r="10"/>';
  }
}
