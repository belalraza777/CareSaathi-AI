# AI Doctor

Production-focused documentation for the full-stack AI Doctor application.

## Overview
AI Doctor is a full-stack medical consultation platform with:
- JWT + cookie-based authentication (local + Google OAuth)
- Profile management for patient context
- AI-powered consultation chat and voice flow
- Risk classification (Mild, Moderate, Critical)
- RAG-backed medical knowledge retrieval (Pinecone + embeddings)
- Consultation history with message timelines

## Tech Stack
- Frontend: React, Vite, React Router, Zustand, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), Joi
- AI Layer: LangChain agent + Groq model
- RAG: Pinecone vector DB + HuggingFace embeddings
- Voice (frontend): Deepgram STT, ElevenLabs/browser TTS

## Repository Structure
```text
AI DOCTOR/
  client/                     # React + Vite frontend
  server/                     # Express API + AI/RAG backend
  README.md                   # Project documentation (this file)
```

## Runtime Architecture
1. User authenticates (cookie + optional bearer fallback).
2. Frontend calls REST APIs under /api/v1.
3. Consultation chat endpoint invokes AI agent.
4. Agent uses tools for profile, consultation context, risk setting, and RAG retrieval.
5. Messages and consultation state are persisted in MongoDB.

## Prerequisites
- Node.js 20+
- npm 10+
- MongoDB (local or managed)
- API keys for AI features (Groq, HuggingFace, Pinecone)
- Optional voice keys (Deepgram, ElevenLabs)

## Environment Variables

### Server (.env in server/)
Use this as a production-oriented template:

```env
# Core
PORT=5000
NODE_ENV=development
MONGODB_URL=mongodb://127.0.0.1:27017/aidoctor
JWT_SECRET=replace-with-a-strong-random-secret
FRONTEND_URL=http://localhost:5173

# AI provider
GROQ_API_KEY=your_groq_key

# RAG retrieval
HF_API_KEY=your_huggingface_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
PINECONE_NAMESPACE=standard-treatment-guidelines_-pdf
PINECONE_NAMESPACES=standard-treatment-guidelines_-pdf
RAG_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
GOOGLE_FRONTEND_REDIRECT_URL=http://localhost:5173/oauth-success

# RAG ingestion script options (optional)
PDF_PATH=./standard-treatment-guidelines_.pdf
MIN_CHUNK_LENGTH=20
PINECONE_UPSERT_BATCH_SIZE=100
```

Important:
- In production, set NODE_ENV=production for secure cookie behavior.
- FRONTEND_URL must exactly match your deployed frontend origin.
- Explicitly set GOOGLE_CALLBACK_URL (do not rely on defaults).

### Client (.env in client/)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_DEEPGRAM_API_KEY=optional_for_voice_stt
VITE_ELEVENLAB_API_KEY=optional_for_voice_tts
```

## Local Development

### 1) Install dependencies
```bash
cd server
npm install

cd ../client
npm install
```

### 2) Start backend
```bash
cd server
node server.js
```

### 3) Start frontend
```bash
cd client
npm run dev
```

Frontend default: http://localhost:5173  
Backend default: http://localhost:5000

## Production Build and Run

### Frontend
```bash
cd client
npm run build
npm run preview
```

Deploy client/dist to your static host (Nginx, CDN, Vercel, Netlify, etc.).

### Backend
```bash
cd server
node server.js
```

Recommended in production:
- Run behind a reverse proxy (Nginx, Caddy, cloud load balancer)
- Use a process manager (PM2/systemd/container orchestration)
- Serve API over HTTPS only

## API Base URL
All API routes are prefixed with:
- /api/v1

## API Summary

### Auth
- POST /auth/register
- POST /auth/login
- GET /auth/logout
- GET /auth/check
- PATCH /auth/reset
- GET /auth/google
- GET /auth/google/callback

### Profile
- GET /profile
- POST /profile
- PATCH /profile

### Consultation
- POST /consultation/new
- POST /consultation/chat/:consultationId
- GET /consultation
- GET /consultation/:consultationId
- GET /consultation/:consultationId/messages
- DELETE /consultation/:consultationId

## Request Validation (high-level)
- Register: name, email, password
- Login: email, password
- Profile: at least one of age, gender, medicalHistory, allergies, medications
- Consultation create: mainSymptom[], symptomDuration, optional notes/gender/age/height/weight
- Consultation chat: message

## Authentication Notes
- Backend sets token cookie (httpOnly, 5 days).
- Frontend sends credentials with Axios (withCredentials=true).
- Bearer token fallback is supported by middleware.
- In production, secure cookie requires HTTPS and proper sameSite handling.

## RAG Knowledge Ingestion
To ingest a medical PDF into Pinecone:

```bash
cd server
node ai_agent/rag/uploadInVDb.js
```

The script uses PDF_PATH, HF_API_KEY, PINECONE_API_KEY, and index/namespace env variables.

## Production Hardening Checklist
- [ ] Add explicit server scripts (start, dev) in server/package.json
- [ ] Add Helmet and rate limiting middleware
- [ ] Add structured logging and request correlation IDs
- [ ] Add health/readiness endpoints for infra probes
- [ ] Add automated tests (unit + integration + API)
- [ ] Add CI pipeline for lint/build/test
- [ ] Add secrets manager integration (do not store keys in files)
- [ ] Add monitoring and alerting (error rate, latency, uptime)
- [ ] Add backup/restore policy for MongoDB and Pinecone data

## Troubleshooting
- 401 Unauthorized:
  - Verify cookie domain, FRONTEND_URL, and CORS credentials setup.
  - Confirm JWT_SECRET is set and consistent.
- OAuth callback issues:
  - Ensure GOOGLE_CALLBACK_URL matches your provider console exactly.
- Empty RAG answers:
  - Check Pinecone index/namespace env values and ingestion status.
- Voice features not working:
  - Confirm VITE_DEEPGRAM_API_KEY and/or VITE_ELEVENLAB_API_KEY.

## Current Gaps to Address Before Regulated/High-Risk Production Use
- No automated test suite
- No CI/CD pipeline in repository
- Limited security middleware hardening
- No built-in observability stack

If needed, I can also generate:
- .env.example files for client and server
- a deployment-specific README (Docker, Render, Railway, EC2, etc.)
- a production checklist tailored to your target cloud platform
