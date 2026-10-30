import { CalendarDays, Pencil, Trash2 } from "lucide-react";
const labels = {
  pending: "Pending",
  "in-progress": "In progress",
  completed: "Completed",
};
export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <article className="task-card">
      {task.imageUrl && (
        <img className="task-image" src={task.imageUrl} alt="Task attachment" />
      )}
      <div className="task-card-body">
        <div className="task-card-heading">
          <h3>{task.title}</h3>
          <span className={`status-pill status-${task.status}`}>
            {labels[task.status]}
          </span>
        </div>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <div className="task-meta">
          {task.dueDate && (
            <span>
              <CalendarDays size={13} /> Due{" "}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="task-actions">
          <select
            aria-label="Task status"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <button className="small-action" onClick={() => onEdit(task)}>
            <Pencil size={14} /> Edit
          </button>
          <button
            className="small-action danger"
            onClick={() => onDelete(task._id)}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}
