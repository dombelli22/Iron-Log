import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
  document.getElementById("root").setAttribute("data-mounted", "true");
} catch (e) {
  if (window.showDiag) {
    window.showDiag("App crashed while starting", e && e.message ? e.message : String(e));
  } else {
    throw e;
  }
}
