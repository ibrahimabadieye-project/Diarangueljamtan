import { describe, expect, it } from "vitest";
import { telHref, waNumber, icsFor, formatLongDate, whatsappShareUrl, formatTime } from "../format";

describe("telHref — numéros internationaux pour la diaspora", () => {
  it("préfixe un numéro local sénégalais avec +221", () => {
    expect(telHref("77 428 67 90")).toBe("tel:+221774286790");
  });

  it("conserve un numéro déjà international", () => {
    expect(telHref("+221 77 123 45 67")).toBe("tel:+221771234567");
  });

  it("convertit le préfixe 00", () => {
    expect(telHref("00221771234567")).toBe("tel:+221771234567");
  });

  it("gère un numéro français de la diaspora", () => {
    expect(telHref("+33 6 12 34 56 78")).toBe("tel:+33612345678");
  });
});

describe("waNumber", () => {
  it("retourne le numéro sans + pour wa.me", () => {
    expect(waNumber("77 123 45 67")).toBe("221771234567");
  });
});

describe("formatLongDate — jour de la semaine dérivé de la date", () => {
  it("le 27 novembre 2026 est un vendredi", () => {
    expect(formatLongDate("2026-11-27T10:00:00.000Z")).toContain("vendredi");
  });

  it("le 14 février 2027 est un dimanche", () => {
    expect(formatLongDate("2027-02-14T10:00:00.000Z")).toContain("dimanche");
  });

  it("le 29 novembre 2026 est un dimanche", () => {
    expect(formatLongDate("2026-11-29T10:00:00.000Z")).toContain("dimanche");
  });
});

describe("formatTime", () => {
  it("affiche l'heure du Sénégal quand demandé", () => {
    expect(formatTime("2026-11-27T09:30:00.000Z", true)).toBe("09h30 (heure du Sénégal)");
  });
});

describe("icsFor — export calendrier conforme RFC 5545", () => {
  const ev = {
    id: "evt123",
    title: "Mariage, familles Sy & Diop",
    startAt: "2026-11-29T09:00:00.000Z",
    endAt: "2026-11-29T14:00:00.000Z",
    location: "Mosquée centrale",
    notes: "Cérémonie, puis réception",
  };

  it("contient un DTSTAMP", () => {
    expect(icsFor(ev)).toMatch(/^DTSTAMP:\d{8}T\d{6}Z$/m);
  });

  it("a un UID stable dérivé de l'identifiant", () => {
    expect(icsFor(ev)).toContain("UID:evt123@diaranguel.sn");
    expect(icsFor(ev)).toBe(icsFor(ev));
  });

  it("échappe les virgules et points-virgules", () => {
    const ics = icsFor(ev);
    expect(ics).toContain("SUMMARY:Mariage\\, familles Sy & Diop — Diaranguel");
    expect(ics).not.toMatch(/^SUMMARY:[^\r\n]*[^\\],/m);
    expect(ics).not.toMatch(/^SUMMARY:[^\r\n]*[^\\];/m);
  });
});

describe("whatsappShareUrl — partage avec lien profond", () => {
  it("inclut le lien vers l'annonce", () => {
    const url = whatsappShareUrl("Titre", "Corps du message", "/?tab=accueil&a=abc");
    expect(decodeURIComponent(url)).toContain("/?tab=accueil&a=abc");
    expect(url).toContain("wa.me");
  });
});
