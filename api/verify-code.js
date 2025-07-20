// api/verify-code.js

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { accessCode } = req.body;

  // Replace with your real access code
  const VALID_CODE = 'WARRENGAMI2025';

  if (accessCode === VALID_CODE) {
    const payload = {
      school: 'Warrengami Academy',
      tier: 'Full Access',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour from now
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const token = `fake.${base64Payload}.signature`;

    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid access code' });
  }
}
