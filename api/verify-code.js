
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-and-long-random-string-for-jwt';
const JWT_EXPIRES_IN = '8h';

const validCodes = [
  {
    access_code_hash: '$2b$12$G6A7P20qA71e0xZrat48heb1Ygww9p2DzLJNOcsybDu/l6cYuhJ9m',
    school_name: 'WarrenGami School',
    subscription_tier: 'Premium',
    expiry_date: '2025-12-31T23:59:59Z',
    is_active: true
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({ message: 'Access code is required.' });
  }

  let matchedCredential = null;

  for (const cred of validCodes) {
    const isMatch = await bcrypt.compare(accessCode, cred.access_code_hash);
    if (isMatch) {
      matchedCredential = cred;
      break;
    }
  }

  if (!matchedCredential) {
    return res.status(401).json({ message: 'Invalid access code.' });
  }

  if (!matchedCredential.is_active) {
    return res.status(403).json({ message: 'This access code is no longer active.' });
  }

  if (new Date() > new Date(matchedCredential.expiry_date)) {
    return res.status(403).json({ message: 'This access code has expired.' });
  }

  const payload = {
    school: matchedCredential.school_name,
    tier: matchedCredential.subscription_tier,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.status(200).json({ token: token });
}
