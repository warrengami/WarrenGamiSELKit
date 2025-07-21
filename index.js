require('dotenv').config(); // Add this line to the top

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Hashed version of "WARRENGAMI2025"
const ACCESS_CODE_HASH = '$2b$10$ZJIiuZ7050sPOiwkUor4auJXWrn1gxf0bCY0.9dQQmL.DeDMzwvNW';
// AFTER
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from 'public'

app.post('/api/verify-code', async (req, res) => {
    const { accessCode } = req.body;
    if (!accessCode) {
        return res.status(400).json({ message: 'Access code is required.' });
    }
    try {
        const isMatch = await bcrypt.compare(accessCode, ACCESS_CODE_HASH);
        if (isMatch) {
            const token = jwt.sign({ user: 'WarrenGamiSchool', tier: 'Premium' }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Invalid access code.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// For Vercel, we export the app instead of listening on a port
module.exports = app;
