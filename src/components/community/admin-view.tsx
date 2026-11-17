"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  CalendarDays,
  Users,
  Bell,
  LogIn,
  LogOut,
  Lock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { Announcement, VillageEvent, Contact, AlertState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "./admin/shared";
import AnnoncesTab from "./admin/annonces-tab";
import EvenementsTab from "./admin/evenements-tab";
import ContactsTab from "./admin/contacts-tab";
import AlerteTab from "./admin/alerte-tab";

type AdminTab = "annonces" | "evenements" | "contacts" | "alerte";

const TABS: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: "annonces", label: "Annonces", icon: Megaphone },
  { id: "evenements", label: "Événements", icon: CalendarDays },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "alerte", label: "Alerte urgente", icon: Bell },
];

interface AdminLists {
  announcements: Announcement[];
  events: VillageEvent[];
  contacts: Contact[];
}

export default function AdminView({
  adminAuthed,
  adminLists,
  alert,
  onDataChanged,
}: {
  adminAuthed: boolean;
  adminLists: AdminLists | null;
  alert: AlertState;
  onDataChanged?: () => void;
}) {
  const [authed, setAuthed] = useState(adminAuthed);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<AdminTab>("annonces");
  const [lists, setLists] = useState<AdminLists | null>(adminLists);

  // Les listes serveur font foi quand elles arrivent — ajustement pendant le rendu
  const [lastServerLists, setLastServerLists] = useState<AdminLists | null>(adminLists);
  if (adminLists !== lastServerLists) {
    setLastServerLists(adminLists);
    if (adminLists) setLists(adminLists);
  }

  // Sécurité : après une connexion côté client, recharge les listes via les API
  useEffect(() => {
    if (!authed || lists) return;
    Promise.all([
      fetch("/api/announcements").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/events").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/contacts").then((r) => (r.ok ? r.json() : { rows: [] })),
    ])
      .then(([announcements, events, contactsRes]) => {
        setLists({ announcements, events, contacts: contactsRes.rows ?? [] });
        onDataChanged?.();
      })
      .catch(() => undefined);
  }, [authed, lists, onDataChanged]);

  const login = async () => {
    if (!code.trim()) return;
    setBusy(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (res.ok) {
      setAuthed(true);
      setCode("");
      toast({ title: "Bienvenue au quartier admin", description: "Vous pouvez publier et modifier le contenu du village." });
    } else {
      toast({
        title: res.status === 429 ? "Trop de tentatives" : "Code incorrect",
        description: await apiErrorMessage(res, res.status === 429 ? "Attendez avant de réessayer." : "Demandez le code au président du CVD."),
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setLists(null);
    toast({ title: "Déconnecté" });
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vert-pale text-vert">
            <Lock className="h-8 w-8" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-vert-deep">Espace administration</h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Réservé au Conseil Villageois de Développement (CVD) de Diaranguel.
          </p>
          <div className="mt-6 space-y-3 text-left">
            <Label htmlFor="admin-code" className="font-bold">Code d'accès</Label>
            <Input
              id="admin-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Code du CVD"
              className="h-14 text-center text-lg font-bold tracking-widest"
            />
            <Button onClick={login} disabled={busy} className="h-14 w-full gap-2 bg-vert font-black hover:bg-vert-deep">
              <LogIn className="h-5 w-5" aria-hidden />
              {busy ? "Vérification…" : "Ouvrir l'administration"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Code long et confidentiel, connu du CVD uniquement.
              5 essais maximum par 15 minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!lists) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Chargement des données admin">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-vert-deep sm:text-3xl">Administration du village</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-vert" aria-hidden />
            Publier, corriger, alerter — au service de Diaranguel
          </p>
        </div>
        <Button variant="outline" onClick={logout} className="gap-1.5 font-bold">
          <LogOut className="h-4 w-4" aria-hidden />
          Quitter
        </Button>
      </div>

      {/* Onglets admin */}
      <div className="grid grid-cols-4 gap-2" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 transition-all",
              tab === id ? "border-vert bg-vert text-white shadow" : "border-border bg-white text-muted-foreground hover:border-vert/40"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="text-xs font-extrabold">{label}</span>
          </button>
        ))}
      </div>

      {tab === "annonces" && <AnnoncesTab key="a" initial={lists.announcements} onMutated={onDataChanged} />}
      {tab === "evenements" && <EvenementsTab key="e" initial={lists.events} onMutated={onDataChanged} />}
      {tab === "contacts" && <ContactsTab key="c" initial={lists.contacts} onMutated={onDataChanged} />}
      {tab === "alerte" && <AlerteTab key="l" initial={alert} onMutated={onDataChanged} />}
    </div>
  );
}
