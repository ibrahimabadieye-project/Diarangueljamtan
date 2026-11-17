#!/usr/bin/env node
/**
 * Sauvegarde de la base SQLite — copie horodatée dans backups/.
 * Usage : bun run db:backup  (ou node scripts/backup-db.mjs)
 * Planification conseillée (cron quotidien) :
 *   0 2 * * *  cd /chemin/vers/diaranguel && node scripts/backup-db.mjs >> backups/backup.log 2>&1
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const databaseUrl = process.env.DATABASE_URL || "file:./db/custom.db";
const databaseFile = databaseUrl.startsWith("file:")
  ? databaseUrl.slice("file:".length)
  : "./db/custom.db";
const DB_PATH = path.isAbsolute(databaseFile)
  ? databaseFile
  : path.resolve(ROOT, databaseFile);
const BACKUP_DIR = path.join(path.dirname(DB_PATH), "backups");
const KEEP = 30; // nombre de sauvegardes conservées

if (!fs.existsSync(DB_PATH)) {
  console.error(`Base introuvable : ${DB_PATH}`);
  process.exit(1);
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const target = path.join(BACKUP_DIR, `diaranguel-${stamp}.db`);

fs.copyFileSync(DB_PATH, target);
console.log(`Sauvegarde créée : ${target} (${Math.round(fs.statSync(target).size / 1024)} Ko)`);

// Rotation : garde les KEEP plus récentes
const backups = fs
  .readdirSync(BACKUP_DIR)
  .filter((f) => f.startsWith("diaranguel-") && f.endsWith(".db"))
  .sort()
  .reverse();
for (const old of backups.slice(KEEP)) {
  fs.unlinkSync(path.join(BACKUP_DIR, old));
  console.log(`Ancienne sauvegarde supprimée : ${old}`);
}
