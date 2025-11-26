// src/CreditsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { apiUrl } from "./api";

const Ctx = createContext(null);
export const useCredits = () => useContext(Ctx);

function authHeaders() {
  const t =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function CreditsProvider({ children }) {
  const [credits, setCredits] = useState(null);

  async function load() {
     try {
      // helper that uses current localStorage token (avoids stale in-memory state)
      const doFetch = async () => {
        return fetch(apiUrl("/me/credits"), {
          method: "GET",
          headers: { ...authHeaders(), Accept: "application/json" },
          credentials: "include",
          cache: "no-cache",
        });
      };

      // first attempt
      let res = await doFetch();

      // If we get 401 but a token exists, it's likely a race — retry once after a short delay
      if (res && res.status === 401) {
        const t =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("auth_token") ||
          localStorage.getItem("token");
        if (t) {
          await new Promise((r) => setTimeout(r, 150));
          res = await doFetch();
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        setCredits(data);
        if (typeof data.remaining_credits === "number") {
          localStorage.setItem("credits", String(data.remaining_credits));
        }
      } else {
        // not ok (including 401 after retry) — clear credits to avoid stale UI
        setCredits(null);
      }
    } catch (err) {
      console.warn("[Credits] load error:", err);
      setCredits(null);
    }
  }

  useEffect(() => { load(); }, []);          // load on mount
  return <Ctx.Provider value={{ credits, refreshCredits: load }}>{children}</Ctx.Provider>;
}
