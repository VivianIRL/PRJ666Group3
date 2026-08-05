// templateRepository.js — data access for task_hierarchy_templates and
// task_hierarchy_template_items.

async function findActiveByCategory(supabase, category, kind = "ONBOARDING") {
  const { data, error } = await supabase
    .from("task_hierarchy_templates")
    .select("*")
    .eq("user_category", category)
    .eq("template_kind", kind)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function findItemsByTemplate(supabase, templateId) {
  const { data, error } = await supabase
    .from("task_hierarchy_template_items")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

async function findAll(supabase) {
  const { data, error } = await supabase
    .from("task_hierarchy_templates")
    .select("*, task_hierarchy_template_items(*)")
    .order("user_category", { ascending: true })
    .order("version", { ascending: false });
  if (error) throw error;
  return data;
}

async function create(supabase, template) {
  const { data, error } = await supabase
    .from("task_hierarchy_templates")
    .insert([template])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function createItems(supabase, items) {
  if (items.length === 0) return [];
  const { data, error } = await supabase
    .from("task_hierarchy_template_items")
    .insert(items)
    .select();
  if (error) throw error;
  return data;
}

module.exports = {
  findActiveByCategory,
  findItemsByTemplate,
  findAll,
  create,
  createItems,
};
