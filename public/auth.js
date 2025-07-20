
// This script runs on every page to manage authentication state.

const TOKEN_KEY = 'toolkit_access_token';
const LOGIN_PAGE = '/index.html';
const PROTECTED_PAGE = '/toolkit.html';

// Function to handle logging out
function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.href = LOGIN_PAGE;
}

// Function to get the token payload (user data)
function getUserData() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            logout();
            return null;
        }
        return payload;
    } catch (e) {
        console.error('Error decoding token:', e);
        logout();
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    const userData = getUserData();

    if (currentPage.endsWith(LOGIN_PAGE)) {
        if (userData) {
            window.location.href = PROTECTED_PAGE;
        }
        handleLoginForm();
    } else {
        if (!userData) {
            window.location.href = LOGIN_PAGE;
            return;
        }
        displayUserData(userData);
    }
});

function handleLoginForm() {
    const form = document.getElementById('access-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const accessCode = document.getElementById('access-code').value;
        const errorMessage = document.getElementById('error-message');

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
                errorMessage.textContent = '';
                sessionStorage.setItem(TOKEN_KEY, data.token);
                window.location.href = PROTECTED_PAGE;
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'Could not connect to the server.';
        }
    });
}

function displayUserData(userData) {
    const userInfoDiv = document.getElementById('user-info');
    if (userInfoDiv && userData) {
        userInfoDiv.innerHTML = `
            <p><strong>School:</strong> ${userData.school}</p>
            <p><strong>Subscription:</strong> ${userData.tier} Tier</p>
        `;
    }
}
