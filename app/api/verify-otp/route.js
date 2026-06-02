import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// Rate limiting: max 5 attempts per email per 15 minutes
const RATE_LIMIT_KEY = (email) => `attempts:${email}`;
const MAX_ATTEMPTS   = 5;

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // ── Rate limiting ───────────────────────────────────────────────────────
    const attemptsKey = RATE_LIMIT_KEY(email);
    const attempts    = (await kv.get(attemptsKey)) || 0;

    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Increment attempt counter (expires in 15 min)
    await kv.set(attemptsKey, Number(attempts) + 1, { ex: 900 });

    // ── Verify OTP ──────────────────────────────────────────────────────────
    const stored = await kv.get(`otp:${email}`);

    if (!stored) {
      return NextResponse.json(
        { success: false, message: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (stored !== otp.trim()) {
      return NextResponse.json(
        { success: false, message: 'Incorrect OTP. Please try again.' },
        { status: 400 }
      );
    }

    // ── Success — delete OTP and rate limit ─────────────────────────────────
    await kv.del(`otp:${email}`);
    await kv.del(attemptsKey);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('verify-otp error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
