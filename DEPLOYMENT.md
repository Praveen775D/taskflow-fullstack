# TaskFlow Deployment Guide

TaskFlow uses separate deployments for the frontend and backend.

```text
Vercel
  ↓
React Frontend
  ↓
Render API
  ↓
SQLite
```

---

# Frontend Deployment

The frontend is deployed using Vercel.

Production URL:

https://taskflow-fullstack-s2ak.vercel.app/

## Root Directory

```text
frontend
```

## Install Command

```bash
npm install
```

## Build Command

```bash
npm run build
```

## Output Directory

```text
dist
```

## Environment Variable

```text
VITE_API_URL
```

Production value:

```text
https://taskflow-fullstack-mce6.onrender.com/api
```

---

# Backend Deployment

The backend is deployed using Render.

Production URL:

https://taskflow-fullstack-mce6.onrender.com

## Root Directory

```text
backend
```

## Build Command

```bash
npm install
```

## Start Command

```bash
npm run seed && npm start
```

This initializes the SQLite database and then starts the Express server.

---

# Backend Port

Render provides the production port through:

```text
PORT
```

The server uses the environment-provided port and falls back to:

```text
4000
```

for local development.

---

# Deployment Verification

After deployment verify:

```text
https://taskflow-fullstack-mce6.onrender.com/api/health
```

Expected:

```json
{
  "status": "ok"
}
```

Then open:

```text
https://taskflow-fullstack-s2ak.vercel.app/
```

The frontend should load tasks from the production API.

---

# Important Deployment Note

The frontend must point to the production backend:

```env
VITE_API_URL=https://taskflow-fullstack-mce6.onrender.com/api
```

The local development value is:

```env
VITE_API_URL=http://localhost:4000/api
```

Never commit private secrets or production `.env` files.