# TaskFlow — Full-Stack Task Management Board

A modern full-stack task management board built as a take-home assignment using React, Vite, Node.js, Express, and SQLite.

TaskFlow allows users to organize work across multiple stages, create and manage tasks, update priorities, move tasks between columns, filter tasks, and persist all changes in a SQLite database.

---

## 🚀 Live Demo

### Frontend

https://taskflow-fullstack-s2ak.vercel.app/

### Backend API

https://taskflow-fullstack-mce6.onrender.com

### Repository

https://github.com/Praveen775D/taskflow-fullstack

---

## 📌 Project Overview

TaskFlow is a lightweight Kanban-style task management application.

The application provides:

- A task board with multiple workflow columns
- Task creation
- Task editing
- Task deletion
- Task movement between columns
- Task priority management
- Priority filtering
- Persistent SQLite storage
- Backend validation
- API error handling
- Task statistics
- Seed data
- Automated backend tests
- Responsive UI

The application is divided into two independent applications:

```text
Frontend
React + Vite
       ↓
REST API
       ↓
Backend
Node.js + Express
       ↓
SQLite
```

---

# ✨ Features

## Task Management

### Create Tasks

Users can create a task with:

- Title
- Description
- Priority

Supported priorities:

- Low
- Medium
- High

A task cannot be created without a valid title.

---

### Edit Tasks

Existing tasks can be edited to update:

- Title
- Description
- Priority

---

### Delete Tasks

Tasks can be permanently deleted using the delete action.

A confirmation step is used before deletion.

---

### Move Tasks

Tasks can be moved between:

- To Do
- In Progress
- Done

A dropdown-based movement control is used to provide a reliable alternative to drag-and-drop.

---

### Priority Filtering

The board supports filtering tasks by:

- All
- High
- Medium
- Low

The filter applies to the currently displayed board.

---

### Task Statistics

Each board column displays its current task count.

The backend provides a dedicated statistics endpoint:

```http
GET /api/boards/1/stats
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React

## Backend

- Node.js
- Express
- JavaScript
- CORS
- dotenv

## Database

- SQLite
- better-sqlite3

## Testing

- Vitest
- Supertest

## Deployment

- Vercel — Frontend
- Render — Backend

## Version Control

- Git
- GitHub

---

# 📁 Project Structure

```text
TaskFlow-Assignment/
│
├── README.md
├── SETUP.md
├── TESTING.md
├── DEPLOYMENT.md
├── .gitignore
│
├── backend/
│   ├── README.md
│   ├── package.json
│   ├── package-lock.json
│   ├── schema.sql
│   ├── .env.example
│   │
│   ├── scripts/
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── db.js
│   │   └── taskRepository.js
│   │
│   └── tests/
│       ├── api.test.js
│       └── repository.test.js
│
└── frontend/
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── .env.example
    │
    └── src/
        ├── App.jsx
        ├── api.js
        ├── main.jsx
        └── styles.css
```

---

# 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │      Vite App        │
                    └──────────┬───────────┘
                               │
                               │ HTTP / REST
                               ▼
                    ┌──────────────────────┐
                    │   Express REST API   │
                    │     Node.js Server   │
                    └──────────┬───────────┘
                               │
                               │ SQL
                               ▼
                    ┌──────────────────────┐
                    │       SQLite         │
                    │  boards / columns    │
                    │       / tasks        │
                    └──────────────────────┘
```

---

# 🗄️ Database Design

TaskFlow uses three main tables:

```text
boards
   │
   │ 1:N
   ▼
columns
   │
   │ 1:N
   ▼
tasks
```

## Boards

Stores the task boards.

Fields:

- `id`
- `name`
- `created_at`

## Columns

Stores workflow stages.

Fields:

- `id`
- `board_id`
- `name`
- `position`
- `created_at`

## Tasks

Stores individual tasks.

Fields:

- `id`
- `column_id`
- `title`
- `description`
- `priority`
- `created_at`

Foreign keys are enabled in SQLite.

---

# 🔐 Database Constraints

The database uses:

- Primary keys
- Foreign keys
- NOT NULL constraints
- CHECK constraints
- UNIQUE constraints
- Indexes

For example, task priority is restricted to:

```text
Low
Medium
High
```

Task titles must contain non-whitespace characters.

---

# 🔎 Non-Trivial SQL Queries

The backend contains two required non-trivial queries.

## 1. Task Count Per Column

Counts tasks for every column, including columns with zero tasks.

```sql
SELECT
    c.id AS column_id,
    c.name AS column_name,
    COUNT(t.id) AS task_count
FROM columns c
LEFT JOIN tasks t ON t.column_id = c.id
WHERE c.board_id = ?
GROUP BY c.id, c.name, c.position
ORDER BY c.position ASC;
```

## 2. Tasks By Priority

Retrieves tasks matching a priority and orders them by newest first.

```sql
SELECT
    t.id,
    t.title,
    t.description,
    t.priority,
    t.created_at,
    t.column_id,
    c.name AS column_name
FROM tasks t
INNER JOIN columns c ON c.id = t.column_id
WHERE t.priority = ?
ORDER BY datetime(t.created_at) DESC, t.id DESC;
```

---

# 🌱 Seed Data

The project includes seed data for easy setup.

Run:

```bash
cd backend
npm run seed
```

The seed creates:

```text
Product Launch Board

├── To Do
│   ├── Review project requirements
│   └── Prepare database schema
│
├── In Progress
│   └── Build REST API
│
└── Done
    └── Create initial UI
```

The seed script safely skips seeding if a board already exists.

---

# 🔌 API Documentation

Base URL:

```text
/api
```

Production:

```text
https://taskflow-fullstack-mce6.onrender.com/api
```

---

## Get Board

```http
GET /api/boards/1
```

Returns the board, columns, and tasks.

---

## Get Board Statistics

```http
GET /api/boards/1/stats
```

Returns task counts by column.

---

## Create Task

```http
POST /api/tasks
Content-Type: application/json
```

Request:

```json
{
  "columnId": 1,
  "title": "Prepare interview notes",
  "description": "Review common backend questions",
  "priority": "High"
}
```

---

## Update Task

```http
PUT /api/tasks/:id
Content-Type: application/json
```

Request:

```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "priority": "Medium"
}
```

---

## Move Task

```http
PATCH /api/tasks/:id/move
Content-Type: application/json
```

Request:

```json
{
  "columnId": 2
}
```

---

## Delete Task

```http
DELETE /api/tasks/:id
```

---

# ⚠️ Validation & Error Handling

The backend validates:

- Missing task title
- Empty task title
- Invalid priority
- Invalid column
- Invalid task
- Invalid task movement

The API returns meaningful HTTP status codes such as:

```text
200 OK
201 Created
204 No Content
400 Bad Request
404 Not Found
500 Internal Server Error
```

The frontend displays user-friendly error messages instead of exposing raw backend errors.

---

# 💻 Local Development

Requirements:

- Node.js 18+
- npm 9+
- Git

---

## 1. Clone Repository

```bash
git clone https://github.com/Praveen775D/taskflow-fullstack.git
```

Enter the project:

```bash
cd taskflow-fullstack
```

---

# 2. Setup Backend

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Seed the database:

```bash
npm run seed
```

Start the backend:

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

Expected response:

```json
{
  "status": "ok"
}
```

---

# 3. Setup Frontend

Open another terminal.

From the project root:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Frontend normally runs at:

```text
http://localhost:5173
```

---

# ⚙️ Environment Variables

## Frontend

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:4000/api
```

For production, the deployed frontend uses:

```text
https://taskflow-fullstack-mce6.onrender.com/api
```

---

## Backend

The backend supports environment configuration through `.env`.

Example:

```env
PORT=4000
```

A sample configuration is provided in:

```text
backend/.env.example
```

---

# 🧪 Testing

Backend tests are implemented using:

- Vitest
- Supertest

Run:

```bash
cd backend
npm test
```

Current test suite:

```text
Test Files: 2 passed
Tests:      5 passed
```

The tests cover:

- Invalid task creation
- Task movement
- Task count query
- Repository behavior
- API behavior

---

# 🏭 Production Build

Build the frontend:

```bash
cd frontend
npm run build
```

The production files are generated in:

```text
frontend/dist/
```

---

# 🚀 Deployment

## Frontend — Vercel

The frontend is deployed on Vercel.

Live URL:

https://taskflow-fullstack-s2ak.vercel.app/

The frontend requires:

```env
VITE_API_URL=https://taskflow-fullstack-mce6.onrender.com/api
```

---

## Backend — Render

The backend is deployed on Render.

Live URL:

https://taskflow-fullstack-mce6.onrender.com

The backend is started using:

```bash
npm start
```

The deployment also initializes the SQLite database using:

```bash
npm run seed
```

---

# 🔄 Deployment Architecture

```text
User
 │
 ▼
Vercel
React Frontend
 │
 │ HTTPS REST API
 ▼
Render
Node.js + Express
 │
 ▼
SQLite
```

---

# 🎨 UI / UX

The application focuses on:

- Clean task-board layout
- Clear workflow columns
- Priority indicators
- Responsive design
- Modal-based task creation/editing
- Confirmation before deletion
- Clear success/error states
- Simple task movement controls
- Visual task counts
- Accessible controls
- Responsive layout

---

# 📱 Responsive Design

The UI is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

The layout adapts based on screen width while keeping task actions accessible.

---

# 🧠 Design Decisions

## Why SQLite?

SQLite was selected because the assignment requires persistent database storage while keeping the project lightweight and easy to run locally.

## Why better-sqlite3?

`better-sqlite3` provides a simple synchronous API and works well for a small task management application.

## Why REST API?

REST keeps the frontend and backend independently maintainable and makes the backend easy to test using HTTP requests.

## Why dropdown movement instead of drag-and-drop?

The task movement requirement specifically benefits from a reliable control. A dropdown avoids fragile drag-and-drop behavior and provides predictable interaction.

## Why a single seeded board?

Authentication, multiple users, and multiple teams are outside the assignment scope, so a single board keeps the implementation focused on the requested functionality.

---

# 🧹 Code Quality

The project separates responsibilities into:

```text
UI
 ↓
API Client
 ↓
Express Routes
 ↓
Repository
 ↓
Database
```

Database operations are isolated in:

```text
backend/src/taskRepository.js
```

Database initialization is handled by:

```text
backend/src/db.js
```

HTTP application configuration is handled by:

```text
backend/src/app.js
```

Server startup is handled by:

```text
backend/src/server.js
```

---

# 🔒 Security / Configuration

The repository does not include:

- Production secrets
- Database files
- `node_modules`
- `.env` files

These are excluded through `.gitignore`.

Example environment configuration is provided using:

```text
.env.example
```

---

# 📦 Clean Clone Verification

To verify the project from a fresh clone:

```bash
git clone https://github.com/Praveen775D/taskflow-fullstack.git

cd taskflow-fullstack

cd backend
npm install
npm run seed
npm test
npm run dev
```

Open another terminal:

```bash
cd taskflow-fullstack/frontend
npm install
npm run build
npm run dev
```

---

# 📊 Assignment Completion

| Requirement | Status |
|---|---|
| Task board  |
| Create task |  Pass |
| Edit task |  Pass |
| Delete task |  Pass |
| Move task |  Pass |
| Priority management |  Pass |
| Priority filtering |  Pass |
| Persistent SQLite database |  Pass |
| Backend validation |  Pass |
| Error handling |  Pass |
| SQL schema |  Pass |
| Foreign keys |  Pass |
| Non-trivial SQL query #1 |  Pass |
| Non-trivial SQL query #2 |  Pass |
| Seed data |  Pass |
| Backend tests |  Pass |
| Task count stretch goal |  Pass |
| Responsive UI |  Pass |
| Production deployment |  Pass |

---

# ⏱️ Development Time

Approximately 5–7 hours including:

- Frontend development
- Backend development
- Database design
- API implementation
- Testing
- Documentation
- Deployment
- Final verification

---

# 🔮 Future Improvements

Possible future enhancements:

- Drag-and-drop task movement
- Authentication
- Multiple boards
- Multiple users
- Team collaboration
- Pagination
- Search
- Task labels
- Due dates
- Notifications
- Database migrations
- Frontend component tests
- CI/CD pipeline

These features were intentionally kept outside the current assignment scope.

---

# 👨‍💻 Author

**Praveen**

Full-Stack Developer

GitHub:

https://github.com/Praveen775D

---

# 📄 Additional Documentation

Detailed documentation is available in:

- `SETUP.md` — Local installation and configuration
- `TESTING.md` — Testing and verification
- `DEPLOYMENT.md` — Production deployment
- `backend/README.md` — Backend architecture and API
- `frontend/README.md` — Frontend architecture and UI

---

## ⭐ Final Verification

Production frontend:

https://taskflow-fullstack-s2ak.vercel.app/

Production backend:

https://taskflow-fullstack-mce6.onrender.com

Repository:

https://github.com/Praveen775D/taskflow-fullstack