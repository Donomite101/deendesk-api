export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '40px', color: '#2E7D32' }}>
      <h1>DeenDesk API</h1>
      <p>OTP service is running. Available endpoints:</p>
      <ul>
        <li><code>POST /api/send-otp</code> — Send OTP to email</li>
        <li><code>POST /api/verify-otp</code> — Verify OTP</li>
      </ul>
    </main>
  );
}
