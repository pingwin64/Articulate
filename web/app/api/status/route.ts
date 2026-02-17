import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

function supabaseHeaders(prefer?: string) {
  const h: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  if (prefer) h['Prefer'] = prefer;
  return h;
}

const POSITION_OFFSET = 100;

async function getPosition(createdAt: string): Promise<number> {
  const params = new URLSearchParams({
    created_at: `lte.${createdAt}`,
    select: 'id',
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?${params}`, {
    headers: { ...supabaseHeaders(), Prefer: 'count=exact' },
  });

  const range = res.headers.get('content-range');
  if (range) {
    const total = range.split('/')[1];
    if (total && total !== '*') return parseInt(total, 10) + POSITION_OFFSET;
  }

  return 1 + POSITION_OFFSET;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const params = new URLSearchParams({
      email: `eq.${cleanEmail}`,
      select: 'id,email,referral_code,referral_count,created_at',
    });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?${params}`, {
      headers: supabaseHeaders(),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }

    const rows = await res.json();
    if (!rows.length) {
      return NextResponse.json({ error: 'Email not found on the waitlist.' }, { status: 404 });
    }

    const user = rows[0];
    const position = await getPosition(user.created_at);

    return NextResponse.json({
      referral_code: user.referral_code,
      position,
      referral_count: user.referral_count,
    });
  } catch (err) {
    console.error('Status lookup error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
