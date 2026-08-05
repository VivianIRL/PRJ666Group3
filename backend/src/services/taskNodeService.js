// taskNodeService.js — business logic for the task/subtask hierarchy.
// Status and due-date changes delegate to Postgres functions (via the
// repository's setStatus/setDueDate) rather than reimplementing the
// cascade/roll-up rules here — see backend/db/init/002_task_hierarchy_system.sql.

const repo = require("../repositories/taskNodeRepository");

const VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Turns the flat, user-scoped row list into a forest of root tasks with
// nested `children` arrays. O(n) — one pass to index by id, one pass to
// attach each node to its parent.
function buildTree(flatNodes) {
  const byId = new Map(flatNodes.map((n) => [n.task_node_id, { ...n, children: [] }]));
  const roots = [];
  for (const node of byId.values()) {
    if (node.parent_id != null && byId.has(node.parent_id)) {
      byId.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function findInTree(nodes, taskNodeId) {
  for (const n of nodes) {
    if (n.task_node_id === taskNodeId) return n;
    const found = findInTree(n.children, taskNodeId);
    if (found) return found;
  }
  return null;
}

async function getTree(supabase, userId) {
  const flat = await repo.findAllByUser(supabase, userId);
  return buildTree(flat);
}

async function getNodeWithChildren(supabase, userId, taskNodeId) {
  const flat = await repo.findAllByUser(supabase, userId);
  return findInTree(buildTree(flat), taskNodeId);
}

async function getChildren(supabase, userId, parentId) {
  const flat = await repo.findAllByUser(supabase, userId);
  return flat.filter((n) => n.parent_id === parentId);
}

async function createTask(supabase, userId, input) {
  if (!input.title?.trim()) throw httpError("title is required.", 400);

  if (input.parentId != null) {
    const parent = await repo.findById(supabase, input.parentId);
    if (!parent || parent.user_id !== userId) {
      throw httpError("Parent task not found.", 404);
    }
  }

  return repo.create(supabase, {
    user_id: userId,
    parent_id: input.parentId ?? null,
    title: input.title.trim(),
    description: input.description ?? null,
    node_type: "CUSTOM",
    source: "USER_CREATED",
    priority: input.priority ?? "NORMAL",
    due_date: input.dueDate ?? null,
    due_date_is_manual: !!input.dueDate,
  });
}

async function createChild(supabase, userId, parentId, input) {
  return createTask(supabase, userId, { ...input, parentId });
}

async function updateStatus(supabase, userId, taskNodeId, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw httpError(`status must be one of ${VALID_STATUSES.join(", ")}.`, 400);
  }
  const flat = await repo.setStatus(supabase, taskNodeId, userId, status);
  return buildTree(flat);
}

async function updateDueDate(supabase, userId, taskNodeId, dueDate) {
  // dueDate === null clears it back to auto roll-up from children.
  const flat = await repo.setDueDate(supabase, taskNodeId, userId, dueDate, dueDate !== null);
  return buildTree(flat);
}

async function updateFields(supabase, userId, taskNodeId, fields) {
  const allowed = ["title", "description", "priority"];
  const updates = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) updates[key] = fields[key];
  }
  if (Object.keys(updates).length === 0) {
    throw httpError("No valid fields to update.", 400);
  }
  return repo.updateFields(supabase, taskNodeId, userId, updates);
}

async function deleteTask(supabase, userId, taskNodeId) {
  await repo.remove(supabase, taskNodeId, userId);
}

module.exports = {
  buildTree,
  getTree,
  getNodeWithChildren,
  getChildren,
  createTask,
  createChild,
  updateStatus,
  updateDueDate,
  updateFields,
  deleteTask,
};
