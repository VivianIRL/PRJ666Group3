// taskNotificationDto.js — shapes task_notifications rows for the wire.

function toNotificationDto(n) {
  return {
    id: n.task_notification_id,
    taskId: n.task_node_id,
    channel: n.channel,
    milestoneDays: n.milestone_days,
    message: n.message,
    scheduledTime: n.scheduled_time,
    status: n.status,
    sentAt: n.sent_at,
    readStatus: n.read_status,
    createdAt: n.created_at,
    task: n.task_nodes ? { title: n.task_nodes.title, dueDate: n.task_nodes.due_date } : undefined,
  };
}

module.exports = { toNotificationDto };
