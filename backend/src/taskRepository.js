export function getBoard(db, boardId) {
  const board = db
    .prepare("SELECT id, name, created_at FROM boards WHERE id = ?")
    .get(boardId);

  if (!board) return null;

  const columns = db
    .prepare(`
      SELECT id, board_id, name, position, created_at
      FROM columns
      WHERE board_id = ?
      ORDER BY position ASC
    `)
    .all(boardId);

  const tasks = db
    .prepare(`
      SELECT id, column_id, title, description, priority, created_at
      FROM tasks
      WHERE column_id IN (
        SELECT id FROM columns WHERE board_id = ?
      )
      ORDER BY datetime(created_at) DESC, id DESC
    `)
    .all(boardId);

  return {
    ...board,
    columns: columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id)
    }))
  };
}

export function getColumn(db, columnId) {
  return db
    .prepare("SELECT id, board_id, name, position FROM columns WHERE id = ?")
    .get(columnId);
}

export function createTask(db, { columnId, title, description, priority }) {
  const result = db
    .prepare(`
      INSERT INTO tasks (column_id, title, description, priority)
      VALUES (?, ?, ?, ?)
    `)
    .run(columnId, title.trim(), description?.trim() || null, priority);

  return db
    .prepare(`
      SELECT id, column_id, title, description, priority, created_at
      FROM tasks
      WHERE id = ?
    `)
    .get(result.lastInsertRowid);
}

export function getTask(db, taskId) {
  return db
    .prepare(`
      SELECT id, column_id, title, description, priority, created_at
      FROM tasks
      WHERE id = ?
    `)
    .get(taskId);
}

export function updateTask(db, taskId, { title, description, priority }) {
  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, priority = ?
    WHERE id = ?
  `).run(title.trim(), description?.trim() || null, priority, taskId);

  return getTask(db, taskId);
}

export function deleteTask(db, taskId) {
  return db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
}

export function moveTask(db, taskId, columnId) {
  db.prepare(`
    UPDATE tasks
    SET column_id = ?
    WHERE id = ?
  `).run(columnId, taskId);

  return getTask(db, taskId);
}

// Required non-trivial query #1:
// Count tasks per column for a board.
export function getTaskCountsByColumn(db, boardId) {
  return db
    .prepare(`
      SELECT
        c.id AS column_id,
        c.name AS column_name,
        COUNT(t.id) AS task_count
      FROM columns c
      LEFT JOIN tasks t ON t.column_id = c.id
      WHERE c.board_id = ?
      GROUP BY c.id, c.name, c.position
      ORDER BY c.position ASC
    `)
    .all(boardId);
}

// Required non-trivial query #2:
// Find tasks of a given priority, newest first.
export function getTasksByPriority(db, priority) {
  return db
    .prepare(`
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
      ORDER BY datetime(t.created_at) DESC, t.id DESC
    `)
    .all(priority);
}
