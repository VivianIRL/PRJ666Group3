// taskNodeDto.js — shapes task_nodes rows for the wire (camelCase,
// DB columns hidden) and parses the create-task request body.

function toTaskNodeDto(node) {
  return {
    id: node.task_node_id,
    parentId: node.parent_id,
    title: node.title,
    description: node.description,
    type: node.node_type,
    category: node.task_category,
    source: node.source,
    status: node.status,
    priority: node.priority,
    dueDate: node.due_date,
    dueDateIsManual: node.due_date_is_manual,
    templateItemId: node.template_item_id,
    canonicalKey: node.canonical_key,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
    children: Array.isArray(node.children) ? node.children.map(toTaskNodeDto) : undefined,
  };
}

function fromCreateTaskRequest(body) {
  return {
    title: body.title,
    description: body.description,
    dueDate: body.dueDate ?? null,
    priority: body.priority,
    parentId: body.parentId ?? null,
  };
}

module.exports = { toTaskNodeDto, fromCreateTaskRequest };
