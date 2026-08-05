// schedulerService.js — the daily notification sweep.
//
// 1. Ask Postgres (run_daily_notification_sweep, SECURITY DEFINER) to
//    generate any missing 7/3/1-day milestone rows and hand back every
//    still-PENDING/FAILED email that needs sending. Postgres can't send
//    mail itself, and idempotency (never re-notifying for the same
//    task/channel/milestone) is enforced there via a UNIQUE constraint +
//    ON CONFLICT DO NOTHING, not by anything in this file.
// 2. Actually send each email via the existing nodemailer transporter.
// 3. Report each attempt's outcome back to Postgres so retries only ever
//    target genuinely unsent notifications.

const notifRepo = require("../repositories/taskNotificationRepository");
const transporter = require("./mailer");
const logger = require("../logger");

function reminderEmailHtml(n) {
  const dayWord = n.milestone_days === 1 ? "day" : "days";
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
      <h2 style="color:#8E0002;margin-bottom:4px;">SettleCAN Reminder</h2>
      <h3 style="margin-top:0;">${n.task_title}</h3>
      <p><strong>Due:</strong> ${n.due_date} — ${n.milestone_days} ${dayWord} from now</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
      <small style="color:#999;">You are receiving this because this task has an upcoming deadline on SettleCAN.</small>
    </div>
  `;
}

async function runDailyNotificationSweep(supabase) {
  const pendingEmails = await notifRepo.runDailySweep(supabase);

  const sentIds = [];
  const failedIds = [];

  for (const n of pendingEmails) {
    try {
      await transporter.sendMail({
        from: `"SettleCAN" <${process.env.GMAIL_USER}>`,
        to: n.recipient_email,
        subject: `SettleCAN Reminder: ${n.task_title}`,
        html: reminderEmailHtml(n),
      });
      sentIds.push(n.task_notification_id);
    } catch (err) {
      logger.error({ err, notificationId: n.task_notification_id }, "Failed to send task reminder email");
      failedIds.push(n.task_notification_id);
    }
  }

  await notifRepo.markStatuses(supabase, sentIds, "SENT");
  await notifRepo.markStatuses(supabase, failedIds, "FAILED");

  return { attempted: pendingEmails.length, sent: sentIds.length, failed: failedIds.length };
}

module.exports = { runDailyNotificationSweep };
