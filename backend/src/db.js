const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'vouchers.db');
const db = new Database(dbPath);

// Enable Foreign Keys & Write-Ahead Logging for speed & safety
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize schema
const schemaPath = path.resolve(__dirname, '../schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

module.exports = db;
