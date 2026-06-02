import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Vercel KV (free Redis) with 10-minute expiry
    await kv.set(`otp:${email}`, otp, { ex: 600 });

    // Send via Brevo Transactional Email API
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: process.env.SENDER_EMAIL || 'noreply@deendesk.com',
          name:  'DeenDesk',
        },
        to: [{ email }],
        subject: 'Your DeenDesk Verification Code',
        htmlContent: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
                      background:#f5f5f5;border-radius:12px;">
            <h2 style="color:#2E7D32;margin-bottom:8px;">DeenDesk</h2>
            <p style="color:#555;font-size:14px;margin-bottom:24px;">
              Your one-time verification code:
            </p>
            <div style="background:#fff;border:2px solid #2E7D32;border-radius:10px;
                        padding:20px;text-align:center;letter-spacing:12px;
                        font-size:36px;font-weight:bold;color:#2E7D32;">
              ${otp}
            </div>
            <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">
              This code expires in <strong>10 minutes</strong>.<br/>
              If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      }),
    });

    if (!brevoRes.ok) {
      const err = await brevoRes.json();
      console.error('Brevo error:', err);
      return NextResponse.json(
        { success: false, message: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
