const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// --- Configuration ---

// This is the securely hashed version of "WARRENGAMI2025".
// You can generate your own using the 'generate-hash' script in your package.json.
const ACCESS_CODE_HASH = '$2b$10$w.a9.yR7G0kY2J3p7dC9Auv2eYmI7jU9k.g3x.v8B.T1f.L6o.C5m';

// For production, this secret should be stored securely as an environment variable.
const JWT_SECRET = 'your_super_secret_and_long_random_string_for_security';

// --- Middleware ---

// This allows the server to parse JSON sent in the body of requests.
app.use(express.json());

// This tells Express to serve all your static frontend files (HTML, CSS, auth.js)
// from the 'public' folder. This is a crucial fix.
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoint ---

// This is the endpoint that your 'auth.js' script sends the access code to.
app.post('/api/verify-code', async (req, res) => {
    // Get the accessCode from the request body.
    const { accessCode } = req.body;

    // Handle cases where no access code was sent.
    if (!accessCode) {
        return res.status(400).json({ message: 'Access code is required.' });
    }

    try {
        // --- SECURE COMPARISON ---
        // Securely compare the plaintext accessCode from the user with the stored hash.
        const isMatch = await bcrypt.compare(accessCode, ACCESS_CODE_HASH);

        if (isMatch) {
            // If the code is correct, create a JSON Web Token (JWT).
            const token = jwt.sign(
                { user: 'WarrenGamiSchool', tier: 'Premium' }, // Example user data to store in the token
                JWT_SECRET,
                { expiresIn: '1h' } // The token will be valid for 1 hour
            );
            // Send the token back to the frontend.
            res.status(200).json({ token });
        } else {
            // If the code is incorrect, send an "Unauthorized" error.
            res.status(401).json({ message: 'Invalid access code.' });
        }
    } catch (error) {
        console.error('Error during code verification:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});


// --- Serve the main login page ---
// When someone visits the root URL, send them the login page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`✅ Server is running successfully!`);
    console.log(`Navigate to http://localhost:${PORT} in your web browser.`);
});
