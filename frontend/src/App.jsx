import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  CirclePlus,
  ClipboardList,
  Pencil,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { api } from "./api";

const BOARD_ID = 1;

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  columnId: ""
};

function App() {
  const [board, setBoard] = useState(null);
  const [stats, setStats] = useState([]);
  const [priority, setPriority] = useState("All");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function loadBoard() {
    setLoading(true);
    try {
      const [nextBoard, nextStats] = await Promise.all([
        api.getBoard(BOARD_ID),
        api.getStats(BOARD_ID)
      ]);
      setBoard(nextBoard);
      setStats(nextStats);
      setNotice(null);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, []);

  const visibleColumns = useMemo(() => {
    if (!board) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return board.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        const matchesPriority =
          priority === "All" || task.priority === priority;

        const matchesQuery =
          !normalizedQuery ||
          task.title.toLowerCase().includes(normalizedQuery);

        return matchesPriority && matchesQuery;
      })
    }));
  }, [board, priority, query]);

  function openCreate(columnId) {
    setForm({ ...emptyForm, columnId: String(columnId) });
    setModal({ mode: "create" });
  }

  function openEdit(task) {
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      columnId: String(task.column_id)
    });
    setModal({ mode: "edit", task });
  }

  function closeModal() {
    if (!saving) setModal(null);
  }

  async function submitForm(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setNotice({ type: "error", text: "Task title is required." });
      return;
    }

    setSaving(true);

    try {
      if (modal.mode === "create") {
        await api.createTask({
          columnId: Number(form.columnId),
          title: form.title,
          description: form.description,
          priority: form.priority
        });
      } else {
        await api.updateTask(modal.task.id, {
          title: form.title,
          description: form.description,
          priority: form.priority
        });
      }

      setModal(null);
      setNotice({
        type: "success",
        text: modal.mode === "create" ? "Task created." : "Task updated."
      });
      await loadBoard();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(taskId, columnId) {
    try {
      await api.moveTask(taskId, Number(columnId));
      setNotice({ type: "success", text: "Task moved successfully." });
      await loadBoard();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  async function handleDelete(task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.deleteTask(task.id);
      setNotice({ type: "success", text: "Task deleted." });
      await loadBoard();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  const totalTasks =
    board?.columns.reduce((sum, column) => sum + column.tasks.length, 0) || 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <ClipboardList size={21} />
          </div>
          <div>
            <strong>TaskFlow</strong>
            <span>Team task board</span>
          </div>
        </div>

        <div className="top-actions">
          <div className="live-pill">
            <span className="live-dot" />
            Backend connected
          </div>
          <button className="icon-button" onClick={loadBoard} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <div>
            <div className="eyebrow">
              <Sparkles size={15} />
              SIMPLE. FAST. PERSISTENT.
            </div>
            <h1>{board?.name || "Your workspace"}</h1>
            <p>
              Organize work across clear stages and keep every change safely
              stored in SQLite.
            </p>
          </div>

          <div className="hero-stat">
            <span>{totalTasks}</span>
            <small>visible tasks</small>
          </div>
        </section>

        {notice && (
          <div className={`notice ${notice.type}`}>
            {notice.type === "success" ? <Check size={17} /> : <AlertCircle size={17} />}
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        <section className="toolbar">
          <div className="search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search task titles..."
              aria-label="Search task titles"
            />
          </div>

          <div className="filters">
            <span>Priority</span>
            {["All", "High", "Medium", "Low"].map((value) => (
              <button
                key={value}
                className={priority === value ? "filter active" : "filter"}
                onClick={() => setPriority(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="state-card">
            <RefreshCw className="spin" size={24} />
            <h2>Loading board...</h2>
            <p>Connecting to the TaskFlow API.</p>
          </div>
        ) : board ? (
          <section className="board">
            {visibleColumns.map((column) => {
              const originalCount =
                stats.find((item) => item.column_id === column.id)?.task_count ?? 0;

              return (
                <div className="column" key={column.id}>
                  <div className="column-header">
                    <div>
                      <h2>{column.name}</h2>
                      <span>{originalCount} total tasks</span>
                    </div>
                    <button
                      className="add-button"
                      onClick={() => openCreate(column.id)}
                      title={`Add task to ${column.name}`}
                    >
                      <CirclePlus size={19} />
                    </button>
                  </div>

                  <div className="task-list">
                    {column.tasks.length === 0 ? (
                      <div className="empty-column">
                        <ClipboardList size={22} />
                        <span>No matching tasks</span>
                      </div>
                    ) : (
                      column.tasks.map((task) => (
                        <article className="task-card" key={task.id}>
                          <div className="task-top">
                            <span className={`priority ${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                            <div className="task-actions">
                              <button onClick={() => openEdit(task)} title="Edit">
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(task)}
                                title="Delete"
                                className="danger"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <h3>{task.title}</h3>
                          {task.description && <p>{task.description}</p>}

                          <div className="move-control">
                            <label htmlFor={`move-${task.id}`}>Move to</label>
                            <div className="select-wrap">
                              <select
                                id={`move-${task.id}`}
                                value={task.column_id}
                                onChange={(event) =>
                                  handleMove(task.id, event.target.value)
                                }
                              >
                                {board.columns.map((target) => (
                                  <option key={target.id} value={target.id}>
                                    {target.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={15} />
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>

                  <button
                    className="column-add"
                    onClick={() => openCreate(column.id)}
                  >
                    <CirclePlus size={17} />
                    Add task
                  </button>
                </div>
              );
            })}
          </section>
        ) : (
          <div className="state-card error-card">
            <AlertCircle size={28} />
            <h2>Could not load the board</h2>
            <p>Make sure the backend is running, then try again.</p>
            <button className="primary-button" onClick={loadBoard}>
              Try again
            </button>
          </div>
        )}
      </main>

      {modal && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <form className="modal" onSubmit={submitForm} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  {modal.mode === "create" ? "NEW TASK" : "EDIT TASK"}
                </span>
                <h2>{modal.mode === "create" ? "Create a task" : "Edit task"}</h2>
              </div>
              <button type="button" className="icon-button" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <label>
              Title <span>*</span>
              <input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Finalize landing page"
                maxLength={120}
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add useful context..."
                rows={4}
                maxLength={500}
              />
            </label>

            <div className="form-grid">
              <label>
                Priority
                <div className="select-wrap full">
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <ChevronDown size={15} />
                </div>
              </label>

              <label>
                Column
                <div className="select-wrap full">
                  <select
                    value={form.columnId}
                    onChange={(e) => setForm({ ...form, columnId: e.target.value })}
                    disabled={modal.mode === "edit"}
                  >
                    {board.columns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} />
                </div>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeModal}>
                Cancel
              </button>
              <button className="primary-button" disabled={saving}>
                {saving ? "Saving..." : modal.mode === "create" ? "Create task" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
