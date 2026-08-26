# PXLRogue High Score Serverless Proxy

This serverless proxy service protects the online high-score leaderboard by holding the JSONBin Access Key privately on the server side and validating incoming score submissions before writing to JSONBin.

---

## Features

- **Bidirectional Proxy**:
  - `GET /api/scores`: Proxies to JSONBin with private `HS_KEY`, cleans and returns the current top 10 leaderboard to the game client.
  - `POST /api/scores`: Validates game state before inserting and updating JSONBin.
  - `OPTIONS /api/scores`: Handles CORS preflight requests.
- **Anti-Cheat Validation**:
  - Checks claimed `xp` against character `level` using `E_LEVELS`.
  - Enforces max level: $\le 21$.
  - Enforces max dungeon depth: $\le 26$.
  - Enforces turn count plausibility relative to depth and XP.
  - Cleans and truncates character names (max 12 characters, alphanumeric only).
- **Rate Limiting**:
  - Limits each player / IP address to at most 20 submissions per hour (returns HTTP 429 when exceeded).

---

## Environment Variables

Set these in your serverless provider's dashboard or CLI:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `HS_KEY` | Your secret JSONBin Access Key (read + write permissions) | `$2a$10$...` |
| `HS_BIN` | The JSONBin bin ID (optional, defaults to game bin) | `6a8c44f9da38895dfe0a98c0` |

---

## Deployment Options

### 1. Cloudflare Workers (Recommended)

```bash
cd serverless/cloudflare
npx wrangler secret put HS_KEY
npx wrangler deploy
```

Once deployed, set `HS_PROXY` in `build/part1_core.js` to your worker URL:
```javascript
var HS_PROXY = 'https://pxlrogue-scores.<your-subdomain>.workers.dev';
```

---

### 2. Vercel

```bash
vercel env add HS_KEY
vercel deploy --prod
```

Set `HS_PROXY` in `build/part1_core.js`:
```javascript
var HS_PROXY = '/api/scores'; // or https://<your-project>.vercel.app/api/scores
```

---

### 3. Netlify

```bash
netlify env:set HS_KEY "<your-secret-key>"
netlify deploy --prod
```

Set `HS_PROXY` in `build/part1_core.js`:
```javascript
var HS_PROXY = '/api/scores'; // or https://<your-project>.netlify.app/api/scores
```

---

## Updating the Game

After configuring `HS_PROXY` in `build/part1_core.js`, rebuild `index.html`:
```bash
cd build
python build.py
python build_playtest.py
```
