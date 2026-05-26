"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            // Check for updates periodically
            registration.addEventListener("updatefound", () => {
              const worker = registration.installing;
              if (!worker) return;
              worker.addEventListener("statechange", () => {
                if (
                  worker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New version available — could show an update toast here
                  console.log("SKINZ: New version available. Refresh to update.");
                }
              });
            });
          })
          .catch((err) => {
            // SW registration failed — app still works, just no offline support
            console.warn("SW registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
