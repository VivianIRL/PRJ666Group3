const supabase = require("../../db/supabase");

async function getWorkPermitInfo(req, res) {
  try {
    const { data: content, error: contentError } = await supabase
      .from("content_db")
      .select("*")
      .eq("page_name", "work-permit")
      .limit(1);

    if (contentError) throw contentError;

    const { data: resources, error: resourceError } = await supabase
      .from("resource_library")
      .select("*")
      .eq("category", "work-permit");

    if (resourceError) throw resourceError;

    res.json({ success: true, content: content[0] || null, resources });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getHealthInfo(req, res) {
  try {
    const { data: content, error: contentError } = await supabase
      .from("content_db")
      .select("*")
      .eq("page_name", "health")
      .limit(1);

    if (contentError) throw contentError;

    const { data: resources, error: resourceError } = await supabase
      .from("resource_library")
      .select("*")
      .eq("category", "health");

    if (resourceError) throw resourceError;

    res.json({ success: true, content: content[0] || null, resources });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getWorkPermitInfo, getHealthInfo };
