# AI-Driven Chatbot System (Next.js Monolith + CSV)

A clean and simple chatbot platform built with Next.js.

## Tech
- Next.js (single monorepo app)
- TypeScript
- CSV files for all storage

## Features
- Chat UI
- Upload your training CSV and use it immediately
- Session/message logging to CSV
- Feedback logging to CSV
- History and dataset pages

## CSV Training Format
Upload a CSV with these headers:

```csv
id,question,answer,keywords
1,What is this?,This is a chatbot.,chatbot intro
```

## Run locally
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy
- Push to GitHub
- Import project into Vercel
- Deploy as a regular Next.js project

## Notes
This is intentionally simple and generic. It uses file-based CSV writes, which are ideal for local development and demos.
