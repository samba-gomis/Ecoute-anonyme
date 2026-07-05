const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS volunteers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    UNIQUE,
    tags       TEXT    NOT NULL DEFAULT '[]',
    status     TEXT    NOT NULL DEFAULT 'online'
                       CHECK(status IN ('online','away','offline')),
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  CREATE TABLE IF NOT EXISTS conversations (
    share_id    TEXT PRIMARY KEY,
    user_pseudo TEXT NOT NULL,
    vol_display TEXT NOT NULL DEFAULT 'Bénévole',
    domain      TEXT,
    messages    TEXT NOT NULL DEFAULT '[]',
    started_at  TEXT,
    ended_at    TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    stars      INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5),
    text       TEXT    NOT NULL,
    pseudo     TEXT    NOT NULL DEFAULT 'Anonyme',
    vol_name   TEXT,
    domain     TEXT,
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );
`);

module.exports = db;
