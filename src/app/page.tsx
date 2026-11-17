import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { cookies } from "next/headers";
import VillageApp from "@/components/community/village-app";
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

export const dynamic = "force-dynamic";

const TABS: ViewId[] = ["accueil", "agenda", "annuaire", "sante", "carte", "histoire", "admin"];

const TITLES: Record<ViewId, string> = {
  accueil: "Tableau officiel — annonces du village",
  agenda: "Agenda du village — cérémonies et rendez-vous",
  annuaire: "Annuaire utile — contacts du village et de la diaspora",
  sante: "Santé & Transport — case de santé et trajets",
  carte: "Carte & Route — le village et le guide Dakar → Diaranguel",
  histoire: "Histoire & Patrimoine — les origines de Diaranguel",
  admin: "Administration du village",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const view = (TABS as string[]).includes(tab ?? "") ? (tab as ViewId) : "accueil";
  return { title: `${TITLES[view]} | Diaranguel — Jam Tan !` };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; a?: string }>;
}) {
  const { tab, a } = await searchParams;
  const view = (TABS as string[]).includes(tab ?? "") ? (tab as ViewId) : "accueil";

  // Chaque section ne lit que SES tables — plus de chargement complet systématique.
  const adminCookie = (await cookies()).get("diaranguel_admin")?.value;
  const adminAuthed = isAuthed(adminCookie);

  let announcements: Announcement[] | null = null;
  let alert: AlertState | null = null;
  let events: VillageEvent[] | null = null;
  let healthInfo: InfoRow[] | null = null;
  let routeSteps: RouteStep[] | null = null;
  let history: HistoryArticle[] | null = null;
  // Listes admin : transmises UNIQUEMENT si la session admin est valide
  let adminLists: { announcements: Announcement[]; events: VillageEvent[]; contacts: Contact[] } | null = null;

  if (view === "accueil" || view === "admin") {
    const [rows, alertRows] = await Promise.all([
      db.announcement.findMany({ orderBy: { date: "desc" } }),
      db.healthTransportInfo.findMany({ where: { section: "alerte" } }),
    ]);
    announcements = rows.map((a2) => ({
      id: a2.id, kind: a2.kind, title: a2.title, author: a2.author, body: a2.body, date: a2.date.toISOString(),
    }));
    alert = {
      active: alertRows.find((r) => r.key === "active")?.value === "true",
      message: alertRows.find((r) => r.key === "message")?.value ?? "",
    };
  }
  if (view === "agenda" || view === "admin") {
    const rows = await db.event.findMany({ orderBy: { startAt: "asc" } });
    events = rows.map((e) => ({
      id: e.id, kind: e.kind, title: e.title,
      startAt: e.startAt.toISOString(), endAt: e.endAt ? e.endAt.toISOString() : null,
      location: e.location, quartier: e.quartier, family: e.family, notes: e.notes,
    }));
  }
  if (view === "sante") {
    const rows = await db.healthTransportInfo.findMany({
      where: { section: { in: ["sante", "transport"] } },
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });
    healthInfo = rows.map((r) => ({
      id: r.id, section: r.section, key: r.key, label: r.label, value: r.value, sortOrder: r.sortOrder,
    }));
  }
  if (view === "carte") {
    const rows = await db.routeStep.findMany({ orderBy: { stepNumber: "asc" } });
    routeSteps = rows.map((s) => ({
      id: s.id, stepNumber: s.stepNumber, landmark: s.landmark, instruction: s.instruction,
      distanceKm: s.distanceKm, tip: s.tip,
    }));
  }
  if (view === "histoire") {
    const rows = await db.historyArticle.findMany({ orderBy: [{ section: "asc" }, { sortOrder: "asc" }] });
    history = rows.map((h) => ({
      id: h.id, section: h.section, title: h.title, subtitle: h.subtitle, body: h.body,
      period: h.period, image: h.image, sortOrder: h.sortOrder,
    }));
  }
  if (view === "admin" && adminAuthed) {
    const contacts = await db.contact.findMany({ orderBy: { name: "asc" } });
    adminLists = {
      announcements: announcements ?? [],
      events: events ?? [],
      contacts: contacts.map((c) => ({
        id: c.id, category: c.category, name: c.name, role: c.role, quartier: c.quartier,
        city: c.city, phone: c.phone, whatsapp: c.whatsapp, note: c.note,
      })),
    };
  }

  return (
    <VillageApp
      initialTab={view}
      focusAnnouncementId={view === "accueil" ? (a ?? null) : null}
      announcements={announcements}
      alert={alert}
      events={events}
      healthInfo={healthInfo}
      routeSteps={routeSteps}
      history={history}
      adminAuthed={adminAuthed}
      adminLists={adminLists}
    />
  );
}
