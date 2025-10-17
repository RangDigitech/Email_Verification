// src/CreditsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { apiUrl } from "./api";

const Ctx = createContext(null);
export const useCredits = () => useContext(Ctx);

function authHeaders() {
  const t = localStorage.getItem("accessToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function CreditsProvider({ children }) {
  const [credits, setCredits] = useState(null);

  async function load() {
    try {
      const res = await fetch(apiUrl("/me/credits"), {
        headers: { ...authHeaders(), Accept: "application/json" },
        credentials: "include",
        cache: "no-cache",
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
        if (typeof data.remaining_credits === "number") {
          localStorage.setItem("credits", String(data.remaining_credits));
        }
      }
    } catch {}
  }

  useEffect(() => { load(); }, []);          // load on mount
  return <Ctx.Provider value={{ credits, refreshCredits: load }}>{children}</Ctx.Provider>;
}
