// File: /api/verify-code.js

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({ message: 'Access code is required' });
  }

  const VALID_CODE = 'WARRENGAMI2025';

  if (accessCode !== VALID_CODE) {
    return res.status(401).json({ message: 'Invalid access code' });
  }

  // Simulate a token (for demo only — not secure for production)
  const token = Buffer.from(
    JSON.stringify({
      school: 'Demo School',
      tier: 'Standard',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiry
    })
  ).toString('base64');

  const fakeJWT = `header.${token}.signature`;

  return res.status(200).json({ token: fakeJWT });
}
