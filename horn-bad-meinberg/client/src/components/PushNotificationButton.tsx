import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Bell, BellOff } from 'lucide-react';

declare global {
  interface Window {
    OneSignal?: any;
  }
}

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!('Notification' in window)) return;
    
    const permission = Notification.permission;
    setIsSubscribed(permission === 'granted');
  };

  const handleEnable = async () => {
    setIsLoading(true);
    
    try {
      if (!('Notification' in window)) {
        alert('Dein Browser unterstützt keine Push-Benachrichtigungen.');
        setIsLoading(false);
        return;
      }

      const currentPermission = Notification.permission;

      if (currentPermission === 'denied') {
        alert('Benachrichtigungen sind blockiert. Bitte erlaube sie in den Browser-Einstellungen.');
        setIsLoading(false);
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Subscribe to OneSignal
        if (window.OneSignal) {
          try {
            await window.OneSignal.Notifications.requestPermission();
            setIsSubscribed(true);
            alert('Benachrichtigungen aktiviert! 🎉');
          } catch (error) {
            console.error('[Push] OneSignal error:', error);
          }
        }
      }
    } catch (error) {
      console.error('[Push] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    
    try {
      if (window.OneSignal) {
        // Opt out from OneSignal
        await window.OneSignal.User.PushSubscription.optOut();
        setIsSubscribed(false);
        alert('Benachrichtigungen deaktiviert. Du erhältst keine Push-Benachrichtigungen mehr.');
      }
    } catch (error) {
      console.error('[Push] Error disabling:', error);
      alert('Fehler beim Deaktivieren. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDisable}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>⏳ Lädt...</>
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
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>⏳ Lädt...</>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Aktivieren
        </>
      )}
    </Button>
  );
}

