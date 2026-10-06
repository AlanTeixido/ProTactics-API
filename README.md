# ProTactics API

REST API behind [ProTactics](https://github.com/AlanTeixido/ProTactics), a management platform for football clubs, built with Node.js, Express and PostgreSQL.
- **Clubs** register and manage their coaches, teams and players.
- **Coaches** plan training sessions on a tactics board and share them with the rest of the club.

## Resources

| Path | What it covers |
|---|---|
| `/auth` | Club registration, coach registration (by their club) and a single login that recognises clubs and coaches |
| `/clubes` | Club profile and password |
| `/entrenadores` | A club's coaches: list, create, edit, remove; a coach's own profile (`/me`) |
| `/equipos` | Teams by category, scoped to the club |
| `/jugadores` | Players, per team or club, and bulk import from CSV (`/upload-csv`) |
| `/entrenamientos` | Training sessions with exercises, durations and the players involved |
| `/publicaciones` | Sessions a coach shares with the club, with likes |
| `/usuarios/:id/resumen` | A coach's activity summary |
| `/api/chatbot` | A keyword-based help bot about how to use the app |

Ready-to-run examples for each area are in [`requests/`](requests), as [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) `.http` files.

## Security model

- **Authentication**: JWT signed with HS256 that expires (`JWT_EXPIRES_IN`). The token carries the role, `club` or `entrenador`, and a token whose account has been deleted is rejected.
- **Authorization**: every query is scoped to the caller's club. A club manages only its own coaches, teams and players. A coach reads their club's teams and players and edits only their own sessions and posts. Anything that belongs to someone else returns 404 or 403.
- **Validation and SQL**: input is validated at the route boundary (types, lengths, emails, ids, dates, URLs). All SQL is parameterized, and partial updates only touch columns from a whitelist.
- **No leaks**: responses never include password hashes. Logging in with an unknown email and with a wrong password gives the same answer, and emails are unique across clubs and coaches.
- **Abuse limits**: login and registration are rate-limited, and CSV uploads are capped (5 MB, `.csv` only, 1,000 rows).
- **Errors**: a central error handler never exposes stack traces, and CORS only allows the origins listed in `CORS_ORIGINS`.

## Data model

[`schema.sql`](schema.sql) creates these tables:
- `clubs`, `entrenadores`, `equipos` and `jugadores`: the club and its people;
- `entrenamientos` and `entrenamiento_jugadores`: sessions and the players in each;
- `publicaciones`, `likes` and `seguidores`: shared sessions and their social side.

[`seed.sql`](seed.sql) loads a demo club with three coaches, two teams, twelve players, sessions and posts.

## Run it locally

You need Node.js 18+ and PostgreSQL. Create a database and load the schema and demo data:

```bash
createdb protactics
psql -d protactics -f schema.sql -f seed.sql
```

Then configure and start the API:

```bash
cp .env.example .env      # set DATABASE_URL and a long random JWT_SECRET
npm install
npm run dev               # http://localhost:3000
```

The seed creates four demo accounts, all with the password `ProTactics2026`:

| Role | Email |
|---|---|
| Club (UE Riera Blava) | `club@rierablava.example` |
| Coach | `marta.soler@rierablava.example` |
| Coach | `pau.ferrer@rierablava.example` |
| Coach | `laia.vidal@rierablava.example` |

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_SSL` | `false` (local), `true`, or `no-verify` for managed databases with self-signed certificates |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing secret and lifetime |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |
| `TRUST_PROXY` | Set to `1` behind a reverse proxy, so rate limiting sees the real client IP |

---

Built by [Alan Teixidó](https://alanteixido.dev).
