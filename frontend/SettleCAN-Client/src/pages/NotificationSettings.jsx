import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/NotificationSettings.scss";
import { NotificationsContext } from "../state/NotificationsContext";
import { AuthContext } from "../state/AuthContext";
import { getAccessToken } from "../service/tokenService";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

// Today's date in YYYY-MM-DD format — used as the min value for the date input
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { tasks, setTasks } = useContext(NotificationsContext);
  const { user } = useContext(AuthContext);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [dateError, setDateError] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // ── Bug 23 fix: validate date is today or future ──────────────────────────
  function handleDateChange(e) {
    const val = e.target.value;
    setNewTask((prev) => ({ ...prev, date: val }));

    if (val && val < todayStr()) {
      setDateError("Reminder date must be today or in the future.");
    } else {
      setDateError("");
    }
  }

  async function addTask() {
    if (!newTask.title.trim() || !newTask.date) return;

    // Block submission if date is in the past
    if (newTask.date < todayStr()) {
      setDateError("Reminder date must be today or in the future.");
      return;
    }

    const task = { id: crypto.randomUUID(), ...newTask };
    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", date: "" });
    setDateError("");

    if (!emailEnabled || !email) {
      setFeedback({ ok: true, text: "Reminder saved." });
      return;
    }

    // ── Bug 25 fix: schedule email 1 day before, don't send immediately ──────
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${BASE}/notifications/schedule-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
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
          ? {
              ok: true,
              text: `Reminder saved! Email will be sent on ${data.scheduled_for}.`,
            }
          : { ok: false, text: data.message ?? "Failed to schedule email." },
      );
    } catch {
      setFeedback({ ok: false, text: "Saved locally — server unreachable." });
    } finally {
      setSaving(false);
    }
  }

  // ── Bug 24 fix: delete a reminder ─────────────────────────────────────────
  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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

          {/* Bug 23 fix: min attribute restricts past dates in the picker UI */}
          <input
            type="date"
            value={newTask.date}
            min={todayStr()}
            onChange={handleDateChange}
            style={{ borderColor: dateError ? "#b91c1c" : undefined }}
          />
          {dateError && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "#b91c1c",
                marginTop: "0.25rem",
              }}
            >
              {dateError}
            </p>
          )}

          <label className="ns-email-toggle">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
            />{" "}
            Send email reminder
          </label>

          {emailEnabled && (
            <>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: "0.4rem" }}
              />
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#7a6a70",
                  marginTop: "0.25rem",
                }}
              >
                📅 Email will be sent 1 day before your reminder date.
              </p>
            </>
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

          <button
            className="primary-btn"
            onClick={addTask}
            disabled={saving || !!dateError}
          >
            {saving ? "Saving…" : "Add Reminder"}
          </button>
        </section>

        {/* ── Existing Tasks ── */}
        <section className="ns-card">
          <h3>Existing Reminders</h3>

          {tasks.length === 0 && <p>No reminders yet.</p>}

          {tasks.map((t) => (
            <div
              key={t.id}
              className="task-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{t.title}</strong>
                <span
                  style={{
                    marginLeft: "0.75rem",
                    color: "#7a6a70",
                    fontSize: "0.85rem",
                  }}
                >
                  {t.date}
                </span>
              </div>
              {/* Bug 24 fix: delete button to clear/remove a reminder */}
              <button
                onClick={() => deleteTask(t.id)}
                style={{
                  background: "none",
                  border: "1px solid #c0392b",
                  color: "#c0392b",
                  borderRadius: "0.4rem",
                  padding: "0.2rem 0.6rem",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
