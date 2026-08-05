jest.mock("../src/services/taskNodeService");
const service = require("../src/services/taskNodeService");
const controller = require("../src/controllers/taskNodeController");

beforeEach(() => jest.clearAllMocks());

function makeRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

const FAKE_USER = { id: "user-1" };

describe("updateTask", () => {
  test("a status field routes to updateStatus, not updateFields", async () => {
    service.updateStatus.mockResolvedValue([{ task_node_id: 1, status: "COMPLETED", children: [] }]);
    const req = { user: FAKE_USER, supabase: {}, params: { id: "1" }, body: { status: "COMPLETED" } };
    const res = makeRes();

    await controller.updateTask(req, res);

    expect(service.updateStatus).toHaveBeenCalledWith({}, "user-1", 1, "COMPLETED");
    expect(service.updateFields).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("a dueDate field routes to updateDueDate, not updateFields", async () => {
    service.updateDueDate.mockResolvedValue([{ task_node_id: 1, due_date: "2026-09-10", children: [] }]);
    const req = { user: FAKE_USER, supabase: {}, params: { id: "1" }, body: { dueDate: "2026-09-10" } };
    const res = makeRes();

    await controller.updateTask(req, res);

    expect(service.updateDueDate).toHaveBeenCalledWith({}, "user-1", 1, "2026-09-10");
    expect(service.updateFields).not.toHaveBeenCalled();
  });

  test("plain fields (title/description/priority) route to updateFields", async () => {
    service.updateFields.mockResolvedValue({ task_node_id: 1, title: "New title" });
    const req = { user: FAKE_USER, supabase: {}, params: { id: "1" }, body: { title: "New title" } };
    const res = makeRes();

    await controller.updateTask(req, res);

    expect(service.updateFields).toHaveBeenCalledWith({}, "user-1", 1, { title: "New title" });
    expect(service.updateStatus).not.toHaveBeenCalled();
    expect(service.updateDueDate).not.toHaveBeenCalled();
  });

  test("propagates a service error's status code", async () => {
    const err = new Error("status must be one of NOT_STARTED, IN_PROGRESS, COMPLETED.");
    err.status = 400;
    service.updateStatus.mockRejectedValue(err);
    const req = { user: FAKE_USER, supabase: {}, params: { id: "1" }, body: { status: "DONE" } };
    const res = makeRes();

    await controller.updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: err.message });
  });
});

describe("createChild", () => {
  test("passes the parent task id from the URL through to the service", async () => {
    service.createChild.mockResolvedValue({ task_node_id: 2, title: "Collect transcripts" });
    const req = { user: FAKE_USER, supabase: {}, params: { taskId: "1" }, body: { title: "Collect transcripts" } };
    const res = makeRes();

    await controller.createChild(req, res);

    expect(service.createChild).toHaveBeenCalledWith({}, "user-1", 1, expect.objectContaining({ title: "Collect transcripts" }));
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
