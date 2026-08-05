// taskNotificationRepository.js — data access for task_notifications.

async function findByUser(supabase, userId) {
  const { data, error } = await supabase
    .from("task_notifications")
    .select("*, task_nodes(title, due_date)")
    .eq("user_id", userId)
    .order("scheduled_time", { ascending: false });
  if (error) throw error;
  return data;
}

async function markRead(supabase, id, userId) {
  const { data, error } = await supabase
    .from("task_notifications")
    .update({ read_status: true })
    .eq("task_notification_id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Privileged, cross-user operation — see run_daily_notification_sweep() in
// backend/db/init/002_task_hierarchy_system.sql.
async function runDailySweep(supabase) {
  const { data, error } = await supabase.rpc("run_daily_notification_sweep");
  if (error) throw error;
  return data;
}

async function markStatuses(supabase, ids, status) {
  if (ids.length === 0) return;
  const { error } = await supabase.rpc("mark_task_notifications_status", {
    p_ids: ids,
    p_status: status,
  });
  if (error) throw error;
}

module.exports = { findByUser, markRead, runDailySweep, markStatuses };
