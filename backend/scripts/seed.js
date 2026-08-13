import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db, { initializeDatabase } from "../src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const seedPath = path.join(backendRoot, "schema.sql");

initializeDatabase(db);

const existing = db.prepare("SELECT COUNT(*) AS count FROM boards").get().count;

if (existing > 0) {
  console.log("Seed skipped: database already contains a board.");
  process.exit(0);
}

const seed = db.transaction(() => {
  const board = db
    .prepare("INSERT INTO boards (name) VALUES (?)")
    .run("Product Launch Board");

  const boardId = Number(board.lastInsertRowid);

  const insertColumn = db.prepare(`
    INSERT INTO columns (board_id, name, position)
    VALUES (?, ?, ?)
  `);

  const todo = Number(insertColumn.run(boardId, "To Do", 1).lastInsertRowid);
  const progress = Number(insertColumn.run(boardId, "In Progress", 2).lastInsertRowid);
  const done = Number(insertColumn.run(boardId, "Done", 3).lastInsertRowid);

  const insertTask = db.prepare(`
    INSERT INTO tasks (column_id, title, description, priority)
    VALUES (?, ?, ?, ?)
  `);

  insertTask.run(todo, "Review project requirements", "Read the assignment and confirm the core scope.", "High");
  insertTask.run(todo, "Prepare database schema", "Create boards, columns and tasks tables.", "Medium");
  insertTask.run(progress, "Build REST API", "Implement task CRUD and task movement.", "High");
  insertTask.run(done, "Create initial UI", "Set up the React board shell.", "Low");
});

seed();

console.log("Database seeded successfully.");
console.log(`Seed file: ${seedPath}`);
