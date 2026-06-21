// Get references to DOM elements
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const toggleButton = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// Handle form submission asynchronously
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    // Get username and password values from input fields
    const username = document.getElementById("username").value;
    const password = passwordInput.value;

    try {
        // Send login data to server via POST request
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        // Redirect on successful login, otherwise show alert
        if (response.ok) {
            window.location.href = "/index.html";
        } else {
            alert("Login failed");
        }
    } catch (error) {
        // Handle network or other errors gracefully
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again.");
    }
});

// Toggle password visibility when the toggle button is clicked
toggleButton.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text"; // Show password
        eyeIcon.src = "src/hide.png"; // Change icon to "hide"
    } else {
        passwordInput.type = "password"; // Hide password
        eyeIcon.src = "src/visible.png"; // Change icon to "visible"
    }
});
