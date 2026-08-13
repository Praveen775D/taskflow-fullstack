import { beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import {
  getTaskCountsByColumn,
  getTasksByPriority
} from "../src/taskRepository.js";

const schema = fs.readFileSync(
  path.resolve(process.cwd(), "schema.sql"),
  "utf8"
);

describe("database query layer", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    db.exec(schema);

    const board = db
      .prepare("INSERT INTO boards (name) VALUES (?)")
      .run("Test Board");

    const boardId = Number(board.lastInsertRowid);

    const column = db.prepare(`
      INSERT INTO columns (board_id, name, position)
      VALUES (?, ?, ?)
    `);

    const todo = Number(column.run(boardId, "To Do", 1).lastInsertRowid);
    const done = Number(column.run(boardId, "Done", 2).lastInsertRowid);

    const task = db.prepare(`
      INSERT INTO tasks (column_id, title, priority)
      VALUES (?, ?, ?)
    `);

    task.run(todo, "High task", "High");
    task.run(todo, "Low task", "Low");
    task.run(done, "Another high task", "High");
  });

  it("returns task counts per column from SQL", () => {
    const result = getTaskCountsByColumn(db, 1);

    expect(result).toEqual([
      { column_id: 1, column_name: "To Do", task_count: 2 },
      { column_id: 2, column_name: "Done", task_count: 1 }
    ]);
  });

  it("returns tasks by priority newest first", () => {
    const result = getTasksByPriority(db, "High");

    expect(result).toHaveLength(2);
    expect(result.every((task) => task.priority === "High")).toBe(true);
    expect(result[0].title).toBe("Another high task");
  });
});
