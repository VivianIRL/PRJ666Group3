// documentAlerts.js — the document list + localStorage persistence shared
// between DocumentAlerts.jsx (the page) and NotificationsProvider.jsx (the
// notification calendar). Lives outside any component file so both can
// import it without breaking React Fast Refresh.

// Persist document expiry dates in localStorage, keyed by user ID so each
// user's dates are stored independently.
export const LS_KEY = (uid) => `settlecan_docs_${uid ?? "guest"}`;

export function loadSavedDates(uid) {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY(uid))) ?? {};
  } catch {
    return {};
  }
}

export function saveDates(uid, dates) {
  localStorage.setItem(LS_KEY(uid), JSON.stringify(dates));
}

export const DEFAULT_DOCS = [
  {
    id: 1,
    name: "Study Permit",
    icon: "🎓",
    expiryDate: "",
    reminderDays: 90,
    category: "Immigration",
    required: true,
    note: "Apply to renew at least 90 days before expiry. Implied status applies while renewal is pending.",
  },
  {
    id: 2,
    name: "Post-Grad Work Permit (PGWP)",
    icon: "💼",
    expiryDate: "",
    reminderDays: 90,
    category: "Immigration",
    required: false,
    note: "PGWP cannot be renewed. Begin Express Entry or PNP process well before expiry.",
  },
  {
    id: 3,
    name: "Work Permit",
    icon: "💼",
    expiryDate: "",
    reminderDays: 90,
    category: "Immigration",
    required: false,
    note: "Apply for renewal before expiry. Confirm employer details match your permit.",
  },
  {
    id: 4,
    name: "Passport",
    icon: "📘",
    expiryDate: "",
    reminderDays: 180,
    category: "Identity",
    required: true,
    note: "Many countries require 6 months validity beyond travel dates. Renew early to avoid delays.",
  },
  {
    id: 5,
    name: "PR Card",
    icon: "🍁",
    expiryDate: "",
    reminderDays: 270,
    category: "PR",
    required: false,
    note: "PR card is valid for 5 years. You must be physically in Canada to renew. Apply 9+ months before expiry.",
  },
  {
    id: 6,
    name: "Provincial Health Card",
    icon: "🏥",
    expiryDate: "",
    reminderDays: 60,
    category: "Health",
    required: true,
    note: "Renewal requirements vary by province. OHIP (Ontario) cards expire every 5 years.",
  },
  {
    id: 7,
    name: "Co-op Work Permit",
    icon: "🔬",
    expiryDate: "",
    reminderDays: 60,
    category: "Immigration",
    required: false,
    note: "Must correspond to the co-op/internship dates in your Letter of Acceptance.",
  },
  {
    id: 8,
    name: "Visitor Record",
    icon: "✈️",
    expiryDate: "",
    reminderDays: 30,
    category: "Immigration",
    required: false,
    note: "If your visitor record is expiring and you need to stay, apply for an extension immediately.",
  },
];
