jest.mock("../db/supabase", () => ({
  from: jest.fn(),
  auth: { getUser: jest.fn() },
}));

jest.mock("../src/services/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "test" }),
}));

const supabase = require("../db/supabase");
const transporter = require("../src/services/mailer");

const FAKE_USER = { id: "user-123", email: "test@example.com" };

beforeEach(() => {
  jest.clearAllMocks();
  supabase.auth.getUser.mockResolvedValue({
    data: { user: FAKE_USER },
    error: null,
  });
});

function getHandler(router, path, method) {
  const layer = router.stack.find(
    (l) => l.route?.path === path && l.route.methods[method],
  );
  const stack = layer.route.stack;
  return stack[stack.length - 1];
}

describe("GET /notifications", () => {
  test("returns notifications on success", async () => {
    const fakeData = [
      { notification_id: 1, message: "Permit expiring", is_read: false },
    ];
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: fakeData, error: null }),
    });

    const router = require("../src/routes/notificationRoutes");
    const handler = getHandler(router, "/", "get");
    const req = { user: FAKE_USER };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await handler.handle(req, res, () => {});
    expect(res.json).toHaveBeenCalledWith(fakeData);
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB down" } }),
    });

    const router = require("../src/routes/notificationRoutes");
    const handler = getHandler(router, "/", "get");
    const req = { user: FAKE_USER };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await handler.handle(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("POST /send-email", () => {
  test("sends email and returns success", async () => {
    const router = require("../src/routes/notificationRoutes");
    const handler = getHandler(router, "/send-email", "post");
    const req = {
      user: FAKE_USER,
      body: {
        email: "a@b.com",
        title: "Permit Renewal",
        date: "2026-07-01",
        description: "Renew!",
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await handler.handle(req, res, () => {});
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "a@b.com" }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  test("returns 400 when email is missing", async () => {
    const router = require("../src/routes/notificationRoutes");
    const handler = getHandler(router, "/send-email", "post");
    const req = { user: FAKE_USER, body: { title: "Reminder" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await handler.handle(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when title is missing", async () => {
    const router = require("../src/routes/notificationRoutes");
    const handler = getHandler(router, "/send-email", "post");
    const req = { user: FAKE_USER, body: { email: "a@b.com" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await handler.handle(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 500 when sendMail throws", async () => {
    transporter.sendMail.mockRejectedValueOnce(new Error("SMTP error"));
    const router = require("../src/routes/notificationRoutes");
    const handler = getHandler(router, "/send-email", "post");
    const req = { user: FAKE_USER, body: { email: "a@b.com", title: "Test" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await handler.handle(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
