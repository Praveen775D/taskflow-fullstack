# TaskFlow Testing & Verification

## Backend Automated Tests

Testing framework:

- Vitest
- Supertest

Run:

```bash
cd backend
npm test
```

Current result:

```text
Test Files: 2 passed
Tests: 5 passed
```

---

# Test Coverage

## API Tests

The API tests verify:

- Invalid task creation
- Task movement
- API responses
- Board behavior

## Repository Tests

Repository tests verify:

- Database operations
- Task count query
- Task persistence

---

# Manual Functional Testing

The following scenarios were verified manually.

## 1. Load Board

Expected:

- Board loads successfully
- Columns are visible
- Seed tasks appear

---

## 2. Create Task

Enter:

```text
Title: Complete TaskFlow Assignment
Description: Verify all assignment requirements
Priority: High
```

Expected:

- Task is created
- Task appears in the selected column
- Task count updates

---

## 3. Empty Title Validation

Attempt to create a task without a title.

Expected:

```text
Title is required.
```

The task should not be created.

---

## 4. Edit Task

Open edit action.

Change:

- Title
- Description
- Priority

Expected:

- Updated task appears immediately
- Changes persist after refresh

---

## 5. Move Task

Change task column using the movement control.

Expected:

- Task moves to selected column
- Database updates
- Board refresh preserves the new location

---

## 6. Delete Task

Click delete.

Expected:

- Confirmation appears
- After confirmation task is removed
- Task count updates

---

## 7. Priority Filter

Test:

```text
All
High
Medium
Low
```

Expected:

- Only matching tasks are displayed
- Board remains functional

---

## 8. Persistence

Create or modify a task.

Refresh browser.

Expected:

- Changes remain because the data is stored in SQLite.

---

# Production Verification

Frontend:

https://taskflow-fullstack-s2ak.vercel.app/

Backend:

https://taskflow-fullstack-mce6.onrender.com

Backend health endpoint:

```text
https://taskflow-fullstack-mce6.onrender.com/api/health
```

Expected:

```json
{
  "status": "ok"
}
```

---

# Final Test Status

| Test | Result |
|---|---|
| Backend automated tests | ✅ Passed |
| API tests | ✅ Passed |
| Repository tests | ✅ Passed |
| Frontend production build | ✅ Passed |
| Create task | ✅ Passed |
| Edit task | ✅ Passed |
| Delete task | ✅ Passed |
| Move task | ✅ Passed |
| Priority filter | ✅ Passed |
| Persistence | ✅ Passed |
| Production frontend | ✅ Verified |
| Production backend | ✅ Verified |