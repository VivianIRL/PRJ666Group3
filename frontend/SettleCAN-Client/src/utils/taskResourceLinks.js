// taskResourceLinks.js — maps a task to the one information resource page
// most relevant to it, for the "related resource" banner on an expanded
// task card. Keyed primarily off canonicalKey (curated, stable across the
// 5 immigration statuses' differently-worded template items — see
// backend/db/init/009_task_canonical_keys.sql / 010_task_category_canonical_keys.sql)
// with a title-keyword fallback for tasks that have no canonicalKey
// (custom user tasks, and template items 009/010 never keyed). Unlike
// NotificationsProvider.jsx's deriveGuideUrl(), this deliberately returns
// null instead of a generic fallback — no confident match means no banner,
// per the "if that task maps to a resource" requirement.

const BY_CANONICAL_KEY = {
  sin_application:              { path: "/guides/sin",          label: "Apply for a Social Insurance Number" },
  bank_account:                 { path: "/guides/bank-account", label: "Opening a Canadian bank account" },
  provincial_health_coverage:   { path: "/guides/health-card",  label: "Registering for provincial health coverage" },
  category_housing:             { path: "/housing",             label: "Housing support" },
  housing_utilities:            { path: "/housing",             label: "Housing support" },
  housing_tenant_insurance:     { path: "/housing",             label: "Housing support" },
  housing_secure_permanent:     { path: "/housing",             label: "Housing support" },
  finance_file_taxes:           { path: "/guides/tax-return",   label: "Filing your Canadian tax return" },
  compliance_maintain_status:   { path: "/compliance",          label: "Your compliance requirements" },
  compliance_report_address_change: { path: "/ircc",            label: "Reporting changes to IRCC" },
  compliance_no_criminal_offence:   { path: "/compliance",      label: "Your compliance requirements" },
};

// Ordered — first match wins — for tasks with no canonicalKey.
const BY_TITLE_KEYWORD = [
  { test: /\bsin\b|social insurance/i,                       path: "/guides/sin",          label: "Apply for a Social Insurance Number" },
  { test: /\bbank\b|\baccount\b/i,                            path: "/guides/bank-account", label: "Opening a Canadian bank account" },
  { test: /health (card|insurance|coverage)|\bohip\b|\bmsp\b|\bifhp\b/i, path: "/guides/health-card", label: "Health coverage in Canada" },
  { test: /work permit/i,                                     path: "/info/work-permit",    label: "Work Permits in Canada" },
  { test: /study permit|\bpgwp\b|co-?op work permit/i,         path: "/guides/permit-renewal", label: "Managing your permit" },
  { test: /\btax(es)?\b|\bt4\b|\bcra\b/i,                      path: "/guides/tax-return",   label: "Filing your Canadian tax return" },
  { test: /housing|\brent\b|\blease\b|tenant/i,                path: "/housing",             label: "Housing support" },
  { test: /express entry|\bpnp\b|\bpr card\b|permanent resid|citizenship/i, path: "/pr-pathway", label: "Your PR pathway" },
  { test: /ielts|celpip|language (score|test|classes)/i,       path: "/info/language",       label: "Language requirements" },
  { test: /\birb\b|\bircc\b|address change/i,                  path: "/ircc",                label: "IRCC requirements" },
];

export function getTaskResource(task) {
  if (!task) return null;
  if (task.canonicalKey && BY_CANONICAL_KEY[task.canonicalKey]) {
    return BY_CANONICAL_KEY[task.canonicalKey];
  }
  const title = task.title ?? "";
  const match = BY_TITLE_KEYWORD.find((entry) => entry.test.test(title));
  return match ? { path: match.path, label: match.label } : null;
}
