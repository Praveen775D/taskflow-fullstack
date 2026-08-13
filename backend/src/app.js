import express from "express";
import cors from "cors";
import db from "./db.js";
import {
  getBoard,
  getColumn,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  getTaskCountsByColumn,
  getTasksByPriority
} from "./taskRepository.js";

const app = express();

app.use(cors());
app.use(express.json());

const VALID_PRIORITIES = new Set(["Low", "Medium", "High"]);

function isValidId(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function validateTaskInput(body, { partial = false } = {}) {
  const errors = [];

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      errors.push("Title is required.");
    }
  }

  if (body.description !== undefined && body.description !== null &&
      typeof body.description !== "string") {
    errors.push("Description must be text.");
  }

  if (body.priority !== undefined && !VALID_PRIORITIES.has(body.priority)) {
    errors.push("Priority must be Low, Medium, or High.");
  }

  return errors;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/boards/:boardId", (req, res) => {
  if (!isValidId(req.params.boardId)) {
    return res.status(400).json({ error: "Invalid board id." });
  }

  const board = getBoard(db, Number(req.params.boardId));

  if (!board) {
    return res.status(404).json({ error: "Board not found." });
  }

  res.json(board);
});

app.get("/api/boards/:boardId/stats", (req, res) => {
  if (!isValidId(req.params.boardId)) {
    return res.status(400).json({ error: "Invalid board id." });
  }

  const board = getBoard(db, Number(req.params.boardId));
  if (!board) {
    return res.status(404).json({ error: "Board not found." });
  }

  res.json(getTaskCountsByColumn(db, Number(req.params.boardId)));
});

app.get("/api/tasks/priority/:priority", (req, res) => {
  if (!VALID_PRIORITIES.has(req.params.priority)) {
    return res.status(400).json({ error: "Invalid priority." });
  }

  res.json(getTasksByPriority(db, req.params.priority));
});

app.post("/api/tasks", (req, res, next) => {
  try {
    const errors = validateTaskInput(req.body);
    if (errors.length) {
      return res.status(400).json({ error: errors[0], errors });
    }

    const columnId = Number(req.body.columnId);
    if (!isValidId(columnId)) {
      return res.status(400).json({ error: "A valid columnId is required." });
    }

    const column = getColumn(db, columnId);
    if (!column) {
      return res.status(404).json({ error: "Column not found." });
    }

    const task = createTask(db, {
      columnId,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || "Medium"
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

app.put("/api/tasks/:taskId", (req, res, next) => {
  try {
    if (!isValidId(req.params.taskId)) {
      return res.status(400).json({ error: "Invalid task id." });
    }

    const errors = validateTaskInput(req.body);
    if (errors.length) {
      return res.status(400).json({ error: errors[0], errors });
    }

    if (!VALID_PRIORITIES.has(req.body.priority)) {
      return res.status(400).json({ error: "Priority must be Low, Medium, or High." });
    }

    const task = getTask(db, Number(req.params.taskId));
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(updateTask(db, Number(req.params.taskId), {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority
    }));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/tasks/:taskId/move", (req, res, next) => {
  try {
    if (!isValidId(req.params.taskId) || !isValidId(req.body.columnId)) {
      return res.status(400).json({ error: "Valid task and column ids are required." });
    }

    const taskId = Number(req.params.taskId);
    const columnId = Number(req.body.columnId);

    if (!getTask(db, taskId)) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (!getColumn(db, columnId)) {
      return res.status(404).json({ error: "Column not found." });
    }

    res.json(moveTask(db, taskId, columnId));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tasks/:taskId", (req, res, next) => {
  try {
    if (!isValidId(req.params.taskId)) {
      return res.status(400).json({ error: "Invalid task id." });
    }

    const result = deleteTask(db, Number(req.params.taskId));

    if (!result.changes) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong on the server." });
});

export default app;
