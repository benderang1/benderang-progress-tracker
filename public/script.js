// Fetch current user info and handle authentication
const authResponse = await fetch("/me");
const authData = await authResponse.json();
const isViewer = authData.role === "viewer";

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

// Socket IO Listeners Start

const socket = io();

socket.on("taskUpdated", ({ taskId, task }) => {
  const project = projects.find((p) => p.tasks.some((t) => t.id == taskId));
  if (!project) return;

  const taskIndex = project.tasks.findIndex((t) => t.id == taskId);
  if (taskIndex === -1) return;

  project.tasks[taskIndex] = { ...project.tasks[taskIndex], ...task };

  syncProjectCalculations(project).then(() => renderAllTables());
});

socket.on("taskCreated", (newTask) => {
  const project = projects.find((p) => p.id == newTask.project_id);
  if (!project) return;
  if (project.tasks.some((t) => t.id === newTask.id)) return; // avoid dup if same client triggered it

  project.tasks.push(newTask);
  renderAllTables();
});

socket.on("taskDeleted", ({ taskId }) => {
  projects.forEach((p) => {
    p.tasks = p.tasks.filter((t) => t.id != taskId);
  });
  renderAllTables();
});

socket.on("projectCreated", (newProject) => {
  if (projects.some((p) => p.id === newProject.id)) return;
  projects.push(newProject);
  refreshProjectNumbers();
  renderAllTables();
});

socket.on("projectUpdated", ({ projectId, project: updatedProject }) => {
  const index = projects.findIndex((p) => p.id == projectId);
  if (index === -1) return;

  projects[index] = { ...projects[index], ...updatedProject };
  renderAllTables();
});

socket.on("projectDeleted", ({ projectId }) => {
  projects = projects.filter((p) => p.id != projectId);
  refreshProjectNumbers();
  renderAllTables();
});

socket.on("projectsNeedRefresh", async () => {
  const refreshed = await fetch("/projects");
  projects = await refreshed.json();
  renderAllTables();
});

// Socket IO Listeners End

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

function calculateProjectProgress(project) {
  if (!project.tasks || project.tasks.length === 0) {
    return project.progress || 0; // keep manual value if no tasks
  }

  const total = project.tasks.reduce(
    (sum, task) => sum + (parseInt(task.progress) || 0),
    0,
  );
  return Math.round(total / project.tasks.length);
}

function isTaskOverdue(task) {
  if (task.status === "Done") return false;
  if (!task.dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

function calculateOverdueTasks(project) {
  if (!project.tasks || project.tasks.length === 0) {
    return 0;
  }

  return project.tasks.filter((task) => isTaskOverdue(task)).length;
}

async function syncProjectCalculations(project) {
  const newProgress = calculateProjectProgress(project);
  const newOverdue = calculateOverdueTasks(project);

  let changed = false;

  if (project.progress !== newProgress) {
    project.progress = newProgress;
    changed = true;
  }

  if (project.pastDueTasks !== newOverdue) {
    project.pastDueTasks = newOverdue;
    changed = true;
  }

  if (changed) {
    try {
      await saveProject(project);
    } catch (err) {
      console.error("Failed to sync project calculations:", err);
    }
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
 * Capture which nested task tables are currently open (not hidden), keyed by projectId
 * @returns {Set<string>} Set of projectIds that are currently expanded
 */
function captureOpenNestedTables() {
  const openProjectIds = new Set();
  document.querySelectorAll(".nested-tasks-row").forEach((row) => {
    if (!row.classList.contains("hidden")) {
      openProjectIds.add(row.dataset.projectId);
    }
  });
  return openProjectIds;
}

/**
 * Restore which nested task tables should be open after re-render
 * @param {Set<string>} openProjectIds - Set of projectIds that were open before re-render
 */
function restoreOpenNestedTables(openProjectIds) {
  openProjectIds.forEach((projectId) => {
    showNestedTable(projectId);
  });
}

/**
 * Capture current scrollTop of each open nested-table scroll wrapper, keyed by projectId
 * @returns {Object} Map of projectId -> scrollTop
 */
function captureNestedScrollPositions() {
  const positions = {};
  document.querySelectorAll(".nested-tasks-row").forEach((row) => {
    const wrapper = row.querySelector(".nested-table-scroll-wrapper");
    if (wrapper) {
      positions[row.dataset.projectId] = wrapper.scrollTop;
    }
  });
  return positions;
}

/**
 * Restore scrollTop of each nested-table scroll wrapper after re-render
 * @param {Object} positions - Map of projectId -> scrollTop
 */
function restoreNestedScrollPositions(positions) {
  document.querySelectorAll(".nested-tasks-row").forEach((row) => {
    const wrapper = row.querySelector(".nested-table-scroll-wrapper");
    const saved = positions[row.dataset.projectId];
    if (wrapper && saved) {
      wrapper.scrollTop = saved;
    }
  });
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
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${months[+month - 1]} ${year}`;
}

// Calculate project counts by status
const onGoingProjects = projects.filter((p) => p.status === "On-going");
const finishedProjects = projects.filter((p) => p.status === "Done");
const holdProjects = projects.filter((p) => p.status === "Hold");

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
function createEditableCell(
  rowData,
  key,
  isTask = false,
  projectId = null,
  taskId = null,
) {
  const td = document.createElement("td");
  td.classList.add("editable");

  // Create appropriate input/select element based on field type
  function createInput(value) {
    if (key === "status") {
      const select = document.createElement("select");
      ["On-going", "Hold", "Done"].forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        if (opt === value) option.selected = true;
        select.appendChild(option);

        select.addEventListener("change", () => {
          if (select.value === "Done" && isTask) {
            rowData.completionDate = new Date().toISOString().split("T")[0];
          }
        });
      });
      return select;
    } else if (
      ["startDate", "endDate", "dueDate", "completionDate"].includes(key)
    ) {
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
    } else if (key === "priority") {
      const input = document.createElement("input");
      input.type = "number";

      const onGoingCount = projects.filter(
        (p) => p.status === "On-going",
      ).length;

      input.min = 0;
      input.max = onGoingCount;
      input.value = value ?? 0;
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
    const overdueClass =
      isTask && isTaskOverdue(rowData) ? "progress-fill-overdue" : "";
    td.innerHTML = `
      <div class="progress-container">
        <div class="progress-fill ${overdueClass}" style="width:${rowData[key]}%"></div>
        <div class="progress-text">${rowData[key]}%</div>
      </div>
    `;
  } else {
    td.textContent =
      ["startDate", "endDate", "dueDate", "completionDate"].includes(key) &&
      rowData[key]
        ? formatDate(rowData[key])
        : rowData[key] || "";
  }

  // Make cells read only for viewers
  if (isViewer) {
    td.classList.remove("editable"); // remove hover/cursor styling too
    td.style.cursor = "default";
    return td; // skip attaching click listener entirely
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

      if (["progress", "pastDueTasks", "priority"].includes(key)) {
        newValue = parseInt(newValue) || 0;
      }

      // Validate priority range using a fresh count from the database
      if (key === "priority") {
        let onGoingCount;

        try {
          const countResponse = await fetch("/projects/ongoing-count");
          const countData = await countResponse.json();
          onGoingCount = countData.count;
        } catch (err) {
          console.error("Failed to fetch on-going count:", err);
          alert("Could not verify priority range. Please try again.");
          td.textContent = rowData[key] || "";
          return;
        }

        if (newValue < 0 || newValue > onGoingCount) {
          alert(
            `Priority must be between 0 and ${onGoingCount} (current number of On-going projects).`,
          );
          td.textContent = rowData[key] || "";
          return;
        }
      }

      const oldValue = rowData[key];
      rowData[key] = newValue;

      const savedScrollPositions = captureNestedScrollPositions();

      try {
        const today = new Date().toISOString().split("T")[0];

        if (key === "progress") {
          if (newValue === 100) {
            rowData.status = "Done";
            rowData.completionDate = today;
          } else if (oldValue === 100 && newValue < 100) {
            // Moving away from 100% undoes the Done state
            if (rowData.status === "Done") {
              rowData.status = "On-going";
            }

            rowData.completionDate = "";
          }
        } else if (key === "status") {
          if (newValue === "Done") {
            rowData.progress = 100;
            rowData.completionDate = today;
          } else if (oldValue === "Done") {
            rowData.completionDate = "";
            // Prevent non-Done tasks from staying at 100%
            if (rowData.progress === 100) {
              rowData.progress = 90;
            }
          }
        } else if (key === "completionDate") {
          if (newValue) {
            rowData.status = "Done";
            rowData.progress = 100;
          } else {
            if (rowData.status === "Done") {
              rowData.status = "On-going";
            }

            if (rowData.progress === 100) {
              rowData.progress = 90;
            }
          }
        }

        if (isTask) {
          await saveTask(rowData);
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            await syncProjectCalculations(project);
          }
        } else {
          await saveProject(rowData);
          if (key === "priority" || key === "status") {
            const refreshed = await fetch("/projects");
            const refreshedProjects = await refreshed.json();
            projects.length = 0;
            projects.push(...refreshedProjects);
          }
        }
      } catch (err) {
        rowData[key] = oldValue;
        console.error(err);
        alert(isTask ? "Failed to save task" : "Failed to save project");
        td.textContent = oldValue;
        return;
      }

      td.textContent =
        ["startDate", "endDate", "dueDate"].includes(key) && newValue
          ? formatDate(newValue)
          : newValue;

      // Re-render tables to reflect changes
      renderAllTables();
      showNestedTable(projectId);

      requestAnimationFrame(() => {
        restoreNestedScrollPositions(savedScrollPositions);
      });
    }

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keydown", (e) => {
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

  const toggleTd = document.createElement("td");
  toggleTd.classList.add("toggle-btn-cell");
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "▸";
  toggleBtn.classList.add("toggle-btn");
  toggleBtn.addEventListener("click", () =>
    toggleNestedTable(project.id, toggleBtn),
  );
  toggleTd.appendChild(toggleBtn);
  tr.appendChild(toggleTd);

  tr.appendChild(createEditableCell(project, "projectName", false, project.id));

  if (project.status === "On-going") {
    tr.appendChild(createEditableCell(project, "priority", false, project.id));
  }

  tr.appendChild(createEditableCell(project, "client", false, project.id));
  tr.appendChild(
    createEditableCell(project, "personInCharge", false, project.id),
  );
  tr.appendChild(createEditableCell(project, "startDate", false, project.id));
  tr.appendChild(createEditableCell(project, "endDate", false, project.id));

  const progressTd = document.createElement("td");
  progressTd.innerHTML = `
      <div class="progress-container">
          <div class="progress-fill" style="width:${project.progress}%"></div>
          <div class="progress-text">${project.progress}%</div>
      </div>
  `;
  tr.appendChild(progressTd);

  tr.appendChild(
    createEditableCell(project, "ongoingActions", false, project.id),
  );

  const overdueTd = document.createElement("td");
  if (project.pastDueTasks > 0) {
    overdueTd.innerHTML = `<span class="overdue-badge">${project.pastDueTasks}</span>`;
  } else {
    overdueTd.innerHTML = `<span class="overdue-zero">0</span>`;
  }
  tr.appendChild(overdueTd);

  tr.appendChild(createEditableCell(project, "status", false, project.id));

  // Only block kept — the conditional one
  if (!isViewer) {
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("actions-cell");
    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => deleteProject(project.id));
    actionsTd.appendChild(delBtn);
    tr.appendChild(actionsTd);
  } else {
    tr.appendChild(document.createElement("td"));
  }

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
  td.colSpan = 12;

  // Wrap the nested table in its own scrollable container
  const scrollWrapper = document.createElement("div");
  scrollWrapper.classList.add("nested-table-scroll-wrapper");

  const nestedTable = document.createElement("table");
  nestedTable.classList.add("nested-table");

  const thead = document.createElement("thead");

  // Filter row with status filter, text filter, and add task button
  const filterRow = document.createElement("tr");
  filterRow.classList.add("task-filter-row");
  const filterTd = document.createElement("td");
  filterTd.colSpan = 12;
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
      ${isViewer ? "" : '<button class="add-task-btn">+ Add Task</button>'}
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
    "Completion Date",
    "Task Progress",
    "Comments",
    "Status",
    "",
  ].forEach((col) => {
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

  // Footer row with a second "Add Task" button, after the last task row
  const tfoot = document.createElement("tfoot");
  const footerRow = document.createElement("tr");
  footerRow.classList.add("task-footer-row");
  const footerTd = document.createElement("td");
  footerTd.colSpan = 10;
  footerTd.innerHTML = isViewer
    ? ""
    : '<button class="add-task-btn add-task-btn-bottom">+ Add Task</button>';
  footerRow.appendChild(footerTd);
  tfoot.appendChild(footerRow);
  nestedTable.appendChild(tfoot);

  // Wrap the table so its header can stick within a bounded scroll box
  scrollWrapper.classList.add("nested-table-scroll-wrapper");
  scrollWrapper.appendChild(nestedTable);

  td.appendChild(scrollWrapper);
  tr.appendChild(td);

  attachNestedTableEvents(nestedTable, project);

  requestAnimationFrame(() => {
    const filterRowHeight = thead.querySelector(
      ".task-filter-row td",
    ).offsetHeight;
    nestedTable
      .querySelectorAll("thead tr:not(.task-filter-row) th")
      .forEach((th) => {
        th.style.top = `${filterRowHeight}px`;
      });
  });

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
  const tfoot = table.querySelector("tfoot");
  let sortKey = null;
  let sortDirection = "asc";

  thead.querySelectorAll("th").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      if (!key) return;

      if (sortKey === key) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortKey = key;
        sortDirection = "asc";
      }

      renderTasks(
        project,
        tbody,
        sortKey,
        sortDirection,
        getNestedFilters(table),
      );
      updateSortIndicators(thead, key, sortDirection);
    });
  });

  const statusFilter = thead.querySelector(".task-status-filter");
  const textFilter = thead.querySelector(".task-text-filter");
  const addTaskBtn = thead.querySelector(".add-task-btn");
  const addTaskBtnBottom = tfoot.querySelector(".add-task-btn-bottom");

  statusFilter.addEventListener("change", () => {
    renderTasks(
      project,
      tbody,
      sortKey,
      sortDirection,
      getNestedFilters(table),
    );
  });
  textFilter.addEventListener("input", () => {
    renderTasks(
      project,
      tbody,
      sortKey,
      sortDirection,
      getNestedFilters(table),
    );
  });

  // Guard against missing buttons for viewers
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      addNewTask(project.id);
    });
  }

  if (addTaskBtnBottom) {
    addTaskBtnBottom.addEventListener("click", () => {
      addNewTask(project.id);
    });
  }

  renderTasks(project, tbody, sortKey, sortDirection, getNestedFilters(table));
}

/**
 * Get current filters from nested tasks table
 * @param {HTMLElement} table - Nested tasks table element
 * @returns {Object} Filters object with statusFilter and textFilter
 */
function getNestedFilters(table) {
  const statusFilter = table.querySelector(".task-status-filter").value;
  const textFilter = table
    .querySelector(".task-text-filter")
    .value.trim()
    .toLowerCase();
  return { statusFilter, textFilter };
}

/**
 * Update sort indicators (arrows) on nested table headers
 * @param {HTMLElement} thead - Table header element
 * @param {string} key - Current sort key
 * @param {string} direction - "asc" or "desc"
 */
function updateSortIndicators(thead, key, direction) {
  thead.querySelectorAll("th").forEach((th) => {
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
  let filteredTasks = project.tasks.filter((task) => {
    if (
      filters.statusFilter !== "all" &&
      task.status !== filters.statusFilter
    ) {
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
    td.colSpan = 10; // Number of columns in task table
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

    if (isTaskOverdue(task)) {
      tr.classList.add("overdue-row");
    }

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
      "completionDate",
      "progress",
      "comments",
      "status",
    ].forEach((key) => {
      tr.appendChild(createEditableCell(task, key, true, project.id, task.id));
    });

    // Delete task button cell
    if (!isViewer) {
      const actionsTd = document.createElement("td");
      actionsTd.classList.add("actions-cell");
      const delBtn = document.createElement("button");
      delBtn.textContent = "✖";
      delBtn.classList.add("delete-btn");
      delBtn.addEventListener("click", () => deleteTask(project.id, task.id));
      actionsTd.appendChild(delBtn);
      tr.appendChild(actionsTd);
    } else {
      tr.appendChild(document.createElement("td")); // empty cell to keep column alignment
    }

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

  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  await fetch(`/tasks/${taskId}`, { method: "DELETE" });

  project.tasks = project.tasks.filter((t) => t.id !== taskId);

  const savedScrollPositions = captureNestedScrollPositions();

  await syncProjectCalculations(project);

  renderAllTables();
  showNestedTable(projectId);

  requestAnimationFrame(() => {
    restoreNestedScrollPositions(savedScrollPositions);
  });
}

/**
 * Delete a project and all its tasks after confirmation
 * @param {string} projectId - Project ID
 */
async function deleteProject(projectId) {
  if (
    !confirm("Are you sure you want to delete this project and all its tasks?")
  )
    return;

  await fetch(`/projects/${projectId}`, { method: "DELETE" });

  projects = projects.filter((p) => p.id !== projectId);

  refreshProjectNumbers();
  renderAllTables();
}

/**
 * Add a new task to a project
 * @param {string} projectId - Project ID
 */
async function addNewTask(projectId) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const newTask = {
    task: "New Task",
    pic: "",
    startDate: "",
    dueDate: "",
    progress: 0,
    comments: "",
    status: "On-going",
    completionDate: "",
  };

  const savedScrollPositions = captureNestedScrollPositions();

  try {
    const result = await createTask(projectId, newTask);
    newTask.id = result.id;
    project.tasks.push(newTask);

    await syncProjectCalculations(project);

    renderAllTables();
    showNestedTable(projectId);

    requestAnimationFrame(() => {
      restoreNestedScrollPositions(savedScrollPositions);
    });
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
    await createProject(newProject);
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
  const nestedRow = document.querySelector(
    `tr.nested-tasks-row[data-project-id='${projectId}']`,
  );
  if (!nestedRow) return;

  if (nestedRow.classList.contains("hidden")) {
    nestedRow.classList.remove("hidden");
    btn.textContent = "▾";

    requestAnimationFrame(() => {
      const filterRowEl = nestedRow.querySelector(".task-filter-row td");
      const filterRowHeight = filterRowEl ? filterRowEl.offsetHeight : 0;
      nestedRow
        .querySelectorAll("thead tr:not(.task-filter-row) th")
        .forEach((th) => {
          th.style.top = `${filterRowHeight}px`;
        });
    });
  } else {
    nestedRow.classList.add("hidden");
    btn.textContent = "▸";
  }
}

/**
 * Show nested tasks row for a project (used after adding/deleting tasks)
 * @param {string} projectId - Project ID
 */
function showNestedTable(projectId) {
  const nestedRow = document.querySelector(
    `tr.nested-tasks-row[data-project-id='${projectId}']`,
  );
  if (!nestedRow) return;

  nestedRow.classList.remove("hidden");

  const toggleBtn = document.querySelector(
    `tr[data-project-id='${projectId}'] button.toggle-btn`,
  );
  if (toggleBtn) toggleBtn.textContent = "▾";

  requestAnimationFrame(() => {
    const filterRowEl = nestedRow.querySelector(".task-filter-row td");
    const filterRowHeight = filterRowEl ? filterRowEl.offsetHeight : 0;
    nestedRow
      .querySelectorAll("thead tr:not(.task-filter-row) th")
      .forEach((th) => {
        th.style.top = `${filterRowHeight}px`;
      });
  });
}

/**
 * Render all project tables and nested tasks
 */
function renderAllTables() {
  const savedScrollPositions = captureNestedScrollPositions();
  const openProjectIds = captureOpenNestedTables();

  ["onGoingTable", "doneTable", "holdCloseTable"].forEach((id) => {
    document.querySelector(`#${id} tbody`).innerHTML = "";
  });

  const filterText = document
    .getElementById("filterInput")
    .value.trim()
    .toLowerCase();

  let filteredProjects = projects.filter((p) => {
    if (filterText) {
      return (
        p.projectName.toLowerCase().includes(filterText) ||
        p.client.toLowerCase().includes(filterText)
      );
    }
    return true;
  });

  // Split by status first
  const onGoing = filteredProjects.filter((p) => p.status === "On-going");
  const done = filteredProjects.filter((p) => p.status === "Done");
  const hold = filteredProjects.filter((p) => p.status === "Hold");

  // Only On-going sorts by priority (0 = unranked, shown first)
  onGoing.sort((a, b) => {
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;

    if (pa === 0 && pb === 0) return 0;
    if (pa === 0) return -1;
    if (pb === 0) return 1;

    return pa - pb;
  });

  // Done and Hold sort alphabetically, priority irrelevant
  done.sort((a, b) => a.projectName.localeCompare(b.projectName));
  hold.sort((a, b) => a.projectName.localeCompare(b.projectName));

  onGoing.forEach((project) => {
    const projectRow = createProjectRow(project);
    const nestedRow = createNestedTasksRow(project);
    document.querySelector("#onGoingTable tbody").appendChild(projectRow);
    document.querySelector("#onGoingTable tbody").appendChild(nestedRow);
  });

  done.forEach((project) => {
    document
      .querySelector("#doneTable tbody")
      .appendChild(createProjectRow(project));
  });

  hold.forEach((project) => {
    document
      .querySelector("#holdCloseTable tbody")
      .appendChild(createProjectRow(project));
  });

  restoreOpenNestedTables(openProjectIds);
  restoreNestedScrollPositions(savedScrollPositions);
}

// Filter input event listener to re-render tables on input
document
  .getElementById("filterInput")
  .addEventListener("input", renderAllTables);

// Initial UI setup
refreshProjectNumbers();
renderAllTables();

// Display logged-in user info
document.getElementById("currentUser").textContent =
  `${authData.username} · ${authData.role}`;

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
document
  .getElementById("exportCalendarBtn")
  .addEventListener("click", async () => {
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
document.querySelectorAll(".toggle-section-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const container = document.getElementById(targetId);
    const isHidden = container.classList.toggle("hidden");
    btn.textContent = isHidden ? "▸" : "▾";
  });

  // Collapse Done and Hold sections by default, keep On-going open
  const targetId = btn.dataset.target;
  if (
    targetId === "doneTableContainer" ||
    targetId === "holdCloseTableContainer"
  ) {
    document.getElementById(targetId).classList.add("hidden");
    btn.textContent = "▸";
  }
});

document.getElementById("createMOMBtn").addEventListener("click", () => {
  showMomModal();
});

function showMomModal() {
  const overlay = document.createElement("div");
  overlay.className = "mom-modal-overlay";

  const onGoingProjectsList = projects.filter((p) => p.status === "On-going");

  function projectCheckboxList(idPrefix) {
    return onGoingProjectsList
      .map(
        (p) => `
      <label class="mom-project-checkbox">
        <input type="checkbox" value="${p.id}" data-group="${idPrefix}">
        ${p.client} - ${p.projectName}
      </label>
    `,
      )
      .join("");
  }

  overlay.innerHTML = `
    <div class="mom-modal">
      <h2>Create MoM Tables</h2>

      <div class="mom-project-section">
        <h3>Follow Up from Previous Meeting — select projects</h3>
        <div class="mom-project-list">
          ${projectCheckboxList("followup")}
        </div>
      </div>

      <div class="mom-project-section">
        <h3>Current Meeting — select projects</h3>
        <div class="mom-project-list">
          ${projectCheckboxList("current")}
        </div>
      </div>

      <div class="mom-modal-actions">
        <button id="momCancelBtn" class="back-btn">Cancel</button>
        <button id="momGenerateBtn" class="add-project-btn">Generate Tables</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("momCancelBtn").addEventListener("click", () => {
    overlay.remove();
  });

  document
    .getElementById("momGenerateBtn")
    .addEventListener("click", async () => {
      const followupProjectIds = [
        ...overlay.querySelectorAll('input[data-group="followup"]:checked'),
      ].map((cb) => parseInt(cb.value));

      const currentProjectIds = [
        ...overlay.querySelectorAll('input[data-group="current"]:checked'),
      ].map((cb) => parseInt(cb.value));

      if (followupProjectIds.length === 0 && currentProjectIds.length === 0) {
        alert("Select at least one project in either table.");
        return;
      }

      const btn = document.getElementById("momGenerateBtn");
      btn.disabled = true;
      btn.textContent = "Generating...";

      try {
        const response = await fetch("/mom/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followupProjectIds, currentProjectIds }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to generate MoM Tables");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `MoM_${new Date().toISOString().slice(0, 10)}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        overlay.remove();
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = "Generate MoM Tables";
      }
    });
}

// Hide Functions Buttons if user is viewer
if (isViewer) {
  document.getElementById("addProjectBtn").style.display = "none";
  // document.getElementById("importXLSX").style.display = "none";
  document.getElementById("exportCalendarBtn").style.display = "none";
  document.getElementById("createMOMBtn").style.display = "none";
  // exportXLSX stays visible since it's read-only
}

async function recalculateAllProjects() {
  for (const project of projects) {
    await syncProjectCalculations(project);
  }
  renderAllTables();
  alert("All projects recalculated!");
}

window.recalculateAllProjects = recalculateAllProjects;
