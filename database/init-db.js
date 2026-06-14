const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/tracker.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projectName TEXT,
            client TEXT,
            personInCharge TEXT,
            startDate TEXT,
            endDate TEXT,
            progress INTEGER,
            ongoingActions TEXT,
            pastDueTasks INTEGER,
            status TEXT
        )
    `);

    db.run(`
        CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,

            task TEXT,
            pic TEXT,
            startDate TEXT,
            dueDate TEXT,
            status TEXT,
            comments TEXT,

            FOREIGN KEY (project_id)
                REFERENCES projects(id)
                ON DELETE CASCADE
        )
    `);

});

db.close();

console.log("Database initialized");