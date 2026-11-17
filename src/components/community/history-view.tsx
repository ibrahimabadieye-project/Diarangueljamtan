"use client";

import { useState } from "react";
import { BookOpen, ScrollText, Users2, Handshake, Quote, ChevronDown, type LucideIcon } from "lucide-react";
import type { HistoryArticle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./widgets";

const SECTIONS: { id: string; label: string; icon: LucideIcon; intro: string }[] = [
  {
    id: "origines",
    label: "Les Origines",
    icon: ScrollText,
    intro: "Le peuple du fleuve et les lieux qui racontent Diaranguel — entre le Sénégal au nord et le Doué au sud.",
  },
  {
    id: "figures",
    label: "Les Grandes Figures",
    icon: Users2,
    intro: "Les visages qui font vivre le village : foi, santé, culture, école, diaspora.",
  },
  {
    id: "cooperation",
    label: "La Coopération (JAD)",
    icon: Handshake,
    intro: "Depuis 1988, l'amitié avec Saint-Pierre-de-Bœuf et le développement porté par les habitants.",
  },
];

export default function HistoryView({ articles }: { articles: HistoryArticle[] }) {
  const [tab, setTab] = useState("origines");
  const list = articles.filter((a) => a.section === tab).sort((a, b) => a.sortOrder - b.sortOrder);
  const current = SECTIONS.find((s) => s.id === tab)!;

  return (
    <div className="space-y-5">
      <SectionHeader icon={BookOpen} title="Histoire & Patrimoine" subtitle="La mémoire du Fouta-Toro, gardée par les anciens" />

      {/* Onglets */}
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Sections d'histoire">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 transition-all",
              tab === id
                ? "border-vert bg-vert text-white shadow"
                : "border-border bg-white text-muted-foreground hover:border-vert/40 hover:text-vert"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="text-[12px] font-extrabold leading-tight sm:text-sm">{label}</span>
          </button>
        ))}
      </div>

      <p className="rounded-xl bg-vert-pale px-4 py-3 text-sm font-semibold leading-relaxed text-vert-deep">
        {current.intro}
      </p>

      {/* Articles */}
      <div className="space-y-5">
        {list.map((a) => (
          <HistoryCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}

function HistoryCard({ a }: { a: HistoryArticle }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = a.body.split("\n\n");

  return (
    <article className="dgr-rise overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md">
      {a.image && (
        <div className="relative">
          <img src={a.image} alt={a.title} className="h-52 w-full object-cover sm:h-64" />
          <div className="absolute inset-0 bg-gradient-to-t from-vert-dark/80 via-transparent to-transparent" />
          {a.period && (
            <span className="absolute bottom-3 left-4 rounded-full bg-or px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-vert-deep shadow">
              {a.period}
            </span>
          )}
        </div>
      )}
      <div className="p-4 sm:p-5">
        {!a.image && a.period && (
          <span className="mb-2 inline-block rounded-full bg-or/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-or-dark">
            {a.period}
          </span>
        )}
        <h3 className="font-display text-xl font-bold leading-snug text-vert-deep sm:text-2xl">{a.title}</h3>
        {a.subtitle && (
          <p className="mt-1 flex items-start gap-1.5 text-sm font-bold italic text-muted-foreground">
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-or-dark" aria-hidden />
            {a.subtitle}
          </p>
        )}
        <div
          className={cn(
            "mt-3 space-y-3 text-[15px] leading-relaxed text-foreground/90",
            !expanded && "line-clamp-5 sm:line-clamp-6"
          )}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-vert hover:text-vert-deep"
          aria-expanded={expanded}
        >
          {expanded ? "Réduire le récit" : "Poursuivre la lecture"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>
      </div>
    </article>
  );
}
