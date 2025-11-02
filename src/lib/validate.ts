// src/lib/validate.ts

/** Coupe, trim et nettoie basiquement une chaîne. Renvoie null si vide après trim. */
export function sanitizeString(
  value: unknown,
  maxLen: number,
  { allowEmpty = false }: { allowEmpty?: boolean } = {}
): string | null {
  if (typeof value !== "string") return null;
  let s = value.trim();
  // retire les contrôles/retours chariot exotiques
  s = s.replace(/[\u0000-\u001F\u007F]/g, "");
  if (!allowEmpty && s.length === 0) return null;
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

/** Valide une URL http/https et limite la longueur. Renvoie null si invalide. */
export function sanitizeUrl(value: unknown, maxLen = 300): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (s.length === 0) return null;
  if (s.length > maxLen) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Valide un rôle DB. Renvoie null si hors liste. */
export function sanitizeRoleDb(value: unknown): "TOP" | "JGL" | "MID" | "ADC" | "SUPP" | "SUB" | null {
  const allowed = new Set(["TOP", "JGL", "MID", "ADC", "SUPP", "SUB"]);
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  return allowed.has(v) ? (v as any) : null;
}

/** Valide un ELO (enum string). Renvoie null si hors liste. */
export function sanitizeElo(value: unknown): string | null {
  const allowed = new Set([
    "IRON","BRONZE","SILVER","GOLD","PLATINUM","EMERALD",
    "DIAMOND","MASTER","GRANDMASTER","CHALLENGER",
  ]);
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  return allowed.has(v) ? v : null;
}
