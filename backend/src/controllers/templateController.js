const templateService = require("../services/templateService");
const { toTemplateDto } = require("../dtos/templateDto");
const logger = require("../logger");

async function listTemplates(req, res) {
  try {
    const templates = await templateService.listAll(req.supabase);
    res.json(templates.map(toTemplateDto));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin-only (see requireAdmin in routes/templateRoutes.js). Creates a
// template and, optionally, its full item tree in one call — items is a
// flat array; parentItemId references another item in the same array's
// item_id only after the parent has actually been inserted, so callers
// should list items in the same breadth-first order the generation
// algorithm expects (parents before children). For deeper editing, use
// dedicated item endpoints (not implemented in this MVP).
async function createTemplate(req, res) {
  const { name, userCategory, description, version, isActive, items } = req.body;
  if (!name?.trim() || !userCategory?.trim()) {
    return res.status(400).json({ message: "name and userCategory are required." });
  }

  try {
    const template = await templateService.createTemplate(req.supabase, req.user.id, {
      name,
      userCategory,
      description,
      version,
      isActive,
    });

    let createdItems = [];
    if (Array.isArray(items) && items.length > 0) {
      createdItems = await templateService.createTemplateItems(req.supabase, template.template_id, items);
    }

    res.status(201).json(toTemplateDto({ ...template, task_hierarchy_template_items: createdItems }));
  } catch (err) {
    logger.error({ err, userId: req.user.id }, "Failed to create template");
    res.status(400).json({ message: err.message });
  }
}

// Self-service only in this MVP: a user generates their own onboarding
// tasks. Admin-triggered generation on someone else's behalf would need
// its own SECURITY DEFINER function, analogous to the notification sweep —
// see the design doc's "Scope cuts" section.
async function generateTasks(req, res) {
  if (req.params.id !== req.user.id) {
    return res.status(403).json({ message: "You can only generate your own tasks." });
  }

  try {
    const meta = req.user.user_metadata ?? {};
    const onboarding = await templateService.generateTasksForUser(
      req.supabase,
      req.user.id,
      meta.immigration_status,
      meta.arrival_date
    );
    const compliance = await templateService.generateComplianceTasksForUser(
      req.supabase,
      req.user.id,
      meta.immigration_status
    );
    res.status(201).json({ onboarding, compliance });
  } catch (err) {
    logger.error({ err, userId: req.user.id }, "Failed to generate tasks from template");
    res.status(500).json({ message: err.message });
  }
}

module.exports = { listTemplates, createTemplate, generateTasks };
