<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WarrenGami SEL Toolkit - Access</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <div class="container">
        <h1>WarrenGami SEL Toolkit</h1>
        <p>Please enter the access code provided to your school.</p>

        <!-- The form that your auth.js script looks for -->
        <form id="access-form">
            <input type="text" id="access-code" placeholder="Enter access code" required>
            
            <!-- The error message will appear here -->
            <div id="error-message"></div>

            <button type="submit">Unlock Toolkit</button>
        </form>
    </div>

    <!-- This script makes the form work -->
    <script src="auth.js"></script>
</body>
</html>
