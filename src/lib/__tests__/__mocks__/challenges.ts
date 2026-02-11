// Stub for challenges module in test environment
export function getCurrentWeekId() { return '2024-W01'; }
export function getCurrentChallenge() {
  return { type: 'texts_read', target: 5, description: 'Read 5 texts', icon: 'book-open' };
}
