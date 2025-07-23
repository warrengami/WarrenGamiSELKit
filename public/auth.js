// This script runs on every page to manage authentication state.

const TOKEN_KEY = 'toolkit_access_token';
const LOGIN_PAGE = 'index.html'; // Correct path for the login page
const PROTECTED_PAGE = 'dashboard.html'; // Updated path for the dashboard

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
 * Creates and injects the global navigation header
 * @param {object} userData The decoded user data from the JWT
 */
function createGlobalHeader(userData) {
    // Don't create header on login page
    if (window.location.pathname.includes(LOGIN_PAGE)) {
        return;
    }

    // Remove any existing global header
    const existingHeader = document.getElementById('global-header');
    if (existingHeader) {
        existingHeader.remove();
    }

    // Create header styles
    const headerStyles = `
        <style id="global-header-styles">
            .global-header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #002b5c 0%, #00408a 100%);
                color: white;
                padding: 12px 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
            }
            .global-header .header-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .global-header .header-right {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .global-header .brand {
                font-weight: 700;
                font-size: 16px;
                color: #73bdf5;
            }
            .global-header .dashboard-link {
                color: white;
                text-decoration: none;
                padding: 6px 12px;
                border-radius: 6px;
                background-color: rgba(255,255,255,0.1);
                transition: background-color 0.3s;
                font-size: 13px;
            }
            .global-header .dashboard-link:hover {
                background-color: rgba(255,255,255,0.2);
            }
            .global-header .user-info {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 12px;
                opacity: 0.9;
            }
            .global-header .user-info span {
                background-color: rgba(255,255,255,0.1);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
            }
            .global-header .logout-btn {
                background-color: #ef5350;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: background-color 0.3s;
            }
            .global-header .logout-btn:hover {
                background-color: #d32f2f;
            }
            /* Adjust body padding to account for fixed header */
            body {
                padding-top: 60px !important;
            }
            /* Hide existing bottom navigation on pages that have it */
            .toolkit-nav {
                display: none !important;
            }
            /* Adjust page container for pages that use it */
            .page-container {
                margin-top: 0 !important;
            }
            @media (max-width: 768px) {
                .global-header {
                    padding: 10px 15px;
                    font-size: 12px;
                }
                .global-header .brand {
                    font-size: 14px;
                }
                .global-header .user-info {
                    flex-direction: column;
                    gap: 5px;
                    align-items: flex-end;
                }
                .global-header .user-info span {
                    font-size: 10px;
                    padding: 2px 6px;
                }
            }
        </style>
    `;

    // Create header HTML
    const headerHTML = `
        <div id="global-header" class="global-header">
            <div class="header-left">
                <div class="brand">WarrenGami SEL Toolkit</div>
                <a href="dashboard.html" class="dashboard-link">🏠 Teacher Dashboard</a>
            </div>
            <div class="header-right">
                <div class="user-info">
                    <span>🏫 ${userData.user}</span>
                    <span>⭐ ${userData.tier} Tier</span>
                </div>
                <button class="logout-btn" onclick="logout()">Log out</button>
            </div>
        </div>
    `;

    // Inject styles and header
    document.head.insertAdjacentHTML('beforeend', headerStyles);
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
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
        // If they are logged in, create the global header and display their data.
        createGlobalHeader(userData);
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
