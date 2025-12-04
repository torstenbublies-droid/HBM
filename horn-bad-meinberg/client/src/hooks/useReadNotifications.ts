import { useState, useEffect } from 'react';

const STORAGE_KEY = 'read_push_notifications';

export function useReadNotifications() {
  const [readNotificationIds, setReadNotificationIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save to localStorage whenever readNotificationIds changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readNotificationIds)));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  }, [readNotificationIds]);

  const markAsRead = (notificationId: number) => {
    setReadNotificationIds(prev => new Set(prev).add(notificationId));
  };

  const markAllAsRead = (notificationIds: number[]) => {
    setReadNotificationIds(prev => {
      const newSet = new Set(prev);
      notificationIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const isRead = (notificationId: number) => {
    return readNotificationIds.has(notificationId);
  };

  const clearAll = () => {
    setReadNotificationIds(new Set());
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    readNotificationIds,
    markAsRead,
    markAllAsRead,
    isRead,
    clearAll,
  };
}
