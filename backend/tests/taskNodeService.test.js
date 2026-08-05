jest.mock("../src/repositories/taskNodeRepository");
const repo = require("../src/repositories/taskNodeRepository");
const service = require("../src/services/taskNodeService");

beforeEach(() => jest.clearAllMocks());

function node(overrides) {
  return {
    task_node_id: 1,
    parent_id: null,
    user_id: "user-1",
    title: "Task",
    status: "NOT_STARTED",
    ...overrides,
  };
}

describe("buildTree", () => {
  test("nests children under their parent", () => {
    const flat = [
      node({ task_node_id: 1, parent_id: null, title: "Prepare College Application" }),
      node({ task_node_id: 2, parent_id: 1, title: "Collect transcripts" }),
      node({ task_node_id: 3, parent_id: 1, title: "Upload documents" }),
      node({ task_node_id: 4, parent_id: 2, title: "Request from registrar" }), // grandchild
    ];

    const tree = service.buildTree(flat);

    expect(tree).toHaveLength(1);
    expect(tree[0].task_node_id).toBe(1);
    expect(tree[0].children.map((c) => c.task_node_id)).toEqual([2, 3]);
    expect(tree[0].children[0].children.map((c) => c.task_node_id)).toEqual([4]);
  });

  test("supports unlimited nesting depth", () => {
    const flat = Array.from({ length: 10 }, (_, i) =>
      node({ task_node_id: i + 1, parent_id: i === 0 ? null : i })
    );

    const tree = service.buildTree(flat);

    let depth = 0;
    let cursor = tree[0];
    while (cursor.children.length > 0) {
      depth++;
      cursor = cursor.children[0];
    }
    expect(depth).toBe(9);
  });

  test("treats a dangling parent_id (parent not in this user's set) as a root", () => {
    const flat = [node({ task_node_id: 5, parent_id: 999 })];
    const tree = service.buildTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0].task_node_id).toBe(5);
  });

  test("multiple independent root tasks stay separate", () => {
    const flat = [node({ task_node_id: 1 }), node({ task_node_id: 2 })];
    const tree = service.buildTree(flat);
    expect(tree).toHaveLength(2);
  });
});

describe("getNodeWithChildren", () => {
  test("finds a nested node and returns it with its own children attached", async () => {
    repo.findAllByUser.mockResolvedValue([
      node({ task_node_id: 1, parent_id: null }),
      node({ task_node_id: 2, parent_id: 1 }),
      node({ task_node_id: 3, parent_id: 2 }),
    ]);

    const found = await service.getNodeWithChildren({}, "user-1", 2);

    expect(found.task_node_id).toBe(2);
    expect(found.children.map((c) => c.task_node_id)).toEqual([3]);
  });

  test("returns null when the id doesn't exist for this user", async () => {
    repo.findAllByUser.mockResolvedValue([node({ task_node_id: 1 })]);
    const found = await service.getNodeWithChildren({}, "user-1", 999);
    expect(found).toBeNull();
  });
});

describe("createTask", () => {
  test("rejects a missing title", async () => {
    await expect(service.createTask({}, "user-1", { title: "  " })).rejects.toMatchObject({ status: 400 });
    expect(repo.create).not.toHaveBeenCalled();
  });

  test("rejects a parentId belonging to another user", async () => {
    repo.findById.mockResolvedValue(node({ task_node_id: 1, user_id: "someone-else" }));
    await expect(
      service.createTask({}, "user-1", { title: "Sub", parentId: 1 })
    ).rejects.toMatchObject({ status: 404 });
    expect(repo.create).not.toHaveBeenCalled();
  });

  test("creates a root custom task with the right defaults", async () => {
    repo.create.mockResolvedValue(node({ title: "Book appointment" }));
    await service.createTask({}, "user-1", { title: "Book appointment" });
    expect(repo.create).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        user_id: "user-1",
        parent_id: null,
        title: "Book appointment",
        node_type: "CUSTOM",
        source: "USER_CREATED",
        due_date_is_manual: false,
      })
    );
  });
});

describe("updateStatus", () => {
  test("rejects an invalid status without calling the repo", async () => {
    await expect(service.updateStatus({}, "user-1", 1, "DONE")).rejects.toMatchObject({ status: 400 });
    expect(repo.setStatus).not.toHaveBeenCalled();
  });

  test("delegates valid status changes to the sync-aware RPC wrapper", async () => {
    repo.setStatus.mockResolvedValue([node({ task_node_id: 1, status: "COMPLETED" })]);
    const tree = await service.updateStatus({}, "user-1", 1, "COMPLETED");
    expect(repo.setStatus).toHaveBeenCalledWith({}, 1, "user-1", "COMPLETED");
    expect(tree[0].status).toBe("COMPLETED");
  });
});

describe("updateDueDate", () => {
  test("marks a non-null due date as manual", async () => {
    repo.setDueDate.mockResolvedValue([node()]);
    await service.updateDueDate({}, "user-1", 1, "2026-09-10");
    expect(repo.setDueDate).toHaveBeenCalledWith({}, 1, "user-1", "2026-09-10", true);
  });

  test("clearing a due date (null) is not treated as manual", async () => {
    repo.setDueDate.mockResolvedValue([node()]);
    await service.updateDueDate({}, "user-1", 1, null);
    expect(repo.setDueDate).toHaveBeenCalledWith({}, 1, "user-1", null, false);
  });
});
