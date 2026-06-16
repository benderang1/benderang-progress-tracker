document
    .getElementById("loginForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;

        const response = await fetch(
            "/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        if (response.ok) {
            window.location.href = "/index.html";
        } else {
            alert("Login failed");
        }
    });document
    .getElementById("loginForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;

        const response = await fetch(
            "/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        if (response.ok) {
            window.location.href = "/index.html";
        } else {
            alert("Login failed");
        }
    });

    const passwordInput =
    document.getElementById("password");

    const toggleButton =
        document.getElementById("togglePassword");

    const eyeIcon =
        document.getElementById("eyeIcon");

    toggleButton.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type = "text";

                eyeIcon.src =
                    "src/hide.png";

            } else {

                passwordInput.type =
                    "password";

                eyeIcon.src =
                    "src/visible.png";

            }

        }
    );