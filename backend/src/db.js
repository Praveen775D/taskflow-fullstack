import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

export function createDatabase(filename) {
  const db = new Database(filename);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  return db;
}

export function initializeDatabase(db) {
  const schemaPath = path.join(backendRoot, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

const dataDir = path.join(backendRoot, "data");
fs.mkdirSync(dataDir, { recursive: true });

const defaultDatabaseFile =
  process.env.DATABASE_FILE
    ? path.resolve(backendRoot, process.env.DATABASE_FILE)
    : path.join(dataDir, "taskflow.db");

const db = createDatabase(defaultDatabaseFile);
initializeDatabase(db);

export default db;
