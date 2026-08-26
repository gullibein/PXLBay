/**
 * PXLRogue High Score Proxy & Validation Service
 * 
 * Secure serverless function handler for Cloudflare Workers, Vercel, Netlify,
 * or standard Node.js servers.
 *
 * Responsibilities:
 *  1. Holds the secret JSONBIN Access Key privately (never exposed to client browsers).
 *  2. Bidirectional proxy:
 *     - GET: Reads and returns the current sanitized top 10 leaderboard.
 *     - POST: Validates incoming run claims and updates the leaderboard on jsonbin.io.
 *     - OPTIONS: CORS preflight support.
 *  3. Rigorous game-state validation against cheating:
 *     - Claimed XP must match claimed Character Level using E_LEVELS.
 *     - Level is at most 21.
 *     - Dungeon depth is at most 26.
 *     - Turn count must be plausible for the claimed depth & XP.
 *  4. Rate limiting: limits score submissions per player/IP per hour.
 */

const E_LEVELS = [
  15, 37, 128, 292, 529, 857, 1319, 2127, 3216, 4640, 7459, 11784, 18582,
  31930, 62086, 112938, 179532, 258345, 343832, 430700, 0
];

const HS_MAX = 10;
const HS_NAME_MAX = 12;
const MAX_LEVEL = 21;
const MAX_DEPTH = 26;
const MAX_SUBMISSIONS_PER_HOUR = 20;
const DEFAULT_BIN = '6a8f330fda38895dfe147360';

// In-memory rate limiting store (IP -> array of submission timestamps in ms)
const rateLimitMap = new Map();

/**
 * Clean up rate limit timestamps older than 1 hour.
 */
function checkRateLimit(ip, now = Date.now()) {
  if (!ip) return true;
  const oneHourAgo = now - 60 * 60 * 1000;
  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(t => t > oneHourAgo);
  if (timestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
    rateLimitMap.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

/**
 * Sanitize player name to characters supported by the retro sprite font.
 */
function hsName(s) {
  s = String(s === undefined || s === null ? '' : s)
    .replace(/[^A-Za-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^ +/, '')
    .replace(/ +$/, '');
  return s.slice(0, HS_NAME_MAX);
}

/**
 * Clean and sort high score records.
 */
function hsClean(list) {
  const out = [];
  if (!list || !Array.isArray(list)) return out;
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (!e || typeof e !== 'object') continue;
    const xp = (typeof e.xp === 'number' ? e.xp : parseInt(e.xp, 10)) | 0;
    const lv = (typeof e.level === 'number' ? e.level : parseInt(e.level, 10)) | 0;
    let nm = hsName(e.name);
    if (!nm) nm = '-';
    out.push({ name: nm, xp: xp, level: lv });
  }
  out.sort((a, b) => b.xp - a.xp || b.level - a.level);
  return out.slice(0, HS_MAX);
}

/**
 * Add an entry to the high score list, re-sort, and slice to top 10.
 */
function hsWith(list, entry) {
  const t = hsClean(list);
  t.push({
    name: hsName(entry.name) || '-',
    xp: entry.xp | 0,
    level: entry.level | 0
  });
  t.sort((a, b) => b.xp - a.xp || b.level - a.level);
  return t.slice(0, HS_MAX);
}

/**
 * Validate that claimed XP accurately reflects claimed character level using E_LEVELS.
 */
function validateXpMatchesLevel(xp, level) {
  if (typeof xp !== 'number' || !Number.isInteger(xp) || xp < 0) return false;
  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > MAX_LEVEL) return false;

  const minXp = level === 1 ? 0 : E_LEVELS[level - 2];
  if (xp < minXp) return false;

  if (level < MAX_LEVEL) {
    const maxXp = E_LEVELS[level - 1];
    if (xp >= maxXp) return false;
  }
  return true;
}

/**
 * Validate all game submission parameters.
 */
function validateScoreSubmission(entry) {
  if (!entry || typeof entry !== 'object') {
    return { ok: false, reason: 'Invalid score payload' };
  }

  const xp = typeof entry.xp === 'number' ? entry.xp : parseInt(entry.xp, 10);
  const level = typeof entry.level === 'number' ? entry.level : parseInt(entry.level, 10);
  const depth = entry.depth !== undefined ? (typeof entry.depth === 'number' ? entry.depth : parseInt(entry.depth, 10)) : 1;
  const turns = entry.turns !== undefined ? (typeof entry.turns === 'number' ? entry.turns : parseInt(entry.turns, 10)) : 0;

  if (isNaN(xp) || isNaN(level) || isNaN(depth) || isNaN(turns)) {
    return { ok: false, reason: 'Numeric fields must be valid numbers' };
  }

  if (level < 1 || level > MAX_LEVEL) {
    return { ok: false, reason: `Character level must be between 1 and ${MAX_LEVEL}` };
  }

  if (depth < 1 || depth > MAX_DEPTH) {
    return { ok: false, reason: `Dungeon depth must be between 1 and ${MAX_DEPTH}` };
  }

  if (!validateXpMatchesLevel(xp, level)) {
    return { ok: false, reason: `Claimed XP (${xp}) does not match character level (${level}) according to E_LEVELS` };
  }

  // Turn plausibility check
  if (turns < 0) {
    return { ok: false, reason: 'Turn count cannot be negative' };
  }
  if (depth > 1 && turns < (depth - 1)) {
    return { ok: false, reason: `Too few turns (${turns}) for dungeon depth ${depth}` };
  }
  // Plausibility for XP gained: gaining substantial XP requires turns to engage monsters
  if (xp > 100 && turns < Math.floor(xp / 100)) {
    return { ok: false, reason: `Too few turns (${turns}) for claimed XP (${xp})` };
  }

  return {
    ok: true,
    entry: {
      name: hsName(entry.name) || '-',
      xp: xp | 0,
      level: level | 0,
      depth: depth | 0,
      turns: turns | 0
    }
  };
}

/**
 * Standard CORS headers.
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Bin-Meta, X-Access-Key',
  'Access-Control-Max-Age': '86400'
};

/**
 * Universal Request Handler (compatible with Web standard Request/Response).
 */
async function handleRequest(request, env = {}) {
  const method = request.method ? request.method.toUpperCase() : 'GET';
  const binId = env.HS_BIN || process.env.HS_BIN || DEFAULT_BIN;
  const accessKey = env.HS_KEY || env.JSONBIN_ACCESS_KEY || process.env.HS_KEY || process.env.JSONBIN_ACCESS_KEY;

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (method === 'GET') {
    try {
      const headers = { 'X-Bin-Meta': 'false' };
      if (accessKey) {
        headers['X-Access-Key'] = accessKey;
      }

      const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, { headers });
      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard from storage', status: res.status }), {
          status: res.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      const raw = await res.json();
      const list = raw && raw.record ? raw.record : raw;
      const cleanList = hsClean(list);

      return new Response(JSON.stringify(cleanList), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  if (method === 'POST') {
    // Extract client IP for rate limiting
    const ip = request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               'unknown-client';

    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Too many score submissions this hour.' }), {
        status: 429,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const val = validateScoreSubmission(body);
    if (!val.ok) {
      return new Response(JSON.stringify({ error: val.reason }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const validatedEntry = val.entry;

    try {
      if (!accessKey) {
        return new Response(JSON.stringify({ error: 'Server configuration error: HS_KEY is not configured on proxy' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      // 1. Fetch current board
      const getRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: { 'X-Access-Key': accessKey, 'X-Bin-Meta': 'false' }
      });

      let currentList = [];
      if (getRes.ok) {
        const raw = await getRes.json();
        currentList = hsClean(raw && raw.record ? raw.record : raw);
      }

      // 2. Compute updated board
      const updatedList = hsWith(currentList, validatedEntry);

      // 3. Save back to jsonbin
      const putRes = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': accessKey
        },
        body: JSON.stringify(updatedList)
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        return new Response(JSON.stringify({ error: 'Failed to update remote highscore bin', details: errText }), {
          status: putRes.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, list: updatedList }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// Module exports for CommonJS (Node / tests / serverless runtimes)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    E_LEVELS,
    HS_MAX,
    HS_NAME_MAX,
    MAX_LEVEL,
    MAX_DEPTH,
    MAX_SUBMISSIONS_PER_HOUR,
    hsName,
    hsClean,
    hsWith,
    validateXpMatchesLevel,
    validateScoreSubmission,
    checkRateLimit,
    handleRequest,
    CORS_HEADERS
  };
}
