// src/lib/discord.ts
// Résolution d’avatar Discord avec cache mémoire, backoff 429, et fallback propre.

const GUILD_ID = process.env.DISCORD_GUILD_ID;
// Accepte les deux noms d'ENV pour compatibilité (Vercel/locaux)
const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN ||
  process.env.DISCORD_TOKEN ||
  "";
const DEBUG = process.env.DEBUG_AVATAR === "true";

// TTL pour une PP résolue (ms)
const AVATAR_TTL = 6 * 60 * 60 * 1000; // 6h
// Backoff minimal si 429 / 5xx (ms)
const BACKOFF_MS = 5 * 60 * 1000; // 5min

type CacheEntry = {
  url: string;
  expiresAt: number;
};

const avatarCache = new Map<string, CacheEntry>();
let nextAllowedFetchAt = 0;

/** Optionnel: pour forcer un reset (ex: après un gros batch de updates) */
export function clearAvatarCache() {
  avatarCache.clear();
  nextAllowedFetchAt = 0;
  if (DEBUG) console.log("[avatar] cache cleared");
}

/** Fallback déterministe (0..5) si on ne peut pas résoudre via l’API */
function fallbackUrlFromId(id: string): string {
  let idx = 0;
  try {
    idx = Number(BigInt(id) % 6n);
  } catch {}
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

/**
 * Construit l'URL d'avatar à partir du hash renvoyé par Discord.
 * - Guild-specific avatar (member.avatar): https://cdn.discordapp.com/guilds/{gid}/users/{uid}/avatars/{hash}.png
 * - Global user avatar (user.avatar): https://cdn.discordapp.com/avatars/{uid}/{hash}.{png|gif}
 */
function buildAvatarUrl(opts: {
  userId: string;
  guildId?: string;
  memberAvatar?: string | null;
  userAvatar?: string | null;
}): string | null {
  const { userId, guildId, memberAvatar, userAvatar } = opts;
  if (memberAvatar && guildId) {
    return `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${memberAvatar}.png?size=128`;
  }
  if (userAvatar) {
    const ext = userAvatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${userId}/${userAvatar}.${ext}?size=128`;
  }
  return null;
}

/**
 * Resolve avatar URL for a Discord userId.
 * Stratégie:
 * 1) Sert le cache si valide
 * 2) Respecte un backoff global si on a pris un 429/5xx récemment
 * 3) Tente GET /guilds/{gid}/members/{uid}
 * 4) Construit l’URL d’avatar depuis member.avatar OU user.avatar
 * 5) Cache le résultat ; fallback si rien
 */
export async function resolveAvatarUrl(userId: string): Promise<string> {
  const now = Date.now();

  // 1) Cache
  const cached = avatarCache.get(userId);
  if (cached && cached.expiresAt > now) {
    if (DEBUG) console.log(`[avatar] cache hit for ${userId}`);
    return cached.url;
  }

  // 2) Backoff global (si Discord nous a limité récemment)
  if (now < nextAllowedFetchAt) {
    if (DEBUG)
      console.warn(
        `[avatar] in backoff until ${new Date(
          nextAllowedFetchAt
        ).toISOString()} — serve fallback/cache for ${userId}`
      );
    return cached?.url ?? fallbackUrlFromId(userId);
  }

  // 3) Préconditions
  if (!GUILD_ID || !BOT_TOKEN) {
    if (DEBUG)
      console.warn(
        `[avatar] missing GUILD_ID or BOT_TOKEN — fallback for ${userId}`
      );
    return fallbackUrlFromId(userId);
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`,
      {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
        cache: "no-store",
      }
    );

    if (res.status === 429 || res.status >= 500) {
      // Rate-limit ou erreur serveur Discord: on active un backoff
      nextAllowedFetchAt = Date.now() + BACKOFF_MS;
      if (DEBUG)
        console.warn(
          `[avatar] Discord ${res.status} — backoff ${BACKOFF_MS / 1000}s`
        );
      return cached?.url ?? fallbackUrlFromId(userId);
    }

    if (!res.ok) {
      // 404: pas membre du serveur, 403: intents manquants, etc.
      if (DEBUG) console.warn(`[avatar] Discord ${res.status} for ${userId} — fallback`);
      const url = fallbackUrlFromId(userId);
      avatarCache.set(userId, { url, expiresAt: now + AVATAR_TTL });
      return url;
    }

    const data = await res.json();

    const memberAvatar = data?.avatar ?? null; // guild-specific
    const userAvatar = data?.user?.avatar ?? null; // global
    const url =
      buildAvatarUrl({
        userId,
        guildId: GUILD_ID,
        memberAvatar,
        userAvatar,
      }) ?? fallbackUrlFromId(userId);

    // 5) Cache
    avatarCache.set(userId, { url, expiresAt: now + AVATAR_TTL });
    if (DEBUG) console.log(`[avatar] resolved & cached for ${userId}`);

    return url;
  } catch (e) {
    if (DEBUG) console.error(`[avatar] fetch error for ${userId}`, e);
    return cached?.url ?? fallbackUrlFromId(userId);
  }
}
