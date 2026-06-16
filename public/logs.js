(async () => {

    // Auth check
    const authResponse = await fetch("/me");
    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.loggedIn) {
        location.href = "/login.html";
        return;
    }

    if (authData.role !== "engineering admin") {
        location.href = "/index.html";
        return;
    }

    document.getElementById("currentUser").textContent =
        `${authData.username} · ${authData.role}`;

    document.getElementById("logout-btn").addEventListener("click", async () => {
        const confirmed = confirm("Are you sure you want to logout?");
        if (!confirmed) return;
        const res = await fetch("/logout", { method: "POST" });
        if (res.ok) location.href = "/login.html";
    });

    let allLogs = [];

    async function fetchAndRenderLogs() {
        const response = await fetch("/logs");
        allLogs = await response.json();

        document.getElementById("lastRefreshed").textContent =
            `Last refreshed: ${new Date().toLocaleTimeString("id-ID")}`;

        renderLogs();
    }

    function renderLogs() {
        const filterText = document.getElementById("logsFilter").value.trim().toLowerCase();
        const tbody = document.getElementById("logsTableBody");
        tbody.innerHTML = "";

        const filtered = allLogs.filter(log => {
            if (!filterText) return true;
            return (
                log.username?.toLowerCase().includes(filterText) ||
                log.action?.toLowerCase().includes(filterText) ||
                log.entityType?.toLowerCase().includes(filterText) ||
                log.entityName?.toLowerCase().includes(filterText)
            );
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        <div class="empty-state">No logs found.</div>
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(log => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString("id-ID")}</td>
                <td><strong>${log.username || "-"}</strong></td>
                <td><span class="action-${log.action}">${log.action}</span></td>
                <td><span class="entity-${log.entityType}">${log.entityType}</span></td>
                <td>${log.entityName || "-"}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("logsFilter").addEventListener("input", renderLogs);

    fetchAndRenderLogs();
    setInterval(fetchAndRenderLogs, 10000);

})();