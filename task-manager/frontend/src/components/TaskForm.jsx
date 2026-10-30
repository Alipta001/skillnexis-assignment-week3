import { useEffect, useState } from "react";
import api from "../services/api";
const blank = {
  title: "",
  description: "",
  status: "pending",
  dueDate: "",
  imageUrl: "",
};
export default function TaskForm({ initialTask, onSaved, onCancel }) {
  const [form, setForm] = useState(blank),
    [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const value = initialTask
      ? {
          title: initialTask.title,
          description: initialTask.description || "",
          status: initialTask.status,
          dueDate: initialTask.dueDate
            ? new Date(initialTask.dueDate).toISOString().slice(0, 10)
            : "",
          imageUrl: initialTask.imageUrl || "",
        }
      : blank;
    setForm(value);
    setPreview(value.imageUrl);
    setFile(null);
    setError("");
  }, [initialTask]);
  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function choose(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) {
      setError("Choose an image no larger than 5 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let imageUrl = form.imageUrl;
      if (file) {
        const fd = new FormData();
        fd.append("image", file);
        imageUrl = (await api.post("/uploads/image", fd)).data.imageUrl;
      }
      const payload = { ...form, imageUrl, dueDate: form.dueDate || null };
      if (initialTask) await api.put(`/tasks/${initialTask._id}`, payload);
      else await api.post("/tasks", payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save task.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="task-form" onSubmit={submit}>
      <div className="form-heading">
        <h2>{initialTask ? "Edit task" : "Create a task"}</h2>
        <button type="button" className="text-button" onClick={onCancel}>
          Close
        </button>
      </div>
      <label>
        Title
        <input
          name="title"
          value={form.title}
          onChange={change}
          required
          maxLength="120"
          placeholder="What needs to get done?"
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          rows="3"
          value={form.description}
          onChange={change}
          placeholder="Add details…"
        />
      </label>
      <div className="form-row">
        <label>
          Status
          <select name="status" value={form.status} onChange={change}>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Due date
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={change}
          />
        </label>
      </div>
      <label>
        Image attachment (optional)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={choose}
        />
      </label>
      {preview && (
        <div className="preview">
          <img src={preview} alt="Selected image preview" />
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setFile(null);
              setPreview("");
              setForm({ ...form, imageUrl: "" });
            }}
          >
            Remove image
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary" disabled={busy}>
          {busy ? "Saving…" : "Save task"}
        </button>
      </div>
    </form>
  );
}
