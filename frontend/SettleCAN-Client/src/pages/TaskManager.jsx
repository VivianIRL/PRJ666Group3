import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Form, Modal, ProgressBar } from 'react-bootstrap';
import { fetchTasks, createTask, updateTask, deleteTask } from '../service/taskService';
import '../scss/TaskManager.scss';

// Convert an API user_task row → the shape this component expects
function normalise(t) {
  const tmpl = t.task_templates ?? {};
  return {
    id:       t.user_task_id,
    title:    tmpl.title       ?? t.title    ?? 'Untitled',
    category: tmpl.category    ?? t.category ?? 'General',
    due:      t.due_date       ?? '',
    priority: t.priority       ?? 'Upcoming',
    status:   t.status         ?? 'In Progress',
    notes:    t.custom_note    ?? '',
  };
}

const INITIAL_TASKS = [
  { id: 1, title: 'Renew Study Permit', category: 'Immigration', due: '2026-04-30', priority: 'Urgent', status: 'In Progress', notes: 'Gather passport, enrollment letter, proof of funds. Submit via IRCC portal.' },
  { id: 2, title: 'Pay Tuition Balance', category: 'Finance', due: '2026-05-15', priority: 'Upcoming', status: 'In Progress', notes: 'Log in to student portal and pay outstanding balance before deadline.' },
  { id: 3, title: 'Book IELTS Exam', category: 'Language Testing', due: '2026-06-01', priority: 'Upcoming', status: 'In Progress', notes: 'Register at ielts.org. Choose a test centre close to campus.' },
  { id: 4, title: 'Register for SIN Card', category: 'Government', due: '2026-03-10', priority: 'Upcoming', status: 'Completed', notes: 'Bring study permit and passport to Service Canada office.' },
  { id: 5, title: 'Open Bank Account', category: 'Finance', due: '2026-03-05', priority: 'Upcoming', status: 'Completed', notes: 'TD and RBC have newcomer packages. Bring passport and study permit.' },
  { id: 6, title: 'Set Up OHIP', category: 'Health', due: '2026-03-20', priority: 'Upcoming', status: 'Completed', notes: '3-month waiting period applies. Apply as soon as you arrive.' },
];

const TOTAL_OFFSET = 2; 

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getBadgeClass(priority, status) {
  if (status === 'Completed') return 'badge-completed';
  if (priority === 'Urgent') return 'badge-urgent';
  return 'badge-upcoming';
}

function getBadgeLabel(priority, status) {
  if (status === 'Completed') return 'Completed';
  if (priority === 'Urgent') return 'Due Soon';
  return 'Upcoming';
}

function getAccentClass(priority, status) {
  if (status === 'Completed') return 'accent-green';
  if (priority === 'Urgent') return 'accent-red';
  return 'accent-orange';
}

export default function TaskManager() {
  const [tasks, setTasks]               = useState(INITIAL_TASKS);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm]   = useState({ title: '', category: '', due: '', priority: 'Upcoming', notes: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState('');

  // ── Load from API ────────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      if (Array.isArray(data) && data.length > 0) setTasks(data.map(normalise));
    } catch { /* keep mock data */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const total     = tasks.length;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  function getFilteredTasks() {
    switch (activeTab) {
      case 'Urgent':    return tasks.filter(t => t.priority === 'Urgent'   && t.status !== 'Completed');
      case 'Upcoming':  return tasks.filter(t => t.priority === 'Upcoming' && t.status !== 'Completed');
      case 'Completed': return tasks.filter(t => t.status === 'Completed');
      default:          return tasks;
    }
  }

  async function markComplete(id) {
    // Optimistic
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
    if (showDetailModal && selectedTask?.id === id)
      setSelectedTask(prev => ({ ...prev, status: 'Completed' }));
    showToast('Task marked as complete! ✓');
    await updateTask(id, { status: 'Completed' }).catch(() => {});
  }

  function openDetail(task) { setSelectedTask(task); setShowDetailModal(true); }
  function openAdd() { setForm({ title: '', category: '', due: '', priority: 'Upcoming', notes: '' }); setErrors({}); setShowAddModal(true); }

  function validate() {
    const e = {};
    if (!form.title.trim())    e.title    = 'Please enter a task name.';
    if (!form.category.trim()) e.category = 'Please enter a category.';
    if (!form.due)             e.due      = 'Please select a due date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    const optimistic = { id: Date.now(), title: form.title, category: form.category, due: form.due, priority: form.priority, status: 'In Progress', notes: form.notes };
    setTasks(prev => [optimistic, ...prev]);
    setShowAddModal(false);
    showToast(`"${form.title}" added!`);
    try {
      const saved = await createTask({ title: form.title, description: form.notes, category: form.category, dueDate: form.due, customNote: form.notes });
      // Replace the optimistic entry with the real ID from the server
      setTasks(prev => prev.map(t => t.id === optimistic.id ? normalise(saved) : t));
    } catch { /* keep optimistic */ }
  }

  async function handleDelete(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setShowDetailModal(false);
    showToast('Task deleted.');
    await deleteTask(id).catch(() => {});
  }

  if (loading) return <div className="tm-loading">Loading tasks…</div>;

  const filtered = getFilteredTasks();

  return (
    <div className="tm-page">
      <div className="tm-container">
        {/* Header */}
        <div className="tm-header">
          <div>
            <h1 className="tm-title">Task Manager</h1>
            <p className="tm-subtitle">Manage your immigration-related tasks</p>
          </div>
          <Button className="btn-add-task" onClick={openAdd}>+ Add New Task</Button>
        </div>

        {/* Tabs */}
        <div className="tm-tabs">
          {['All', 'Urgent', 'Upcoming', 'Completed'].map(tab => (
            <button
              key={tab}
              className={`tm-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="tm-progress-section">
          <div className="tm-progress-label">
            You have completed <strong>{completed} of {total} tasks</strong>
          </div>
          <ProgressBar now={progress} className="tm-progress-bar" />
        </div>

        {/* Task List */}
        <div className="tm-task-list">
          {filtered.length === 0 && (
            <div className="tm-empty">No tasks in this category.</div>
          )}
          {filtered.map(task => (
            <div key={task.id} className={`tm-card ${task.status === 'Completed' ? 'completed' : ''}`}>
              <div className={`tm-accent ${getAccentClass(task.priority, task.status)}`} />
              <div className="tm-card-body">
                <div className="tm-card-top">
                  <span className="tm-card-title">{task.title}</span>
                  <span className={`tm-badge ${getBadgeClass(task.priority, task.status)}`}>
                    {getBadgeLabel(task.priority, task.status)}
                  </span>
                </div>
                <div className="tm-card-meta">{task.category} · Due: {formatDate(task.due)}</div>
              </div>
              <div className="tm-card-actions">
                <button className="btn-view-details" onClick={() => openDetail(task)}>View Details</button>
                {task.status !== 'Completed' ? (
                  <button className="btn-mark-complete" onClick={() => markComplete(task.id)}>Mark as Complete</button>
                ) : (
                  <button className="btn-mark-complete done" disabled>Completed ✓</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
        {selectedTask && (
          <>
            <Modal.Header closeButton>
              <div className="detail-header-inner">
                <Modal.Title>{selectedTask.title}</Modal.Title>
                <span className={`tm-badge ${getBadgeClass(selectedTask.priority, selectedTask.status)}`}>
                  {getBadgeLabel(selectedTask.priority, selectedTask.status)}
                </span>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Category</div>
                  <div className="detail-value">{selectedTask.category}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Due Date</div>
                  <div className="detail-value">{formatDate(selectedTask.due)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Priority</div>
                  <div className="detail-value">{selectedTask.priority}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`status-pill ${selectedTask.status === 'Completed' ? 'pill-done' : 'pill-progress'}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                </div>
              </div>
              {selectedTask.notes && (
                <>
                  <hr className="detail-divider" />
                  <div className="detail-label">Notes</div>
                  <div className="detail-notes">{selectedTask.notes}</div>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              {selectedTask.status !== 'Completed' && (
                <Button className="btn-mark-complete" onClick={() => markComplete(selectedTask.id)}>
                  Mark as Complete
                </Button>
              )}
              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(selectedTask.id)}>
                Delete Task
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Add Task Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="field-label">Task Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Apply for SIN Card"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="field-label">Category</Form.Label>
                <Form.Select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  isInvalid={!!errors.category}
                >
                  <option value="">Select category…</option>
                  <option>Immigration</option>
                  <option>Finance</option>
                  <option>Housing</option>
                  <option>Language Testing</option>
                  <option>Government</option>
                  <option>Education</option>
                  <option>Health</option>
                  <option>Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="field-label">Priority</Form.Label>
                <Form.Select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  <option>Urgent</option>
                  <option>Upcoming</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="field-label">Due Date</Form.Label>
            <Form.Control
              type="date"
              value={form.due}
              onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
              isInvalid={!!errors.due}
            />
            <Form.Control.Feedback type="invalid">{errors.due}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="field-label">
              Notes <span className="optional">(optional)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Any documents needed, reminders, or extra details…"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-add-task" onClick={handleSave}>Save Task</Button>
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>

      {toast && <div className="tm-toast">{toast}</div>}
    </div>
  );
}
