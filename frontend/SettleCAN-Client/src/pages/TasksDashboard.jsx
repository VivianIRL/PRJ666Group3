// TasksDashboard.jsx — sidebar layout with Calendar, Timeline, Schedule, Documents, Help
// Replace MOCK_TASKS with a GET /api/users/:id/tasks call when the backend is ready.

import { useState } from "react";
import TaskTimeline from "../components/TaskTimeline";
import TaskChecklist from "../components/TaskChecklist";
import TasksCalendarView from "../components/TasksCalendarView";
import "../scss/TasksDashboard.scss";

// ── Mock data (matches DB schema: user_tasks + task_checklist) ────────────────
// guideUrl links each task to its dedicated step-by-step guide page
const MOCK_TASKS = [
  {
    user_task_id: 1,
    title: "Apply for Social Insurance Number (SIN)",
    description: "Visit a Service Canada office or apply online. You need your passport and study/work permit.",
    category: "Employment",
    status: "Completed",
    due_date: "2026-01-15",
    custom_note: null,
    guideUrl: "/guides/sin",
    checklist: [
      { checklist_id: 1, item_description: "Gather passport and immigration documents", is_required: true, checked: true },
      { checklist_id: 2, item_description: "Locate nearest Service Canada office", is_required: true, checked: true },
      { checklist_id: 3, item_description: "Submit SIN application", is_required: true, checked: true },
      { checklist_id: 4, item_description: "Store SIN number securely", is_required: true, checked: true },
    ],
  },
  {
    user_task_id: 2,
    title: "Open a Canadian Bank Account",
    description: "Most banks require your passport, SIN, and proof of address. No credit history needed as a newcomer.",
    category: "Banking",
    status: "In Progress",
    due_date: "2026-06-05",
    custom_note: "TD and RBC have newcomer accounts with no monthly fees.",
    guideUrl: "/guides/bank-account",
    checklist: [
      { checklist_id: 5, item_description: "Compare newcomer banking offers (TD, RBC, Scotiabank)", is_required: false, checked: true },
      { checklist_id: 6, item_description: "Book an appointment at chosen bank", is_required: true, checked: true },
      { checklist_id: 7, item_description: "Bring passport, SIN, and proof of address", is_required: true, checked: false },
      { checklist_id: 8, item_description: "Set up online banking", is_required: false, checked: false },
    ],
  },
  {
    user_task_id: 3,
    title: "Register for Provincial Health Card",
    description: "Apply through your province's health ministry. There is typically a 3-month waiting period.",
    category: "Health",
    status: "Pending",
    due_date: "2026-06-20",
    custom_note: null,
    guideUrl: "/guides/health-card",
    checklist: [
      { checklist_id: 9, item_description: "Check your province's health ministry website", is_required: true, checked: false },
      { checklist_id: 10, item_description: "Fill out health card application form", is_required: true, checked: false },
      { checklist_id: 11, item_description: "Submit proof of residency", is_required: true, checked: false },
      { checklist_id: 12, item_description: "Receive health card in mail", is_required: true, checked: false },
    ],
  },
  {
    user_task_id: 4,
    title: "Secure Permanent Housing",
    description: "Connect with a settlement agency or housing support organization to find safe housing.",
    category: "Housing",
    status: "In Progress",
    due_date: "2026-07-01",
    custom_note: null,
    guideUrl: "/housing",
    checklist: [
      { checklist_id: 13, item_description: "Research neighbourhoods and transit routes", is_required: false, checked: true },
      { checklist_id: 14, item_description: "Create a rental budget", is_required: true, checked: true },
      { checklist_id: 15, item_description: "View at least 3 rental units", is_required: false, checked: false },
      { checklist_id: 16, item_description: "Sign lease and pay deposit", is_required: true, checked: false },
      { checklist_id: 17, item_description: "Set up utilities (hydro, internet)", is_required: false, checked: false },
    ],
  },
  {
    user_task_id: 5,
    title: "Renew Study / Work Permit",
    description: "Apply at least 90 days before your current permit expires. Use IRCC's online portal.",
    category: "Immigration",
    status: "Pending",
    due_date: "2026-08-30",
    custom_note: "Apply early — processing times can be 3–4 months.",
    guideUrl: "/guides/permit-renewal",
    checklist: [
      { checklist_id: 18, item_description: "Check permit expiry date", is_required: true, checked: false },
      { checklist_id: 19, item_description: "Gather supporting documents (letter of acceptance, proof of funds)", is_required: true, checked: false },
      { checklist_id: 20, item_description: "Submit renewal application on IRCC portal", is_required: true, checked: false },
      { checklist_id: 21, item_description: "Pay application fee", is_required: true, checked: false },
      { checklist_id: 22, item_description: "Track application status", is_required: false, checked: false },
    ],
  },
  {
    user_task_id: 6,
    title: "File Annual Income Tax Return",
    description: "Even with no income, filing taxes establishes your Canadian tax residency and qualifies you for benefits.",
    category: "Tax",
    status: "Pending",
    due_date: "2026-04-30",
    custom_note: null,
    guideUrl: "/guides/tax-return",
    checklist: [
      { checklist_id: 23, item_description: "Collect all T4 / T2202 slips", is_required: true, checked: false },
      { checklist_id: 24, item_description: "Choose tax software (Wealthsimple Tax is free)", is_required: false, checked: false },
      { checklist_id: 25, item_description: "Complete and file return by April 30", is_required: true, checked: false },
    ],
  },
];

const NAV_ITEMS = [
  { key: "calendar",  icon: "📅", label: "Calendar"  },
  { key: "timeline",  icon: "📌", label: "Time Line"  },
  { key: "schedule",  icon: "🗓️",  label: "Schedule"  },
  { key: "documents", icon: "📄", label: "Documents" },
  { key: "help",      icon: "❓", label: "Help"       },
];

// ── Schedule view ─────────────────────────────────────────────────────────────
function ScheduleView({ tasks }) {
  const upcoming = [...tasks]
    .filter(t => t.status !== "Completed")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  if (upcoming.length === 0)
    return <p className="td-empty">All tasks are completed — nothing scheduled.</p>;

  return (
    <div className="td-schedule">
      {upcoming.map(t => {
        const d = new Date(t.due_date);
        const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
        return (
          <div key={t.user_task_id} className={`td-sched-row ${days <= 0 ? "td-sched-row--overdue" : days <= 7 ? "td-sched-row--soon" : ""}`}>
            <div className="td-sched-date">
              <span className="td-sched-day">{d.getDate()}</span>
              <span className="td-sched-month">{d.toLocaleString("en-CA", { month: "short" })}</span>
            </div>
            <div className="td-sched-info">
              <span className="td-sched-cat">{t.category}</span>
              <span className="td-sched-title">{t.title}</span>
            </div>
            <span className={`td-sched-badge ${t.status === "In Progress" ? "td-sched-badge--active" : ""}`}>
              {t.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Documents view ────────────────────────────────────────────────────────────
const DOCUMENTS = [
  { id: 1, name: "Passport",                       category: "Identity",    required: true,  uploaded: true  },
  { id: 2, name: "Study / Work Permit",             category: "Immigration", required: true,  uploaded: true  },
  { id: 3, name: "Social Insurance Number (SIN)",   category: "Employment",  required: true,  uploaded: false },
  { id: 4, name: "Proof of Address",                category: "Housing",     required: true,  uploaded: false },
  { id: 5, name: "Bank Account Statement",          category: "Banking",     required: false, uploaded: false },
  { id: 6, name: "Health Card",                     category: "Health",      required: true,  uploaded: false },
  { id: 7, name: "T4 / T2202 Tax Slip",             category: "Tax",         required: false, uploaded: false },
  { id: 8, name: "Lease Agreement",                 category: "Housing",     required: false, uploaded: false },
];

function DocumentsView() {
  const [docs, setDocs] = useState(DOCUMENTS);
  const uploaded = docs.filter(d => d.uploaded).length;

  return (
    <div className="td-documents">
      <div className="td-docs-header">
        <span className="td-docs-progress">{uploaded} of {docs.length} documents uploaded</span>
        <div className="td-docs-bar">
          <div className="td-docs-bar__fill" style={{ width: `${(uploaded / docs.length) * 100}%` }} />
        </div>
      </div>
      <div className="td-docs-list">
        {docs.map(doc => (
          <div key={doc.id} className={`td-doc-row ${doc.uploaded ? "td-doc-row--done" : ""}`}>
            <span className="td-doc-icon">{doc.uploaded ? "✅" : "📋"}</span>
            <div className="td-doc-info">
              <span className="td-doc-name">{doc.name}</span>
              <span className="td-doc-cat">{doc.category}{doc.required ? " · Required" : ""}</span>
            </div>
            <button
              className={`td-doc-btn ${doc.uploaded ? "td-doc-btn--remove" : ""}`}
              onClick={() => setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, uploaded: !d.uploaded } : d))}
            >
              {doc.uploaded ? "Remove" : "Upload"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Help view ─────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "How do I apply for a SIN?",               a: "Visit a Service Canada office in person, or apply online at canada.ca. You'll need your passport and immigration document." },
  { q: "When should I renew my study permit?",    a: "Apply at least 90 days before your current permit expires. Processing can take 3–4 months, so apply early via the IRCC portal." },
  { q: "What is the 3-month health card wait?",   a: "Most provinces require a 3-month residency period before provincial health coverage begins. Register as soon as you arrive." },
  { q: "Do I need to file taxes with no income?", a: "Yes. Filing establishes Canadian tax residency and makes you eligible for benefits like the GST/HST credit and carbon rebate." },
  { q: "How do I open a bank account?",           a: "Most major banks offer newcomer packages with no monthly fees. Bring your passport, SIN, and proof of address to any branch." },
];

function HelpView() {
  const [open, setOpen] = useState(null);
  return (
    <div className="td-help">
      <p className="td-help-intro">Frequently asked questions about settling in Canada.</p>
      {FAQS.map((faq, i) => (
        <div key={i} className={`td-faq ${open === i ? "td-faq--open" : ""}`}>
          <button className="td-faq__q" onClick={() => setOpen(open === i ? null : i)}>
            {faq.q}
            <span className="td-faq__chevron">{open === i ? "▲" : "▼"}</span>
          </button>
          {open === i && <p className="td-faq__a">{faq.a}</p>}
        </div>
      ))}
      <div className="td-help-contact">
        <p>Still need help?</p>
        <a href="mailto:support@settlecan.ca" className="td-help-link">Contact Support →</a>
      </div>
    </div>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function TasksDashboard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [activeNav, setActiveNav] = useState("timeline");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleStatusChange(taskId, newStatus) {
    setTasks(prev => prev.map(t => t.user_task_id === taskId ? { ...t, status: newStatus } : t));
  }

  function handleCheckItem(taskId, checklistId, checked) {
    setTasks(prev => prev.map(t => {
      if (t.user_task_id !== taskId) return t;
      return { ...t, checklist: t.checklist.map(item => item.checklist_id === checklistId ? { ...item, checked } : item) };
    }));
  }

  function handleTaskComplete(taskId) { handleStatusChange(taskId, "Completed"); }

  const pending    = tasks.filter(t => t.status === "Pending").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const completed  = tasks.filter(t => t.status === "Completed").length;

  function renderContent() {
    switch (activeNav) {
      case "calendar":
        return <TasksCalendarView tasks={tasks} onStatusChange={handleStatusChange} />;
      case "timeline":
        return (
          <div className="td-split">
            <section className="td-panel">
              <h3 className="td-panel__title">📌 Timeline</h3>
              <TaskTimeline tasks={tasks} onStatusChange={handleStatusChange} />
            </section>
            <section className="td-panel">
              <h3 className="td-panel__title">✅ Checklist</h3>
              <TaskChecklist tasks={tasks} onCheckItem={handleCheckItem} onTaskComplete={handleTaskComplete} />
            </section>
          </div>
        );
      case "schedule":
        return (
          <section className="td-panel">
            <h3 className="td-panel__title">🗓️ Upcoming Schedule</h3>
            <ScheduleView tasks={tasks} />
          </section>
        );
      case "documents":
        return (
          <section className="td-panel">
            <h3 className="td-panel__title">📄 Documents</h3>
            <DocumentsView />
          </section>
        );
      case "help":
        return (
          <section className="td-panel">
            <h3 className="td-panel__title">❓ Help &amp; FAQ</h3>
            <HelpView />
          </section>
        );
      default:
        return null;
    }
  }

  return (
    <div className={`tasks-dashboard ${sidebarOpen ? "" : "tasks-dashboard--collapsed"}`}>

      {/* ── Sidebar ── */}
      <aside className="td-sidebar">
        <div className="td-sidebar__brand">
          <span className="td-sidebar__title">My Tasks</span>
          <button className="td-sidebar__toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Stats row */}
        {sidebarOpen && (
          <div className="td-sidebar__stats">
            <div className="td-sstat td-sstat--pending"><span>{pending}</span>Pending</div>
            <div className="td-sstat td-sstat--active"><span>{inProgress}</span>Active</div>
            <div className="td-sstat td-sstat--done"><span>{completed}</span>Done</div>
          </div>
        )}

        <nav className="td-sidebar__nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`td-nav-item ${activeNav === item.key ? "td-nav-item--active" : ""}`}
              onClick={() => setActiveNav(item.key)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="td-nav-item__icon">{item.icon}</span>
              {sidebarOpen && <span className="td-nav-item__label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="td-main">
        {renderContent()}
      </main>
    </div>
  );
}
