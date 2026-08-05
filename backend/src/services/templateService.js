// templateService.js — template CRUD (admin) and the recursive
// template -> task-tree generation algorithm (self-service, at onboarding).

const templateRepo = require("../repositories/templateRepository");
const taskNodeRepo = require("../repositories/taskNodeRepository");

// Templates are keyed directly by the app's 5 canonical immigration-status
// strings (matching profiles.immigration_status / the Auth user's metadata
// exactly) rather than a coarse STUDENT/WORKER bucket — that bucketing was
// the bug: only 2 of 5 statuses ever matched a template, so users with any
// other status (Refugee / Protected Person, Permanent Resident, Visitor)
// never got any tasks generated. See backend/db/init/003_task_hierarchy_all_statuses.sql.
const CANONICAL_STATUSES = [
  "International Student",
  "Work Permit Holder",
  "Permanent Resident",
  "Refugee / Protected Person",
  "Visitor / Tourist",
];

// Legacy/free-text status values seen on older accounts.
const STATUS_SYNONYMS = {
  "Student Visa": "International Student",
  "Work Permit": "Work Permit Holder",
};

function resolveCategory(immigrationStatus) {
  if (CANONICAL_STATUSES.includes(immigrationStatus)) return immigrationStatus;
  return STATUS_SYNONYMS[immigrationStatus] ?? null;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// Builds the two lookup maps materialize() uses to decide, per item,
// whether the user already has this exact task (template_item_id — the
// same status generated again) or this same real-world action under a
// DIFFERENT status's wording (canonical_key — see
// 009_task_canonical_keys.sql for why title text can't be used for this).
function buildExistingMaps(existingNodes) {
  const byTemplateItemId = new Map();
  const byCanonicalKey = new Map();
  for (const n of existingNodes) {
    if (n.template_item_id != null) byTemplateItemId.set(n.template_item_id, n.task_node_id);
    if (n.canonical_key != null) byCanonicalKey.set(n.canonical_key, n.task_node_id);
  }
  return { byTemplateItemId, byCanonicalKey };
}

// Walks task_hierarchy_template_items breadth-first, level by level, so
// each child's parent_id is always already known (mapped from the level
// above) before that child is inserted. This is what lets an arbitrarily
// deep template be materialized with plain sequential batch inserts
// instead of a single recursive CTE that would need to invent new ids
// mid-query. Shared by both onboarding and compliance generation below —
// the only difference between them is which template/items are passed in.
//
// Every item in the template is visited on every call — there is no
// "already generated, skip everything" shortcut. Each item is instead
// individually matched against existingMaps: a match means the user
// already has this task (either literally, or as the same real-world
// action under a different status), so it's left completely untouched —
// its EXISTING node id feeds the parent-wiring map so children of an
// already-satisfied parent still land in the right place — and only
// items with no match get freshly inserted. This is what makes it safe to
// call this on every status change (or even redundantly, e.g. on every
// task-tree load): re-running the same status is a full no-op, switching
// status adds exactly the new items, and nothing already in progress or
// completed is ever reset.
async function materialize(supabase, userId, template, items, arrivalDate, existingMaps) {
  const byParent = new Map();
  for (const item of items) {
    const key = item.parent_item_id ?? "root";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }

  const itemIdToNodeId = new Map();
  let level = byParent.get("root") ?? [];
  let generated = 0;
  let skipped = 0;

  while (level.length > 0) {
    const toInsert = [];
    for (const item of level) {
      const existingId =
        (item.canonical_key != null ? existingMaps.byCanonicalKey.get(item.canonical_key) : undefined) ??
        existingMaps.byTemplateItemId.get(item.item_id);
      if (existingId != null) {
        itemIdToNodeId.set(item.item_id, existingId);
        skipped += 1;
      } else {
        toInsert.push(item);
      }
    }

    if (toInsert.length > 0) {
      const rows = toInsert.map((item) => ({
        user_id: userId,
        parent_id: item.parent_item_id != null ? itemIdToNodeId.get(item.parent_item_id) ?? null : null,
        title: item.title,
        description: item.description,
        node_type: "SYSTEM",
        source: "TEMPLATE",
        priority: item.priority ?? "NORMAL",
        task_category: item.task_category ?? "GENERAL",
        due_date:
          item.default_due_offset_days != null && arrivalDate
            ? addDays(arrivalDate, item.default_due_offset_days)
            : null,
        due_date_is_manual: false,
        template_item_id: item.item_id,
        canonical_key: item.canonical_key ?? null,
        sort_order: item.sort_order,
      }));

      const created = await taskNodeRepo.insertMany(supabase, rows);
      generated += created.length;
      created.forEach((node, i) => itemIdToNodeId.set(toInsert[i].item_id, node.task_node_id));
    }

    const nextLevel = [];
    for (const item of level) {
      nextLevel.push(...(byParent.get(item.item_id) ?? []));
    }
    level = nextLevel;
  }

  return { generated, skipped, templateId: template.template_id, templateVersion: template.version };
}

async function generateTasksForUser(supabase, userId, immigrationStatus, arrivalDate) {
  const category = resolveCategory(immigrationStatus);
  if (!category) return { generated: 0, reason: "no_template_for_category" };

  const template = await templateRepo.findActiveByCategory(supabase, category);
  if (!template) return { generated: 0, reason: "no_active_template" };

  const items = await templateRepo.findItemsByTemplate(supabase, template.template_id);
  if (items.length === 0) return { generated: 0, reason: "empty_template" };

  const existing = await taskNodeRepo.findAllByUser(supabase, userId);
  const result = await materialize(supabase, userId, template, items, arrivalDate, buildExistingMaps(existing));
  return result.generated === 0 ? { ...result, reason: "up_to_date" } : result;
}

// Compliance rules are also status-specific (see
// backend/db/init/004_task_hierarchy_compliance.sql) but generated as a
// separate template "kind" from onboarding, so a user ends up with both
// sets rather than one replacing the other. No arrival-date offsets —
// compliance rules don't have a natural due date until the user sets one.
async function generateComplianceTasksForUser(supabase, userId, immigrationStatus) {
  const category = resolveCategory(immigrationStatus);
  if (!category) return { generated: 0, reason: "no_template_for_category" };

  const template = await templateRepo.findActiveByCategory(supabase, category, "COMPLIANCE");
  if (!template) return { generated: 0, reason: "no_active_template" };

  const items = await templateRepo.findItemsByTemplate(supabase, template.template_id);
  if (items.length === 0) return { generated: 0, reason: "empty_template" };

  const existing = await taskNodeRepo.findAllByUser(supabase, userId);
  const result = await materialize(supabase, userId, template, items, null, buildExistingMaps(existing));
  return result.generated === 0 ? { ...result, reason: "up_to_date" } : result;
}

async function createTemplate(supabase, adminUserId, input) {
  return templateRepo.create(supabase, {
    name: input.name,
    user_category: input.userCategory,
    description: input.description ?? null,
    version: input.version ?? 1,
    is_active: input.isActive ?? true,
    created_by_admin: adminUserId,
  });
}

async function createTemplateItems(supabase, templateId, items) {
  const rows = items.map((it, i) => ({
    template_id: templateId,
    parent_item_id: it.parentItemId ?? null,
    title: it.title,
    description: it.description ?? null,
    default_due_offset_days: it.defaultDueOffsetDays ?? null,
    sort_order: it.sortOrder ?? i,
  }));
  return templateRepo.createItems(supabase, rows);
}

module.exports = {
  resolveCategory,
  generateTasksForUser,
  generateComplianceTasksForUser,
  createTemplate,
  createTemplateItems,
  listAll: templateRepo.findAll,
};
