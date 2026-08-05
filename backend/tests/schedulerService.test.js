jest.mock("../src/repositories/taskNotificationRepository");
jest.mock("../src/services/mailer", () => ({ sendMail: jest.fn() }));

const notifRepo = require("../src/repositories/taskNotificationRepository");
const transporter = require("../src/services/mailer");
const { runDailyNotificationSweep } = require("../src/services/schedulerService");

beforeEach(() => jest.clearAllMocks());

function pending(overrides) {
  return {
    task_notification_id: 1,
    channel: "EMAIL",
    milestone_days: 3,
    message: "Your task is due soon.",
    recipient_email: "user@example.com",
    task_title: "Apply for SIN",
    due_date: "2026-08-20",
    ...overrides,
  };
}

test("does nothing (and reports zeros) when the sweep finds no pending emails", async () => {
  notifRepo.runDailySweep.mockResolvedValue([]);
  const result = await runDailyNotificationSweep({});
  expect(result).toEqual({ attempted: 0, sent: 0, failed: 0 });
  expect(transporter.sendMail).not.toHaveBeenCalled();
  expect(notifRepo.markStatuses).toHaveBeenCalledWith({}, [], "SENT");
  expect(notifRepo.markStatuses).toHaveBeenCalledWith({}, [], "FAILED");
});

test("sends each pending email and reports the ones that succeeded as SENT", async () => {
  notifRepo.runDailySweep.mockResolvedValue([pending({ task_notification_id: 1 }), pending({ task_notification_id: 2 })]);
  transporter.sendMail.mockResolvedValue({});

  const result = await runDailyNotificationSweep({});

  expect(result).toEqual({ attempted: 2, sent: 2, failed: 0 });
  expect(transporter.sendMail).toHaveBeenCalledTimes(2);
  expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "user@example.com" }));
  expect(notifRepo.markStatuses).toHaveBeenCalledWith({}, [1, 2], "SENT");
  expect(notifRepo.markStatuses).toHaveBeenCalledWith({}, [], "FAILED");
});

test("a failed send is reported as FAILED without blocking the other notifications", async () => {
  notifRepo.runDailySweep.mockResolvedValue([pending({ task_notification_id: 1 }), pending({ task_notification_id: 2 })]);
  transporter.sendMail
    .mockRejectedValueOnce(new Error("SMTP down"))
    .mockResolvedValueOnce({});

  const result = await runDailyNotificationSweep({});

  expect(result).toEqual({ attempted: 2, sent: 1, failed: 1 });
  expect(notifRepo.markStatuses).toHaveBeenCalledWith({}, [2], "SENT");
  expect(notifRepo.markStatuses).toHaveBeenCalledWith({}, [1], "FAILED");
});

test("relies entirely on the repository/DB layer for idempotency — never re-checks itself", async () => {
  // The UNIQUE(task_node_id, channel, milestone_days) constraint + ON
  // CONFLICT DO NOTHING in run_daily_notification_sweep() is what prevents
  // duplicates; this service just sends whatever it's handed back.
  notifRepo.runDailySweep.mockResolvedValue([pending()]);
  transporter.sendMail.mockResolvedValue({});
  await runDailyNotificationSweep({});
  await runDailyNotificationSweep({});
  expect(notifRepo.runDailySweep).toHaveBeenCalledTimes(2);
  expect(transporter.sendMail).toHaveBeenCalledTimes(2); // service doesn't dedupe; the DB layer already did
});
