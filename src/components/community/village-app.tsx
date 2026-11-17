"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/community/app-shell";
import HomeView from "@/components/community/home-view";
import AgendaView from "@/components/community/agenda-view";
import DirectoryView from "@/components/community/directory-view";
import HealthTransportView from "@/components/community/health-transport-view";
import MapRouteView from "@/components/community/map-route-view";
import HistoryView from "@/components/community/history-view";
import AdminView from "@/components/community/admin-view";
import type {
  Announcement,
  VillageEvent,
  Contact,
  InfoRow,
  RouteStep,
  HistoryArticle,
  AlertState,
  ViewId,
} from "@/lib/types";

interface AdminLists {
  announcements: Announcement[];
  events: VillageEvent[];
  contacts: Contact[];
}

export default function VillageApp({
  initialTab,
  focusAnnouncementId,
  announcements,
  alert,
  events,
  healthInfo,
  routeSteps,
  history,
  adminAuthed,
  adminLists,
}: {
  initialTab: ViewId;
  focusAnnouncementId: string | null;
  announcements: Announcement[] | null;
  alert: AlertState | null;
  events: VillageEvent[] | null;
  healthInfo: InfoRow[] | null;
  routeSteps: RouteStep[] | null;
  history: HistoryArticle[] | null;
  adminAuthed: boolean;
  adminLists: AdminLists | null;
}) {
  const [view, setView] = useState<ViewId>(initialTab);
  const router = useRouter();

  // Le serveur re-rend avec le nouvel onglet — ajustement d'état pendant le rendu
  // (motif React officiel : pas d'effect, donc pas de rendu en cascade)
  const [lastTab, setLastTab] = useState<ViewId>(initialTab);
  if (initialTab !== lastTab) {
    setLastTab(initialTab);
    setView(initialTab);
  }

  // Remonter en haut à chaque changement de section (navigation mobile)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [initialTab]);

  // Navigation : pousse l'URL (?tab=…) → bouton retour du navigateur actif
  const navigate = useCallback(
    (v: ViewId) => {
      if (v === view) return;
      router.push(v === "accueil" ? "/" : `/?tab=${v}`);
    },
    [router, view]
  );

  const refreshData = useCallback(() => router.refresh(), [router]);

  return (
    <AppShell active={view} onNavigate={navigate}>
      {view === "accueil" && (
        <HomeView announcements={announcements ?? []} alert={alert ?? { active: false, message: "" }} focusId={focusAnnouncementId} />
      )}
      {view === "agenda" && <AgendaView events={events ?? []} />}
      {view === "annuaire" && <DirectoryView />}
      {view === "sante" && <HealthTransportView rows={healthInfo ?? []} />}
      {view === "carte" && <MapRouteView steps={routeSteps ?? []} />}
      {view === "histoire" && <HistoryView articles={history ?? []} />}
      {view === "admin" && (
        <AdminView
          adminAuthed={adminAuthed}
          adminLists={adminLists}
          alert={alert ?? { active: false, message: "" }}
          onDataChanged={refreshData}
        />
      )}
    </AppShell>
  );
}
