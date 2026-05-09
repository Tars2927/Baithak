import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleScriptPromise = null;

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in a browser."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

function getErrorMessage(requestError, fallbackMessage) {
  const detail = requestError.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return detail?.message || fallbackMessage;
}

export default function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [error, setError] = useState("");
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const isGoogleConfigured = Boolean(googleClientId);

  const handleGoogleCredential = useCallback(
    async (credentialResponse) => {
      const credential = credentialResponse?.credential;

      if (!credential) {
        setError("Google did not return a sign-in credential.");
        return;
      }

      setError("");
      setIsSubmitting(true);

      try {
        const response = await api.post("/auth/google", { credential });
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/chat", { replace: true });
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Google sign-in failed. Please try again with your Google account.",
          ),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    let isMounted = true;

    if (!isGoogleConfigured) {
      setError("Google sign-in is not configured yet.");
      setIsGoogleReady(false);
      return undefined;
    }

    async function setupGoogleSignIn() {
      setError("");
      setIsGoogleReady(false);

      try {
        await loadGoogleIdentityScript();

        if (!isMounted || !googleButtonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
          ux_mode: "popup",
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "signin_with",
          logo_alignment: "left",
          width: Math.min(360, Math.max(240, googleButtonRef.current.offsetWidth || 320)),
        });

        setIsGoogleReady(true);
      } catch {
        if (isMounted) {
          setError("Google sign-in could not be loaded right now.");
          setIsGoogleReady(false);
        }
      }
    }

    setupGoogleSignIn();

    return () => {
      isMounted = false;
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
    };
  }, [googleClientId, handleGoogleCredential, isGoogleConfigured]);

  return (
    <main className="login-shell">
      <section className="login-showcase" aria-hidden="true">
        <div className="login-showcase-frame">
          <div className="login-showcase-topline">
            <div className="login-showcase-mark">
              <img src="/baithak-logo.svg" alt="" />
            </div>
            <span>Namaste, settle in</span>
          </div>

          <div className="login-showcase-ornament">
            <div className="login-showcase-ornament-ring" />
            <div className="login-showcase-ornament-core">
              <img src="/baithak-logo.svg" alt="" />
            </div>
          </div>

          <div className="login-showcase-copy">
            <p className="login-showcase-kicker">A softer digital baithak</p>
            <h1>Baithak</h1>
            <p>Quiet rooms, familiar faces, and conversations that feel closer to a calm evening adda.</p>
            <div className="login-showcase-chips">
              <span>Private rooms</span>
              <span>Live presence</span>
              <span>Gentle reminders</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="login-brand-lockup">
            <img src="/baithak-logo.svg" alt="" />
            <div>
              <div className="login-brand">baithak</div>
              <span>Made for small, trusted circles</span>
            </div>
          </div>

          <div className="login-intro">
            <p className="eyebrow">Welcome back</p>
            <h2>Enter your conversation courtyard.</h2>
            <p>Your Google name and photo will start your Baithak profile, so the room feels human from the first hello.</p>
          </div>

          <div className="login-google-panel">
            {isGoogleConfigured ? (
              <div
                className={`login-google-button${isSubmitting ? " disabled" : ""}`}
                aria-busy={!isGoogleReady || isSubmitting}
              >
                <div ref={googleButtonRef} />
                {!isGoogleReady && !error ? (
                  <span className="login-google-placeholder">Preparing Google sign-in...</span>
                ) : null}
              </div>
            ) : (
              <div className="login-google-unavailable" aria-disabled="true">
                Google sign-in unavailable
              </div>
            )}

            {isSubmitting ? (
              <div className="login-status login-status-success">
                <span>Signing you in with Google...</span>
              </div>
            ) : null}

            {error ? (
              <div className="login-status login-status-error">
                <span>{error}</span>
              </div>
            ) : null}
          </div>

          <div className="login-meta-links">
            <span>Google OAuth</span>
            <span>No password needed</span>
            <span>Admin approved</span>
          </div>
        </div>
      </section>
    </main>
  );
}
