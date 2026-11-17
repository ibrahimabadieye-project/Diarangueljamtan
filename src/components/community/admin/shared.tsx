// Utilitaires partagés entre les onglets de l'administration

export const ANNOUNCE_KINDS = [
  { id: "communique", label: "Communiqué Officiel" },
  { id: "conseil", label: "Décision du Conseil" },
  { id: "deces", label: "Avis de Décès" },
  { id: "naissance", label: "Naissance & Baptême" },
  { id: "mariage", label: "Mariage" },
  { id: "diaspora", label: "Diaspora" },
];

export const EVENT_KIND_OPTIONS = [
  "religieux", "mariage", "bapteme", "assemblee", "sport", "sante", "culture", "marche", "diaspora",
];

export const CONTACT_CATEGORY_OPTIONS = [
  { id: "urgence", label: "Urgences & Autorités" },
  { id: "artisan", label: "Ouvriers & Artisans" },
  { id: "habitant", label: "Habitants & Diaspora" },
];

/** ISO → valeur pour <input type="datetime-local"> */
export function toInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Message d'erreur lisible depuis une réponse API (validation zod incluse) */
export async function apiErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
}
