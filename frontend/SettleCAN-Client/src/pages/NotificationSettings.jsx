import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/NotificationSettings.scss";
import { NotificationsContext } from "../state/NotificationsContext";
import { AuthContext } from "../state/AuthContext";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { tasks, setTasks } = useContext(NotificationsContext);
  const { user } = useContext(AuthContext);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function addTask() {
    if (!newTask.title.trim() || !newTask.date) return;

    const task = { id: crypto.randomUUID(), ...newTask };
    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", date: "" });

    if (!emailEnabled || !email) {
      setFeedback({ ok: true, text: "Reminder saved." });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${BASE}/notifications/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.accessToken
            ? { Authorization: `Bearer ${user.accessToken}` }
            : {}),
        },
        body: JSON.stringify({
          email,
          title: task.title,
          date: task.date,
          description: task.description,
        }),
      });
      const data = await res.json();
      setFeedback(
        data.success
          ? { ok: true, text: "Reminder saved and email sent!" }
          : { ok: false, text: data.message ?? "Email failed." },
      );
    } catch {
      setFeedback({ ok: false, text: "Saved locally — server unreachable." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="notification-settings">
      <button
        className="back-btn"
        onClick={() => navigate("/notifications-dashboard")}
      >
        ← Back to Notifications
      </button>

      <h2>Notification Settings</h2>
      <p>Manage your reminders, deadlines, and notification preferences.</p>

      <div className="ns-grid">
        {/* ── Add New Reminder ── */}
        <section className="ns-card">
          <h3>Add New Reminder</h3>

          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />

          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />

          <input
            type="date"
            value={newTask.date}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
          />

          {/* Email toggle */}
          <label className="ns-email-toggle">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
            />{" "}
            Send email reminder
          </label>

          {emailEnabled && (
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginTop: "0.4rem" }}
            />
          )}

          {feedback && (
            <p
              style={{
                fontSize: "0.84rem",
                marginTop: "0.4rem",
                color: feedback.ok ? "#15803d" : "#b91c1c",
              }}
            >
              {feedback.text}
            </p>
          )}

          <button className="primary-btn" onClick={addTask} disabled={saving}>
            {saving ? "Saving…" : "Add Reminder"}
          </button>
        </section>

        {/* ── Existing Tasks ── */}
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
