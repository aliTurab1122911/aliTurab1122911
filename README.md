# AI-Driven Chatbot System (Next.js Monolith + CSV)

A clean and simple chatbot platform built with Next.js, glassmorphism UI, and CSV storage only.

## Features
- Chat UI with gradient + glassmorphism styling
- End Chat button to close current conversation and open a fresh session
- Gradient theme rotates every ~15 minutes through complementary palettes
- Upload your CSV dataset to train the chatbot (append mode)
- Clear training dataset from the Datasets page
- Every chat session and message stored as dataset rows in CSV
- Full training table view (not limited to 30 rows)

## Training CSV Format
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
- Import in Vercel
- Deploy as a standard Next.js project

## Notes
This project is intentionally simple and generic. It writes CSV files locally for demo/dev workflows.
