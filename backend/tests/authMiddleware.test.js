jest.mock("../db/supabase", () => ({ auth: { getUser: jest.fn() }, from: jest.fn() }));

const sharedSupabase = require("../db/supabase");
const { requireAdmin, requireAdminOrSchedulerSecret } = require("../src/middleware/authMiddleware");

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.SCHEDULER_SECRET;
});

function makeRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe("requireAdmin", () => {
  test("401s when there's no authenticated user", async () => {
    const req = {};
    const res = makeRes();
    await requireAdmin(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("403s when the user isn't in the admins table", async () => {
    const req = {
      user: { id: "user-1" },
      supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => ({ data: null, error: null }) }) }) }) },
    };
    const res = makeRes();
    const next = jest.fn();
    await requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() when the user is an admin", async () => {
    const req = {
      user: { id: "user-1" },
      supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => ({ data: { admin_id: 1 }, error: null }) }) }) }) },
    };
    const res = makeRes();
    const next = jest.fn();
    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("requireAdminOrSchedulerSecret", () => {
  test("passes through on a matching shared secret without needing a JWT at all", async () => {
    process.env.SCHEDULER_SECRET = "topsecret";
    const req = { headers: { "x-scheduler-secret": "topsecret" } };
    const res = makeRes();
    const next = jest.fn();
    requireAdminOrSchedulerSecret(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("rejects a wrong secret and falls through to normal auth (which then 401s with no token)", async () => {
    process.env.SCHEDULER_SECRET = "topsecret";
    const req = { headers: { "x-scheduler-secret": "wrong" } };
    const res = makeRes();
    const next = jest.fn();
    await requireAdminOrSchedulerSecret(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("ignores the header entirely when SCHEDULER_SECRET isn't configured", async () => {
    const req = { headers: { "x-scheduler-secret": "anything" } };
    const res = makeRes();
    const next = jest.fn();
    await requireAdminOrSchedulerSecret(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401); // falls through to requireAuth, no token present
  });
});
