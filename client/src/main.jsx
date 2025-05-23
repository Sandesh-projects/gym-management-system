// client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Import the main App component
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./index.css"; // Import your custom global CSS (if you have one)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
