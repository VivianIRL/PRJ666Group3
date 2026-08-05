// guideChecklist.js — localStorage persistence for the document checklist
// on each step-by-step guide page (SINGuide, BankAccountGuide,
// HealthCardGuide, PermitRenewalGuide, TaxReturnGuide). Same pattern as
// documentAlerts.js: keyed by user ID so each user's checked state is
// independent and survives logout/login and page refreshes, not just
// held in component state that resets on navigation. Lives outside any
// component file so every guide page can import it without breaking React
// Fast Refresh.

const LS_KEY = (guideId, uid) => `settlecan_checklist_${guideId}_${uid ?? "guest"}`;

export function loadChecklist(guideId, uid) {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY(guideId, uid))) ?? {};
  } catch {
    return {};
  }
}

export function saveChecklist(guideId, uid, checked) {
  localStorage.setItem(LS_KEY(guideId, uid), JSON.stringify(checked));
}
