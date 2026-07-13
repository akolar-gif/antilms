import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP WITH TIME ZONE,
  approved BOOLEAN DEFAULT FALSE NOT NULL,
  archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idempotent schema upgrades for existing installations
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE NOT NULL;

CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_group TEXT,
  category VARCHAR(255),
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  type VARCHAR(50) DEFAULT 'comprehensive' NOT NULL,
  sprint_course_ids JSONB DEFAULT '[]'::jsonb,
  is_custom BOOLEAN DEFAULT FALSE NOT NULL,
  learner_id VARCHAR(255),
  created_by VARCHAR(255),
  price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idempotent schema upgrades for existing installations
ALTER TABLE courses ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'comprehensive' NOT NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS sprint_course_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learner_id VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

CREATE TABLE IF NOT EXISTS modules (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL,
  learning_objectives JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS blocks (
  id VARCHAR(255) PRIMARY KEY,
  module_id VARCHAR(255) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  display_order INTEGER NOT NULL,
  learning_mode VARCHAR(50) DEFAULT 'understand',
  source VARCHAR(255),
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS progress (
  user_id VARCHAR(255) NOT NULL,
  course_id VARCHAR(255) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_blocks JSONB NOT NULL DEFAULT '[]',
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS reflections (
  id VARCHAR(255) PRIMARY KEY,
  learner_id VARCHAR(255) NOT NULL,
  block_id VARCHAR(255) NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  user_id VARCHAR(255) NOT NULL,
  course_id VARCHAR(255) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);
`;

async function main() {
  console.log("Connecting to database and running migrations...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Creating tables...");
    await client.query(schemaSql);
    await client.query("COMMIT");
    console.log("Migration completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
