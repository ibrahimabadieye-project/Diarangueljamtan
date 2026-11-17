"use client";

import { useSyncExternalStore } from "react";
import {
  Home,
  CalendarDays,
  Users,
  HeartPulse,
  Map,
  BookOpen,
  Settings,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/types";

export const VIEWS: { id: ViewId; label: string; icon: LucideIcon; shortLabel: string }[] = [
  { id: "accueil", label: "Tableau officiel", icon: Home, shortLabel: "Accueil" },
  { id: "agenda", label: "Agenda du village", icon: CalendarDays, shortLabel: "Agenda" },
  { id: "annuaire", label: "Annuaire utile", icon: Users, shortLabel: "Annuaire" },
  { id: "sante", label: "Santé & Transport", icon: HeartPulse, shortLabel: "Santé" },
  { id: "carte", label: "Carte & Route", icon: Map, shortLabel: "Carte" },
  { id: "histoire", label: "Histoire & Patrimoine", icon: BookOpen, shortLabel: "Histoire" },
];

export default function AppShell({
  active,
  onNavigate,
  children,
}: {
  active: ViewId;
  onNavigate: (v: ViewId) => void;
  children: React.ReactNode;
}) {
  const online = useSyncExternalStore(
    (notify) => {
      window.addEventListener("online", notify);
      window.addEventListener("offline", notify);
      return () => {
        window.removeEventListener("online", notify);
        window.removeEventListener("offline", notify);
      };
    },
    () => navigator.onLine,
    () => true
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Barre latérale — grand écran */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 shrink-0 pattern-waves text-white fixed inset-y-0 left-0 z-40">
        <Logo onNavigate={onNavigate} compact={false} />
        <nav className="flex-1 px-4 pb-4 space-y-1.5" aria-label="Navigation principale">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={active === id ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-[15px] transition-all",
                active === id
                  ? "bg-white text-vert-deep shadow-md"
                  : "text-emerald-50/90 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.3} aria-hidden />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-5 space-y-1.5">
          <button
            onClick={() => onNavigate("admin")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-[15px] transition-all",
              active === "admin"
                ? "bg-white text-vert-deep shadow-md"
                : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <Settings className="h-5 w-5" strokeWidth={2.3} aria-hidden />
            Administration
          </button>
          <p className="px-4 pt-2 text-[11px] leading-relaxed text-emerald-100/70">
            Diaranguel — arrondissement de Saldé, département de Podor, région de Saint-Louis.
            Jaraama !
          </p>
        </div>
      </aside>

      {/* En-tête mobile */}
      <header className="lg:hidden sticky top-0 z-40 pattern-waves text-white shadow-md">
        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <Logo onNavigate={onNavigate} compact />
          <div className="flex items-center gap-2">
            {!online && (
              <span className="rounded-full bg-or px-2.5 py-1 text-[11px] font-extrabold text-vert-deep">
                Hors-ligne
              </span>
            )}
            <button
              onClick={() => onNavigate("admin")}
              aria-label="Administration du village"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-emerald-50 hover:bg-white/20"
            >
              <Settings className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 lg:pl-72 min-w-0">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 lg:px-8 pb-28 lg:pb-12 pt-4 sm:pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Barre inférieure — mobile */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/95 backdrop-blur shadow-[0_-4px_16px_rgba(15,61,34,0.08)] pb-safe"
        aria-label="Navigation du village"
      >
        <div className="grid grid-cols-6">
          {VIEWS.map(({ id, shortLabel, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={active === id ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors",
                active === id ? "text-vert" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                  active === id ? "bg-vert-pale" : "bg-transparent"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active === id ? 2.6 : 2.1} aria-hidden />
              </span>
              {shortLabel}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Logo({ onNavigate, compact }: { onNavigate: (v: ViewId) => void; compact: boolean }) {
  return (
    <button
      onClick={() => onNavigate("accueil")}
      className="flex items-center gap-3 px-4 py-3 text-left"
      aria-label="Diaranguel — aller à l'accueil"
    >
      <img
        src="/icons/icon-192.png"
        alt=""
        width={compact ? 40 : 56}
        height={compact ? 40 : 56}
        className="rounded-2xl shadow-md ring-2 ring-white/25"
      />
      <span>
        <span className="block font-display font-bold leading-tight text-white" style={{ fontSize: compact ? "1.25rem" : "1.6rem" }}>
          Diaranguel
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-or">
          <Waves className="h-3 w-3" aria-hidden />
          Île à Morphil — Jam tan !
        </span>
      </span>
    </button>
  );
}
