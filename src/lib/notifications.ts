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
