# DeenDesk API Server

Next.js API server hosted on Vercel for DeenDesk OTP authentication.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send-otp` | Sends 4-digit OTP to email via Brevo |
| POST | `/api/verify-otp` | Verifies OTP (rate limited: 5 attempts / 15 min) |

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `BREVO_API_KEY` | Your Brevo API key from brevo.com |
| `SENDER_EMAIL` | Verified sender email in Brevo |
| `KV_REST_API_URL` | Auto-set by Vercel when KV store is linked |
| `KV_REST_API_TOKEN` | Auto-set by Vercel when KV store is linked |

## Local Development

```bash
npm install
npm run dev
```
