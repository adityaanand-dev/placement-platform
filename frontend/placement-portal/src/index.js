import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Amplify } from "aws-amplify"; // 🟢 Added to ensure AWS configurations initialization works seamlessly

// Minimal global reset — no CSS file needed
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F8F7FF; -webkit-font-smoothing: antialiased; }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font-family: inherit; }
  @media print {
    aside, nav { display: none !important; }
    main { margin: 0 !important; padding: 1rem !important; }
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);