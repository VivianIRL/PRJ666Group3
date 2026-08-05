// templateDto.js — shapes task_hierarchy_templates (+ nested items) for the wire.

function toTemplateItemDto(item) {
  return {
    id: item.item_id,
    parentItemId: item.parent_item_id,
    title: item.title,
    description: item.description,
    defaultDueOffsetDays: item.default_due_offset_days,
    sortOrder: item.sort_order,
  };
}

function toTemplateDto(template) {
  return {
    id: template.template_id,
    name: template.name,
    userCategory: template.user_category,
    description: template.description,
    version: template.version,
    isActive: template.is_active,
    createdAt: template.created_at,
    items: Array.isArray(template.task_hierarchy_template_items)
      ? template.task_hierarchy_template_items.map(toTemplateItemDto)
      : undefined,
  };
}

module.exports = { toTemplateDto, toTemplateItemDto };
