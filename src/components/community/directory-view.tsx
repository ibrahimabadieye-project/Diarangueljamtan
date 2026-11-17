"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldAlert,
  Hammer,
  Globe2,
  Building2,
  Home as HomeIcon,
  LockKeyhole,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Contact } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CallButton, WhatsAppDirectButton, EmptyState, SectionHeader } from "./widgets";

const TABS: { id: string; label: string; icon: LucideIcon; subtitle: string }[] = [
  { id: "urgence", label: "Urgences & Autorités", icon: ShieldAlert, subtitle: "Chef de village, santé, sécurité, eau" },
  { id: "artisan", label: "Ouvriers & Artisans", icon: Hammer, subtitle: "Les savoir-faire du village" },
  { id: "habitant", label: "Habitants & Diaspora", icon: Globe2, subtitle: "Dakar, France, Italie, Espagne, Mauritanie…" },
];

export default function DirectoryView() {
  const [tab, setTab] = useState("urgence");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fullAccess, setFullAccess] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", { cache: "no-store" });
      if (!res.ok) throw new Error("lecture");
      const data = await res.json();
      setFullAccess(Boolean(data.fullAccess));
      setContacts(data.rows ?? []);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (c.category !== tab) return false;
      if (!q) return true;
      return [c.name, c.role, c.quartier, c.city, c.note]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q));
    });
  }, [contacts, tab, query]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    contacts.forEach((c) => (m[c.category] = (m[c.category] ?? 0) + 1));
    return m;
  }, [contacts]);

  const habitanLocked = tab === "habitant" && !fullAccess;

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={HomeIcon}
        title="Annuaire du village"
        subtitle="Un numéro au bon moment — pour tout le village et la diaspora"
      />

      {/* Recherche instantanée */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, un métier, un quartier, une ville…"
          aria-label="Recherche dans l'annuaire"
          className="h-14 rounded-2xl border-2 border-border bg-white pl-12 text-base font-semibold shadow-sm focus-visible:ring-vert"
        />
      </div>

      {/* Onglets */}
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Catégories de l'annuaire">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-center transition-all",
              tab === id
                ? "border-vert bg-vert-pale shadow-sm"
                : "border-border bg-white hover:border-vert/40"
            )}
          >
            <Icon className={cn("h-5 w-5", tab === id ? "text-vert" : "text-muted-foreground")} aria-hidden />
            <span className={cn("text-[12px] font-extrabold leading-tight sm:text-[13px]", tab === id ? "text-vert-deep" : "text-muted-foreground")}>
              {label}
            </span>
            <span className="rounded-full bg-vert text-white px-2 py-0.5 text-[11px] font-black">
              {id === "habitant" && !fullAccess ? "•" : (counts[id] ?? 0)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-10 text-sm font-bold text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Chargement de l'annuaire…
        </div>
      ) : habitanLocked ? (
        <VillageCodeGate onUnlocked={load} />
      ) : (
        <>
          <p className="text-sm font-semibold text-muted-foreground">
            {TABS.find((t) => t.id === tab)?.subtitle} — {results.length} contact{results.length > 1 ? "s" : ""}
          </p>

          {/* Résultats */}
          <div className="grid gap-3 sm:grid-cols-2">
            {results.length === 0 && (
              <div className="sm:col-span-2">
                <EmptyState icon={Search} title="Aucun résultat" hint="Essayez un autre nom : Dieye, Diop, Sy, Sall, Ba, Ndongo…" />
              </div>
            )}
            {results.map((c) => (
              <ContactCard key={c.id} c={c} />
            ))}
          </div>
        </>
      )}

      <p className="rounded-xl bg-vert-pale px-4 py-3 text-xs font-semibold leading-relaxed text-vert-deep">
        Les numéros sont gérés par le Comité Villageois de Développement. Pour ajouter ou corriger
        un numéro, passer par la chefferie ou le président du CVD. Urgence nationale : composer le 17.
      </p>
    </div>
  );
}

/** Déverrouillage des contacts personnels par le code du village */
function VillageCodeGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (res.ok) {
      onUnlocked();
    } else {
      try {
        const data = await res.json();
        setError(data?.error ?? "Code incorrect");
      } catch {
        setError("Code incorrect");
      }
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vert-pale text-vert">
        <LockKeyhole className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-vert-deep">
        Contacts personnels protégés
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-muted-foreground">
        Les numéros des habitants et de la diaspora ne sont pas publics : ils sont réservés aux
        familles du village. Entrez le <strong>code du village</strong> transmis par le CVD dans les
        groupes WhatsApp — il restera déverrouillé sur cet appareil (90 jours).
      </p>
      <div className="mx-auto mt-5 max-w-xs space-y-3 text-left">
        <Input
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Code du village"
          aria-label="Code du village"
          className="h-14 text-center text-lg font-bold tracking-widest"
        />
        {error && <p className="text-center text-sm font-bold text-destructive">{error}</p>}
        <Button onClick={submit} disabled={busy} className="h-12 w-full bg-vert font-black hover:bg-vert-deep">
          {busy ? "Vérification…" : "Déverrouiller"}
        </Button>
      </div>
    </div>
  );
}

function ContactCard({ c }: { c: Contact }) {
  return (
    <article className="dgr-rise rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vert-pale font-display text-lg font-bold text-vert-deep">
          {c.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold leading-snug">{c.name}</h3>
          <p className="text-sm font-bold text-vert">{c.role}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {c.quartier && c.quartier !== "—" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                <HomeIcon className="h-3 w-3" aria-hidden />
                {c.quartier}
              </span>
            )}
            {c.city && (
              <span className="inline-flex items-center gap-1 rounded-full bg-or/20 px-2 py-0.5 text-[11px] font-bold text-or-dark">
                <Building2 className="h-3 w-3" aria-hidden />
                {c.city}
              </span>
            )}
          </div>
        </div>
      </div>

      {c.note && <p className="mt-2.5 text-sm leading-relaxed text-foreground/80">{c.note}</p>}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
        <span className="shrink-0 font-mono text-[13px] font-bold tracking-wide text-foreground whitespace-nowrap">{c.phone}</span>
        <div className="flex gap-2">
          <CallButton phone={c.phone} label={c.name} />
          {c.whatsapp && <WhatsAppDirectButton phone={c.whatsapp} />}
        </div>
      </div>
    </article>
  );
}
