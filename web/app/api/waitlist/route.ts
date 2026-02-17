import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

function generateCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

function supabaseHeaders(prefer?: string) {
  const h: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  if (prefer) h['Prefer'] = prefer;
  return h;
}

/** Fetch a waitlist row by email and compute its position. */
async function fetchExistingUser(email: string) {
  const params = new URLSearchParams({
    email: `eq.${email}`,
    select: 'id,email,referral_code,referral_count,created_at',
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?${params}`, {
    headers: supabaseHeaders(),
  });

  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows.length) return null;

  const user = rows[0];
  const position = await getPosition(user.created_at);
  return { referral_code: user.referral_code, position, referral_count: user.referral_count };
}

const POSITION_OFFSET = 100;

/** Count how many rows were created at or before this timestamp = position. */
async function getPosition(createdAt: string): Promise<number> {
  const params = new URLSearchParams({
    created_at: `lte.${createdAt}`,
    select: 'id',
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?${params}`, {
    headers: { ...supabaseHeaders(), Prefer: 'count=exact' },
  });

  // Supabase returns count in the content-range header: "0-N/TOTAL"
  const range = res.headers.get('content-range');
  if (range) {
    const total = range.split('/')[1];
    if (total && total !== '*') return parseInt(total, 10) + POSITION_OFFSET;
  }

  return 1 + POSITION_OFFSET;
}

/** Increment referrer's referral_count via Supabase RPC or PATCH. */
async function incrementReferralCount(referralCode: string) {
  // First fetch current count
  const params = new URLSearchParams({
    referral_code: `eq.${referralCode}`,
    select: 'referral_count',
  });

  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?${params}`, {
    headers: supabaseHeaders(),
  });

  if (!getRes.ok) return;
  const rows = await getRes.json();
  if (!rows.length) return;

  const newCount = (rows[0].referral_count || 0) + 1;

  const patchParams = new URLSearchParams({
    referral_code: `eq.${referralCode}`,
  });

  await fetch(`${SUPABASE_URL}/rest/v1/waitlist?${patchParams}`, {
    method: 'PATCH',
    headers: supabaseHeaders('return=minimal'),
    body: JSON.stringify({ referral_count: newCount }),
  });
}

export async function POST(request: Request) {
  try {
    const { email, ref } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const referralCode = generateCode();

    const insertBody: Record<string, unknown> = {
      email: cleanEmail,
      referral_code: referralCode,
    };

    // Validate referrer code if provided
    if (ref && typeof ref === 'string' && ref.length === 8) {
      insertBody.referred_by = ref;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: supabaseHeaders('return=representation'),
      body: JSON.stringify(insertBody),
    });

    // Duplicate email — return existing user's data
    if (res.status === 409) {
      const existing = await fetchExistingUser(cleanEmail);
      if (existing) {
        return NextResponse.json({ success: true, ...existing });
      }
      return NextResponse.json({ success: true, message: 'Already on the list.' });
    }

    if (!res.ok) {
      const body = await res.text();
      console.error('Supabase insert failed:', res.status, body);
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }

    const [inserted] = await res.json();

    // Credit the referrer
    if (insertBody.referred_by) {
      await incrementReferralCount(insertBody.referred_by as string);
    }

    const position = await getPosition(inserted.created_at);

    return NextResponse.json({
      success: true,
      referral_code: inserted.referral_code,
      position,
      referral_count: inserted.referral_count,
    });
  } catch (err) {
    console.error('Waitlist error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
