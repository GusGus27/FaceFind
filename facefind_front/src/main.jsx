import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext"; // 👈 importa aquí

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>   {/* 👈 mueve AuthProvider acá */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
