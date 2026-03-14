const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db_name = path.join(__dirname, "terminal.db");

const db = new sqlite3.Database(db_name, (err) => {
    if (err) {
        console.error("❌ Database error:", err.message);
        process.exit(1);
    } else {
        console.log("✅ Database connected!");
    }
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// ============ CREATE TRIPS TABLE ============
const sql_create = `CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger TEXT NOT NULL,
    passport TEXT NOT NULL,
    driver TEXT NOT NULL,
    destination TEXT NOT NULL,
    type TEXT DEFAULT 'Local',
    fare REAL NOT NULL,
    status TEXT DEFAULT 'completed',
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);`;

db.run(sql_create, (err) => {
    if (err) {
        console.error("❌ Table error:", err.message);
    } else {
        console.log("✅ Trips table ready!");
        createIndexes();
    }
});

// ============ CREATE INDEXES ============
function createIndexes() {
    const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_passenger ON trips(passenger);",
        "CREATE INDEX IF NOT EXISTS idx_date ON trips(date);",
        "CREATE INDEX IF NOT EXISTS idx_driver ON trips(driver);",
        "CREATE INDEX IF NOT EXISTS idx_destination ON trips(destination);"
    ];

    indexes.forEach((index, idx) => {
        db.run(index, (err) => {
            if (err) {
                console.error(`❌ Index ${idx} error:`, err.message);
            } else {
                console.log(`✅ Index ${idx} created`);
            }
        });
    });
}

module.exports = db;