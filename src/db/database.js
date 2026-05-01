const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'leads.db'));

// Create leads table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'NEW',
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

module.exports = db;