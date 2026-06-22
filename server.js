// Load environment variables from .env file into process.env
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const ExcelJS = require("exceljs");
const calendar = require("./calendar");
const ics = require("ics");
const nodemailer = require("nodemailer");

const app = express();

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Configure nodemailer transporter for Gmail using app password from env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "admengineering.benderang@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send calendar invite email with ICS attachment to attendees
 * @param {Object} task - Task details including dueDate, projectName, client, comments
 * @param {string[]} attendeeEmails - List of email addresses to invite
 */
async function sendCalendarInvite(task, attendeeEmails) {
  if (!attendeeEmails || attendeeEmails.length === 0) return;

  // Parse dueDate string "YYYY-MM-DD" into [year, month, day]
  const [year, month, day] = task.dueDate.split("-").map(Number);

  // Create ICS event
  const { error, value } = ics.createEvent({
    title: `[${task.client}-${task.projectName}] -> ${task.task}`,
    description: `Notes: ${task.comments || "-"}`,
    start: [year, month, day, 9, 0],
    end: [year, month, day, 9, 30],
    startInputType: "local",
    location: "Benderang Hidup Indonesia",
    organizer: {
      name: "Engineering Admin",
      email: "admengineering.benderang@gmail.com",
    },
    attendees: attendeeEmails.map(email => ({
      email,
      rsvp: true,
      partstat: "NEEDS-ACTION",
      role: "REQ-PARTICIPANT",
    })),
    alarms: [
      { action: "display", trigger: { days: 1, before: true } },
      { action: "display", trigger: { days: 2, before: true } },
      { action: "display", trigger: { days: 3, before: true } },
    ],
  });

  if (error) {
    console.error("ICS generation error:", error);
    return;
  }

  // Send email with ICS calendar invite
  await transporter.sendMail({
    from: `"Benderang Project Tracker" <admengineering.benderang@gmail.com>`,
    to: attendeeEmails.join(", "),
    subject: `[Task Assignment] ${task.projectName} — ${task.task}`,
    text: `Your task is due on ${day}-${month}-${year}.\n\n
    Project: ${task.projectName}\nTask: ${task.task}\nClient: ${task.client}\nDue: ${day}-${month}-${year}\n
    Notes: ${task.comments || "-"}\n\nPlease accept the calendar invitation attached.`,
    icalEvent: {
      filename: "invite.ics",
      method: "REQUEST",
      content: value,
    },
  });

  console.log(`Invitation sent to: ${attendeeEmails.join(", ")}`);
}

/**
 * Middleware to require user login (session must have userId)
 */
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  next();
}

/**
 * Middleware to require admin role ("engineering admin")
 */
function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  if (req.session.role !== "engineering admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

/**
 * Middleware to block viewers from write operations (CRUD, exports that modify data)
 */
function blockViewer(req, res, next) {
  if (req.session.role === "viewer") {
    return res.status(403).json({ error: "Viewers cannot perform this action" });
  }
  next();
}

/**
 * Write an action log entry to the database
 * @param {sqlite3.Database} db - SQLite database instance
 * @param {string} username - Username performing the action
 * @param {string} action - Action type (CREATE, UPDATE, DELETE)
 * @param {string} entityType - Entity type (project, task, etc.)
 * @param {number|string} entityId - Entity ID
 * @param {string} entityName - Entity name or description
 * @param {string} details - Additional details (optional)
 */
function writeLog(db, username, action, entityType, entityId, entityName, details = "") {
  db.run(
    `INSERT INTO logs (username, action, entityType, entityId, entityName, details)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, action, entityType, entityId, entityName, details],
    err => {
      if (err) console.error("Log write failed:", err.message);
    }
  );
}

/**
 * Reassign priority for a project by moving it to newPriority position,
 * then re-sequencing ALL on-going projects to be gapless (1, 2, 3...N)
 * @param {sqlite3.Database} db - SQLite database instance
 * @param {number} projectId - ID of the project being changed
 * @param {number} newPriority - Desired new priority position (0 = unranked)
 * @returns {Promise<void>}
 */
function reassignPriority(db, projectId, newPriority) {
  return new Promise((resolve, reject) => {

    // Get ALL on-going projects ordered by their current priority
    db.all(
      `
      SELECT id, priority
      FROM projects
      WHERE status = 'On-going'
      ORDER BY
        CASE WHEN priority = 0 OR priority IS NULL THEN 999999 ELSE priority END ASC,
        id ASC
      `,
      [],
      (err, rows) => {
        if (err) return reject(err);

        // Separate the moving project out of the list
        const movingIndex = rows.findIndex(r => r.id === parseInt(projectId));
        if (movingIndex === -1) {
          // Project not found in on-going list (shouldn't normally happen), just resolve
          return resolve();
        }

        const movingProject = rows.splice(movingIndex, 1)[0];

        if (newPriority === 0) {
          // Moving to unranked: just put it at the end of the ranked list conceptually,
          // it will get priority 0 explicitly, everyone else re-sequences 1..N-1
          db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            rows.forEach((row, index) => {
              db.run(
                "UPDATE projects SET priority = ? WHERE id = ?",
                [index + 1, row.id]
              );
            });

            db.run(
              "UPDATE projects SET priority = 0 WHERE id = ?",
              [movingProject.id],
              (err) => {
                if (err) {
                  db.run("ROLLBACK");
                  return reject(err);
                }
                db.run("COMMIT", (err) => {
                  if (err) return reject(err);
                  resolve();
                });
              }
            );
          });
          return;
        }

        // Clamp newPriority to a valid range (1 to rows.length + 1)
        const clampedPriority = Math.max(1, Math.min(newPriority, rows.length + 1));

        // Insert the moving project back into the list at the clamped position
        rows.splice(clampedPriority - 1, 0, movingProject);

        // Re-sequence everyone, gapless, 1-indexed
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          rows.forEach((row, index) => {
            db.run(
              "UPDATE projects SET priority = ? WHERE id = ?",
              [index + 1, row.id]
            );
          });

          db.run("COMMIT", (err) => {
            if (err) {
              db.run("ROLLBACK");
              return reject(err);
            }
            resolve();
          });
        });
      }
    );
  });
}

// Express middleware setup
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 6 * 60 * 60 * 1000, // 6 hours session timeout
    },
  })
);
app.use(express.static("public"));

/**
 * GET /me - Return current logged-in user info or 401 if not logged in
 */
app.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ loggedIn: false });
  }
  res.json({
    loggedIn: true,
    username: req.session.username,
    role: req.session.role,
  });
});

/**
 * GET /projects - Return all projects with nested tasks
 * Requires login
 */
app.get("/projects", requireLogin, (req, res) => {
  const db = new sqlite3.Database("./database/tracker.db");

  db.all("SELECT * FROM projects", [], (err, projects) => {
    if (err) {
      console.error("SQLite error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    db.all("SELECT * FROM tasks", [], (err, tasks) => {
      if (err) {
        console.error("SQLite error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      // Attach tasks to their respective projects
      projects.forEach(project => {
        project.tasks = tasks.filter(task => task.project_id === project.id);
      });

      res.json(projects);
    });
  });
});

/**
 * Helper to abbreviate client name for Excel sheet names
 * @param {string} str - Client name string
 * @returns {string} Abbreviated client name or original if short
 */
function abbreviateClient(str) {
  const words = str.trim().split(" ");
  if (words.length > 1 || str.length > 10) {
    return words.map(word => word[0]).join("").toUpperCase();
  }
  return str;
}

/**
 * GET /logs - Return last 200 logs, admin only
 */
app.get("/logs", requireAdmin, (req, res) => {
  const db = new sqlite3.Database("./database/tracker.db");
  db.all("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 200", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get("/projects/ongoing-count", requireLogin, blockViewer, (req, res) => {
  const db = new sqlite3.Database("./database/tracker.db");

  db.get(
    "SELECT COUNT(*) AS count FROM projects WHERE status = 'On-going'",
    [],
    (err, row) => {
      if (err) {
        console.error("SQLite error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ count: row.count });
    }
  );
});


/**
 * GET /export-excel - Export projects and tasks to Excel file
 * Requires login
 */
app.get("/export-excel", requireLogin, (req, res) => {
  const db = new sqlite3.Database("./database/tracker.db");

  db.all("SELECT * FROM projects", [], async (err, projects) => {
    if (err) return res.status(500).json(err);

    db.all("SELECT * FROM tasks", [], async (err, tasks) => {
      if (err) return res.status(500).json(err);

      const workbook = new ExcelJS.Workbook();

      // Projects worksheet setup
      const projectsSheet = workbook.addWorksheet("Projects");
      projectsSheet.columns = [
        { header: "Project Name", key: "projectName", width: 30 },
        { header: "Priority", key: "priority", width: 12 },
        { header: "Client", key: "client", width: 20 },
        { header: "PIC", key: "personInCharge", width: 20 },
        { header: "Start Date", key: "startDate", width: 15 },
        { header: "Due Date", key: "endDate", width: 15 },
        { header: "Project Progress (%)", key: "progress", width: 20 },
        { header: "Current Actions", key: "ongoingActions", width: 40 },
        { header: "Overdue Tasks", key: "pastDueTasks", width: 20 },
        { header: "Status", key: "status", width: 20 },
      ];

      // Add project rows
      projects.forEach(project => {
        projectsSheet.addRow({
          projectName: project.projectName,
          priority: project.status === "On-going" ? (project.priority ?? 0) : "",
          client: project.client,
          personInCharge: project.personInCharge,
          startDate: project.startDate,
          endDate: project.endDate,
          progress: project.progress,
          ongoingActions: project.ongoingActions,
          pastDueTasks: project.pastDueTasks,
          status: project.status,
        });
      });

      // Style project header row
      projectsSheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4285F4" } };
      });
      projectsSheet.views = [{ state: "frozen", ySplit: 1 }];
      projectsSheet.autoFilter = { from: "A1", to: "J1" };

      // Create individual sheets for each project's tasks
      projects.forEach(project => {
        let sheetName = `${abbreviateClient(project.client)} - ${project.projectName}`;
        // Remove invalid characters and limit length to 31 chars (Excel limit)
        sheetName = sheetName.replace(/[\\\/\*\?\:\[\]]/g, "").substring(0, 31);

        const sheet = workbook.addWorksheet(sheetName);
        sheet.columns = [
          { header: "No.", key: "number", width: 10 },
          { header: "Tasks", key: "task", width: 40 },
          { header: "Assigned To", key: "pic", width: 20 },
          { header: "Issued Date", key: "startDate", width: 20 },
          { header: "Due Date", key: "dueDate", width: 20 },
          { header: "Completion Date", key: "completionDate", width:15 },
          { header: "Task Progress (%)", key: "percentage", width: 20 },
          { header: "Comments", key: "comments", width: 40 },
          { header: "Status", key: "status", width: 20 },
        ];

        const projectTasks = tasks.filter(task => task.project_id === project.id);

        projectTasks.forEach((task, index) => {
          sheet.addRow({
            number: index + 1,
            task: task.task,
            pic: task.pic,
            startDate: task.startDate,
            dueDate: task.dueDate,
            completionDate: task.completionDate || "",
            percentage: task.progress || 0,
            comments: task.comments,
            status: task.status,
          });
        });

        // Style task sheet header row
        sheet.getRow(1).eachCell(cell => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1FA74A" } };
        });
        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.autoFilter = { from: "A1", to: "H1" };
      });

      // Set response headers for Excel file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      const filename = `BenderangProjectTracker_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      // Write workbook to response stream
      await workbook.xlsx.write(res);
      res.end();
    });
  });
});

/**
 * Batch process tasks to sync with Google Calendar and send invites
 * @param {Object[]} tasks - List of task objects
 * @param {sqlite3.Database} db - SQLite database instance
 * @param {number} batchSize - Number of tasks to process concurrently
 */
async function batchProcess(tasks, db, batchSize = 5) {
  // Map PIC initials to email addresses
  const picEmailMap = {
    LRB: "luhung.benderang@gmail.com",
    AOJ: "alwi.benderang@gmail.com",
    DH: "doni.benderang@gmail.com",
    LM: "leonardo.benderang@gmail.com",
    RS: "admbenderang@gmail.com",
    PK: "praderm77@gmail.com",
    MT: "marshel.benderang@gmail.com",
    FM: "flora.benderang@gmail.com",
  };

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async task => {
        // Prepare attendees emails from PIC initials
        const attendees = task.pic
          .split(",")
          .map(name => name.trim())
          .filter(name => picEmailMap[name])
          .map(name => ({ email: picEmailMap[name] }));

        // Always include engineering admin email
        attendees.push({ email: "admengineering.benderang@gmail.com" });

        // Prepare Google Calendar event body
        const eventBody = {
          summary: `[${task.client} - ${task.projectName}] ${task.task}`,
          description: `Notes: ${task.comments || ""}`,
          start: {
            dateTime: `${task.dueDate}T09:00:00`,
            timeZone: "Asia/Jakarta",
          },
          end: {
            dateTime: `${task.dueDate}T09:30:00`,
            timeZone: "Asia/Jakarta",
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "popup", minutes: 1 * 24 * 60 },
              { method: "popup", minutes: 2 * 24 * 60 },
              { method: "popup", minutes: 3 * 24 * 60 },
            ],
          },
          attendees,
        };

        let isNewEvent = false;

        // Update existing event or create new one
        if (task.eventId) {
          try {
            await calendar.events.update({
              calendarId: "admengineering.benderang@gmail.com",
              eventId: task.eventId,
              // sendUpdates: "all", --> this is native google calendar invitation sender. Commented out because nodemailer already send invites. 
              requestBody: eventBody,
            });
          } catch (updateErr) {
            if (updateErr.code === 404) {
              // Event not found, create new
              const created = await calendar.events.insert({
                calendarId: "admengineering.benderang@gmail.com",
                // sendUpdates: "all", --> this is native google calendar invitation sender. Commented out because nodemailer already send invites.
                requestBody: eventBody,
              });
              isNewEvent = true;
              await new Promise((resolve, reject) => {
                db.run(
                  "UPDATE tasks SET eventId = ? WHERE id = ?",
                  [created.data.id, task.id],
                  err => (err ? reject(err) : resolve())
                );
              });
            } else {
              throw updateErr;
            }
          }
        } else {
          // No eventId, create new event
          const created = await calendar.events.insert({
            calendarId: "admengineering.benderang@gmail.com",
            // sendUpdates: "all", --> this is native google calendar invitation sender. Commented out because nodemailer already send invites. 
            requestBody: eventBody,
          });
          isNewEvent = true;
          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE tasks SET eventId = ? WHERE id = ?",
              [created.data.id, task.id],
              err => (err ? reject(err) : resolve())
            );
          });
        }

        // Send invite email only for new events
        if (isNewEvent) {
          const emails = attendees.map(a => a.email);
          await sendCalendarInvite(task, emails);
        }
      })
    );

    // Delay between batches to avoid rate limits
    if (i + batchSize < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * POST /export-calendar - Sync tasks to Google Calendar and send invites
 * Requires login
 */
app.post("/export-calendar", requireLogin, blockViewer, async (req, res) => {
  try {
    const db = new sqlite3.Database("./database/tracker.db");

    // Select tasks that are not done, have dueDate, and dueDate >= today
    const tasks = await new Promise((resolve, reject) => {
      db.all(
        `
        SELECT
          tasks.*,
          projects.projectName,
          projects.client
        FROM tasks
        JOIN projects ON tasks.project_id = projects.id
        WHERE
          tasks.status <> 'Done'
          AND tasks.dueDate <> ''
          AND tasks.dueDate >= date('now')
        `,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log(`Syncing ${tasks.length} tasks to Google Calendar...`);

    await batchProcess(tasks, db);

    db.close();
    console.log("Calendar sync complete.");

    res.json({ success: true, synced: tasks.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /login - Authenticate user and create session
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = new sqlite3.Database("./database/tracker.db");

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      console.error("SQLite error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid username" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Set session info
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({ success: true });
  });
});

/**
 * POST /logout - Destroy user session
 */
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

/**
 * POST /projects - Create new project
 * Requires login
 */
app.post("/projects", requireLogin, blockViewer, (req, res) => {
  const p = req.body;
  const db = new sqlite3.Database("./database/tracker.db");

  db.run(
    `
    INSERT INTO projects
      (projectName, priority, client, personInCharge, startDate, endDate, progress, ongoingActions, pastDueTasks, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      p.projectName,
      0, // ← always starts at priority 0
      p.client,
      p.personInCharge,
      p.startDate,
      p.endDate,
      p.progress,
      p.ongoingActions,
      p.pastDueTasks,
      p.status,
    ],
    function (err) {
      if (err) {
        console.error("SQLite error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID, priority: 0 });
      writeLog(db, req.session.username, "CREATE", "project", this.lastID, p.projectName);
      io.emit("projectCreated", { ...p, id: this.lastID, priority: 0, tasks: [] });
    }
  );
});

/**
 * POST /projects/:id/tasks - Create new task under project
 * Requires login
 */
app.post("/projects/:id/tasks", requireLogin, blockViewer, (req, res) => {
  const task = req.body;
  const db = new sqlite3.Database("./database/tracker.db");

  db.run(
    `
    INSERT INTO tasks
      (project_id, task, pic, startDate, dueDate, progress, comments, status, completionDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      req.params.id,
      task.task,
      task.pic,
      task.startDate,
      task.dueDate,
      task.progress,
      task.comments,
      task.status,
      task.completionDate || ""
    ],
    function (err) {
      if (err) {
        console.error("SQLite error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID });
      writeLog(db, req.session.username, "CREATE", "task", this.lastID, task.task);
      io.emit("taskCreated", { ...task, id: this.lastID, project_id: req.params.id });
    }
  );
});

/**
 * PUT /projects/:id - Update project by ID
 * Requires login
 */
app.put("/projects/:id", requireLogin, blockViewer, async (req, res) => {
  const projectId = req.params.id;
  const project = req.body;
  const db = new sqlite3.Database("./database/tracker.db");

  try {
    // Check the project's current status before updating
    const currentRow = await new Promise((resolve, reject) => {
      db.get(
        "SELECT status, priority FROM projects WHERE id = ?",
        [projectId],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    const wasOnGoing = currentRow && currentRow.status === "On-going";
    const isNowOnGoing = project.status === "On-going";

    // Moving AWAY from On-going: reset priority to 0 and close the gap
    if (wasOnGoing && !isNowOnGoing) {
      const oldPriority = currentRow.priority;

      if (oldPriority !== null && oldPriority >= 1) {
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE projects SET priority = priority - 1 WHERE priority > ?",
            [oldPriority],
            err => err ? reject(err) : resolve()
          );
        });
      }

      project.priority = 0;
    }
    // Moving INTO On-going (e.g. from Done/Hold back to On-going): starts unranked at 0
    else if (!wasOnGoing && isNowOnGoing) {
      project.priority = 0;
    }
    // Staying On-going, and priority is explicitly being changed
    else if (isNowOnGoing && project.priority !== undefined && project.priority !== null) {
      await reassignPriority(db, projectId, parseInt(project.priority));
    }

    db.run(
      `
      UPDATE projects
      SET projectName = ?, priority = ?, client = ?, personInCharge = ?, startDate = ?, endDate = ?, progress = ?, ongoingActions = ?, pastDueTasks = ?, status = ?
      WHERE id = ?
      `,
      [
        project.projectName,
        project.priority ?? currentRow.priority,
        project.client,
        project.personInCharge,
        project.startDate,
        project.endDate,
        project.progress,
        project.ongoingActions,
        project.pastDueTasks,
        project.status,
        projectId,
      ],
      function (err) {
        if (err) {
          console.error("SQLite error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        res.json({ success: true });
        writeLog(db, req.session.username, "UPDATE", "project", projectId, project.projectName);
        io.emit("projectsNeedRefresh");
        io.emit("projectUpdated", { projectId, project: { ...project, priority: project.priority ?? currentRow.priority } });
      }
    );
  }
  catch (err) {
    console.error("Priority reassignment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /tasks/:id - Update task by ID
 * Requires login
 */
app.put("/tasks/:id", requireLogin, blockViewer, (req, res) => {
  const taskId = req.params.id;
  const task = req.body;
  const db = new sqlite3.Database("./database/tracker.db");

  db.run(
    `
    UPDATE tasks
    SET task = ?, pic = ?, startDate = ?, dueDate = ?, progress = ?, comments = ?, status = ?, completionDate = ?
    WHERE id = ?
    `,
    [
      task.task,
      task.pic,
      task.startDate,
      task.dueDate,
      task.progress,
      task.comments,
      task.status,
      task.completionDate,
      taskId,
    ],
    function (err) {
      if (err) {
        console.error("SQLite error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({ success: true });
      writeLog(db, req.session.username, "UPDATE", "task", taskId, task.task);
      io.emit("taskUpdated", { taskId, task });
    }
  );
});

/**
 * DELETE /projects/:id - Delete project by ID
 * Requires login
 */
app.delete("/projects/:id", requireLogin, blockViewer, (req, res) => {
  const db = new sqlite3.Database("./database/tracker.db");

  db.get(
    "SELECT priority FROM projects WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error("SQLite error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      const deletedPriority = row ? row.priority : null;

      db.run("DELETE FROM projects WHERE id = ?", [req.params.id], function (err) {
        if (err) {
          console.error("SQLite error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        // Shift everyone after the deleted priority down by 1, closing the gap
        if (deletedPriority !== null && deletedPriority >= 1) {
          db.run(
            "UPDATE projects SET priority = priority - 1 WHERE priority > ?",
            [deletedPriority]
          );
        }

        res.json({ success: true });
        writeLog(db, req.session.username, "DELETE", "project", req.params.id, "");
        io.emit("projectDeleted", { projectId: req.params.id });
      });
    }
  );
});

/**
 * DELETE /tasks/:id - Delete task by ID
 * Requires login
 */
app.delete("/tasks/:id", requireLogin, blockViewer, (req, res) => {
  const db = new sqlite3.Database("./database/tracker.db");

  db.run("DELETE FROM tasks WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      console.error("SQLite error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({ success: true });
    writeLog(db, req.session.username, "DELETE", "task", req.params.id, "");
    io.emit("taskDeleted", { taskId: req.params.id });
  });
});

/**
 * DELETE /logs - Delete all logs (admin only)
 */
app.delete("/logs", requireAdmin, (req, res) => {
  const db = new sqlite3.Database("./database/tracker.db");

  db.run("DELETE FROM logs", function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Start server on configured port or default 5050
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
