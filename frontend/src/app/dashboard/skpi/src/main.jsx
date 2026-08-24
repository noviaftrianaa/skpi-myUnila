import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LockProvider } from "./contexts/LockContext";
import "./index.css";

const basename = window.location.pathname.startsWith("/dashboard/skpi")
  ? "/dashboard/skpi"
  : "/";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <LockProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </LockProvider>
    </ThemeProvider>
  </React.StrictMode>
);
