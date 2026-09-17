const fs = require('fs');

// --- Types ---
let types = fs.readFileSync('src/types.ts', 'utf8');
const notifType = `
export interface Notification {
  id: string;
  projectId?: string;
  projectName?: string;
  message: string;
  read: boolean;
  createdAt: string;
}
`;
if (!types.includes('export interface Notification')) {
  fs.writeFileSync('src/types.ts', types + notifType);
}

// --- Storage ---
let storage = fs.readFileSync('src/utils/storage.ts', 'utf8');

const importSearch = 'export function getYouTubeThumbnail';
const notifStorageCode = `const NOTIFICATIONS_STORAGE_KEY = "daniel_vale_notifications";

export function getNotifications(): import('../types').Notification[] {
  const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

export function saveNotifications(notifications: import('../types').Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
}

export function addNotification(notification: Omit<import('../types').Notification, 'id' | 'createdAt' | 'read'>): import('../types').Notification {
  const notifications = getNotifications();
  const newNotif: import('../types').Notification = {
    ...notification,
    id: Date.now().toString(),
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(newNotif);
  saveNotifications(notifications);
  
  // Custom event to trigger updates across windows/tabs
  window.dispatchEvent(new Event('notificationsUpdated'));
  return newNotif;
}

export function markNotificationsAsRead(): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
  window.dispatchEvent(new Event('notificationsUpdated'));
}

`;

if (!storage.includes('NOTIFICATIONS_STORAGE_KEY')) {
  storage = storage.replace(importSearch, notifStorageCode + importSearch);
  fs.writeFileSync('src/utils/storage.ts', storage);
}

