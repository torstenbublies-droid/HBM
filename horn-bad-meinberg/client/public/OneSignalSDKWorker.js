// OneSignal Service Worker - Simple approach
// Just forward notifications to the frontend, let frontend handle saving
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

console.log('[Service Worker] OneSignal Service Worker initialized');

// Listen for push events
self.addEventListener('push', async function(event) {
  console.log('[Service Worker] 📨 Push event received');
  
  let title = 'Schieder-Schwalenberg';
  let body = 'Neue Nachricht';
  let data = null;
  
  try {
    if (event.data) {
      const payload = event.data.json();
      console.log('[Service Worker] Push payload:', payload);
      
      title = payload.title || payload.heading || title;
      body = payload.body || payload.message || payload.alert || body;
      data = payload.data || payload.additionalData || payload.custom || payload;
    }
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e);
  }
  
  // Notify all open tabs about the new notification
  // The frontend will handle saving to database
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      console.log('[Service Worker] Notifying', clients.length, 'client(s)');
      
      clients.forEach(client => {
        client.postMessage({
          type: 'PUSH_NOTIFICATION_RECEIVED',
          title: title,
          body: body,
          data: data,
          timestamp: Date.now(),
        });
      });
    })()
  );
});

// Listen for notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();
  
  const urlToOpen = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : self.location.origin + '/notifications';
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

