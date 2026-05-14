// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import useAuthStore from "./store/authStore";
import "./styles/global.css";
import "./pages/LoginPage.css";

// ← AÑADE ESTO: aplicar tema antes de renderizar
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
}

function Root() {
  const init = useAuthStore((s) => s.init);
  React.useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <PrivateRoute>
            <App />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);