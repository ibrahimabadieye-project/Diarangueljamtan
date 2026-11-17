import { describe, expect, it } from "vitest";
import {
  announcementCreateSchema,
  contactCreateSchema,
  eventCreateSchema,
  alertUpdateSchema,
} from "../schemas";

describe("announcementCreateSchema", () => {
  it("accepte une annonce valide", () => {
    const parsed = announcementCreateSchema.safeParse({
      kind: "communique",
      title: "Coupure d'eau vendredi",
      body: "Le comité de gestion annonce une coupure de 8h à 12h.",
      date: "2026-11-27T08:00:00.000Z",
    });
    expect(parsed.success).toBe(true);
  });

  it("refuse une catégorie inconnue", () => {
    const parsed = announcementCreateSchema.safeParse({
      kind: "publicité",
      title: "Titre",
      body: "Corps du message assez long.",
    });
    expect(parsed.success).toBe(false);
  });

  it("refuse une date invalide avec z.coerce.date", () => {
    const parsed = announcementCreateSchema.safeParse({
      kind: "communique",
      title: "Titre",
      body: "Corps du message assez long.",
      date: "pas-une-date",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("contactCreateSchema", () => {
  it("refuse un numéro de téléphone invalide", () => {
    const parsed = contactCreateSchema.safeParse({
      category: "habitant",
      name: "Awa Dieye",
      role: "Commerçante",
      phone: "appel-moi",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepte un numéro sénégalais espacé", () => {
    const parsed = contactCreateSchema.safeParse({
      category: "habitant",
      name: "Awa Dieye",
      role: "Commerçante",
      phone: "77 123 45 67",
    });
    expect(parsed.success).toBe(true);
  });

  it("refuse une catégorie hors liste (contacts personnels bien cloisonnés)", () => {
    const parsed = contactCreateSchema.safeParse({
      category: "autre",
      name: "X",
      role: "Y",
      phone: "771234567",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("eventCreateSchema", () => {
  it("exige un startAt valide", () => {
    const parsed = eventCreateSchema.safeParse({
      kind: "religieux",
      title: "Veillée du Maouloud",
      startAt: "2027-08-13T20:00:00.000Z",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.startAt instanceof Date).toBe(true);
      expect(parsed.data.endAt ?? null).toBeNull();
    }
  });

  it("refuse un kind non prévu", () => {
    const parsed = eventCreateSchema.safeParse({
      kind: "soirée",
      title: "Soirée",
      startAt: "2027-08-13T20:00:00.000Z",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("alertUpdateSchema", () => {
  it("refuse un message trop long et un booléen manquant", () => {
    expect(alertUpdateSchema.safeParse({ active: true, message: "x".repeat(401) }).success).toBe(false);
    expect(alertUpdateSchema.safeParse({ active: "oui" }).success).toBe(false);
  });
});
