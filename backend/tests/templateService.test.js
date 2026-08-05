jest.mock("../src/repositories/templateRepository");
jest.mock("../src/repositories/taskNodeRepository");
const templateRepo = require("../src/repositories/templateRepository");
const taskNodeRepo = require("../src/repositories/taskNodeRepository");
const service = require("../src/services/templateService");

beforeEach(() => jest.clearAllMocks());

describe("resolveCategory", () => {
  test("passes all 5 canonical immigration statuses through unchanged", () => {
    expect(service.resolveCategory("International Student")).toBe("International Student");
    expect(service.resolveCategory("Work Permit Holder")).toBe("Work Permit Holder");
    expect(service.resolveCategory("Permanent Resident")).toBe("Permanent Resident");
    expect(service.resolveCategory("Refugee / Protected Person")).toBe("Refugee / Protected Person");
    expect(service.resolveCategory("Visitor / Tourist")).toBe("Visitor / Tourist");
  });

  test("maps legacy synonyms onto their canonical status", () => {
    expect(service.resolveCategory("Student Visa")).toBe("International Student");
    expect(service.resolveCategory("Work Permit")).toBe("Work Permit Holder");
  });

  test("returns null for an unrecognised status", () => {
    expect(service.resolveCategory("Citizen")).toBeNull();
    expect(service.resolveCategory(undefined)).toBeNull();
  });
});

describe("generateTasksForUser", () => {
  test("does nothing when the status has no mapped category", async () => {
    const result = await service.generateTasksForUser({}, "user-1", "Citizen", "2026-01-01");
    expect(result).toEqual({ generated: 0, reason: "no_template_for_category" });
    expect(taskNodeRepo.findAllByUser).not.toHaveBeenCalled();
  });

  test("returns a no-op result when no active template exists for the category", async () => {
    taskNodeRepo.findAllByUser.mockResolvedValue([]);
    templateRepo.findActiveByCategory.mockResolvedValue(null);
    const result = await service.generateTasksForUser({}, "user-1", "International Student", "2026-01-01");
    expect(result).toEqual({ generated: 0, reason: "no_active_template" });
  });

  test("materializes a nested template breadth-first, wiring parent_id from the previous level", async () => {
    taskNodeRepo.findAllByUser.mockResolvedValue([]);
    templateRepo.findActiveByCategory.mockResolvedValue({ template_id: 10, version: 1 });
    templateRepo.findItemsByTemplate.mockResolvedValue([
      { item_id: 100, parent_item_id: null, title: "Prepare College Application", description: null, canonical_key: null, default_due_offset_days: 30, sort_order: 1 },
      { item_id: 101, parent_item_id: 100, title: "Collect transcripts", description: null, canonical_key: null, default_due_offset_days: 10, sort_order: 1 },
      { item_id: 102, parent_item_id: 100, title: "Upload documents", description: null, canonical_key: null, default_due_offset_days: 20, sort_order: 2 },
      { item_id: 103, parent_item_id: 101, title: "Request from registrar", description: null, canonical_key: null, default_due_offset_days: null, sort_order: 1 },
    ]);

    // insertMany is called once per BFS level; return rows with ids that
    // mirror the order items were submitted in.
    taskNodeRepo.insertMany
      .mockResolvedValueOnce([{ task_node_id: 500 }]) // level 0: the root
      .mockResolvedValueOnce([{ task_node_id: 501 }, { task_node_id: 502 }]) // level 1: the two children of root
      .mockResolvedValueOnce([{ task_node_id: 503 }]); // level 2: grandchild under 101->501

    const result = await service.generateTasksForUser({}, "user-1", "International Student", "2026-01-01");

    expect(result).toEqual({ generated: 4, skipped: 0, templateId: 10, templateVersion: 1 });
    expect(taskNodeRepo.insertMany).toHaveBeenCalledTimes(3);

    // Level 0: root has no parent, and its due date is arrival_date + 30 days.
    expect(taskNodeRepo.insertMany).toHaveBeenNthCalledWith(1, {}, [
      expect.objectContaining({ title: "Prepare College Application", parent_id: null, due_date: "2026-01-31", source: "TEMPLATE", node_type: "SYSTEM" }),
    ]);

    // Level 1: both children point at the root's newly-created id (500).
    expect(taskNodeRepo.insertMany).toHaveBeenNthCalledWith(2, {}, [
      expect.objectContaining({ title: "Collect transcripts", parent_id: 500 }),
      expect.objectContaining({ title: "Upload documents", parent_id: 500 }),
    ]);

    // Level 2: grandchild points at "Collect transcripts"'s id (501), and
    // has no due date since default_due_offset_days was null.
    expect(taskNodeRepo.insertMany).toHaveBeenNthCalledWith(3, {}, [
      expect.objectContaining({ title: "Request from registrar", parent_id: 501, due_date: null }),
    ]);
  });

  test("re-running the same status is a full no-op — every item already matches by template_item_id", async () => {
    taskNodeRepo.findAllByUser.mockResolvedValue([
      { task_node_id: 500, template_item_id: 100, canonical_key: null },
      { task_node_id: 501, template_item_id: 101, canonical_key: null },
    ]);
    templateRepo.findActiveByCategory.mockResolvedValue({ template_id: 10, version: 1 });
    templateRepo.findItemsByTemplate.mockResolvedValue([
      { item_id: 100, parent_item_id: null, title: "Prepare College Application", description: null, canonical_key: null, default_due_offset_days: 30, sort_order: 1 },
      { item_id: 101, parent_item_id: 100, title: "Collect transcripts", description: null, canonical_key: null, default_due_offset_days: 10, sort_order: 1 },
    ]);

    const result = await service.generateTasksForUser({}, "user-1", "International Student", "2026-01-01");

    expect(result).toEqual({ generated: 0, skipped: 2, templateId: 10, templateVersion: 1, reason: "up_to_date" });
    expect(taskNodeRepo.insertMany).not.toHaveBeenCalled();
  });

  test("switching status adds the new status's items but does not duplicate a shared action (matched by canonical_key)", async () => {
    // The user was previously a Student and already has a "bank_account"
    // task from that template — now generating Work Permit Holder's
    // template, which has its own differently-worded bank-account item
    // sharing the same canonical_key.
    taskNodeRepo.findAllByUser.mockResolvedValue([
      { task_node_id: 700, template_item_id: 55, canonical_key: "bank_account" },
    ]);
    templateRepo.findActiveByCategory.mockResolvedValue({ template_id: 11, version: 1 });
    templateRepo.findItemsByTemplate.mockResolvedValue([
      { item_id: 200, parent_item_id: null, title: "Arrival & Registration", description: null, canonical_key: null, default_due_offset_days: 14, sort_order: 1 },
      { item_id: 201, parent_item_id: 200, title: "Open a Canadian bank account", description: null, canonical_key: "bank_account", default_due_offset_days: 3, sort_order: 1 },
      { item_id: 202, parent_item_id: 200, title: "Get a Canadian SIM card / phone plan", description: null, canonical_key: "sim_phone_plan", default_due_offset_days: 4, sort_order: 2 },
    ]);
    taskNodeRepo.insertMany
      .mockResolvedValueOnce([{ task_node_id: 800 }]) // level 0: "Arrival & Registration" root
      .mockResolvedValueOnce([{ task_node_id: 801 }]); // level 1: only the SIM card item — bank account was skipped

    const result = await service.generateTasksForUser({}, "user-1", "Work Permit Holder", "2026-01-01");

    expect(result).toEqual({ generated: 2, skipped: 1, templateId: 11, templateVersion: 1 });
    expect(taskNodeRepo.insertMany).toHaveBeenCalledTimes(2);
    expect(taskNodeRepo.insertMany).toHaveBeenNthCalledWith(2, {}, [
      expect.objectContaining({ title: "Get a Canadian SIM card / phone plan", parent_id: 800 }),
    ]);

    const insertedTitles = taskNodeRepo.insertMany.mock.calls.flatMap(([, rows]) => rows.map((r) => r.title));
    expect(insertedTitles).not.toContain("Open a Canadian bank account");
  });
});

describe("generateComplianceTasksForUser", () => {
  test("does nothing when the status has no mapped category", async () => {
    const result = await service.generateComplianceTasksForUser({}, "user-1", "Citizen");
    expect(result).toEqual({ generated: 0, reason: "no_template_for_category" });
    expect(taskNodeRepo.findAllByUser).not.toHaveBeenCalled();
  });

  test("looks up the COMPLIANCE template kind, separate from the onboarding one", async () => {
    taskNodeRepo.findAllByUser.mockResolvedValue([]);
    templateRepo.findActiveByCategory.mockResolvedValue({ template_id: 20, version: 1 });
    templateRepo.findItemsByTemplate.mockResolvedValue([
      { item_id: 200, parent_item_id: null, title: "Study Permit Conditions", description: null, task_category: "COMPLIANCE", canonical_key: null, priority: "NORMAL", default_due_offset_days: null, sort_order: 1 },
      { item_id: 201, parent_item_id: 200, title: "Enroll full-time at your DLI", description: "...", task_category: "COMPLIANCE", canonical_key: null, priority: "HIGH", default_due_offset_days: null, sort_order: 1 },
    ]);
    taskNodeRepo.insertMany
      .mockResolvedValueOnce([{ task_node_id: 900 }])
      .mockResolvedValueOnce([{ task_node_id: 901 }]);

    const result = await service.generateComplianceTasksForUser({}, "user-1", "International Student");

    expect(templateRepo.findActiveByCategory).toHaveBeenCalledWith({}, "International Student", "COMPLIANCE");
    expect(result).toEqual({ generated: 2, skipped: 0, templateId: 20, templateVersion: 1 });
    expect(taskNodeRepo.insertMany).toHaveBeenNthCalledWith(2, {}, [
      expect.objectContaining({ title: "Enroll full-time at your DLI", parent_id: 900, priority: "HIGH", task_category: "COMPLIANCE", due_date: null }),
    ]);
  });

  test("re-running the same status makes no changes", async () => {
    taskNodeRepo.findAllByUser.mockResolvedValue([
      { task_node_id: 900, template_item_id: 200, canonical_key: null },
    ]);
    templateRepo.findActiveByCategory.mockResolvedValue({ template_id: 20, version: 1 });
    templateRepo.findItemsByTemplate.mockResolvedValue([
      { item_id: 200, parent_item_id: null, title: "Study Permit Conditions", description: null, task_category: "COMPLIANCE", canonical_key: null, priority: "NORMAL", default_due_offset_days: null, sort_order: 1 },
    ]);

    const result = await service.generateComplianceTasksForUser({}, "user-1", "International Student");

    expect(result).toEqual({ generated: 0, skipped: 1, templateId: 20, templateVersion: 1, reason: "up_to_date" });
    expect(taskNodeRepo.insertMany).not.toHaveBeenCalled();
  });

  test("switching status does not duplicate the shared General Legal Obligations items (matched by canonical_key)", async () => {
    // The user already has all 3 shared compliance rules from their
    // previous status's compliance template (see
    // 009_task_canonical_keys.sql — these 3 are seeded verbatim-identical
    // across every status's compliance template).
    taskNodeRepo.findAllByUser.mockResolvedValue([
      { task_node_id: 910, template_item_id: 300, canonical_key: "compliance_maintain_status" },
      { task_node_id: 911, template_item_id: 301, canonical_key: "compliance_report_address_change" },
      { task_node_id: 912, template_item_id: 302, canonical_key: "compliance_no_criminal_offence" },
    ]);
    templateRepo.findActiveByCategory.mockResolvedValue({ template_id: 30, version: 1 });
    templateRepo.findItemsByTemplate.mockResolvedValue([
      { item_id: 400, parent_item_id: null, title: "Work Permit Conditions", description: null, task_category: "COMPLIANCE", canonical_key: null, priority: "NORMAL", default_due_offset_days: null, sort_order: 1 },
      { item_id: 401, parent_item_id: 400, title: "Work only for the employer named on your permit", description: null, task_category: "COMPLIANCE", canonical_key: null, priority: "HIGH", default_due_offset_days: null, sort_order: 1 },
      { item_id: 402, parent_item_id: null, title: "General Legal Obligations", description: null, task_category: "COMPLIANCE", canonical_key: null, priority: "NORMAL", default_due_offset_days: null, sort_order: 2 },
      { item_id: 403, parent_item_id: 402, title: "Maintain valid status at all times", description: null, task_category: "COMPLIANCE", canonical_key: "compliance_maintain_status", priority: "HIGH", default_due_offset_days: null, sort_order: 1 },
      { item_id: 404, parent_item_id: 402, title: "Report address changes to IRCC", description: null, task_category: "COMPLIANCE", canonical_key: "compliance_report_address_change", priority: "NORMAL", default_due_offset_days: null, sort_order: 2 },
      { item_id: 405, parent_item_id: 402, title: "Do not criminally offend — it affects future applications", description: null, task_category: "COMPLIANCE", canonical_key: "compliance_no_criminal_offence", priority: "NORMAL", default_due_offset_days: null, sort_order: 3 },
    ]);
    taskNodeRepo.insertMany
      .mockResolvedValueOnce([{ task_node_id: 950 }, { task_node_id: 951 }]) // level 0: the two root groups (neither matches an existing task)
      .mockResolvedValueOnce([{ task_node_id: 960 }]); // level 1: only "Work only for the employer..." — the 3 General items all matched existing tasks

    const result = await service.generateComplianceTasksForUser({}, "user-1", "Work Permit Holder");

    expect(result).toEqual({ generated: 3, skipped: 3, templateId: 30, templateVersion: 1 });
    const insertedTitles = taskNodeRepo.insertMany.mock.calls.flatMap(([, rows]) => rows.map((r) => r.title));
    expect(insertedTitles).toEqual([
      "Work Permit Conditions",
      "General Legal Obligations",
      "Work only for the employer named on your permit",
    ]);
    expect(insertedTitles).not.toContain("Maintain valid status at all times");
  });
});
