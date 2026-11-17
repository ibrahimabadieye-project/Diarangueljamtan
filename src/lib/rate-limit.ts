/**
 * Limitation de tentatives en mémoire (déploiement mono-serveur / SQLite).
 * Fenêtre glissante : max N tentatives par durée, par IP.
 * Le compteur se réinitialise au redémarrage — acceptable ici, l'essentiel
 * est de bloquer le brute-force en ligne.
 */

type Attempt = { times: number[] };

const store = new Map<string, Attempt>();

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Clé d'identification : première IP du X-Forwarded-For, sinon fallback */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "inconnue";
  return ip;
}

export function rateLimit(key: string): { ok: boolean; retryAfterSec: number; remaining: number } {
  const now = Date.now();
  const entry = store.get(key) ?? { times: [] };
  entry.times = entry.times.filter((t) => now - t < WINDOW_MS);

  if (entry.times.length >= MAX_ATTEMPTS) {
    const oldest = entry.times[0];
    store.set(key, entry);
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
      remaining: 0,
    };
  }

  entry.times.push(now);
  store.set(key, entry);
  return { ok: true, retryAfterSec: 0, remaining: MAX_ATTEMPTS - entry.times.length };
}

/** Réinitialise le compteur après un succès */
export function resetAttempts(key: string): void {
  store.delete(key);
}

// Purge périodique pour éviter toute fuite mémoire
const CLEAN_MS = 5 * 60 * 1000;
let timer: ReturnType<typeof setInterval> | undefined;
function scheduleClean() {
  if (timer) return;
  timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (!entry.times.some((t) => now - t < WINDOW_MS)) store.delete(key);
    }
  }, CLEAN_MS);
  timer.unref?.();
}
scheduleClean();
