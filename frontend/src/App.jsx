import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";

const THEME_STORAGE_KEY = "baithak-theme";
const NOTICE_STORAGE_KEY = "baithak-v1-notice-dismissed";

function readStoredUser() {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const user = readStoredUser();
  return user?.is_admin ? <Outlet /> : <Navigate to="/chat" replace />;
}

function PublicRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/chat" replace /> : children;
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button type="button" className="theme-toggle" onClick={onToggle}>
      <span className="theme-toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
      <span className="theme-toggle-icon">{theme === "dark" ? "☾" : "☀"}</span>
    </button>
  );
}

function V1Notice({ onClose }) {
  return (
    <div className="notice-backdrop" role="presentation">
      <div className="notice-modal" role="dialog" aria-modal="true" aria-labelledby="baithak-v1-title">
        <p className="eyebrow">Baithak v1</p>
        <h2 id="baithak-v1-title">A calm room works best with kind voices.</h2>
        <p>
          This first public Baithak is ready for rooms, direct messages, uploads, presence,
          and notifications while the foundation continues to mature.
        </p>
        <p>
          Keep the conversation respectful, share thoughtfully, and let the space stay easy
          for everyone gathered here.
        </p>
        <div className="notice-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Got it
          </button>
          <button type="button" className="primary-button" onClick={onClose}>
            Enter Baithak
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const initialTheme = useMemo(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" ? "dark" : "light";
  }, []);
  const [theme, setTheme] = useState(initialTheme);
  const [showNotice, setShowNotice] = useState(() => !localStorage.getItem(NOTICE_STORAGE_KEY));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function dismissNotice() {
    localStorage.setItem(NOTICE_STORAGE_KEY, "true");
    setShowNotice(false);
  }

  const showFloatingThemeToggle = location.pathname !== "/chat";

  return (
    <>
      {showFloatingThemeToggle ? <ThemeToggle theme={theme} onToggle={toggleTheme} /> : null}
      {showNotice ? <V1Notice onClose={dismissNotice} /> : null}

      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={<Navigate to="/login" replace />}
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat theme={theme} onToggleTheme={toggleTheme} />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </>
  );
}
