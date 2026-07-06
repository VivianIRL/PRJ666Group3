import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../state/AuthContext';
import '../scss/Checklist.scss';

// ── localStorage persistence (per user) ──────────────────────────────────────
const LS_KEY           = (uid) => `settlecan_checklist_${uid ?? 'guest'}`;
const TASKS_DONE_KEY   = (uid) => `settlecan_tasks_done_${uid ?? 'guest'}`;
const CUSTOM_TASKS_KEY = (uid) => `settlecan_custom_tasks_${uid ?? 'guest'}`;

function loadCustomTasks(uid) {
  try { return JSON.parse(localStorage.getItem(CUSTOM_TASKS_KEY(uid))) ?? []; }
  catch { return []; }
}
function saveCustomTasks(uid, tasks) {
  try { localStorage.setItem(CUSTOM_TASKS_KEY(uid), JSON.stringify(tasks)); }
  catch (_e) { /* localStorage unavailable */ }
}

// Persist and restore checklist state keyed by uid + immigration status.
// If the stored status doesn't match the current status (e.g. account re-used,
// status changed, or first-time user), return null so defaults are used.
function loadState(uid, status) {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY(uid)));
    if (!stored || stored.status !== status) return null;
    return stored.categories ?? null;
  } catch { return null; }
}
function saveState(uid, status, categories) {
  try { localStorage.setItem(LS_KEY(uid), JSON.stringify({ status, categories })); }
  catch (_e) { /* localStorage unavailable */ }
}

// ── Task → Checklist item sync ────────────────────────────────────────────────
// Maps MOCK_TEMPLATE user_task_id → checklist item IDs to auto-check.
// Covers all status variants of the same real-world action.
const TASK_TO_CHECKLIST_IDS = {
  1: [1, 101, 202, 302, 501],      // Apply for SIN
  2: [3, 103, 211, 309, 411, 503], // Open bank account
  3: [2, 102, 205, 305, 502],      // Register for provincial health card
  4: [5, 105, 208, 311, 505],      // Secure permanent housing
  5: [14, 109],                     // Renew study / work permit
  6: [21, 118, 213, 511],          // File tax return
  // Visitor / Tourist task IDs (7–12)
  7:  [401],   // Confirm authorized stay duration
  8:  [405],   // Purchase visitor health insurance
  9:  [408],   // Get local SIM card
  10: [409],   // Download transit app
  11: [412],   // Apply to extend stay
  12: [415],   // Research work/study permit options
};

// Reverse map: checklist item ID → task ID (for Checklist → Tasks sync)
const CHECKLIST_TO_TASK_ID = {};
Object.entries(TASK_TO_CHECKLIST_IDS).forEach(([taskId, cIds]) => {
  cIds.forEach(cId => { CHECKLIST_TO_TASK_ID[cId] = Number(taskId); });
});

// When checklist items are toggled, mirror the state back to the shared tasks-done key
// so TasksDashboard can pick it up on focus or reload.
function syncCheckedToTasks(categories, uid) {
  try {
    const done = new Set(JSON.parse(localStorage.getItem(TASKS_DONE_KEY(uid))) ?? []);
    categories.forEach(cat => {
      cat.items.forEach(item => {
        // Custom items (id >= 600): task ID = item ID directly
        const taskId = item.id >= 600 ? item.id : CHECKLIST_TO_TASK_ID[item.id];
        if (taskId !== undefined) {
          if (item.done) done.add(taskId);
          else done.delete(taskId);
        }
      });
    });
    localStorage.setItem(TASKS_DONE_KEY(uid), JSON.stringify([...done]));
  } catch (_e) { /* localStorage unavailable */ }
}

// Read which task IDs have been completed and return the Set of checklist item IDs to auto-check
function getAutoCheckedIds(uid) {
  try {
    const done = JSON.parse(localStorage.getItem(TASKS_DONE_KEY(uid))) ?? [];
    const ids = new Set();
    done.forEach(taskId => {
      if (taskId >= 600) {
        ids.add(taskId); // custom task — checklist item ID equals task ID
      } else {
        (TASK_TO_CHECKLIST_IDS[taskId] ?? []).forEach(cId => ids.add(cId));
      }
    });
    return ids;
  } catch { return new Set(); }
}

// Apply auto-check overrides to categories (non-destructive — only sets done:true, never false)
function applyTaskSync(categories, uid) {
  const autoIds = getAutoCheckedIds(uid);
  if (autoIds.size === 0) return categories;
  return categories.map(cat => ({
    ...cat,
    items: cat.items.map(item =>
      autoIds.has(item.id) ? { ...item, done: true } : item
    ),
  }));
}

// ── Status-specific default categories ───────────────────────────────────────
// Each status gets categories and items relevant to their situation.
// IDs must be unique across all statuses (each block uses a different range).

const CATEGORIES_BY_STATUS = {

  "International Student": [
    { id: 'arrival', label: 'Arrival & Registration', icon: '✈️', items: [
      { id: 1,  text: 'Get your SIN (Social Insurance Number)', done: false, required: true },
      { id: 2,  text: 'Register for provincial health insurance', done: false, required: true },
      { id: 3,  text: 'Open a Canadian bank account', done: false, required: true },
      { id: 4,  text: 'Get a Canadian SIM card / phone plan', done: false, required: false },
    ]},
    { id: 'housing', label: 'Housing', icon: '🏠', items: [
      { id: 5,  text: 'Sign your lease or confirm housing arrangement', done: false, required: true },
      { id: 6,  text: 'Set up utilities (hydro, internet)', done: false, required: false },
      { id: 7,  text: 'Get tenant insurance', done: false, required: false },
    ]},
    { id: 'school', label: 'School & Studies', icon: '🎓', items: [
      { id: 8,  text: 'Complete enrollment / course registration', done: false, required: true },
      { id: 9,  text: 'Get your student ID card', done: false, required: true },
      { id: 10, text: 'Set up school email and online accounts', done: false, required: true },
      { id: 11, text: 'Get student health insurance through your institution', done: false, required: true },
      { id: 12, text: 'Attend orientation week', done: false, required: false },
    ]},
    { id: 'immigration', label: 'Study Permit', icon: '📋', items: [
      { id: 13, text: 'Confirm study permit is valid and up to date', done: false, required: true },
      { id: 14, text: 'Note study permit expiry — set a 90-day renewal reminder', done: false, required: true },
      { id: 15, text: 'Understand the 24-hr off-campus work rule', done: false, required: true },
      { id: 16, text: 'Apply for co-op work permit if your program requires it', done: false, required: false },
      { id: 17, text: 'Research PGWP eligibility for after graduation', done: false, required: false },
    ]},
    { id: 'finance', label: 'Finance & Tax', icon: '💳', items: [
      { id: 18, text: 'Pay tuition and fees on time', done: false, required: true },
      { id: 19, text: 'Apply for TTC / transit card and student discount', done: false, required: false },
      { id: 20, text: 'Apply for any scholarships or bursaries', done: false, required: false },
      { id: 21, text: 'File a tax return (required after your first year)', done: false, required: false },
    ]},
  ],

  "Work Permit Holder": [
    { id: 'arrival', label: 'Arrival & Registration', icon: '✈️', items: [
      { id: 101, text: 'Apply for SIN at Service Canada', done: false, required: true },
      { id: 102, text: 'Register for provincial health card', done: false, required: true },
      { id: 103, text: 'Open a Canadian bank account', done: false, required: true },
      { id: 104, text: 'Get a Canadian SIM card / phone plan', done: false, required: false },
    ]},
    { id: 'housing', label: 'Housing', icon: '🏠', items: [
      { id: 105, text: 'Secure permanent housing', done: false, required: true },
      { id: 106, text: 'Set up utilities (hydro, internet)', done: false, required: false },
      { id: 107, text: 'Get tenant insurance', done: false, required: false },
    ]},
    { id: 'work', label: 'Employment & Work Permit', icon: '💼', items: [
      { id: 108, text: 'Confirm your work permit conditions (employer, location, NOC)', done: false, required: true },
      { id: 109, text: 'Set renewal reminder 90 days before permit expires', done: false, required: true },
      { id: 110, text: 'Never work for a different employer without a new permit', done: false, required: true },
      { id: 111, text: 'Get a copy of your employment contract', done: false, required: false },
    ]},
    { id: 'pr', label: 'PR Pathway Planning', icon: '🍁', items: [
      { id: 112, text: 'Research Express Entry (CEC, FSW)', done: false, required: false },
      { id: 113, text: 'Accumulate 1 year TEER 0–3 experience for CEC', done: false, required: false },
      { id: 114, text: 'Improve language score (IELTS/CELPIP) for Express Entry CRS', done: false, required: false },
      { id: 115, text: 'Check Provincial Nominee Program (PNP) for your province', done: false, required: false },
    ]},
    { id: 'finance', label: 'Finance & Tax', icon: '💳', items: [
      { id: 116, text: 'Set up direct deposit with your employer', done: false, required: true },
      { id: 117, text: 'Start building Canadian credit history', done: false, required: false },
      { id: 118, text: 'File Canadian taxes each April', done: false, required: true },
    ]},
  ],

  "Permanent Resident": [
    { id: 'pr-activation', label: 'PR Activation', icon: '🍁', items: [
      { id: 201, text: 'Land before your COPR (Confirmation of PR) expiry date', done: false, required: true },
      { id: 202, text: 'Apply for SIN — your new SIN will NOT start with 9', done: false, required: true },
      { id: 203, text: 'Apply for PR card immediately after landing', done: false, required: true },
      { id: 204, text: 'Keep your PR card — you need it to re-enter Canada', done: false, required: true },
    ]},
    { id: 'health', label: 'Health & Services', icon: '🏥', items: [
      { id: 205, text: 'Apply for provincial health card on arrival', done: false, required: true },
      { id: 206, text: 'Register children in school via local school board', done: false, required: false },
      { id: 207, text: 'Find a family doctor or register with a health team', done: false, required: false },
    ]},
    { id: 'housing', label: 'Housing', icon: '🏠', items: [
      { id: 208, text: 'Secure permanent housing', done: false, required: true },
      { id: 209, text: 'Understand tenant rights in your province', done: false, required: false },
      { id: 210, text: 'Set up utilities and get tenant insurance', done: false, required: false },
    ]},
    { id: 'finance', label: 'Finance & Credit', icon: '💳', items: [
      { id: 211, text: 'Open a Canadian bank account', done: false, required: true },
      { id: 212, text: 'Start building Canadian credit history', done: false, required: true },
      { id: 213, text: 'File Canadian taxes each April', done: false, required: true },
      { id: 214, text: 'Enrol in LINC / ESL language classes if needed (free)', done: false, required: false },
    ]},
    { id: 'citizenship', label: 'Citizenship Planning', icon: '🌟', items: [
      { id: 215, text: 'Track physical presence days (need 1,095 days in 5 years)', done: false, required: true },
      { id: 216, text: 'Renew PR card 9 months before expiry', done: false, required: true },
      { id: 217, text: 'Prepare for citizenship test (language, history, rights)', done: false, required: false },
    ]},
  ],

  "Refugee / Protected Person": [
    { id: 'documentation', label: 'Documentation & Status', icon: '📄', items: [
      { id: 301, text: 'Receive your Protected Person determination document', done: false, required: true },
      { id: 302, text: 'Apply for SIN', done: false, required: true },
      { id: 303, text: 'Apply for Convention Refugee Travel Document (CRTD)', done: false, required: false },
      { id: 304, text: 'Apply for PR — protected persons are eligible immediately', done: false, required: true },
    ]},
    { id: 'health', label: 'Health & Support', icon: '🏥', items: [
      { id: 305, text: 'Register for IFHP (Interim Federal Health Program)', done: false, required: true },
      { id: 306, text: 'Connect with a settlement agency near you', done: false, required: true },
      { id: 307, text: 'Access legal aid if your claim is still pending', done: false, required: false },
      { id: 308, text: 'Apply for RAP (Resettlement Assistance Program) if eligible', done: false, required: false },
    ]},
    { id: 'essentials', label: 'Banking & Essential Services', icon: '💳', items: [
      { id: 309, text: 'Open a bank account (some banks have refugee-specific packages)', done: false, required: true },
      { id: 310, text: 'Enroll in LINC / ESL language classes (free)', done: false, required: false },
      { id: 311, text: 'Secure stable housing', done: false, required: true },
    ]},
  ],

  "Visitor / Tourist": [
    { id: 'stay', label: 'Arrival & Stay Documents', icon: '✈️', items: [
      { id: 401, text: 'Confirm your authorized stay duration on entry stamp or eTA', done: false, required: true },
      { id: 402, text: 'Keep your passport valid for the full duration of your stay', done: false, required: true },
      { id: 403, text: 'Note: working or studying requires a separate permit — do not do either without one', done: false, required: true },
      { id: 404, text: 'Register with your country\'s embassy or consulate in Canada', done: false, required: false },
    ]},
    { id: 'health', label: 'Health & Insurance', icon: '🏥', items: [
      { id: 405, text: 'Purchase visitor health insurance — provincial health does not cover temporary residents', done: false, required: true },
      { id: 406, text: 'Locate the nearest hospital, walk-in clinic, and pharmacy', done: false, required: false },
      { id: 407, text: 'Save the emergency number 911 and provincial health line 811', done: false, required: false },
    ]},
    { id: 'local', label: 'Getting Around & Local Life', icon: '🗺️', items: [
      { id: 408, text: 'Get a local SIM card or activate international roaming', done: false, required: false },
      { id: 409, text: 'Download a transit app for your city (TTC, STM, Moovit, Transit)', done: false, required: false },
      { id: 410, text: 'Set up a travel-friendly debit or credit card to avoid foreign fees', done: false, required: false },
      { id: 411, text: 'Open a Canadian bank account if staying longer than 3 months', done: false, required: false },
    ]},
    { id: 'extending', label: 'Extending or Changing Your Status', icon: '📋', items: [
      { id: 412, text: 'Apply to extend your stay via IRCC at least 30 days before expiry', done: false, required: true },
      { id: 413, text: 'Do not overstay — being out-of-status can affect all future Canadian applications', done: false, required: true },
      { id: 414, text: 'Explore Super Visa if visiting parents / grandparents of a Canadian PR or citizen', done: false, required: false },
      { id: 415, text: 'Research pathways to a work or study permit if you plan to stay longer', done: false, required: false },
    ]},
  ],
};

// Generic fallback for any unrecognised status
const DEFAULT_CATEGORIES = [
  { id: 'arrival', label: 'Arrival & Registration', icon: '✈️', items: [
    { id: 501, text: 'Get your SIN (Social Insurance Number)', done: false, required: true },
    { id: 502, text: 'Register for provincial health card', done: false, required: true },
    { id: 503, text: 'Open a Canadian bank account', done: false, required: true },
    { id: 504, text: 'Get a Canadian SIM card / phone plan', done: false, required: false },
  ]},
  { id: 'housing', label: 'Housing', icon: '🏠', items: [
    { id: 505, text: 'Secure permanent housing', done: false, required: true },
    { id: 506, text: 'Set up utilities (hydro, internet)', done: false, required: false },
    { id: 507, text: 'Get tenant insurance', done: false, required: false },
  ]},
  { id: 'immigration', label: 'Immigration & Permits', icon: '📋', items: [
    { id: 508, text: 'Confirm your permit or status is valid', done: false, required: true },
    { id: 509, text: 'Set renewal reminder 90 days before expiry', done: false, required: true },
  ]},
  { id: 'finance', label: 'Finance & Tax', icon: '💳', items: [
    { id: 510, text: 'Start building Canadian credit history', done: false, required: false },
    { id: 511, text: 'File a Canadian tax return each April', done: false, required: true },
  ]},
];

function getCategoriesByStatus(status) {
  return CATEGORIES_BY_STATUS[status] ?? DEFAULT_CATEGORIES;
}

let nextId = 600;

export default function Checklist() {
  const { user } = useContext(AuthContext);
  const uid    = user?.id;
  const status = user?.immigrationStatus ?? "";

  // Load saved state; apply task-sync overrides on top
  const [categories, setCategories] = useState(() =>
    applyTaskSync(loadState(uid, status) ?? getCategoriesByStatus(status), uid)
  );
  const [trackedUid, setTrackedUid] = useState(uid);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCatId, setAddCatId] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newItemRequired, setNewItemRequired] = useState(false);
  const [newItemError, setNewItemError] = useState('');
  const [toast, setToast] = useState('');

  // Reset when a different user logs in (render-time, not useEffect, to avoid cascading setState warning)
  if (trackedUid !== uid) {
    setTrackedUid(uid);
    setCategories(applyTaskSync(loadState(uid, status) ?? getCategoriesByStatus(status), uid));
  }

  // Re-apply task sync whenever the window regains focus (user may have completed tasks in another tab/page)
  useEffect(() => {
    function onFocus() {
      setCategories(prev => applyTaskSync(prev, uid));
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [uid]);

  // Persist every time categories change; mirror completion state back to Tasks
  useEffect(() => {
    saveState(uid, status, categories);
    syncCheckedToTasks(categories, uid);
  }, [categories, uid, status]);

  // flat list of all items
  const allItems = categories.flatMap(c => c.items.map(i => ({ ...i, catId: c.id, catLabel: c.label })));
  const totalDone = allItems.filter(i => i.done).length;
  const totalCount = allItems.length;
  const progress = totalCount === 0 ? 0 : Math.round((totalDone / totalCount) * 100);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function toggleItem(catId, itemId) {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return { ...c, items: c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) };
    }));
  }

  function deleteItem(catId, itemId) {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return { ...c, items: c.items.filter(i => i.id !== itemId) };
    }));
    if (itemId >= 600) {
      saveCustomTasks(uid, loadCustomTasks(uid).filter(t => t.user_task_id !== itemId));
    }
    showToast('Item removed.');
  }

  function openAddModal(catId) {
    setAddCatId(catId || categories[0].id);
    setNewItemText('');
    setNewItemRequired(false);
    setNewItemError('');
    setShowAddModal(true);
  }

  function handleAddItem() {
    if (!newItemText.trim()) { setNewItemError('Please enter a checklist item.'); return; }
    setNewItemError('');
    const newId = nextId++;
    const item = { id: newId, text: newItemText.trim(), done: false, required: newItemRequired };
    setCategories(prev => prev.map(c => c.id === addCatId ? { ...c, items: [...c.items, item] } : c));

    // Mirror to custom tasks so TasksDashboard picks it up on next focus/load
    const catLabel = categories.find(c => c.id === addCatId)?.label ?? 'Custom';
    saveCustomTasks(uid, [...loadCustomTasks(uid), {
      user_task_id: newId,
      title:        newItemText.trim(),
      category:     catLabel,
      status:       'Pending',
      due_date:     null,
      guideUrl:     '/checklist',
      description:  'Added from your checklist.',
      isCustom:     true,
    }]);

    setShowAddModal(false);
    showToast('Item added!');
  }

  function markAllDone(catId) {
    setCategories(prev => prev.map(c => c.id !== catId ? c : { ...c, items: c.items.map(i => ({ ...i, done: true })) }));
    showToast('All items marked as done!');
  }

  function getVisibleItems(items) {
    if (activeFilter === 'Completed') return items.filter(i => i.done);
    if (activeFilter === 'Pending') return items.filter(i => !i.done);
    if (activeFilter === 'Required') return items.filter(i => i.required);
    return items;
  }

  return (
    <div className="cl-page">
      <div className="cl-container">

        {/* Header */}
        <div className="cl-header">
          <div>
            <h1 className="cl-title">Settlement Checklist</h1>
            <p className="cl-subtitle">Track every step of your Canadian settlement journey</p>
          </div>
          <button className="btn-add-cl" onClick={() => openAddModal('')}>+ Add Item</button>
        </div>

        {/* Progress card */}
        <div className="cl-progress-card">
          <div className="cl-progress-top">
            <div>
              <div className="cl-progress-heading">Your Progress</div>
              <div className="cl-progress-label">
                <strong>{totalDone} of {totalCount}</strong> items completed
              </div>
            </div>
            <div className="cl-progress-pct">{progress}%</div>
          </div>
          <div className="cl-progress-bar"><div className="cl-progress-bar-fill" style={{ width: `${progress}%` }} /></div>
          {progress === 100 && (
            <div className="cl-complete-msg">🎉 Amazing! You've completed your settlement checklist!</div>
          )}
        </div>

        {/* Filters */}
        <div className="cl-filters">
          {['All', 'Pending', 'Completed', 'Required'].map(f => (
            <button
              key={f}
              className={`cl-filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Categories */}
        {categories.map(cat => {
          const visible = getVisibleItems(cat.items);
          if (visible.length === 0) return null;
          const catDone = cat.items.filter(i => i.done).length;
          const catTotal = cat.items.length;

          return (
            <div key={cat.id} className="cl-category">
              {/* Category header */}
              <div className="cl-cat-header">
                <div className="cl-cat-left">
                  <span className="cl-cat-icon">{cat.icon}</span>
                  <div>
                    <div className="cl-cat-label">{cat.label}</div>
                    <div className="cl-cat-count">{catDone} of {catTotal} completed</div>
                  </div>
                </div>
                <div className="cl-cat-actions">
                  {catDone < catTotal && (
                    <button className="cl-cat-btn" onClick={() => markAllDone(cat.id)}>Mark all done</button>
                  )}
                  <button className="cl-cat-btn primary" onClick={() => openAddModal(cat.id)}>+ Add</button>
                </div>
              </div>

              {/* Items */}
              <div className="cl-items">
                {visible.map(item => (
                  <div key={item.id} className={`cl-item ${item.done ? 'done' : ''}`}>
                    <div className="cl-item-left">
                      <button
                        className={`cl-checkbox ${item.done ? 'checked' : ''}`}
                        onClick={() => toggleItem(cat.id, item.id)}
                        aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {item.done && (
                          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <div className="cl-item-content">
                        <span className="cl-item-text">{item.text}</span>
                        {item.required && <span className="cl-required-tag">Required</span>}
                      </div>
                    </div>
                    <button className="cl-delete-btn" onClick={() => deleteItem(cat.id, item.id)} title="Remove item">×</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal — native, no Bootstrap dependency */}
      {showAddModal && (
        <div className="cl-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="cl-modal" onClick={e => e.stopPropagation()}>
            <div className="cl-modal-header">
              <h3 className="cl-modal-title">Add Checklist Item</h3>
              <button className="cl-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div className="cl-modal-body">
              <div className="cl-modal-field">
                <label className="cl-field-label">Category</label>
                <select className="cl-select" value={addCatId} onChange={e => setAddCatId(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div className="cl-modal-field">
                <label className="cl-field-label">Item Description</label>
                <input
                  className={`cl-input ${newItemError ? 'cl-input--error' : ''}`}
                  type="text"
                  placeholder="e.g. Book airport pickup"
                  value={newItemText}
                  onChange={e => { setNewItemText(e.target.value); if (newItemError) setNewItemError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                  autoFocus
                />
                {newItemError && <span className="cl-field-error">{newItemError}</span>}
              </div>

              <label className="cl-required-check">
                <input
                  type="checkbox"
                  checked={newItemRequired}
                  onChange={e => setNewItemRequired(e.target.checked)}
                />
                Mark as Required
              </label>
            </div>

            <div className="cl-modal-footer">
              <button className="btn-save-cl" onClick={handleAddItem}>Add Item</button>
              <button className="cl-btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="cl-toast">{toast}</div>}
    </div>
  );
}
