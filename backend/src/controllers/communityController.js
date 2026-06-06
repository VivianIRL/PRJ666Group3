const supabase = require("../../db/supabase");

// GET /api/community — fetch all posts
async function getAllPosts(req, res) {
  try {
    const { data, error } = await supabase
      .from("community_qa")
      .select("*")
      .order("qa_id", { ascending: false });

    if (error) throw error;
    res.json({ success: true, posts: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/community — create a new post
async function createPost(req, res) {
  try {
    const { user_id, question } = req.body;
    if (!question) {
      return res
        .status(400)
        .json({ success: false, error: "question is required." });
    }
    const { data, error } = await supabase
      .from("community_qa")
      .insert([{ user_id: user_id || null, question, is_moderated: false }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, post: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/community/:id/reply — add a reply to a post
async function replyToPost(req, res) {
  try {
    const { id } = req.params;
    const { answer, answered_by_admin } = req.body;
    if (!answer) {
      return res
        .status(400)
        .json({ success: false, error: "answer is required." });
    }
    const { data, error } = await supabase
      .from("community_qa")
      .update({ answer, answered_by_admin: answered_by_admin || null })
      .eq("qa_id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, post: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE /api/community/:id — delete a post
async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("community_qa")
      .delete()
      .eq("qa_id", id);

    if (error) throw error;
    res.json({ success: true, message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllPosts, createPost, replyToPost, deletePost };
