import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import {
  getColumn,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  getBoard
} from "../src/taskRepository.js";

const schema = fs.readFileSync(
  path.resolve(process.cwd(), "schema.sql"),
  "utf8"
);

function makeTestApp() {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  db.exec(schema);

  const board = db.prepare("INSERT INTO boards (name) VALUES (?)").run("Test Board");
  const boardId = Number(board.lastInsertRowid);

  const column = db.prepare(`
    INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)
  `);

  const todo = Number(column.run(boardId, "To Do", 1).lastInsertRowid);
  const progress = Number(column.run(boardId, "In Progress", 2).lastInsertRowid);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/boards/:boardId", (req, res) => {
    const board = getBoard(db, Number(req.params.boardId));
    if (!board) return res.status(404).json({ error: "Board not found." });
    res.json(board);
  });

  app.post("/api/tasks", (req, res) => {
    if (!req.body.title?.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }

    if (!getColumn(db, Number(req.body.columnId))) {
      return res.status(404).json({ error: "Column not found." });
    }

    const task = createTask(db, {
      columnId: Number(req.body.columnId),
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || "Medium"
    });

    res.status(201).json(task);
  });

  app.patch("/api/tasks/:taskId/move", (req, res) => {
    const task = getTask(db, Number(req.params.taskId));
    if (!task) return res.status(404).json({ error: "Task not found." });

    const column = getColumn(db, Number(req.body.columnId));
    if (!column) return res.status(404).json({ error: "Column not found." });

    res.json(moveTask(db, Number(req.params.taskId), Number(req.body.columnId)));
  });

  return { app, db, boardId, todo, progress };
}

describe("TaskFlow API", () => {
  let ctx;

  beforeEach(() => {
    ctx = makeTestApp();
  });

  it("rejects creating a task with no title", async () => {
    const response = await request(ctx.app)
      .post("/api/tasks")
      .send({ columnId: ctx.todo, title: "   " });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Title is required.");
  });

  it("moves a task to another column", async () => {
    const created = createTask(ctx.db, {
      columnId: ctx.todo,
      title: "Move me",
      description: null,
      priority: "Medium"
    });

    const response = await request(ctx.app)
      .patch(`/api/tasks/${created.id}/move`)
      .send({ columnId: ctx.progress });

    expect(response.status).toBe(200);
    expect(response.body.column_id).toBe(ctx.progress);
  });

  it("can create a valid task and persist it", async () => {
    const response = await request(ctx.app)
      .post("/api/tasks")
      .send({
        columnId: ctx.todo,
        title: "Persisted task",
        description: "Stored in SQLite",
        priority: "High"
      });

    expect(response.status).toBe(201);

    const saved = getTask(ctx.db, response.body.id);
    expect(saved.title).toBe("Persisted task");
    expect(saved.priority).toBe("High");
  });
});
