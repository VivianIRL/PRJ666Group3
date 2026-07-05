import { createRoot } from "react-dom/client";

// Bootstrap CSS — required for Modals, Badges, Tables, ProgressBar, etc.
import "bootstrap/dist/css/bootstrap.min.css";

import Center from "./Center.jsx";

createRoot(document.getElementById("root")).render(
  <Center/>
);