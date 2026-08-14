# TaskFlow Setup Guide

This document explains how to install and run TaskFlow locally.

---

# 1. Prerequisites

Install:

- Node.js 18+
- npm 9+
- Git

Verify:

```bash
node --version
npm --version
git --version
```

---

# 2. Clone Project

```bash
git clone https://github.com/Praveen775D/taskflow-fullstack.git
cd taskflow-fullstack
```

---

# 3. Backend Setup

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Initialize database and seed data:

```bash
npm run seed
```

Start development server:

```bash
npm run dev
```

Backend:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

Expected:

```json
{
  "status": "ok"
}
```

---

# 4. Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:4000/api
```

Start:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 5. Verify Full Stack Connection

Make sure the backend is running first.

Then open:

```text
http://localhost:5173
```

The frontend should display the seeded board.

Verify:

- Tasks load
- Task creation works
- Task editing works
- Task deletion works
- Task movement works
- Priority filtering works
- Task counts update

---

# 6. Backend Tests

From:

```text
backend/
```

Run:

```bash
npm test
```

Expected:

```text
Test Files: 2 passed
Tests: 5 passed
```

---

# 7. Frontend Production Build

From:

```text
frontend/
```

Run:

```bash
npm run build
```

Expected:

```text
✓ built
```

The generated production files are stored in:

```text
frontend/dist/
```

---

# 8. Common Problems

## Backend is not responding

Check:

```text
http://localhost:4000/api/health
```

If necessary restart:

```bash
npm run dev
```

---

## Frontend says "Could not load the board"

Check:

```text
frontend/.env
```

It should contain:

```env
VITE_API_URL=http://localhost:4000/api
```

Restart Vite after changing `.env`.

---

## Board not found

Run:

```bash
cd backend
npm run seed
```

Then restart backend.

---

## PowerShell Invoke-WebRequest warning

Use:

```powershell
Invoke-WebRequest http://localhost:4000/api/health -UseBasicParsing
```

Expected:

```text
StatusCode : 200
Content   : {"status":"ok"}
```

---

# 9. Production URLs

Frontend:

https://taskflow-fullstack-s2ak.vercel.app/

Backend:

https://taskflow-fullstack-mce6.onrender.com