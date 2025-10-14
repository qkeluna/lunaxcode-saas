CREATE TABLE service_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL,
  features TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL
)