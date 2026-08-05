const service = require("../services/taskNotificationService");
const { toNotificationDto } = require("../dtos/taskNotificationDto");

async function list(req, res) {
  try {
    const notifs = await service.listForUser(req.supabase, req.user.id);
    res.json(notifs.map(toNotificationDto));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function markRead(req, res) {
  try {
    const notif = await service.markRead(req.supabase, req.user.id, Number(req.params.id));
    res.json(toNotificationDto(notif));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { list, markRead };
