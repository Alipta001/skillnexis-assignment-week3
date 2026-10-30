import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  Circle,
  ClipboardList,
  ListFilter,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api, { getErrorMessage } from "./services/api";

const filters = [
  { value: "all", label: "All tasks" },
  { value: "active", label: "To do" },
  { value: "completed", label: "Completed" },
];

function TaskDialog({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Add a title before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({ title: title.trim(), description: description.trim() });
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Could not save this task."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="dialog-title"
        aria-modal="true"
        className="task-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">
              {task ? "MAKE AN UPDATE" : "ADD TO YOUR LIST"}
            </p>
            <h2 id="dialog-title">{task ? "Edit task" : "New task"}</h2>
          </div>
          <button
            aria-label="Close dialog"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={19} />
          </button>
        </div>
        <form className="task-form" onSubmit={submit}>
          <label>
            Task title
            <input
              autoFocus
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to get done?"
              value={title}
            />
          </label>
          <label>
            Description <span className="optional">(optional)</span>
            <textarea
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a few helpful details..."
              rows={4}
              value={description}
            />
          </label>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="button button-quiet"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              disabled={saving}
              type="submit"
            >
              {saving ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Check size={17} />
              )}
              {saving ? "Saving..." : task ? "Save changes" : "Add task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete, busy }) {
  return (
    <article className={`task-row${task.completed ? " task-row-done" : ""}`}>
      <button
        aria-label={
          task.completed
            ? `Mark ${task.title} as not done`
            : `Mark ${task.title} as done`
        }
        className={`complete-button${task.completed ? " is-complete" : ""}`}
        disabled={busy}
        onClick={() => onToggle(task)}
        type="button"
      >
        {task.completed ? (
          <Check size={17} strokeWidth={2.5} />
        ) : (
          <Circle size={21} />
        )}
      </button>
      <div className="task-copy">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <span
          className={`task-label ${task.completed ? "label-done" : "label-active"}`}
        >
          {task.completed ? "Completed" : "To do"}
        </span>
      </div>
      <div className="row-actions">
        <button
          aria-label={`Edit ${task.title}`}
          className="icon-button"
          onClick={() => onEdit(task)}
          type="button"
        >
          <Pencil size={16} />
        </button>
        <button
          aria-label={`Delete ${task.title}`}
          className="icon-button delete-button"
          onClick={() => onDelete(task)}
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");
  const [busyTaskId, setBusyTaskId] = useState("");
  const [actionError, setActionError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.tasks);
      setApiStatus("connected");
    } catch (error) {
      setLoadError(getErrorMessage(error, "Could not load tasks."));
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const counts = useMemo(
    () => ({
      total: tasks.length,
      active: tasks.filter((task) => !task.completed).length,
      completed: tasks.filter((task) => task.completed).length,
    }),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" ? task.completed : !task.completed);
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, tasks]);

  function openCreateDialog() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  async function saveTask(values) {
    if (editingTask) {
      await api.put(`/tasks/${editingTask._id}`, values);
    } else {
      await api.post("/tasks", values);
    }
    setDialogOpen(false);
    setEditingTask(null);
    setActionError("");
    await loadTasks();
  }

  async function toggleTask(task) {
    setBusyTaskId(task._id);
    setActionError("");
    try {
      const { data } = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((current) =>
        current.map((item) => (item._id === task._id ? data.task : item)),
      );
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not update task."));
    } finally {
      setBusyTaskId("");
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusyTaskId(task._id);
    setActionError("");
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((current) => current.filter((item) => item._id !== task._id));
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not delete task."));
    } finally {
      setBusyTaskId("");
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a aria-label="Week 3 To-Do home" className="brand" href="/">
          <span className="brand-mark">
            <CheckCheck size={20} />
          </span>
          <span>
            daymark<span className="brand-period">.</span>
          </span>
        </a>
        <span className="connection-label">
          <span className={`connection-dot connection-${apiStatus}`} />
          {apiStatus === "connected"
            ? "Week 2 API connected"
            : apiStatus === "offline"
              ? "Week 2 API unavailable"
              : "Connecting to Week 2 API"}
        </span>
      </header>

      <section className="content">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">A LITTLE MORE FOCUS</p>
            <h1>
              Your day,
              <br className="mobile-break" /> thoughtfully done.
            </h1>
            <p className="welcome-copy">
              Keep the important things moving, one task at a time.
            </p>
          </div>
          <button
            className="button button-primary add-button"
            onClick={openCreateDialog}
            type="button"
          >
            <Plus size={18} /> Add a task
          </button>
        </div>

        <section aria-label="Task summary" className="summary">
          <div className="summary-icon">
            <ClipboardList size={20} />
          </div>
          <div>
            <span>Tasks on your list</span>
            <strong>{counts.total}</strong>
          </div>
          <div className="summary-divider" />
          <div>
            <span>Still to do</span>
            <strong>{counts.active}</strong>
          </div>
          <div className="summary-divider" />
          <div>
            <span>Completed</span>
            <strong>{counts.completed}</strong>
          </div>
        </section>

        <section aria-label="Your tasks" className="tasks-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR LIST</p>
              <h2>
                Tasks <span className="task-count">{visibleTasks.length}</span>
              </h2>
            </div>
            <label className="search-field">
              <Search size={17} />
              <span className="sr-only">Search tasks</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a task..."
                value={search}
              />
              {search && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>

          <div aria-label="Filter tasks" className="filter-tabs" role="group">
            <span className="filter-icon">
              <ListFilter size={15} />
            </span>
            {filters.map((item) => (
              <button
                aria-pressed={filter === item.value}
                className={filter === item.value ? "filter-active" : ""}
                key={item.value}
                onClick={() => setFilter(item.value)}
                type="button"
              >
                {item.label}
                {item.value === "active" && <span>{counts.active}</span>}
                {item.value === "completed" && <span>{counts.completed}</span>}
              </button>
            ))}
          </div>

          {actionError && (
            <p className="error-banner" role="alert">
              {actionError}
            </p>
          )}
          {loadError ? (
            <div className="state-card error-state">
              <h3>Could not reach your task list</h3>
              <p>{loadError}</p>
              <p className="connection-help">
                Make sure the Week 2 API is running on port 5001, then try
                again.
              </p>
              <button
                className="button button-quiet"
                onClick={loadTasks}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="state-card">
              <LoaderCircle className="spin" size={24} />
              <p>Loading your tasks...</p>
            </div>
          ) : visibleTasks.length ? (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <TaskRow
                  busy={busyTaskId === task._id}
                  key={task._id}
                  onDelete={deleteTask}
                  onEdit={(selectedTask) => {
                    setEditingTask(selectedTask);
                    setDialogOpen(true);
                  }}
                  onToggle={toggleTask}
                  task={task}
                />
              ))}
            </div>
          ) : (
            <div className="state-card empty-state">
              <div className="empty-icon">
                <ClipboardList size={23} />
              </div>
              <h3>
                {search
                  ? "No matching tasks"
                  : filter === "completed"
                    ? "Nothing completed yet"
                    : filter === "active"
                      ? "All caught up"
                      : "A fresh start"}
              </h3>
              <p>
                {search
                  ? "Try a different search, or clear it to see your full list."
                  : filter === "active"
                    ? "There are no tasks waiting for you. Enjoy the breathing room."
                    : "Add a task to get your list started."}
              </p>
              {!search && filter !== "completed" && (
                <button
                  className="button button-quiet"
                  onClick={openCreateDialog}
                  type="button"
                >
                  <Plus size={16} /> Add your first task
                </button>
              )}
            </div>
          )}
        </section>
        <footer className="footer">Small steps count. Keep going.</footer>
      </section>

      {dialogOpen && (
        <TaskDialog
          key={editingTask?._id || "new"}
          onClose={() => {
            setDialogOpen(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
          task={editingTask}
        />
      )}
    </main>
  );
}
