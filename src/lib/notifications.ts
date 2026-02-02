import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

export async function scheduleStreakReminder(
  hour: number,
  minute: number,
  currentStreak: number
): Promise<void> {
  // Cancel existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const messages = currentStreak > 0 ? STREAK_MESSAGES : GENERIC_MESSAGES;
  const message = messages[Math.floor(Math.random() * messages.length)].replace(
    '{streak}',
    String(currentStreak)
  );

  await Notifications.scheduleNotificationAsync({
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
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
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

  // Check if it's past 8pm already
  const now = new Date();
  if (now.getHours() >= 20) {
    // It's past 8pm, send immediate notification
    const messages = STREAK_AT_RISK_MESSAGES;
    const message = messages[Math.floor(Math.random() * messages.length)].replace(
      '{streak}',
      String(currentStreak)
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Streak at Risk!',
        body: message,
        sound: true,
      },
      trigger: null, // Immediate
    });
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
    await Notifications.scheduleNotificationAsync({
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
  }
}

/**
 * Cancel streak at risk reminders (call when user completes a reading)
 */
export async function cancelStreakAtRiskReminder(): Promise<void> {
  // Get all scheduled notifications and cancel the streak risk ones
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.title === 'Streak at Risk!') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
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
