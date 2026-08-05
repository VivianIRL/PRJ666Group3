// taskNotificationService.js — user-facing reads/writes on task_notifications.
// The daily generation/sending sweep lives in schedulerService.js.

const repo = require("../repositories/taskNotificationRepository");

async function listForUser(supabase, userId) {
  return repo.findByUser(supabase, userId);
}

async function markRead(supabase, userId, id) {
  return repo.markRead(supabase, id, userId);
}

module.exports = { listForUser, markRead };
