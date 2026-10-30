import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ListTodo } from "lucide-react";
import api from "../services/api";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
const filters = ["all", "pending", "in-progress", "completed"];
export default function Dashboard() {
  const [tasks, setTasks] = useState([]),
    [status, setStatus] = useState("all"),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState(false),
    [editing, setEditing] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks", { params: { status, search } });
      setTasks(data.tasks);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load tasks");
    } finally {
      setLoading(false);
    }
  }, [status, search]);
  useEffect(() => {
    const t = setTimeout(fetchTasks, 200);
    return () => clearTimeout(t);
  }, [fetchTasks]);
  const counts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      progress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks],
  );
  const edit = (task) => {
    setEditing(task);
    setModal(true);
  };
  async function remove(id) {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  }
  async function updateStatus(task, next) {
    try {
      await api.put(`/tasks/${task._id}`, { status: next });
      fetchTasks();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    }
  }
  return (
    <div className="dashboard">
      <header className="welcome">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>
            Task overview<span>.</span>
          </h1>
          <p className="muted">A clear view of what needs your attention.</p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setEditing(null);
            setModal(true);
          }}
        >
          <Plus size={17} /> New task
        </button>
      </header>
      <section className="stats">
        {[
          ["Total tasks", counts.total],
          ["Pending", counts.pending],
          ["In progress", counts.progress],
          ["Completed", counts.done],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <section className="tasks-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">STAY ON TOP OF IT</p>
            <h2>Your tasks</h2>
          </div>
          <input
            className="search"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters">
          {filters.map((f) => (
            <button
              key={f}
              className={status === f ? "selected" : ""}
              onClick={() => setStatus(f)}
            >
              {f === "all"
                ? "All tasks"
                : f === "in-progress"
                  ? "In progress"
                  : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="empty">Loading tasks…</p>
        ) : tasks.length ? (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={edit}
                onDelete={remove}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <ListTodo size={30} />
            <h3>No tasks found</h3>
            <p>Create a task or adjust your search/filter.</p>
          </div>
        )}
      </section>
      {modal && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <div className="modal">
            <TaskForm
              initialTask={editing}
              onCancel={() => setModal(false)}
              onSaved={() => {
                setModal(false);
                setEditing(null);
                fetchTasks();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
