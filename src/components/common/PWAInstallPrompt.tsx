import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "musicscan-install-dismissed-until";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

const isStandaloneMode = () => {
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(iosStandalone);
};

const isMobileViewport = () => window.matchMedia("(max-width: 768px)").matches;

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isDismissed = useMemo(() => {
    const dismissedUntil = Number(window.localStorage.getItem(DISMISS_KEY) || "0");
    return dismissedUntil > Date.now();
  }, []);

  useEffect(() => {
    if (isStandaloneMode() || !isMobileViewport() || isDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      window.localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsVisible(false);
      window.localStorage.removeItem(DISMISS_KEY);
    }

    setDeferredPrompt(null);
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md card p-3">
        <p className="text-sm text-white mb-3">Install and play it like a full-screen app.</p>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-info flex-1" onClick={handleInstall}>
            Install
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDismiss}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
