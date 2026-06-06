const supabase = require("../../db/supabase");

async function getWorkPermitInfo(req, res) {
  try {
    const { data: content, error: contentError } = await supabase
      .from("content_db")
      .select("*")
      .eq("page_name", "work-permit")
<<<<<<< HEAD
      .single();
=======
      .limit(1);
>>>>>>> origin/main

    if (contentError) throw contentError;

    const { data: resources, error: resourceError } = await supabase
      .from("resource_library")
      .select("*")
      .eq("category", "work-permit");

    if (resourceError) throw resourceError;

<<<<<<< HEAD
    res.json({ success: true, content, resources });
=======
    res.json({ success: true, content: content[0] || null, resources });
>>>>>>> origin/main
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
<<<<<<< HEAD
      .single();
=======
      .limit(1);
>>>>>>> origin/main

    if (contentError) throw contentError;

    const { data: resources, error: resourceError } = await supabase
      .from("resource_library")
      .select("*")
      .eq("category", "health");

    if (resourceError) throw resourceError;

<<<<<<< HEAD
    res.json({ success: true, content, resources });
=======
    res.json({ success: true, content: content[0] || null, resources });
>>>>>>> origin/main
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getWorkPermitInfo, getHealthInfo };
