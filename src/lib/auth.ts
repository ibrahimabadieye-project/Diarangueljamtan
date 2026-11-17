import crypto from "crypto";

/**
 * Authentification admin + accès « code du village » (annuaire personnel).
 *
 * ⚠️ Aucune valeur par défaut en production : refus de démarrer si
 * ADMIN_CODE ou ADMIN_SECRET manquent (NODE_ENV=production).
 * En développement, un repli est accepté avec avertissement console.
 */

function requireSecret(name: string, devFallback: string, minLen = 8): string {
  const value = process.env[name];
  if (value && value.length >= minLen) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[Sécurité] La variable ${name} est obligatoire en production (${minLen} caractères minimum). ` +
        `Définissez-la dans l'environnement du serveur, puis redémarrez.`
    );
  }
  console.warn(
    `[Sécurité] ${name} non définie (ou trop courte : ${minLen} caractères min.) — ` +
      `repli de DÉVELOPPEMENT utilisé. Copiez .env.example vers .env et définissez vos propres valeurs.`
  );
  return devFallback;
}

export const ADMIN_CODE = requireSecret("ADMIN_CODE", "diaranguel-dev-code");
const SECRET = requireSecret("ADMIN_SECRET", "diaranguel-dev-secret-change-me");
// Code du village : volontairement court et partageable (4 caractères min.)
export const VILLAGE_CODE = requireSecret("VILLAGE_CODE", "diaranguel", 4);

export const SESSION_COOKIE = "diaranguel_admin";
export const ACCESS_COOKIE = "diaranguel_acces";

const ADMIN_TTL_MS = 12 * 3600 * 1000; // 12 h
const ACCESS_TTL_MS = 90 * 24 * 3600 * 1000; // 90 jours
export const ACCESS_TTL_SECONDS = Math.floor(ACCESS_TTL_MS / 1000);

/** Comparaison à temps constant de deux chaînes (hashées pour égaliser la longueur) */
function constantTimeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Vérifie le code admin saisi (comparaison à temps constant) */
export function checkAdminCode(code: string | undefined | null): boolean {
  if (!code) return false;
  return constantTimeEqual(String(code).trim(), ADMIN_CODE);
}

/** Vérifie le code du village saisi (comparaison à temps constant) */
export function checkVillageCode(code: string | undefined | null): boolean {
  if (!code) return false;
  return constantTimeEqual(String(code).trim().toLowerCase(), VILLAGE_CODE.toLowerCase());
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

/**
 * Jeton signé `exp.portée.nonce.sig` — la portée évite qu'un jeton
 * d'accès villageois soit réutilisé comme session admin (et inversement).
 */
function issueSignedToken(scope: "admin" | "village", ttlMs: number): string {
  const exp = Date.now() + ttlMs;
  const nonce = crypto.randomBytes(12).toString("hex");
  const payload = `${exp}.${scope}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined | null, scope: "admin" | "village"): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [exp, tokScope, nonce, sig] = parts;
  if (tokScope !== scope || !exp || !nonce || !sig) return false;
  const expected = sign(`${exp}.${scope}.${nonce}`);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return false;
  }
  return Number(exp) > Date.now();
}

export function issueToken(): string {
  return issueSignedToken("admin", ADMIN_TTL_MS);
}

export function verifyTokenAdmin(token: string | undefined | null): boolean {
  return verifyToken(token, "admin");
}

export function issueAccessToken(): string {
  return issueSignedToken("village", ACCESS_TTL_MS);
}

function readCookie(cookieHeader: string | null | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

/** Vérifie le cookie de session admin d'une requête */
export function isAuthed(cookieHeader: string | null | undefined): boolean {
  return verifyTokenAdmin(readCookie(cookieHeader, SESSION_COOKIE));
}

/** Vérifie le cookie d'accès villageois (annuaire personnel) */
export function hasVillageAccess(cookieHeader: string | null | undefined): boolean {
  return verifyToken(readCookie(cookieHeader, ACCESS_COOKIE), "village");
}

/** Options de cookie — secure en production (HTTPS) */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Chargé après définition des variables .env
