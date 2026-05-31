import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/NotificationSettings.scss";
import { NotificationsContext } from "../state/NotificationsContext";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { tasks, setTasks } = useContext(NotificationsContext);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
  });

  const addTask = () => {
    if (!newTask.title || !newTask.date) return;

    setTasks([
      ...tasks,
      {
        id: crypto.randomUUID(),
        ...newTask,
      },
    ]);

    setNewTask({ title: "", description: "", date: "" });
  };

  return (
    <div className="notification-settings">

      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() => navigate("/notifications-dashboard")}
      >
        ← Back to Notifications
      </button>

      <h2>Notification Settings</h2>
      <p>Manage your reminders, deadlines, and notification preferences.</p>

      <div className="ns-grid">

        {/* ADD NEW TASK */}
        <section className="ns-card">
          <h3>Add New Reminder</h3>

          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({ ...newTask, title: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />

          <input
            type="date"
            value={newTask.date}
            onChange={(e) =>
              setNewTask({ ...newTask, date: e.target.value })
            }
          />

          <button className="primary-btn" onClick={addTask}>
            Add Reminder
          </button>
        </section>

        {/* EXISTING TASKS */}
        <section className="ns-card">
          <h3>Existing Reminders</h3>

          {tasks.length === 0 && <p>No reminders yet.</p>}

          {tasks.map((t) => (
            <div key={t.id} className="task-row">
              <strong>{t.title}</strong>
              <span>{t.date}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
