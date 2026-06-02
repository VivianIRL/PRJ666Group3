const supabase = require("../../db/supabase");

// GET /api/content — fetch all articles
async function getAllContent(req, res) {
  try {
    const { data, error } = await supabase
      .from("content_db")
      .select("*")
      .order("last_updated", { ascending: false });

    if (error) throw error;
    res.json({ success: true, articles: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/content — add new article
async function createContent(req, res) {
  try {
    const { page_name, body_content, updated_by_admin } = req.body;
    if (!page_name || !body_content) {
      return res.status(400).json({
        success: false,
        error: "page_name and body_content are required.",
      });
    }
    const { data, error } = await supabase
      .from("content_db")
      .insert([
        { page_name, body_content, updated_by_admin: updated_by_admin || 1 },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, article: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/content/:id — update article
async function updateContent(req, res) {
  try {
    const { id } = req.params;
    const { page_name, body_content } = req.body;

    const { data, error } = await supabase
      .from("content_db")
      .update({ page_name, body_content, last_updated: new Date() })
      .eq("content_id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, article: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE /api/content/:id — delete article
async function deleteContent(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("content_db")
      .delete()
      .eq("content_id", id);

    if (error) throw error;
    res.json({ success: true, message: "Article deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllContent, createContent, updateContent, deleteContent };
