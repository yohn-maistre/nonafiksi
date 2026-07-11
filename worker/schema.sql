-- D1 canonical store (DO SQLite holds per-user interview memory; this holds
-- everything cross-user). Apply: wrangler d1 execute nonafiksi --file worker/schema.sql
CREATE TABLE IF NOT EXISTS users(
  user_id TEXT PRIMARY KEY, handle TEXT UNIQUE, created_at TEXT);
CREATE TABLE IF NOT EXISTS kopi(
  user_id TEXT PRIMARY KEY REFERENCES users(user_id),
  balance INTEGER NOT NULL DEFAULT 1);          -- cangkir pertama kutraktir
CREATE TABLE IF NOT EXISTS stories(
  story_id TEXT PRIMARY KEY, owner_id TEXT REFERENCES users(user_id),
  title TEXT, manifest TEXT NOT NULL,            -- .aksara JSON
  listed INTEGER NOT NULL DEFAULT 0,             -- unlisted by default (UU ITE)
  place TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS memory_facts(         -- distilled, batch-written
  id INTEGER PRIMARY KEY, user_id TEXT, fact TEXT,
  source TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS rumah(                -- the /@handle promise
  handle TEXT PRIMARY KEY, persona TEXT NOT NULL,
  manifest TEXT NOT NULL, updated_at TEXT,
  secret_hash TEXT,                              -- sha256 of the claim token (NULL = legacy unclaimed)
  bangun_day TEXT,                               -- /api/bangun daily window (UTC date)
  bangun_count INTEGER NOT NULL DEFAULT 0,       -- calls used in that window
  terdaftar INTEGER NOT NULL DEFAULT 0,          -- opt-in: visible as a neighbor on Jalan (doctrine: unlisted by default)
  facets TEXT NOT NULL DEFAULT '');              -- ',penulis,dev,' — opt-in self-labels; gang streets filter on this
CREATE TABLE IF NOT EXISTS tamu(                 -- buku tamu: visitors' notes, owner-read (kunci)
  id INTEGER PRIMARY KEY AUTOINCREMENT, handle TEXT NOT NULL,
  nama TEXT, pesan TEXT NOT NULL, at TEXT);
