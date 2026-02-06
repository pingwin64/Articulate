import * as Notifications from 'expo-notifications';
import { createMMKV } from 'react-native-mmkv';

// Persist notification IDs in MMKV to survive app restarts
const notifStorage = createMMKV({ id: 'articulate-notifications' });

function getDailyReminderId(): string | null {
  return notifStorage.getString('dailyReminderId') ?? null;
}
function setDailyReminderId(id: string | null) {
  if (id) {
    notifStorage.set('dailyReminderId', id);
  } else {
    notifStorage.remove('dailyReminderId');
  }
}

function getStreakAtRiskId(): string | null {
  return notifStorage.getString('streakAtRiskId') ?? null;
}
function setStreakAtRiskId(id: string | null) {
  if (id) {
    notifStorage.set('streakAtRiskId', id);
  } else {
    notifStorage.remove('streakAtRiskId');
  }
}

const STREAK_MESSAGES = [
  "Don't lose your {streak}-day streak! A quick read keeps it alive.",
  'Your streak is at {streak} days. Keep the momentum going!',
  "You've been consistent for {streak} days. Time to read!",
  'Your reading habit is growing. Day {streak} awaits!',
  'A few minutes of reading is all it takes. Protect your {streak}-day streak.',
];

const GENERIC_MESSAGES = [
  'Time for your daily reading practice.',
  'Your words are waiting. Start a quick read.',
  'Build your reading muscles — one session a day.',
  'Focused reading time. Open Articulate.',
  'A few minutes now, sharper reading skills forever.',
];

const STREAK_AT_RISK_MESSAGES = [
  "Your {streak}-day streak is at risk! Read now to keep it alive.",
  "Don't let your {streak}-day streak slip away. Just one read!",
  "Warning: Your streak ends at midnight. Protect your {streak} days!",
  "Quick reminder: You haven't read today. Your {streak}-day streak needs you!",
];

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Clean up orphaned notifications on app launch.
 * Cancels any scheduled notifications that don't match our persisted IDs.
 */
export async function cleanupOrphanedNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const knownIds = new Set<string>();
    const dailyId = getDailyReminderId();
    const riskId = getStreakAtRiskId();
    if (dailyId) knownIds.add(dailyId);
    if (riskId) knownIds.add(riskId);

    for (const notif of scheduled) {
      if (!knownIds.has(notif.identifier)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch {
    // Notification cleanup may fail on some devices
  }
}

export async function scheduleStreakReminder(
  hour: number,
  minute: number,
  currentStreak: number
): Promise<void> {
  // Cancel previous daily reminder by persisted ID
  const prevId = getDailyReminderId();
  if (prevId) {
    await Notifications.cancelScheduledNotificationAsync(prevId).catch((e) => { if (__DEV__) console.warn('[Notifications] Failed to cancel daily reminder:', e); });
    setDailyReminderId(null);
  }

  const messages = currentStreak > 0 ? STREAK_MESSAGES : GENERIC_MESSAGES;
  const message = messages[Math.floor(Math.random() * messages.length)].replace(
    '{streak}',
    String(currentStreak)
  );

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Articulate',
      body: message,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  setDailyReminderId(id);
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  setDailyReminderId(null);
  setStreakAtRiskId(null);
}

/**
 * Schedule a "streak at risk" notification for 8pm if user hasn't read today.
 * Call this on app launch to check if they need a reminder.
 */
export async function scheduleStreakAtRiskReminder(
  currentStreak: number,
  lastReadDate: string | null
): Promise<void> {
  // Only schedule if user has an active streak
  if (currentStreak < 1) return;

  // Check if user has already read today
  if (lastReadDate) {
    const lastRead = new Date(lastReadDate);
    const now = new Date();
    const isSameDay =
      lastRead.getDate() === now.getDate() &&
      lastRead.getMonth() === now.getMonth() &&
      lastRead.getFullYear() === now.getFullYear();

    // Already read today, no need for risk reminder
    if (isSameDay) return;
  }

  // Cancel any previous streak-at-risk notification by persisted ID
  const prevId = getStreakAtRiskId();
  if (prevId) {
    await Notifications.cancelScheduledNotificationAsync(prevId).catch((e) => { if (__DEV__) console.warn('[Notifications] Failed to cancel streak-at-risk:', e); });
    setStreakAtRiskId(null);
  }

  // Check if it's past 8pm already
  const now = new Date();
  if (now.getHours() >= 20) {
    // It's past 8pm, send immediate notification
    const messages = STREAK_AT_RISK_MESSAGES;
    const message = messages[Math.floor(Math.random() * messages.length)].replace(
      '{streak}',
      String(currentStreak)
    );

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Streak at Risk!',
        body: message,
        sound: true,
      },
      trigger: null, // Immediate
    });
    setStreakAtRiskId(id);
    return;
  }

  // Schedule for 8pm today
  const messages = STREAK_AT_RISK_MESSAGES;
  const message = messages[Math.floor(Math.random() * messages.length)].replace(
    '{streak}',
    String(currentStreak)
  );

  // Calculate seconds until 8pm
  const eightPM = new Date();
  eightPM.setHours(20, 0, 0, 0);
  const secondsUntil8PM = Math.floor((eightPM.getTime() - now.getTime()) / 1000);

  if (secondsUntil8PM > 0) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Streak at Risk!',
        body: message,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntil8PM,
      },
    });
    setStreakAtRiskId(id);
  }
}

/**
 * Cancel streak at risk reminders (call when user completes a reading)
 */
export async function cancelStreakAtRiskReminder(): Promise<void> {
  const id = getStreakAtRiskId();
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch((e) => { if (__DEV__) console.warn('[Notifications] Failed to cancel streak-at-risk:', e); });
    setStreakAtRiskId(null);
  }
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
