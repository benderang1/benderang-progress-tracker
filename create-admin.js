const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

async function createAdmin() {
    const db = new sqlite3.Database("./database/tracker.db");

    const passwordHash = await bcrypt.hash("admin123", 10);

    db.run(
        `
        INSERT INTO users
        (username,password_hash,role)
        VALUES (?,?,?)
        `,
        ["admin", passwordHash, "admin"]
    );

    db.close();
}

createAdmin();