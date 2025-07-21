// File: /index.js

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Environment Variable Loading & Validation ---
// Load secrets from environment variables.
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_CODE_HASH = process.env.ACCESS_CODE_HASH;

// CRITICAL: This check ensures your app fails fast if secrets are missing.
if (!JWT_SECRET || !ACCESS_CODE_HASH) {
    console.error('FATAL ERROR: JWT_SECRET or ACCESS_CODE_HASH is not defined in environment variables.');
    process.exit(1); // Exit the process if secrets are not found
}

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoint for Verifying Access Code ---
app.post('/api/verify-code', async (req, res) => {
    const { accessCode } = req.body;

    if (!accessCode) {
        return res.status(400).json({ message: 'Access code is required.' });
    }

    try {
        // Compare the provided code with the hash from your environment variables
        const isMatch = await bcrypt.compare(accessCode, ACCESS_CODE_HASH);

        if (isMatch) {
            const payload = { user: 'WarrenGamiSchool', tier: 'Premium' };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Invalid access code.' });
        }
    } catch (error) {
        console.error('Error during access code verification:', error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
});

// For Vercel, we export the app
module.exports = app;