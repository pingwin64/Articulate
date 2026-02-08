// Public Supabase config — these are publishable keys (not secrets).
// The actual secret (OPENAI_API_KEY) lives server-side in Supabase Edge Function secrets.
// Env var overrides are supported for flexibility.
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://mgwkhxlhhrvjgixptcnu.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nd2toeGxoaHJ2amdpeHB0Y251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjkxNDQsImV4cCI6MjA4NTQ0NTE0NH0.O7n4Ak6KoC-FDHGk9UicvhKBqus2C0FfgmgsIz8Aa50';
