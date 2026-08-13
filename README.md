# TaskFlow — Full-Stack Take-Home Assignment

A small full-stack task board built with **React + Vite**, **Node.js + Express**, and **SQLite**.

## What is included

### Core requirements
- Board with columns and tasks
- Create task
- Edit task
- Delete task
- Move task between columns with a reliable dropdown
- Persistent SQLite database
- Priority filtering
- Backend validation for empty titles
- Friendly API error handling
- SQL schema with primary/foreign keys and NOT NULL constraints
- Two non-trivial SQL queries:
  1. Task count per column
  2. Tasks by priority, newest first
- Seed data
- Backend tests

### One stretch goal
- Task count displayed in each column header

## Tech stack

- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express
- Database: SQLite using `better-sqlite3`
- Tests: Vitest + Supertest

## Project structure

```text
TaskFlow-Assignment/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── db.js
│   │   └── taskRepository.js
│   ├── scripts/
│   │   └── seed.js
│   ├── tests/
│   │   ├── api.test.js
│   │   └── repository.test.js
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── .env.example
└── README.md
```

## Requirements

- Node.js 18+
- npm 9+

## 1. Install backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend starts at:

```text
http://localhost:4000
```

## 2. Install frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at the URL printed by Vite, normally:

```text
http://localhost:5173
```

The frontend expects the API at:

```text
http://localhost:4000/api
```

You can override it with `VITE_API_URL`.

## Run backend tests

```bash
cd backend
npm test
```

Tests cover:
- creating a task without a title fails
- moving a task changes its column
- the database query for task counts per column returns expected seed data

## API

### Get board

```http
GET /api/boards/1
```

### Create task

```http
POST /api/tasks
Content-Type: application/json

{
  "columnId": 1,
  "title": "Prepare interview notes",
  "description": "Review common backend questions",
  "priority": "High"
}
```

### Update task

```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "Medium"
}
```

### Move task

```http
PATCH /api/tasks/:id/move
Content-Type: application/json

{
  "columnId": 2
}
```

### Delete task

```http
DELETE /api/tasks/:id
```

### Task counts

```http
GET /api/boards/1/stats
```

## Database design

The schema is intentionally kept small:

- `boards`
- `columns`
- `tasks`

Relationships:

```text
Board 1 ──── * Columns 1 ──── * Tasks
```

Foreign keys are enforced by SQLite.

The application uses SQL queries directly in `taskRepository.js` rather than depending on an ORM's generated CRUD methods.

## Design decisions / assumptions

- A single seeded board is enough because authentication, multiple users, and multiple teams are explicitly out of scope.
- A task must always belong to an existing column.
- Moving a task means updating its `column_id`.
- The UI uses a dropdown for moving tasks instead of drag-and-drop because the assignment explicitly says a reliable control is preferable to broken drag-and-drop.
- Priority filtering is done in the UI because the requirement is to filter the currently visible board.
- The API returns useful 400/404/500 responses so the frontend can recover gracefully.

## If I had more time

- Add drag-and-drop with optimistic updates and rollback.
- Add pagination for larger boards.
- Add database migrations/versioning.
- Add more integration tests and frontend component tests.
- Add authentication only if the product scope later requires multiple users.

## Rough time spent

Approximately 5–7 hours for the implementation, testing, documentation, and cleanup.

## Interesting thing learned

SQLite foreign-key enforcement is connection-level, so the application explicitly enables `PRAGMA foreign_keys = ON` whenever a database connection is created. This keeps the database constraints meaningful rather than relying only on application-level validation.

## Clean-clone verification

From a fresh checkout:

```bash
cd backend
npm install
npm run seed
npm test
npm run dev
```

Then in another terminal:

```bash
cd frontend
npm install
npm run dev
```
