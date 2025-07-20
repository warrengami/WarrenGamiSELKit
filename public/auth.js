// This script runs on every page to manage authentication state.

const TOKEN_KEY = 'toolkit_access_token';
const LOGIN_PAGE = 'index.html'; // Correct path for the login page
const PROTECTED_PAGE = '(Table of Contents).html'; // Correct path for the protected page

/**
 * Removes the user's token and redirects them to the login page.
 */
function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.href = LOGIN_PAGE; // Correct: Logout should always go to the login page.
}

/**
 * Checks for a valid token in session storage.
 * @returns {object|null} The decoded user data or null if invalid/expired.
 */
function getUserData() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
        // Decode the token payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if the token has expired
        if (payload.exp * 1000 < Date.now()) {
            logout(); // Log out if expired
            return null;
        }
        return payload;
    } catch (e) {
        console.error('Error decoding token:', e);
        logout(); // Log out if token is malformed
        return null;
    }
}

/**
 * This is the main logic that runs when any page loads.
 * It handles routing and page protection.
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    const userData = getUserData();

    if (currentPage === LOGIN_PAGE) {
        // If we are on the login page...
        if (userData) {
            // ...and the user is already logged in, send them to the toolkit.
            window.location.href = PROTECTED_PAGE;
        }
        // Otherwise, set up the login form.
        handleLoginForm();
    } else {
        // If we are on any other page (like toolkit.html)...
        if (!userData) {
            // ...and the user is NOT logged in, redirect them to the login page.
            window.location.href = LOGIN_PAGE; // Correct: Protect pages by sending unauth users to login.
            return;
        }
        // If they are logged in, display their data.
        displayUserData(userData);
    }
});

/**
 * Attaches the submission event listener to the login form.
 */
function handleLoginForm() {
    const form = document.getElementById('access-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const accessCode = document.getElementById('access-code').value;
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = ''; // Clear previous errors

        try {
            const response = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent = data.message || 'An error occurred.';
            } else {
                // On successful login...
                sessionStorage.setItem(TOKEN_KEY, data.token);
                // ...redirect to the protected toolkit page.
                window.location.href = PROTECTED_PAGE; // Correct: This is the successful login redirect.
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'Could not connect to the server.';
        }
    });
}

/**
 * Displays user data on the page.
 * @param {object} userData The decoded data from the JWT.
 */
function displayUserData(userData) {
    const userInfoDiv = document.getElementById('user-info');
    if (userInfoDiv && userData) {
        userInfoDiv.innerHTML = `
            <p><strong>School:</strong> ${userData.user}</p>
            <p><strong>Subscription:</strong> ${userData.tier} Tier</p>
        `;
    }
}
