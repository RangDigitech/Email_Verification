// src/AdminProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkAdminStatus, getMe } from "./api";

export default function AdminProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) quick local check (optional): if you cached from a previous session
        const localAdmin = localStorage.getItem("is_admin");
        if (localAdmin === "true") {
          if (mounted) {
            setAllowed(true);
            setLoading(false);
            return;
          }
        }

        // 2) authoritative check from backend (/me must return is_admin)
        const isAdmin = await checkAdminStatus(); // uses authHeaders() internally
        if (mounted) {
          setAllowed(isAdmin === true);
          setLoading(false);
        }

        // 3) cache result to speed up next mount (optional)
        try {
          const me = await getMe();
          if (me && typeof me.is_admin === "boolean") {
            localStorage.setItem("is_admin", me.is_admin ? "true" : "false");
          }
        } catch {}
      } catch {
        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>Checking admin access…</div>
    );
  }

  if (!allowed) {
    // not admin? send back to dashboard or login
    const hasToken =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    return (
      <Navigate
        to={hasToken ? "/dashboard" : "/login"}
        replace
        state={{ from: location, reason: "admin_required" }}
      />
    );
  }

  return children;
}
