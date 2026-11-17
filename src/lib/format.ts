import { BADGE_STYLES, EVENT_KINDS } from "./types";

const DT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Dakar",
});

const DT_SHORT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Dakar",
});

const TM = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Dakar",
});

/** « mercredi 25 novembre 2026 » */
export function formatLongDate(iso: string): string {
  return DT.format(new Date(iso));
}

/** « 25 nov. » */
export function formatShortDate(iso: string): string {
  return DT_SHORT.format(new Date(iso));
}

/** « 09h00 (heure du Sénégal) » — utile pour la diaspora en Europe */
export function formatTime(iso: string, withZone = false): string {
  const time = TM.format(new Date(iso)).replace(":", "h");
  return withZone ? `${time} (heure du Sénégal)` : time;
}

/** « il y a 3 jours » */
export function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 0) {
    const future = Math.ceil(-diffMs / 86_400_000);
    if (future <= 1) return "demain";
    if (future < 30) return `dans ${future} jours`;
    return formatShortDate(iso);
  }
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return formatShortDate(iso);
}

export function badgeFor(kind: string) {
  return BADGE_STYLES[kind] ?? { label: "Information", className: "bg-vert text-white", dot: "#166534" };
}

export function eventKindFor(kind: string) {
  return EVENT_KINDS[kind] ?? { label: "Événement", color: "#166534", bg: "#e8f3e6" };
}

/** ── Téléphones & partage ───────────────────────────────────────────────── */

/**
 * Numéro international +221 pour les liens `tel:` :
 * fonctionne depuis la diaspora (France, Italie, Espagne…) comme au village.
 * Accepte « 77 428 67 90 », « +221… », « 00221… », « 22177… ».
 */
export function telHref(phone: string): string {
  const clean = phone.replace(/[\s().-]/g, "");
  let intl = clean;
  if (clean.startsWith("+")) intl = clean.slice(1);
  else if (clean.startsWith("00")) intl = clean.slice(2);
  else if (!clean.startsWith("221")) intl = `221${clean}`;
  return `tel:+${intl}`;
}

/** Numéro pour l'URL WhatsApp (sans « + ») */
export function waNumber(phone: string): string {
  return telHref(phone).replace("tel:+", "");
}

/** URL absolue du site (partage WhatsApp, liens profonds) */
export function siteUrl(path = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** URL WhatsApp avec texte pré-rempli + lien vers la page */
export function whatsappShareUrl(title: string, body: string, path?: string): string {
  const link = path ? `\n\n👉 ${siteUrl(path)}` : "";
  const text = `*${title}*\n\n${body.slice(0, 220)}${body.length > 220 ? "…" : ""}\n\n— Diaranguel, île à Morphil${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** ── Agenda (Google Calendar & .ics) ────────────────────────────────────── */

function calendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Échappe , ; \ et les retours à la ligne pour les champs ICS (RFC 5545) */
function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  location: string;
  notes: string | null;
}

/** Lien Google Calendar pour un événement */
export function googleCalendarUrl(ev: CalendarEvent): string {
  const start = calendarStamp(ev.startAt);
  const end = ev.endAt ? calendarStamp(ev.endAt) : calendarStamp(new Date(new Date(ev.startAt).getTime() + 2 * 3600_000).toISOString());
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${ev.title} — Diaranguel`,
    dates: `${start}/${end}`,
    location: `${ev.location}, Diaranguel (île à Morphil), Sénégal`,
    details: ev.notes ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Fichier .ics téléchargeable (UID stable + DTSTAMP obligatoire, champset échappés) */
export function icsFor(ev: CalendarEvent): string {
  const start = calendarStamp(ev.startAt);
  const end = ev.endAt ? calendarStamp(ev.endAt) : calendarStamp(new Date(new Date(ev.startAt).getTime() + 2 * 3600_000).toISOString());
  const dtstamp = calendarStamp(new Date().toISOString());
  const uid = `${ev.id}@diaranguel.sn`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Diaranguel//Village//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(`${ev.title} — Diaranguel`)}`,
    `LOCATION:${escapeIcs(`${ev.location}, Diaranguel (île à Morphil), Sénégal`)}`,
    `DESCRIPTION:${escapeIcs(ev.notes ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(ev: Parameters<typeof icsFor>[0]) {
  const blob = new Blob([icsFor(ev)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^a-z0-9àâçéèêëîïôûùüÿñæœ\s-]/gi, "").slice(0, 40) || "evenement"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
