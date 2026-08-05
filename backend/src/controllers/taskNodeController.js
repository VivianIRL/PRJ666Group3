const service = require("../services/taskNodeService");
const { toTaskNodeDto, fromCreateTaskRequest } = require("../dtos/taskNodeDto");
const logger = require("../logger");

async function getTree(req, res) {
  try {
    const tree = await service.getTree(req.supabase, req.user.id);
    res.json(tree.map(toTaskNodeDto));
  } catch (err) {
    logger.error({ err, userId: req.user.id }, "Failed to fetch task tree");
    res.status(500).json({ message: err.message });
  }
}

async function createTask(req, res) {
  try {
    const node = await service.createTask(req.supabase, req.user.id, fromCreateTaskRequest(req.body));
    res.status(201).json(toTaskNodeDto(node));
  } catch (err) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const node = await service.getNodeWithChildren(req.supabase, req.user.id, Number(req.params.id));
    if (!node) return res.status(404).json({ message: "Task not found." });
    res.json(toTaskNodeDto(node));
  } catch (err) {
    logger.error({ err, userId: req.user.id, taskId: req.params.id }, "Failed to fetch task");
    res.status(500).json({ message: err.message });
  }
}

// A single PATCH endpoint handles status changes, due-date changes, and
// plain field edits — each routes to the service function that knows how
// to apply it (status/due-date go through the sync-aware Postgres RPCs).
async function updateTask(req, res) {
  try {
    const taskNodeId = Number(req.params.id);
    if (req.body.status !== undefined) {
      const tree = await service.updateStatus(req.supabase, req.user.id, taskNodeId, req.body.status);
      return res.json(tree.map(toTaskNodeDto));
    }
    if (req.body.dueDate !== undefined) {
      const tree = await service.updateDueDate(req.supabase, req.user.id, taskNodeId, req.body.dueDate);
      return res.json(tree.map(toTaskNodeDto));
    }
    const node = await service.updateFields(req.supabase, req.user.id, taskNodeId, req.body);
    res.json(toTaskNodeDto(node));
  } catch (err) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    await service.deleteTask(req.supabase, req.user.id, Number(req.params.id));
    res.json({ message: "Task deleted." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function createChild(req, res) {
  try {
    const node = await service.createChild(
      req.supabase,
      req.user.id,
      Number(req.params.taskId),
      fromCreateTaskRequest(req.body)
    );
    res.status(201).json(toTaskNodeDto(node));
  } catch (err) {
    res.status(err.status ?? 400).json({ message: err.message });
  }
}

async function getChildren(req, res) {
  try {
    const children = await service.getChildren(req.supabase, req.user.id, Number(req.params.taskId));
    res.json(children.map(toTaskNodeDto));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getTree, createTask, getById, updateTask, deleteTask, createChild, getChildren };
