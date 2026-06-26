// theme.js — shared dark mode logic across all pages

(function () {
  const STORAGE_KEY = "benderang-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function updateToggleIcon(theme) {
    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  // Apply saved theme immediately (before page paints, to avoid flash)
  const savedTheme = localStorage.getItem(STORAGE_KEY) || "light";
  applyTheme(savedTheme);

  // Wait for DOM to attach the toggle button listener
  document.addEventListener("DOMContentLoaded", () => {
    updateToggleIcon(savedTheme);

    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        const current =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "dark"
            : "light";
        const next = current === "dark" ? "light" : "dark";

        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
        updateToggleIcon(next);
      });
    }
  });
})();
