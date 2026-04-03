# Anonymous Chain Messenger

A monolithic Next.js app that simulates a blockchain-inspired anonymous messaging network using only local CSV files and Node.js hashing.

## Features

- Single repository and single app (frontend + backend route handlers)
- Anonymous/pseudonymous message submission UI
- 3 simulated nodes (`nodeA`, `nodeB`, `nodeC`) in-process
- Append-only CSV ledger files per node
- Hash-linked records (`prevHash` -> `hash`) using Node `crypto`
- Internal message propagation (function calls, no real p2p networking)

## Tech stack

- Next.js (App Router)
- TypeScript
- Local filesystem CSV storage (`/data`)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API endpoints

- `POST /api/messages`
  - body: `{ "pseudonym": "anon", "message": "hello" }`
- `GET /api/ledger?node=nodeA`
- `GET /api/network/status`
- `GET /api/verify?node=nodeA`

## Data files

At runtime the app auto-creates CSV files under `data/`:

- `messages.csv`
- `ledger_nodeA.csv`
- `ledger_nodeB.csv`
- `ledger_nodeC.csv`

## Important Vercel note

This project is fully monolithic and deployable to GitHub/Vercel, but local filesystem writes on Vercel are ephemeral in serverless environments. This is ideal for demoing architecture and behavior, but not durable long-term storage.
