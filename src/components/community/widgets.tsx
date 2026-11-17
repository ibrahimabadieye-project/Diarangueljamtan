"use client";

import { ReactNode } from "react";
import { Phone, MessageCircle, Share2, WifiOff, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { waNumber, telHref, whatsappShareUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

// ─── En-tête de section ──────────────────────────────────────────────────────

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-vert text-white shadow-sm">
          <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-extrabold leading-tight text-foreground sm:text-2xl font-display">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground font-medium">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

// ─── Boutons d'action téléphone / WhatsApp ───────────────────────────────────

export function CallButton({ phone, label }: { phone: string; label?: string }) {
  return (
    <Button asChild size="sm" className="h-11 min-w-[112px] gap-1.5 bg-vert hover:bg-vert-deep text-white font-bold text-sm">
      <a href={telHref(phone)} aria-label={`Appeler ${label ?? phone}`}>
        <Phone className="h-4 w-4" aria-hidden />
        Appeler
      </a>
    </Button>
  );
}

export function WhatsAppDirectButton({ phone }: { phone: string }) {
  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="h-11 min-w-[112px] gap-1.5 border-whatsapp text-whatsapp-dark hover:bg-whatsapp hover:text-white font-bold text-sm"
    >
      <a
        href={`https://wa.me/${waNumber(phone)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Écrire sur WhatsApp au ${phone}`}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp
      </a>
    </Button>
  );
}

// ─── Partage WhatsApp d'une annonce ─────────────────────────────────────────

export function ShareButton({ title, body, path, className }: { title: string; body: string; path?: string; className?: string }) {
  return (
    <Button
      asChild
      size="sm"
      className={cn("h-10 gap-1.5 bg-whatsapp hover:bg-whatsapp-dark text-white font-bold", className)}
    >
      <a
        href={whatsappShareUrl(title, body, path)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Partager « ${title} » sur WhatsApp`}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Partager sur WhatsApp
      </a>
    </Button>
  );
}

// ─── État vide ───────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-vert-pale text-vert">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <p className="mt-4 font-bold text-foreground">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Puce « hors-ligne disponible » ─────────────────────────────────────────

export function OfflineChip({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-vert-pale px-3 py-1 text-xs font-bold text-vert-deep">
      <WifiOff className="h-3.5 w-3.5" aria-hidden />
      {children ?? "Consultable hors-ligne"}
    </span>
  );
}
