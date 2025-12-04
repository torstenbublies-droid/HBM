import { useState, useEffect } from 'react';

declare global {
  interface Window {
    OneSignal?: any;
  }
}

/**
 * Hook to get and store OneSignal Player ID
 * Returns the player ID from OneSignal or localStorage
 * 
 * NOTE: OneSignal is already initialized in index.html,
 * so we just need to get the Player ID, not initialize again!
 */
export function useOneSignalPlayerId() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPlayerId = async () => {
      try {
        // First check localStorage
        const storedPlayerId = localStorage.getItem('oneSignalPlayerId');
        if (storedPlayerId) {
          console.log('[useOneSignalPlayerId] Found in localStorage:', storedPlayerId);
          setPlayerId(storedPlayerId);
          setIsLoading(false);
        }

        // Wait for OneSignal to be ready (it's initialized in index.html)
        if (window.OneSignal) {
          // Don't call init() again! OneSignal is already initialized
          // Just wait for it to be ready and get the Player ID
          
          // Check if User object is available
          if (window.OneSignal.User && window.OneSignal.User.PushSubscription) {
            const id = window.OneSignal.User.PushSubscription.id;
            if (id) {
              console.log('[useOneSignalPlayerId] Got Player ID from OneSignal:', id);
              setPlayerId(id);
              localStorage.setItem('oneSignalPlayerId', id);
            } else {
              console.log('[useOneSignalPlayerId] No Player ID yet (user not subscribed)');
            }
          } else {
            console.log('[useOneSignalPlayerId] OneSignal User object not ready yet');
            
            // Retry after a delay
            setTimeout(async () => {
              try {
                if (window.OneSignal?.User?.PushSubscription?.id) {
                  const id = window.OneSignal.User.PushSubscription.id;
                  console.log('[useOneSignalPlayerId] Got Player ID on retry:', id);
                  setPlayerId(id);
                  localStorage.setItem('oneSignalPlayerId', id);
                }
              } catch (e) {
                console.error('[useOneSignalPlayerId] Error on retry:', e);
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error('[useOneSignalPlayerId] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getPlayerId();
  }, []);

  return { playerId, isLoading };
}

