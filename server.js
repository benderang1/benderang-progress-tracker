require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const app = express();

function requireLogin(
    req,
    res,
    next
) {

    if (!req.session.userId) {

        return res.status(401).json({
            error: "Not logged in"
        });
    }

    next();
}

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

app.use(express.static("public"));

app.get(
    "/me",
    (req, res) => {

        if (!req.session.userId) {

            return res
                .status(401)
                .json({
                    loggedIn: false
                });

        }

        res.json({
            loggedIn: true,
            username: req.session.username,
            role: req.session.role
        });
    }
);


app.get(
    "/projects",
    requireLogin,
    (req, res) => {

        const db =
            new sqlite3.Database(
                "./database/tracker.db"
            );

        db.all(
            "SELECT * FROM projects",
            [],
            (err, projects) => {

                if (err) {
                    console.error("SQLite error:", err);
                    console.error("SQLite message:", err.message);

                    return res.status(500).json({
                        error: err.message
                    });
                }

                db.all(
                    "SELECT * FROM tasks",
                    [],
                    (err, tasks) => {

                        if (err) {
                            console.error("SQLite error:", err);
                            console.error("SQLite message:", err.message);

                            return res.status(500).json({
                                error: err.message
                            });
                        }

                        projects.forEach(project => {

                            project.tasks =
                                tasks.filter(
                                    task =>
                                        task.project_id === project.id
                                );

                        });

                        res.json(projects);

                    }
                );

            }
        );

    }
);

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const db = new sqlite3.Database("./database/tracker.db");

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {

            if (!user) {
                return res.status(401).json({
                    error: "Invalid username"
                });
            }

            const match = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!match) {
                return res.status(401).json({
                    error: "Invalid password"
                });
            }

            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.role = user.role;

            res.json({
                success: true
            });
        }
    );
});

app.post("/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true
        });

    });

});

app.post(
    "/projects",
    requireLogin,
    (req, res) => {

        const p =
            req.body;

        const db =
            new sqlite3.Database(
                "./database/tracker.db"
            );

        db.run(
            `
            INSERT INTO projects
            (
                projectName,
                client,
                personInCharge,
                startDate,
                endDate,
                progress,
                ongoingActions,
                pastDueTasks,
                status
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                p.projectName,
                p.client,
                p.personInCharge,
                p.startDate,
                p.endDate,
                p.progress,
                p.ongoingActions,
                p.pastDueTasks,
                p.status
            ],
            function(err) {

                if (err) {
                    console.error("SQLite error:", err);
                    console.error("SQLite message:", err.message);

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    id: this.lastID
                });

            }
        );

    }
);

app.post(
    "/projects/:id/tasks",
    requireLogin,
    (req, res) => {

        const task =
            req.body;

        const db =
            new sqlite3.Database(
                "./database/tracker.db"
            );

        db.run(
            `
            INSERT INTO tasks
            (
                project_id,
                task,
                pic,
                startDate,
                dueDate,
                progress,
                comments,
                status
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                req.params.id,
                task.task,
                task.pic,
                task.startDate,
                task.dueDate,
                task.progress,
                task.comments,
                task.status
            ],
            function(err) {

                if (err) {
                    console.error("SQLite error:", err);
                    console.error("SQLite message:", err.message);

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    id: this.lastID
                });

            }
        );

    }
);

app.put(
    "/projects/:id",
    requireLogin,
    (req, res) => {

        const projectId = req.params.id;

        const project = req.body;

        const db =
            new sqlite3.Database(
                "./database/tracker.db"
            );

        db.run(
            `
            UPDATE projects
            SET
                projectName = ?,
                client = ?,
                personInCharge = ?,
                startDate = ?,
                endDate = ?,
                progress = ?,
                ongoingActions = ?,
                pastDueTasks = ?,
                status = ?
            WHERE id = ?
            `,
            [
                project.projectName,
                project.client,
                project.personInCharge,
                project.startDate,
                project.endDate,
                project.progress,
                project.ongoingActions,
                project.pastDueTasks,
                project.status,
                projectId
            ],
            function(err) {

                if (err) {
                    console.error("SQLite error:", err);
                    console.error("SQLite message:", err.message);

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    success: true
                });

            }
        );

    }
);

app.put(
    "/tasks/:id",
    requireLogin,
    (req, res) => {

        const taskId = req.params.id;

        const task = req.body;

        const db =
            new sqlite3.Database(
                "./database/tracker.db"
            );

        db.run(
            `
            UPDATE tasks
            SET
                task = ?,
                pic = ?,
                startDate = ?,
                dueDate = ?,
                progress = ?,
                comments = ?,
                status = ?
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
                taskId
            ],
            function(err) {

                if (err) {
                    console.error("SQLite error:", err);
                    console.error("SQLite message:", err.message);

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    success: true
                });

            }
        );

    }
);

app.delete(
    "/projects/:id",
    requireLogin,
    (req, res) => {

        const db =
            new sqlite3.Database(
                "./database/tracker.db"
            );

        db.run(
            `
            DELETE FROM projects
            WHERE id = ?
            `,
            [req.params.id],
            function(err) {

                if (err) {
                    console.error("SQLite error:", err);
                    console.error("SQLite message:", err.message);

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    success: true
                });

            }
        );

    }
);

app.delete(
    "/tasks/:id",
    requireLogin,
    (req, res) => {

        const db =
            new sqlite3.Database(
                "./database/tracker.db"
            );

        db.run(
            `
            DELETE FROM tasks
            WHERE id = ?
            `,
            [req.params.id],
            function(err) {

                if (err) {
                    console.error("SQLite error:", err);
                    console.error("SQLite message:", err.message);

                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({
                    success: true
                });

            }
        );

    }
);

const PORT =
    process.env.PORT || 5050;

app.listen(PORT);