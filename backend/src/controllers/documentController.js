const supabase = require("../../db/supabase");

// ── GET /api/documents ───────────────────────────────────────────────────────
// Returns all documents for the logged-in user, optionally filtered by
// user_task_id (?user_task_id=5) to scope to one task's documents.
async function getDocuments(req, res) {
  try {
    const { user_task_id } = req.query;

    let query = supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (user_task_id) {
      query = query.eq("user_task_id", user_task_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, documents: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /api/documents/:id ───────────────────────────────────────────────────
async function getDocumentById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .eq("document_id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, error: "Document not found." });

    res.json({ success: true, document: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── POST /api/documents ───────────────────────────────────────────────────────
// Creates a document metadata record. No file is uploaded — this just
// tracks name, type, expiry date, and optionally links to a task.
async function createDocument(req, res) {
  try {
    const { title, doc_type, expiry_date, user_task_id, notes } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "title is required." });
    }

    const { data, error } = await supabase
      .from("user_documents")
      .insert([
        {
          user_id: req.user.id,
          title,
          doc_type: doc_type ?? null,
          expiry_date: expiry_date ?? null,
          user_task_id: user_task_id ?? null,
          notes: notes ?? null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, document: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── PUT /api/documents/:id ───────────────────────────────────────────────────
// Updates any subset of fields (title, doc_type, expiry_date, user_task_id, notes).
async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const { title, doc_type, expiry_date, user_task_id, notes } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (doc_type !== undefined) updates.doc_type = doc_type;
    if (expiry_date !== undefined) updates.expiry_date = expiry_date;
    if (user_task_id !== undefined) updates.user_task_id = user_task_id;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from("user_documents")
      .update(updates)
      .eq("document_id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ success: false, error: "Document not found." });

    res.json({ success: true, document: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── DELETE /api/documents/:id ────────────────────────────────────────────────
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("user_documents")
      .delete()
      .eq("document_id", id)
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.json({ success: true, message: "Document deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /api/documents/expiring ──────────────────────────────────────────────
// Returns documents expiring within the next N days (default 30).
// Powers the Document Alerts page's "expiring soon" view.
async function getExpiringDocuments(req, res) {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + days);

    const { data, error } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", req.user.id)
      .not("expiry_date", "is", null)
      .lte("expiry_date", cutoff.toISOString().split("T")[0])
      .order("expiry_date", { ascending: true });

    if (error) throw error;

    res.json({ success: true, documents: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getExpiringDocuments,
};
