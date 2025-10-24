import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { finishOAuthLogin } from "./api";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const token = hash.get("token");

      try {
        await finishOAuthLogin(token);
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error(e);
        navigate("/login?oauth=failed", { replace: true });
      }
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Signing you in…</div>;
}