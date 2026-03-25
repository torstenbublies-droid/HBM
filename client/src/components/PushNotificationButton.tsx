import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
declare global {
  interface Window {
    OneSignal?: any;
  }
}
const STORAGE_KEY = "push_notifications_enabled";
export function isPushNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  // Default to true if not set
  return stored === null ? true : stored === "true";
}
export function setPushNotificationsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  // Dispatch custom event so other components can react
  window.dispatchEvent(new CustomEvent("pushNotificationsStatusChanged", { detail: { enabled } }));
}
export default function PushNotificationButton() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    // Load initial state from localStorage
    setIsEnabled(isPushNotificationsEnabled());
    
    // Listen for changes from other components
    const handleStatusChange = (e: CustomEvent) => {
      setIsEnabled(e.detail.enabled);
    };
    
    window.addEventListener("pushNotificationsStatusChanged", handleStatusChange as EventListener);
    return () => {
      window.removeEventListener("pushNotificationsStatusChanged", handleStatusChange as EventListener);
    };
  }, []);
  const handleEnable = async () => {
    setIsLoading(true);
    try {
      if (!("Notification" in window)) {
        alert("Dein Browser unterstützt keine Push-Benachrichtigungen.");
        return;
      }
      const currentPermission = Notification.permission;
      
      if (currentPermission === "denied") {
        alert(
          "Benachrichtigungen sind blockiert. Bitte erlaube sie in den Browser-Einstellungen."
        );
        return;
      }
      // Enable notifications in our app
      setPushNotificationsEnabled(true);
      setIsEnabled(true);
      
      // Re-subscribe to OneSignal if available (important after optOut!)
      if (window.OneSignal?.User?.PushSubscription?.optIn) {
        try {
          const optInPromise = window.OneSignal.User.PushSubscription.optIn();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("timeout")), 5000)
          );
          await Promise.race([optInPromise, timeoutPromise]);
          console.log("[Push] OneSignal optIn successful");
        } catch (e) {
          console.log("[Push] OneSignal optIn timeout or error, continuing...");
        }
      }
      
      // Also try to request browser permission if not already granted
      if (currentPermission !== "granted") {
        try {
          const permissionPromise = Notification.requestPermission();
          const timeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error("timeout")), 5000)
          );
          await Promise.race([permissionPromise, timeoutPromise]);
        } catch (e) {
          // Ignore timeout - we've already enabled in our app
        }
      }
      
      alert("Benachrichtigungen aktiviert! Du erhältst jetzt Nachrichten.");
    } catch (error) {
      console.error("[Push] Error:", error);
      alert("Fehler beim Aktivieren. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDisable = async () => {
    setIsLoading(true);
    try {
      // Disable notifications in our app
      setPushNotificationsEnabled(false);
      setIsEnabled(false);
      
      // Try to opt out from OneSignal if available
      if (window.OneSignal?.User?.PushSubscription?.optOut) {
        try {
          const optOutPromise = window.OneSignal.User.PushSubscription.optOut();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("timeout")), 3000)
          );
          await Promise.race([optOutPromise, timeoutPromise]);
          console.log("[Push] OneSignal optOut successful");
        } catch (error) {
          console.log("[Push] OneSignal optOut timeout or error, continuing...");
        }
      }
      
      alert("Benachrichtigungen deaktiviert. Du erhältst keine Nachrichten mehr.");
    } catch (error) {
      console.error("[Push] Error disabling:", error);
      alert("Fehler beim Deaktivieren. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };
  if (isEnabled) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDisable}
        disabled={isLoading}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Lädt...
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4" />
            Deaktivieren
          </>
        )}
      </Button>
    );
  }
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleEnable}
      disabled={isLoading}
      className="flex items-center gap-2 whitespace-nowrap"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Lädt...
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Aktivieren
        </>
      )}
    </Button>
  );
}
