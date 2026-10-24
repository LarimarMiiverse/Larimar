# Larimar

A Miiverse replacement for the Wii U (portal), with 3DS and off-device views
planned. Larimar is a general-purpose Miiverse: communities belong to a topic
category (games, art & creativity, music, chat, apps, news), and linking a
community to game title IDs is optional.

Working on the Wii U portal today: login, user pages (profile comment, game
experience, follow/unfollow), communities with categories, search and
favorites, and posting with text, Wii U memo drawings and spoilers.

## Requirements

- Node.js 20+
- MariaDB/MySQL
- An account server that implements `account.v2.AccountService`
  `ExchangeIndependentServiceTokenForUserData` (as Pretendo-style account
  servers do). Larimar uses it to turn a console's service token into a PNID;
  accounts are created on a player's first visit.

## Setup

```sh
npm install
mysql larimar < larimar.sql
for f in migrations/*.sql; do mysql larimar < "$f"; done
cp .env.example .env   # then fill it in
npm start
```

## Configuration (`.env`)

| Variable | Meaning |
| --- | --- |
| `PORT` | HTTP port |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MariaDB connection |
| `GRPC_ACCOUNT_HOST`, `GRPC_ACCOUNT_PORT`, `GRPC_ACCOUNT_API_KEY` | Account server gRPC (sent as `x-api-key`) |
| `REDIS_URL` | Optional. Only for running next to Juxt: enables the "Switch back to Juxt" setting (deletes `miiverse:instance:<pid>`, which Juxt's discovery reads). |

Larimar expects to sit behind a TLS-terminating proxy on the same host
(`trust proxy` is set to loopback). Uploaded drawings are stored in `media/`.

## Notes for contributors

- The original portal script (`src/static/js/portal/complete.js`) cancels every
  form submit unless the `<form>` has `data-allow-submission`.
- Community pages must stay at `/titles/<number>/<number>`; that is where the
  script sets up the favorite (☆) button.
- `#header-post-button` is hidden by the script unless the page has
  `.post-headline[data-show-post-button="1"]`.
- Memo drawings are read with `wiiuMemo.getImage(true)` (zlib-compressed TGA)
  and converted to PNG server-side in `src/painting.js`;
  `getImage(false)` is a BMP and only used for the preview.
- Schema changes go in `migrations/` as numbered SQL files.
