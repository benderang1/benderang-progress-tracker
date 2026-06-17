// Fetch current user info and handle authentication
const authResponse = await fetch("/me");
const authData = await authResponse.json();

if (!authResponse.ok) {
  // Redirect to login if not authenticated
  location.href = "/login.html";
}

// Show logs button only for engineering admin role
if (authData.role === "engineering admin") {
  document.getElementById("logsBtn").style.display = "inline-block";
}

// Fetch projects data from server
const projectsResponse = await fetch("/projects");
let projects = await projectsResponse.json();

/**
 * Save updated project to server
 * @param {Object} project - Project object to save
 */
async function saveProject(project) {
  const response = await fetch(`/projects/${project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    throw new Error("Failed to save project");
  }
}

/**
 * Save updated task to server
 * @param {Object} task - Task object to save
 */
async function saveTask(task) {
  const response = await fetch(`/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to save task");
  }
}

/**
 * Create a new project on server
 * @param {Object} project - New project data
 * @returns {Object} Created project with ID
 */
async function createProject(project) {
  const response = await fetch("/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return await response.json();
}

/**
 * Create a new task under a project on server
 * @param {string} projectId - ID of the project
 * @param {Object} task - New task data
 * @returns {Object} Created task with ID
 */
async function createTask(projectId, task) {
  const response = await fetch(`/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return await response.json();
}

/**
 * Format date string from YYYY-MM-DD to "DD MMM YYYY"
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${day} ${months[+month - 1]} ${year}`;
}

// Calculate project counts by status
const onGoingProjects = projects.filter(p => p.status === "On-going");
const finishedProjects = projects.filter(p => p.status === "Done");
const holdProjects = projects.filter(p => p.status === "Hold");

/**
 * Update project counts displayed in UI
 */
function refreshProjectNumbers() {
  document.getElementById("onGoingNumber").textContent = onGoingProjects.length;
  document.getElementById("doneNumber").textContent = finishedProjects.length;
  document.getElementById("holdNumber").textContent = holdProjects.length;
}

/**
 * Create an editable table cell for project/task fields
 * Supports inline editing with appropriate input types
 * @param {Object} rowData - Project or task data object
 * @param {string} key - Field key to display/edit
 * @param {boolean} isTask - True if editing a task, false for project
 * @param {string|null} projectId - Project ID (for tasks)
 * @param {string|null} taskId - Task ID (for tasks)
 * @returns {HTMLElement} Table cell element
 */
function createEditableCell(rowData, key, isTask = false, projectId = null, taskId = null) {
  const td = document.createElement("td");
  td.classList.add("editable");

  // Create appropriate input/select element based on field type
  function createInput(value) {
    if (key === "status") {
      const select = document.createElement("select");
      ["On-going", "Hold", "Done"].forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        if (opt === value) option.selected = true;
        select.appendChild(option);
      });
      return select;
    } else if (["startDate", "endDate", "dueDate"].includes(key)) {
      const input = document.createElement("input");
      input.type = "date";
      input.value = value || "";
      return input;
    } else if (["progress", "pastDueTasks"].includes(key)) {
      const input = document.createElement("input");
      input.type = "number";
      input.min = 0;
      input.value = value || 0;
      return input;
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.value = value || "";
      return input;
    }
  }

  // For progress field, show progress bar instead of plain text
  if (key === "progress") {
    td.innerHTML = `
      <div class="progress-container">
        <div class="progress-fill" style="width:${rowData[key]}%"></div>
        <div class="progress-text">${rowData[key]}%</div>
      </div>
    `;
  } else {
    td.textContent =
      (["startDate", "endDate", "dueDate"].includes(key) && rowData[key])
        ? formatDate(rowData[key])
        : rowData[key] || "";
  }

  // Enable inline editing on click
  td.addEventListener("click", () => {
    if (td.querySelector("input") || td.querySelector("select")) return; // Already editing

    const input = createInput(rowData[key]);
    td.textContent = "";
    td.appendChild(input);
    input.focus();

    // Save changes on blur or Enter key
    async function saveEdit() {
      let newValue = input.value;

      if (["progress", "pastDueTasks"].includes(key)) {
        newValue = parseInt(newValue) || 0;
      }

      const oldValue = rowData[key];
      rowData[key] = newValue;

      try {
        if (isTask) {
          await saveTask(rowData);
        } else {
          await saveProject(rowData);
        }
      } catch (err) {
        rowData[key] = oldValue;
        console.error(err);
        alert(isTask ? "Failed to save task" : "Failed to save project");
        td.textContent = oldValue;
        return;
      }

      td.textContent =
        (["startDate", "endDate", "dueDate"].includes(key) && newValue)
          ? formatDate(newValue)
          : newValue;

      // Re-render tables to reflect changes
      renderAllTables();
      if (isTask) {
        showNestedTable(projectId);
      }
    }

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        input.blur();
      } else if (e.key === "Escape") {
        td.textContent = rowData[key] || "";
      }
    });
  });

  return td;
}

/**
 * Create a table row for a project with toggle button and delete button
 * @param {Object} project - Project data
 * @returns {HTMLElement} Table row element
 */
function createProjectRow(project) {
  const tr = document.createElement("tr");
  tr.dataset.projectId = project.id;
  tr.classList.add("project-row");

  // Toggle button cell to show/hide nested tasks
  const toggleTd = document.createElement("td");
  toggleTd.classList.add("toggle-btn-cell");
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "▸"; // collapsed arrow
  toggleBtn.classList.add("toggle-btn");
  toggleBtn.addEventListener("click", () => toggleNestedTable(project.id, toggleBtn));
  toggleTd.appendChild(toggleBtn);
  tr.appendChild(toggleTd);

  // Editable cells for project fields
  [
    "projectName",
    "client",
    "personInCharge",
    "startDate",
    "endDate",
    "progress",
    "ongoingActions",
    "pastDueTasks",
    "status",
  ].forEach(key => {
    tr.appendChild(createEditableCell(project, key, false, project.id));
  });

  // Delete project button cell
  const actionsTd = document.createElement("td");
  actionsTd.classList.add("actions-cell");
  const delBtn = document.createElement("button");
  delBtn.textContent = "✖";
  delBtn.classList.add("delete-btn");
  delBtn.addEventListener("click", () => deleteProject(project.id));
  actionsTd.appendChild(delBtn);
  tr.appendChild(actionsTd);

  return tr;
}

/**
 * Create a hidden nested row containing the tasks table for a project
 * @param {Object} project - Project data
 * @returns {HTMLElement} Table row element
 */
function createNestedTasksRow(project) {
  const tr = document.createElement("tr");
  tr.classList.add("nested-tasks-row", "hidden");
  tr.dataset.projectId = project.id;

  const td = document.createElement("td");
  td.colSpan = 11;

  // Nested tasks table with header, filters, and add task button
  const nestedTable = document.createElement("table");
  nestedTable.classList.add("nested-table");

  const thead = document.createElement("thead");

  // Filter row with status filter, text filter, and add task button
  const filterRow = document.createElement("tr");
  filterRow.classList.add("task-filter-row");
  const filterTd = document.createElement("td");
  filterTd.colSpan = 11;
  filterTd.innerHTML = `
    <div class="filter-add-task-section">
      <label>Filter Tasks of <b>${project.projectName}</b> by Status:</label>
      <select class="task-status-filter">
        <option value="all">All</option>
        <option value="On-going">On-going</option>
        <option value="Hold">Hold</option>
        <option value="Done">Done</option>
      </select>
      <input type="text" class="task-text-filter" placeholder="Filter tasks by name or PIC..."/>
      <button class="add-task-btn">+ Add Task</button>
    </div>
  `;
  filterRow.appendChild(filterTd);
  thead.appendChild(filterRow);

  // Header row with sortable columns
  const headerRow = document.createElement("tr");
  [
    "No.",
    "Tasks",
    "Assigned To",
    "Issued Date",
    "Due Date",
    "Task Progress",
    "Comments",
    "Status",
    "",
  ].forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    th.style.cursor = "pointer";
    th.dataset.key = col.toLowerCase().replace(/ /g, "");
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  nestedTable.appendChild(thead);

  const tbody = document.createElement("tbody");
  nestedTable.appendChild(tbody);

  td.appendChild(nestedTable);
  tr.appendChild(td);

  // Attach sorting, filtering, and add task event listeners
  attachNestedTableEvents(nestedTable, project);

  return tr;
}

/**
 * Attach sorting, filtering, and add task event listeners to nested tasks table
 * @param {HTMLElement} table - Nested tasks table element
 * @param {Object} project - Project data
 */
function attachNestedTableEvents(table, project) {
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  let sortKey = null;
  let sortDirection = "asc";

  // Sorting on header click
  thead.querySelectorAll("th").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (!key) return;

      if (sortKey === key) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDirection = "asc";
      }

      renderTasks(project, tbody, sortKey, sortDirection, getNestedFilters(table));
      updateSortIndicators(thead, key, sortDirection);
    });
  });

  // Filtering inputs
  const statusFilter = thead.querySelector(".task-status-filter");
  const textFilter = thead.querySelector(".task-text-filter");
  const addTaskBtn = thead.querySelector(".add-task-btn");

  statusFilter.addEventListener("change", () => {
    renderTasks(project, tbody, sortKey, sortDirection, getNestedFilters(table));
  });
  textFilter.addEventListener("input", () => {
    renderTasks(project, tbody, sortKey, sortDirection, getNestedFilters(table));
  });

  // Add new task button
  addTaskBtn.addEventListener("click", () => {
    addNewTask(project.id);
  });

  // Initial render of tasks
  renderTasks(project, tbody, sortKey, sortDirection, getNestedFilters(table));
}

/**
 * Get current filters from nested tasks table
 * @param {HTMLElement} table - Nested tasks table element
 * @returns {Object} Filters object with statusFilter and textFilter
 */
function getNestedFilters(table) {
  const statusFilter = table.querySelector(".task-status-filter").value;
  const textFilter = table.querySelector(".task-text-filter").value.trim().toLowerCase();
  return { statusFilter, textFilter };
}

/**
 * Update sort indicators (arrows) on nested table headers
 * @param {HTMLElement} thead - Table header element
 * @param {string} key - Current sort key
 * @param {string} direction - "asc" or "desc"
 */
function updateSortIndicators(thead, key, direction) {
  thead.querySelectorAll("th").forEach(th => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.key === key) {
      th.classList.add(direction === "asc" ? "sort-asc" : "sort-desc");
    }
  });
}

/**
 * Render tasks inside nested table tbody with sorting and filtering
 * @param {Object} project - Project data
 * @param {HTMLElement} tbody - Table body element to render tasks into
 * @param {string|null} sortKey - Field to sort by
 * @param {string} sortDirection - "asc" or "desc"
 * @param {Object} filters - Filters object with statusFilter and textFilter
 */
function renderTasks(project, tbody, sortKey, sortDirection, filters) {
  tbody.innerHTML = "";

  // Filter tasks by status and text
  let filteredTasks = project.tasks.filter(task => {
    if (filters.statusFilter !== "all" && task.status !== filters.statusFilter) {
      return false;
    }

    if (filters.textFilter) {
      const text = filters.textFilter;
      if (
        !task.task.toLowerCase().includes(text) &&
        !task.pic.toLowerCase().includes(text)
      ) {
        return false;
      }
    }
    return true;
  });

  // Show message if no tasks match filters
  if (filteredTasks.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 9; // Number of columns in task table
    td.classList.add("empty-message");

    td.innerHTML = `
      <div class="empty-state">
        ${
          project.tasks.length === 0
            ? "No tasks available. Click Add Task to create your first task."
            : "No matching tasks found."
        }
      </div>
    `;

    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  // Sort tasks if sortKey is specified
  if (sortKey) {
    filteredTasks.sort((a, b) => {
      let valA = a[sortKey] || "";
      let valB = b[sortKey] || "";

      if (sortKey.includes("date")) {
        valA = new Date(valA);
        valB = new Date(valB);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Render each filtered and sorted task row
  filteredTasks.forEach((task, index) => {
    const tr = document.createElement("tr");
    tr.dataset.taskId = task.id;

    // Number cell
    const numberTd = document.createElement("td");
    numberTd.textContent = index + 1;
    tr.appendChild(numberTd);

    // Editable cells for task fields
    [
      "task",
      "pic",
      "startDate",
      "dueDate",
      "progress",
      "comments",
      "status",
    ].forEach(key => {
      tr.appendChild(createEditableCell(task, key, true, project.id, task.id));
    });

    // Delete task button cell
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("actions-cell");
    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => deleteTask(project.id, task.id));
    actionsTd.appendChild(delBtn);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });
}

/**
 * Delete a task by ID after confirmation
 * @param {string} projectId - Project ID
 * @param {string} taskId - Task ID
 */
async function deleteTask(projectId, taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  await fetch(`/tasks/${taskId}`, { method: "DELETE" });

  project.tasks = project.tasks.filter(t => t.id !== taskId);

  renderAllTables();
  showNestedTable(projectId);
}

/**
 * Delete a project and all its tasks after confirmation
 * @param {string} projectId - Project ID
 */
async function deleteProject(projectId) {
  if (!confirm("Are you sure you want to delete this project and all its tasks?")) return;

  await fetch(`/projects/${projectId}`, { method: "DELETE" });

  projects = projects.filter(p => p.id !== projectId);

  refreshProjectNumbers();
  renderAllTables();
}

/**
 * Add a new task to a project
 * @param {string} projectId - Project ID
 */
async function addNewTask(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  const newTask = {
    task: "New Task",
    pic: "",
    startDate: "",
    dueDate: "",
    progress: 0,
    comments: "",
    status: "On-going",
  };

  try {
    const result = await createTask(projectId, newTask);
    newTask.id = result.id;
    project.tasks.push(newTask);

    renderAllTables();
    showNestedTable(projectId);
  } catch (err) {
    console.error(err);
    alert("Failed to create task");
  }
}

// Add new project button handler
document.getElementById("addProjectBtn").addEventListener("click", async () => {
  const newProject = {
    projectName: "~ New Project",
    client: "",
    personInCharge: "",
    startDate: "",
    endDate: "",
    progress: 0,
    ongoingActions: "",
    pastDueTasks: 0,
    status: "On-going",
  };

  try {
    const result = await createProject(newProject);
    newProject.id = result.id;
    newProject.tasks = [];
    projects.push(newProject);

    renderAllTables();
  } catch (err) {
    console.error(err);
    alert("Failed to create project");
  }
});

/**
 * Toggle visibility of nested tasks row for a project
 * @param {string} projectId - Project ID
 * @param {HTMLElement} btn - Toggle button element
 */
function toggleNestedTable(projectId, btn) {
  const nestedRow = document.querySelector(`tr.nested-tasks-row[data-project-id='${projectId}']`);
  if (!nestedRow) return;

  if (nestedRow.classList.contains("hidden")) {
    nestedRow.classList.remove("hidden");
    btn.textContent = "▾"; // expanded arrow
  } else {
    nestedRow.classList.add("hidden");
    btn.textContent = "▸"; // collapsed arrow
  }
}

/**
 * Show nested tasks row for a project (used after adding/deleting tasks)
 * @param {string} projectId - Project ID
 */
function showNestedTable(projectId) {
  const nestedRow = document.querySelector(`tr.nested-tasks-row[data-project-id='${projectId}']`);
  if (!nestedRow) return;

  nestedRow.classList.remove("hidden");

  const toggleBtn = document.querySelector(`tr[data-project-id='${projectId}'] button.toggle-btn`);
  if (toggleBtn) toggleBtn.textContent = "▾";
}

/**
 * Render all project tables and nested tasks
 */
function renderAllTables() {
  // Clear all project tables
  ["onGoingTable", "doneTable", "holdCloseTable"].forEach(id => {
    document.querySelector(`#${id} tbody`).innerHTML = "";
  });

  // Get project filter text
  const filterText = document.getElementById("filterInput").value.trim().toLowerCase();

  // Filter projects by name or client
  let filteredProjects = projects.filter(p => {
    if (filterText) {
      return (
        p.projectName.toLowerCase().includes(filterText) ||
        p.client.toLowerCase().includes(filterText)
      );
    }
    return true;
  });

  // Sort projects alphabetically by projectName
  filteredProjects.sort((a, b) => a.projectName.localeCompare(b.projectName));

  // Append projects and nested tasks to appropriate tables by status
  filteredProjects.forEach(project => {
    const projectRow = createProjectRow(project);
    const nestedRow = createNestedTasksRow(project);

    if (project.status === "On-going") {
      document.querySelector("#onGoingTable tbody").appendChild(projectRow);
      document.querySelector("#onGoingTable tbody").appendChild(nestedRow);
    } else if (project.status === "Done") {
      document.querySelector("#doneTable tbody").appendChild(projectRow);
    } else if (project.status === "Hold") {
      document.querySelector("#holdCloseTable tbody").appendChild(projectRow);
    }
  });
}

// Filter input event listener to re-render tables on input
document.getElementById("filterInput").addEventListener("input", renderAllTables);

// Initial UI setup
refreshProjectNumbers();
renderAllTables();

// Display logged-in user info
document.getElementById("currentUser").textContent = `${authData.username} · ${authData.role}`;

// Logout button handler with confirmation
document.getElementById("logout-btn").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to logout?")) return;

  const response = await fetch("/logout", { method: "POST" });
  if (response.ok) {
    location.href = "/login.html";
  }
});

// Export to Excel button handler
document.getElementById("exportXLSX").addEventListener("click", () => {
  window.location.href = "/export-excel";
});

// Export to Google Calendar button handler with UI feedback
document.getElementById("exportCalendarBtn").addEventListener("click", async () => {
  const btn = document.getElementById("exportCalendarBtn");
  btn.disabled = true;
  btn.textContent = "Syncing...";

  try {
    const response = await fetch("/export-calendar", { method: "POST" });
    const result = await response.json();

    if (result.success) {
      alert(`Synced ${result.synced} tasks to Google Calendar!`);
    } else {
      alert("Sync failed: " + result.error);
    }
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "⟳ Export to Google Calendar";
  }
});

// Logs page button handler (visible only for engineering admin)
document.getElementById("logsBtn").addEventListener("click", () => {
  location.href = "/logs.html";
});

// Toggle section buttons for collapsing project tables
document.querySelectorAll(".toggle-section-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const container = document.getElementById(targetId);
    const isHidden = container.classList.toggle("hidden");
    btn.textContent = isHidden ? "▸" : "▾";
  });

  // Collapse Done and Hold sections by default, keep On-going open
  const targetId = btn.dataset.target;
  if (targetId === "doneTableContainer" || targetId === "holdCloseTableContainer") {
    document.getElementById(targetId).classList.add("hidden");
    btn.textContent = "▸";
  }
});
