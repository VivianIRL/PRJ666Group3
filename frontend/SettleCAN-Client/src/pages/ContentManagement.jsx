import { useState } from 'react';
import { Container, Row, Col, Button, Table, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import '../scss/ContentManagement.scss';

const INITIAL_ARTICLES = [
  { id: 1, title: 'How to Apply for a Study Permit Extension', category: 'Academic', updated: 'Jan 10, 2025', status: 'Published' },
  { id: 2, title: 'Understanding SIN Application Process', category: 'Legal', updated: 'Feb 3, 2025', status: 'Draft' },
  { id: 3, title: 'Healthcare Registration Guide', category: 'General', updated: 'Dec 18, 2024', status: 'Archived' },
];

function getStatusVariant(status) {
  switch (status) {
    case 'Published': return 'success';
    case 'Draft': return 'warning';
    case 'Archived': return 'secondary';
    default: return 'secondary';
  }
}

export default function ContentManagement() {
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deletingArticle, setDeletingArticle] = useState(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ title: '', category: '', status: '' });
  const [errors, setErrors] = useState({});

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All Categories' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stats = {
    total: articles.length,
    drafts: articles.filter(a => a.status === 'Draft').length,
    published: articles.filter(a => a.status === 'Published').length,
    archived: articles.filter(a => a.status === 'Archived').length,
  };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function openAdd() {
    setEditingArticle(null);
    setForm({ title: '', category: '', status: '' });
    setErrors({});
    setShowAddModal(true);
  }

  function openEdit(article) {
    setEditingArticle(article);
    setForm({ title: article.title, category: article.category, status: article.status });
    setErrors({});
    setShowAddModal(true);
  }

  function openDelete(article) {
    setDeletingArticle(article);
    setShowDeleteModal(true);
  }

  function validateForm() {
    const e = {};
    if (!form.title.trim()) e.title = 'Please enter a title.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.status) e.status = 'Please select a status.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validateForm()) return;
    if (editingArticle) {
      setArticles(prev => prev.map(a => a.id === editingArticle.id
        ? { ...a, title: form.title, category: form.category, status: form.status, updated: today }
        : a
      ));
      showToast('Article updated successfully!');
    } else {
      const newArticle = { id: Date.now(), title: form.title, category: form.category, status: form.status, updated: today };
      setArticles(prev => [newArticle, ...prev]);
      showToast(`"${form.title}" added!`);
    }
    setShowAddModal(false);
  }

  function handleDelete() {
    setArticles(prev => prev.filter(a => a.id !== deletingArticle.id));
    setShowDeleteModal(false);
    showToast('Article deleted.');
  }

  return (
    <div className="cms-page">
      {/* Sidebar + Content */}
      <div className="cms-layout">
        {/* Sidebar */}
        <aside className="cms-sidebar">
          <div className="sidebar-item">Dashboard</div>
          <div className="sidebar-item">User Management</div>
          <div className="sidebar-item active">Content Management</div>
          <div className="sidebar-item">Notifications</div>
          <div className="sidebar-item">Reports</div>
          <div className="sidebar-item">Settings</div>
        </aside>

        {/* Main */}
        <main className="cms-main">
          <h1 className="cms-title">Content Management System</h1>
          <p className="cms-subtitle">Manage immigration guides, updates, and announcements</p>

          {/* Stat Cards */}
          <Row className="g-3 mb-4">
            {[
              { label: 'Total Articles', value: stats.total },
              { label: 'Drafts', value: stats.drafts },
              { label: 'Published', value: stats.published },
              { label: 'Archived', value: stats.archived },
            ].map(s => (
              <Col key={s.label} xs={6} md={3}>
                <div className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Toolbar */}
          <div className="cms-toolbar">
            <Button className="btn-add-content" onClick={openAdd}>+ Add New Content</Button>
            <div className="toolbar-right">
              <Form.Control
                type="text"
                placeholder="Search content..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
              <Form.Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option>All Categories</option>
                <option>Academic</option>
                <option>Legal</option>
                <option>General</option>
                <option>Health</option>
                <option>Finance</option>
              </Form.Select>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <Table hover className="cms-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted py-4">No articles found.</td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.category}</td>
                    <td>{a.updated}</td>
                    <td>
                      <Badge bg={getStatusVariant(a.status)} className="status-badge">{a.status}</Badge>
                    </td>
                    <td>
                      <span className="action-link" onClick={() => openEdit(a)}>Edit</span>
                      <span className="action-link" onClick={() => openDelete(a)}>Delete</span>
                      <span className="action-link" onClick={() => showToast('Opening preview…')}>View</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingArticle ? 'Edit Article' : 'Add New Content'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="field-label">Article Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. How to Apply for a PR Card"
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
                  <option>Academic</option>
                  <option>Legal</option>
                  <option>General</option>
                  <option>Health</option>
                  <option>Finance</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="field-label">Status</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  isInvalid={!!errors.status}
                >
                  <option value="">Select status…</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.status}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="field-label">Notes <span className="optional">(optional)</span></Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Brief description or notes…" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-save-modal" onClick={handleSave}>
            {editingArticle ? 'Save Changes' : 'Add Content'}
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Body className="text-center py-4">
          <div className="delete-icon">🗑</div>
          <h5 className="mt-3 mb-2">Delete Article?</h5>
          <p className="text-muted small">"{deletingArticle?.title}" will be permanently removed.</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pb-4">
          <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast */}
      {toast && <div className="cms-toast">{toast}</div>}
    </div>
  );
}
