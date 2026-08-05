import { createRoot } from "react-dom/client";

// Bootstrap CSS — required for Modals, Badges, Tables, ProgressBar, etc.
import "bootstrap/dist/css/bootstrap.min.css";

// Brand color tokens (CSS custom properties) — loaded once here so
// var(--color-primary) resolves everywhere, including inline JS styles.
import "./scss/_designTokens.scss";

import Center from "./Center.jsx";

createRoot(document.getElementById("root")).render(
  <Center/>
);