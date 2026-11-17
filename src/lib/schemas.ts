import { z } from "zod";
import { NextResponse } from "next/server";

/** ── Schémas de validation (zod v4) ─────────────────────────────────────── */

export const ANNOUNCE_KINDS = ["communique", "conseil", "deces", "naissance", "mariage", "diaspora"] as const;
export const EVENT_KINDS = ["religieux", "mariage", "bapteme", "assemblee", "sport", "sante", "culture", "marche", "diaspora"] as const;
export const CONTACT_CATEGORIES = ["urgence", "artisan", "habitant"] as const;

const phoneRegex = /^[\d\s()+.-]{8,25}$/;

export const announcementCreateSchema = z.object({
  kind: z.enum(ANNOUNCE_KINDS),
  title: z.string().trim().min(3, "Titre trop court").max(150),
  author: z.string().trim().max(100).optional(),
  body: z.string().trim().min(5, "Contenu trop court").max(4000),
  date: z.coerce.date().optional(),
});

export const announcementUpdateSchema = announcementCreateSchema.partial();

export const eventCreateSchema = z.object({
  kind: z.enum(EVENT_KINDS),
  title: z.string().trim().min(3, "Titre trop court").max(150),
  startAt: z.coerce.date({ message: "Date de début invalide" }),
  endAt: z.coerce.date({ message: "Date de fin invalide" }).nullish(),
  location: z.string().trim().max(150).optional(),
  quartier: z.string().trim().max(80).optional(),
  family: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).nullish(),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const contactCreateSchema = z.object({
  category: z.enum(CONTACT_CATEGORIES),
  name: z.string().trim().min(2, "Nom trop court").max(100),
  role: z.string().trim().min(2, "Fonction trop courte").max(100),
  quartier: z.string().trim().max(80).nullish(),
  city: z.string().trim().max(80).nullish(),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
  whatsapp: z.string().trim().regex(phoneRegex, "Numéro WhatsApp invalide").nullish(),
  note: z.string().trim().max(300).nullish(),
});

export const contactUpdateSchema = contactCreateSchema.partial();

export const healthInfoUpdateSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(2).max(120).optional(),
  value: z.string().trim().min(1).max(600).optional(),
});

export const alertUpdateSchema = z.object({
  active: z.boolean(),
  message: z.string().trim().max(400).optional(),
});

export const accessSchema = z.object({
  code: z.string().min(4, "Code trop court").max(64),
});

/** ── Réponses d'erreur uniformes ────────────────────────────────────────── */

export function zodErrorResponse(error: z.ZodError): NextResponse {
  const first = error.issues[0];
  const field = first?.path?.join(".");
  const message = field
    ? `Champ « ${field} » : ${first?.message}`
    : (first?.message ?? "Données invalides");
  return NextResponse.json({ error: message, details: z.flattenError(error).fieldErrors }, { status: 400 });
}
