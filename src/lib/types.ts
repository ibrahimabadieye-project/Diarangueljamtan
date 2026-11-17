export type ViewId =
  | "accueil"
  | "agenda"
  | "annuaire"
  | "sante"
  | "carte"
  | "histoire"
  | "admin";

export interface Announcement {
  id: string;
  kind: string;
  title: string;
  author: string;
  body: string;
  date: string;
}

export interface VillageEvent {
  id: string;
  kind: string;
  title: string;
  startAt: string;
  endAt: string | null;
  location: string;
  quartier: string;
  family: string;
  notes: string | null;
}

export interface Contact {
  id: string;
  category: string;
  name: string;
  role: string;
  quartier: string | null;
  city: string | null;
  phone: string;
  whatsapp: string | null;
  note: string | null;
}

export interface InfoRow {
  id: string;
  section: string;
  key: string;
  label: string;
  value: string;
  sortOrder: number;
}

export interface RouteStep {
  id: string;
  stepNumber: number;
  landmark: string;
  instruction: string;
  distanceKm: number;
  tip: string | null;
}

export interface HistoryArticle {
  id: string;
  section: string;
  title: string;
  subtitle: string | null;
  body: string;
  period: string | null;
  image: string | null;
  sortOrder: number;
}

export interface AlertState {
  active: boolean;
  message: string;
}

export interface AdminSession {
  authenticated: boolean;
}

/** Définition visuelle des badges du tableau officiel */
export const BADGE_STYLES: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  communique: {
    label: "Communiqué Officiel",
    className: "bg-vert text-white",
    dot: "#166534",
  },
  conseil: {
    label: "Décision du Conseil",
    className: "bg-or-dark text-white",
    dot: "#b77f16",
  },
  deces: {
    label: "Avis de Décès",
    className: "bg-anthracite text-white",
    dot: "#22301f",
  },
  naissance: {
    label: "Naissance & Baptême",
    className: "bg-vert-light text-white",
    dot: "#1f8a4c",
  },
  mariage: {
    label: "Mariage",
    className: "bg-[#a8474f] text-white",
    dot: "#a8474f",
  },
  diaspora: {
    label: "Diaspora",
    className: "bg-[#0e5a68] text-white",
    dot: "#0e5a68",
  },
};

/** Catégories d'événements de l'agenda */
export const EVENT_KINDS: Record<string, { label: string; color: string; bg: string }> = {
  religieux: { label: "Religieux", color: "#0e5a68", bg: "#e2f1f3" },
  mariage: { label: "Mariage", color: "#a8474f", bg: "#f9e8ea" },
  bapteme: { label: "Baptême", color: "#1f8a4c", bg: "#e8f3e6" },
  assemblee: { label: "Réunion", color: "#166534", bg: "#e8f3e6" },
  sport: { label: "Lutte & Sport", color: "#b77f16", bg: "#fdf6e0" },
  sante: { label: "Santé", color: "#c02626", bg: "#fbeaea" },
  culture: { label: "Culture", color: "#6d4f94", bg: "#efeaf7" },
  marche: { label: "Marché", color: "#0f3d22", bg: "#e4efe6" },
  diaspora: { label: "Diaspora", color: "#0e5a68", bg: "#e2f1f3" },
};

/** Quartiers / repères internes du village */
export const VILLAGE_QUARTIERS = [
  "Centre du village",
  "Quartier du fleuve",
  "Quartier de l'école",
  "Walo (périmètre rizicole)",
  "Diéri (terres hautes)",
  "Embarcadère",
];
