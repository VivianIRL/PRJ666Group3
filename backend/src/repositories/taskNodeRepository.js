// taskNodeRepository.js — data access for the task hierarchy system.
// Every function takes the caller's RLS-aware `supabase` client (attached
// to req by requireAuth) so row-level security, not application code, is
// what actually stops one user from touching another user's tasks.

async function findAllByUser(supabase, userId) {
  const { data, error } = await supabase
    .from("task_nodes")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("task_node_id", { ascending: true });
  if (error) throw error;
  return data;
}

async function findById(supabase, taskNodeId) {
  const { data, error } = await supabase
    .from("task_nodes")
    .select("*")
    .eq("task_node_id", taskNodeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function create(supabase, node) {
  const { data, error } = await supabase
    .from("task_nodes")
    .insert([node])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function insertMany(supabase, nodes) {
  if (nodes.length === 0) return [];
  const { data, error } = await supabase
    .from("task_nodes")
    .insert(nodes)
    .select();
  if (error) throw error;
  return data;
}

async function updateFields(supabase, taskNodeId, userId, fields) {
  const { data, error } = await supabase
    .from("task_nodes")
    .update(fields)
    .eq("task_node_id", taskNodeId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function remove(supabase, taskNodeId, userId) {
  const { error } = await supabase
    .from("task_nodes")
    .delete()
    .eq("task_node_id", taskNodeId)
    .eq("user_id", userId);
  if (error) throw error;
}

// Wraps set_task_node_status() (backend/db/init/002_task_hierarchy_system.sql).
// The cascade-down + roll-up-ancestors chain for one status change runs as
// a single Postgres function call so concurrent updates on sibling nodes
// can't interleave into an inconsistent result — see the design doc's
// "Concurrency" section for why this isn't done as sequential app-side UPDATEs.
async function setStatus(supabase, taskNodeId, userId, status) {
  const { data, error } = await supabase.rpc("set_task_node_status", {
    p_task_node_id: taskNodeId,
    p_user_id: userId,
    p_status: status,
  });
  if (error) throw error;
  return data; // full updated flat list for this user
}

async function setDueDate(supabase, taskNodeId, userId, dueDate, manual) {
  const { data, error } = await supabase.rpc("set_task_node_due_date", {
    p_task_node_id: taskNodeId,
    p_user_id: userId,
    p_due_date: dueDate,
    p_manual: manual,
  });
  if (error) throw error;
  return data;
}

module.exports = {
  findAllByUser,
  findById,
  create,
  insertMany,
  updateFields,
  remove,
  setStatus,
  setDueDate,
};
