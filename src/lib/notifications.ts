import * as Notifications from 'expo-notifications';
import { MMKV } from 'react-native-mmkv';

// Persist notification IDs in MMKV to survive app restarts
const notifStorage = new MMKV({ id: 'articulate-notifications' });

function getDailyReminderId(): string | null {
  return notifStorage.getString('dailyReminderId') ?? null;
}
function setDailyReminderId(id: string | null) {
  if (id) {
    notifStorage.set('dailyReminderId', id);
  } else {
    notifStorage.delete('dailyReminderId');
  }
}

function getStreakAtRiskId(): string | null {
  return notifStorage.getString('streakAtRiskId') ?? null;
}
function setStreakAtRiskId(id: string | null) {
  if (id) {
    notifStorage.set('streakAtRiskId', id);
  } else {
    notifStorage.delete('streakAtRiskId');
  }
}

function getWindDownReminderId(): string | null {
  return notifStorage.getString('windDownReminderId') ?? null;
}
function setWindDownReminderId(id: string | null) {
  if (id) {
    notifStorage.set('windDownReminderId', id);
  } else {
    notifStorage.delete('windDownReminderId');
  }
}

// ── Streak-tier message pools ──

const NEW_STREAK_MESSAGES = [
  'Day {streak} — the habit is forming. Keep it going!',
  "You're building something. Day {streak} of reading daily.",
  '{streak} days in. A few more and it becomes automatic.',
  "Day {streak}! You're off to a great start.",
  'Your reading habit is growing. Day {streak} awaits!',
];

const ESTABLISHED_STREAK_MESSAGES = [
  'Day {streak}. Readers like you don\'t skip.',
  '{streak} days of consistent reading. That\'s discipline.',
  "You've built a real habit. Day {streak} is waiting.",
  '{streak}-day streak. You read more than most people.',
  'Day {streak} — this is who you are now.',
];

const VETERAN_STREAK_MESSAGES = [
  '{streak} days. That\'s not a streak, that\'s a lifestyle.',
  'Day {streak}. At this point, reading is just what you do.',
  '{streak} days strong. You\'re in rare company.',
  'Day {streak} — most people quit by day 7. You didn\'t.',
  '{streak}-day streak. Your future self thanks you.',
];

const GENERIC_MESSAGES = [
  'Your words miss you. Just a 2-minute read.',
  'Start a new streak today. One read is all it takes.',
  'Time for a fresh start. Open Articulate.',
  'A quick read today could be day 1 of something great.',
  'Pick up where you left off. Your words are waiting.',
];

function getStreakMessages(streak: number): string[] {
  if (streak >= 30) return VETERAN_STREAK_MESSAGES;
  if (streak >= 7) return ESTABLISHED_STREAK_MESSAGES;
  return NEW_STREAK_MESSAGES;
}

const WIND_DOWN_MESSAGES = [
  'Your wind-down reading is ready.',
  "Tonight's reading awaits.",
  'A few quiet minutes before sleep.',
  'Time to unwind with a calm read.',
  'Your bedtime reading is waiting.',
];

const WORD_OF_DAY_MESSAGES = [
  'Word of the Day: ephemeral — lasting for a very short time. From Greek ephēmeros, "lasting only a day."',
  'Word of the Day: serendipity — finding something good by chance. Coined by Horace Walpole in 1754.',
  'Word of the Day: eloquent — fluent or persuasive in speaking or writing. From Latin eloquens.',
  'Word of the Day: ubiquitous — found everywhere. From Latin ubique, meaning "everywhere."',
  'Word of the Day: mellifluous — sweet-sounding, pleasant to hear. From Latin mel (honey) + fluere (to flow).',
  'Word of the Day: sanguine — optimistic, especially in a difficult situation. From Latin sanguis, "blood."',
  'Word of the Day: perspicacious — having keen mental perception and understanding. From Latin perspicax.',
  'Word of the Day: loquacious — tending to talk a great deal. From Latin loquax, from loqui, "to speak."',
  'Word of the Day: ineffable — too great to be expressed in words. From Latin ineffabilis.',
  'Word of the Day: resilient — able to recover quickly from difficulty. From Latin resilire, "to rebound."',
  'Word of the Day: equanimity — calmness and composure under stress. From Latin aequus (equal) + animus (mind).',
  'Word of the Day: luminous — giving off light; brilliant. From Latin luminosus, from lumen, "light."',
  'Word of the Day: petrichor — the pleasant earthy smell after rain. Coined in 1964 from Greek petra + ichor.',
  'Word of the Day: tenacious — holding firmly to something. From Latin tenax, from tenere, "to hold."',
  'Word of the Day: vivacious — attractively lively and animated. From Latin vivax, from vivere, "to live."',
  'Word of the Day: sonorous — deep and full in sound. From Latin sonorus, from sonare, "to sound."',
  'Word of the Day: incandescent — emitting light as a result of being heated; brilliant. From Latin candere.',
  'Word of the Day: verisimilitude — the appearance of being true. From Latin verisimilitudo.',
  'Word of the Day: ebullient — cheerful and full of energy. From Latin ebullire, "to bubble out."',
  'Word of the Day: quintessential — representing the perfect example. From medieval Latin quinta essentia.',
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
    const windDownId = getWindDownReminderId();
    if (dailyId) knownIds.add(dailyId);
    if (riskId) knownIds.add(riskId);
    if (windDownId) knownIds.add(windDownId);

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

  let message: string;
  if (Math.random() < 0.5) {
    // Word of the Day — deliver value even without opening the app
    message = WORD_OF_DAY_MESSAGES[Math.floor(Math.random() * WORD_OF_DAY_MESSAGES.length)];
  } else {
    const messages = currentStreak > 0 ? getStreakMessages(currentStreak) : GENERIC_MESSAGES;
    message = messages[Math.floor(Math.random() * messages.length)].replace(
      '{streak}',
      String(currentStreak)
    );
  }

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

export async function scheduleWindDownReminder(
  hour: number,
  minute: number
): Promise<void> {
  // Cancel previous wind-down reminder by persisted ID
  const prevId = getWindDownReminderId();
  if (prevId) {
    await Notifications.cancelScheduledNotificationAsync(prevId).catch((e) => { if (__DEV__) console.warn('[Notifications] Failed to cancel wind-down reminder:', e); });
    setWindDownReminderId(null);
  }

  const message = WIND_DOWN_MESSAGES[Math.floor(Math.random() * WIND_DOWN_MESSAGES.length)];

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
  setWindDownReminderId(id);
}

export async function cancelWindDownReminder(): Promise<void> {
  const id = getWindDownReminderId();
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch((e) => { if (__DEV__) console.warn('[Notifications] Failed to cancel wind-down reminder:', e); });
    setWindDownReminderId(null);
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  setDailyReminderId(null);
  setStreakAtRiskId(null);
  setWindDownReminderId(null);
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
