  const authResponse =
      await fetch("/me");

  if (!authResponse.ok) {

      location.href =
          "/login.html";

  }

  // Load or initialize projects data from local storage
  // let projects = JSON.parse(localStorage.getItem("projectsData")) || defaultData;

  const projectsResponse =
      await fetch("/projects");

  let projects =
      await projectsResponse.json();

  console.log("Loaded projects data:", projects);

  // Save projects to database
  async function saveProject(project) {

    const response =
        await fetch(
            `/projects/${project.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(project)
            }
        );
    
    if (!response.ok) {

        throw new Error(
            "Failed to save project"
        );

    }



}

  async function saveTask(task) {

      const response =
          await fetch(
              `/tasks/${task.id}`,
              {
                  method: "PUT",
                  headers: {
                      "Content-Type":
                          "application/json"
                  },
                  body:
                      JSON.stringify(task)
              }
          );

      if (!response.ok) {

          throw new Error(
              "Failed to save task"
          );

      }

  }

  async function createProject(project) {

      const response =
          await fetch(
              "/projects",
              {
                  method: "POST",
                  headers: {
                      "Content-Type":
                          "application/json"
                  },
                  body:
                      JSON.stringify(project)
              }
          );

      if (!response.ok) {

          throw new Error(
              "Failed to create project"
          );

      }

      return await response.json();
  }

async function createTask(
    projectId,
    task
) {

    const response =
        await fetch(
            `/projects/${projectId}/tasks`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(task)
            }
        );

    if (!response.ok) {

        throw new Error(
            "Failed to create task"
        );

    }

    return await response.json();
}

  // Utility: Create editable cell with input/select depending on column
  function createEditableCell(rowData, key, isTask = false, projectId = null, taskId = null) {
    const td = document.createElement("td");
    td.classList.add("editable");

    function createInput(value) {
      if (key === "status") {
        const select = document.createElement("select");
        const options = isTask ? ["Done", "On-going", "Hold/Close"] : ["On-going", "Hold/Close", "Done"];
        options.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          if (opt === value) option.selected = true;
          select.appendChild(option);
        });
        return select;
      } else if (key === "startDate" || key === "endDate" || key === "dueDate") {
        const input = document.createElement("input");
        input.type = "date";
        input.value = value || "";
        return input;
      } else if (key === "progress" || key === "pastDueTasks") {
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

    td.textContent = rowData[key] || "";

    td.addEventListener("click", () => {
      if (td.querySelector("input") || td.querySelector("select")) return; // already editing

      const input = createInput(rowData[key]);
      td.textContent = "";
      td.appendChild(input);
      input.focus();

    async function saveEdit() {

        let newValue = input.value;

        if (key === "progress" || key === "pastDueTasks") {
            newValue = parseInt(newValue) || 0;
        }

        const oldValue = rowData[key];

        rowData[key] = newValue;

        try {

            if (isTask) {
                await saveTask(rowData);
            }
            else {
                await saveProject(rowData);
            }

        }
        catch (err) {

            rowData[key] = oldValue;

            console.error(err);

            alert(
                isTask
                    ? "Failed to save task"
                    : "Failed to save project"
            );

            return;
        }

        td.textContent = newValue;

        if (!isTask) {
            renderAllTables();
        }
        else {
            renderTasksForProject(projectId);
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

  // Update project status and move project to correct section
  function updateProjectStatus(projectId, newStatus) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    project.status = newStatus;
  }

  // Update task status and move task to correct section inside project
  function updateTaskStatus(projectId, taskId, newStatus) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.status = newStatus;
  }

  // Create project row with toggle button and nested tasks row (hidden by default)
  function createProjectRow(project) {
    const tr = document.createElement("tr");
    tr.dataset.projectId = project.id;

    // Create editable cells for project columns
    tr.appendChild(createEditableCell(project, "projectName", false, project.id));
    tr.appendChild(createEditableCell(project, "client", false, project.id));
    tr.appendChild(createEditableCell(project, "personInCharge", false, project.id));
    tr.appendChild(createEditableCell(project, "startDate", false, project.id));
    tr.appendChild(createEditableCell(project, "endDate", false, project.id));
    tr.appendChild(createEditableCell(project, "progress", false, project.id));
    tr.appendChild(createEditableCell(project, "ongoingActions", false, project.id));
    tr.appendChild(createEditableCell(project, "pastDueTasks", false, project.id));
    tr.appendChild(createEditableCell(project, "status", false, project.id));
    

    // Toggle button cell
    const toggleTd = document.createElement("td");
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "▼";
    toggleBtn.classList.add("toggle-btn");
    toggleBtn.addEventListener("click", () => toggleNestedTable(project.id, toggleBtn));
    toggleTd.classList.add("toggle-btn-cell");
    toggleTd.appendChild(toggleBtn);
    tr.appendChild(toggleTd);

    // Delete Project cell
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("actions-cell");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.padding = "4px 8px";
    delBtn.addEventListener("click", () => {
      deleteProject(project.id);
    });
    actionsTd.appendChild(delBtn);
    tr.appendChild(actionsTd);

    return tr;
  }

  // Create nested tasks row (hidden by default)
  function createNestedTasksRow(project) {
    const tr = document.createElement("tr");
    tr.classList.add("nested-tasks-row", "hidden");
    tr.dataset.projectId = project.id;

    const td = document.createElement("td");
    td.colSpan = 11;

    // Create nested tasks table with sorting and filtering
    const nestedTable = document.createElement("table");
    nestedTable.classList.add("nested-table");

    // Header with sorting
    const thead = document.createElement("thead");

    // Filter row for tasks
    const filterRow = document.createElement("tr");
    filterRow.classList.add("task-filter-row");
    const filterTd = document.createElement("td");
    filterTd.colSpan = 7;
    filterTd.innerHTML = `
      <label>Filter Tasks of <b>${project.projectName}</b> by Status:</label>
      <select class="task-status-filter">
        <option value="all">All</option>
        <option value="On-going">On-going</option>
        <option value="Hold/Close">Hold/Close</option>
        <option value="Done">Done</option>
      </select>
      <input type="text" class="task-text-filter" placeholder="Filter tasks by name or PIC..." style="width: 300px; margin-left: 10px;" />
      <button class="add-task-btn">Add Task</button>
    `;
    filterRow.appendChild(filterTd);
    thead.appendChild(filterRow);

    const headerRow = document.createElement("tr");
    ["No.", "Tasks", "PIC", "Start Date", "Due Date", "Progress (%)", "Comments", "Status", "Actions"].forEach(col => {
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

    // Attach event listeners for sorting and filtering
    attachNestedTableEvents(nestedTable, project);

    return tr;
  }

  // Attach sorting/filtering events to nested task table
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

    // Initial render
    renderTasks(project, tbody, sortKey, sortDirection, getNestedFilters(table));
  }

  // Get current filters from nested table
  function getNestedFilters(table) {
    const statusFilter = table.querySelector(".task-status-filter").value;
    const textFilter = table.querySelector(".task-text-filter").value.trim().toLowerCase();
    return { statusFilter, textFilter };
  }

  // Update sort indicators on nested table headers
  function updateSortIndicators(thead, key, direction) {
    thead.querySelectorAll("th").forEach(th => {
      th.classList.remove("sort-asc", "sort-desc");
      if (th.dataset.key === key) {
        th.classList.add(direction === "asc" ? "sort-asc" : "sort-desc");
      }
    });
  }

  // Render tasks inside nested table tbody with sorting and filtering
  function renderTasks(project, tbody, sortKey, sortDirection, filters) {
    tbody.innerHTML = "";

    let filteredTasks = project.tasks.filter(task => {
      // Filter by status
      if (filters.statusFilter !== "all") {
        if (filters.statusFilter === "Hold/Close") {
          if (task.status !== "Hold/Close") return false;
        } else if (task.status !== filters.statusFilter) return false;
      }
      // Filter by text in task name or PIC
      if (filters.textFilter) {
        const text = filters.textFilter;
        if (!task.task.toLowerCase().includes(text) && !task.pic.toLowerCase().includes(text)) {
          return false;
        }
      }
      return true;
    });

    // Sort tasks
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

    filteredTasks.forEach((task, index) => {
      const tr = document.createElement("tr");
      tr.dataset.taskId = task.id;

      // Number cell
      const numberTd = document.createElement("td");
      numberTd.textContent = index + 1;
      tr.appendChild(numberTd);

      tr.appendChild(createEditableCell(task, "task", true, project.id, task.id));
      tr.appendChild(createEditableCell(task, "pic", true, project.id, task.id));
      tr.appendChild(createEditableCell(task, "startDate", true, project.id, task.id));
      tr.appendChild(createEditableCell(task, "dueDate", true, project.id, task.id));
      tr.appendChild(createEditableCell(task, "comments", true, project.id, task.id));
      tr.appendChild(createEditableCell(task, "percentage", true, project.id, task.id));
      tr.appendChild(createEditableCell(task, "status", true, project.id, task.id));

      // Actions cell (optional: add delete task button)
      const actionsTd = document.createElement("td");
      actionsTd.classList.add("actions-cell");
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.padding = "4px 8px";
      delBtn.addEventListener("click", () => {
        deleteTask(project.id, task.id);
      });
      actionsTd.appendChild(delBtn);
      tr.appendChild(actionsTd);

      tbody.appendChild(tr);
    });
  }

  // Delete task by id
  async function deleteTask(projectId, taskId) {
    let userChoice = confirm("Are you sure you want to delete this task?");
    if (!userChoice) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    await fetch(
    `/tasks/${taskId}`,
    {
        method: "DELETE"
    }
    );

    project.tasks =
        project.tasks.filter(
            t =>
                t.id !== taskId
        );
    renderAllTables();
    showNestedTable(projectId);
  }

  // Delete project by id
  async function deleteProject(projectId) {
    let userChoice = confirm("Are you sure you want to delete this project and all its tasks?");
    if (!userChoice) return;

    await fetch(
    `/projects/${projectId}`,
    {
        method: "DELETE"
    }
    );

    projects =
      projects.filter(
          p =>
              p.id !== projectId
      );
    renderAllTables();
  }

  // Add new task to project
  async function addNewTask(
      projectId
  ) {

      const project =
          projects.find(
              p =>
                  p.id === projectId
          );

      if (!project) {
          return;
      }

      const newTask = {

          task: "New Task",
          pic: "",
          startDate: "",
          dueDate: "",
          comments: "",
          status: "On-going"

      };

      try {

          const result =
              await createTask(
                  projectId,
                  newTask
              );

          newTask.id =
              result.id;

          project.tasks.push(
              newTask
          );

          renderAllTables();

          showNestedTable(
              projectId
          );

      }
      catch(err) {

          console.error(err);

          alert(
              "Failed to create task"
          );

      }

  }

  // Add new project
  document.getElementById("addProjectBtn").addEventListener(
      "click",
      async () => {

          const newProject = {

              projectName: "New Project",
              client: "",
              personInCharge: "",
              startDate: "",
              endDate: "",
              progress: 0,
              ongoingActions: "",
              pastDueTasks: 0,
              status: "On-going"

          };

          try {

              const result =
                  await createProject(
                      newProject
                  );

              newProject.id =
                  result.id;

              newProject.tasks =
                  [];

              projects.push(
                  newProject
              );

              renderAllTables();

          }
          catch(err) {

              console.error(err);

              alert(
                  "Failed to create project"
              );

          }

      }
  );

  // Toggle nested tasks visibility
  function toggleNestedTable(projectId, btn) {
    const nestedRow = document.querySelector(`tr.nested-tasks-row[data-project-id='${projectId}']`);
    if (!nestedRow) return;
    if (nestedRow.classList.contains("hidden")) {
      nestedRow.classList.remove("hidden");
      btn.textContent = "▲";
    } else {
      nestedRow.classList.add("hidden");
      btn.textContent = "▼";
    }
  }

  // Show nested tasks row (used after adding or deleting task)
  function showNestedTable(projectId) {
    const nestedRow = document.querySelector(`tr.nested-tasks-row[data-project-id='${projectId}']`);
    if (!nestedRow) return;
    nestedRow.classList.remove("hidden");
    const toggleBtn = document.querySelector(`tr[data-project-id='${projectId}'] button.toggle-btn`);
    if (toggleBtn) toggleBtn.textContent = "▲";
  }


  // Render all project tables and nested tasks
  function renderAllTables() {
    // Clear all tables
    ["onGoingTable", "doneTable", "holdCloseTable"].forEach(id => {
      document.querySelector(`#${id} tbody`).innerHTML = "";
    });

    // Get project filters
    const filterText = document.getElementById("filterInput").value.trim().toLowerCase();

    // Filter projects by category and text
    let filteredProjects = projects.filter(p => {

      // Filter by text in projectName or client
      if (filterText) {
        if (!p.projectName.toLowerCase().includes(filterText) && !p.client.toLowerCase().includes(filterText)) {
          return false;
        }
      }
      return true;
    });

    // Sort projects by projectName ascending by default
    filteredProjects.sort((a, b) => a.projectName.localeCompare(b.projectName));

    filteredProjects.forEach((project, index) => {
      const projectRow = createProjectRow(project);
      const nestedRow = createNestedTasksRow(project);

      if (project.status === "On-going") {
        document.querySelector("#onGoingTable tbody").appendChild(projectRow);
        document.querySelector("#onGoingTable tbody").appendChild(nestedRow);
      } else if (project.status === "Done") {
        document.querySelector("#doneTable tbody").appendChild(projectRow);
      } else if (project.status === "Hold/Close") {
        document.querySelector("#holdCloseTable tbody").appendChild(projectRow);
      }
    });
  }

  // Event listeners for project filters
  document.getElementById("filterInput").addEventListener("input", renderAllTables);

  // Initial render
  renderAllTables();

  