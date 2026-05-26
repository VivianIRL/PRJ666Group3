import { useState } from 'react';
import { Row, Col, Button, Form, Modal, ProgressBar } from 'react-bootstrap';
import '../scss/Checklist.scss';

const CATEGORIES = [
  {
    id: 'arrival',
    label: 'Arrival & Registration',
    icon: '✈️',
    items: [
      { id: 1, text: 'Get your SIN (Social Insurance Number)', done: true, required: true },
      { id: 2, text: 'Register for provincial health insurance (OHIP)', done: true, required: true },
      { id: 3, text: 'Open a Canadian bank account', done: false, required: true },
      { id: 4, text: 'Get a Canadian SIM card / phone plan', done: false, required: false },
    ],
  },
  {
    id: 'housing',
    label: 'Housing',
    icon: '🏠',
    items: [
      { id: 5, text: 'Sign your lease or confirm housing arrangement', done: true, required: true },
      { id: 6, text: 'Set up utilities (hydro, internet)', done: false, required: false },
      { id: 7, text: 'Get tenant insurance', done: false, required: false },
    ],
  },
  {
    id: 'school',
    label: 'School & Studies',
    icon: '🎓',
    items: [
      { id: 8, text: 'Complete university enrollment / course registration', done: true, required: true },
      { id: 9, text: 'Get your student ID card', done: false, required: true },
      { id: 10, text: 'Set up school email and online accounts', done: false, required: true },
      { id: 11, text: 'Attend orientation week', done: false, required: false },
    ],
  },
  {
    id: 'immigration',
    label: 'Immigration & Permits',
    icon: '📋',
    items: [
      { id: 12, text: 'Confirm study permit is valid and up to date', done: false, required: true },
      { id: 13, text: 'Note study permit expiry and set renewal reminder', done: false, required: true },
      { id: 14, text: 'Understand co-op / work permit rules if applicable', done: false, required: false },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Tax',
    icon: '💳',
    items: [
      { id: 15, text: 'Pay tuition and fees on time', done: false, required: true },
      { id: 16, text: 'Apply for any scholarships or bursaries', done: false, required: false },
      { id: 17, text: 'File a tax return (after your first year)', done: false, required: false },
    ],
  },
];

let nextId = 100;

export default function Checklist() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCatId, setAddCatId] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newItemRequired, setNewItemRequired] = useState(false);
  const [newItemError, setNewItemError] = useState('');
  const [toast, setToast] = useState('');

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
    const item = { id: nextId++, text: newItemText.trim(), done: false, required: newItemRequired };
    setCategories(prev => prev.map(c => c.id === addCatId ? { ...c, items: [...c.items, item] } : c));
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
          <Button className="btn-add-cl" onClick={() => openAddModal('')}>+ Add Item</Button>
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
          <ProgressBar now={progress} className="cl-progress-bar" />
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

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Checklist Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="cl-field-label">Category</Form.Label>
            <Form.Select value={addCatId} onChange={e => setAddCatId(e.target.value)}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="cl-field-label">Item Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Book airport pickup"
              value={newItemText}
              onChange={e => { setNewItemText(e.target.value); if (newItemError) setNewItemError(''); }}
              isInvalid={!!newItemError}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            />
            <Form.Control.Feedback type="invalid">{newItemError}</Form.Control.Feedback>
          </Form.Group>

          <Form.Check
            type="checkbox"
            id="required-check"
            label="Mark as Required"
            checked={newItemRequired}
            onChange={e => setNewItemRequired(e.target.checked)}
            className="cl-required-check"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-save-cl" onClick={handleAddItem}>Add Item</Button>
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>

      {toast && <div className="cl-toast">{toast}</div>}
    </div>
  );
}
