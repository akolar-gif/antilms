import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupParentDir = path.join(process.cwd(), "backups");
const backupDir = path.join(backupParentDir, `backup-${timestamp}`);

// Helper to copy directory recursively
function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function runBackup() {
  console.log("Starting backup process...");

  // Ensure backups directory exists
  if (!fs.existsSync(backupParentDir)) {
    fs.mkdirSync(backupParentDir, { recursive: true });
  }

  // Create current backup directory
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backup directory: ${backupDir}`);

  // 1. Backup PostgreSQL database using pg_dump
  if (databaseUrl) {
    const dbBackupPath = path.join(backupDir, "database.sql");
    try {
      console.log("Backing up PostgreSQL database...");
      // Use pg_dump tool. Ensure pg_dump is installed and in PATH.
      execSync(`pg_dump "${databaseUrl}" -f "${dbBackupPath}"`, { stdio: "inherit" });
      console.log(`Database backup saved to: ${dbBackupPath}`);
    } catch (error) {
      console.error("Warning: pg_dump failed. Make sure postgresql-client is installed.");
      console.error(error);
    }
  } else {
    console.log("Skipping database backup: DATABASE_URL not set in .env.");
  }

  // 2. Backup upload files
  console.log(`Backing up uploads from ${uploadDir}...`);
  const destUploadsDir = path.join(backupDir, "uploads");
  try {
    if (fs.existsSync(uploadDir)) {
      copyDir(uploadDir, destUploadsDir);
      console.log("Uploads backup completed.");
    } else {
      console.log(`Uploads folder not found at ${uploadDir}. Skipping uploads backup.`);
    }
  } catch (error) {
    console.error("Failed to backup uploads folder:", error);
  }

  console.log(`\nBackup successfully created at ${backupDir}!`);
  console.log("To automate this, add the following cron job to your production server:");
  console.log(`0 2 * * * npx tsx ${path.join(process.cwd(), "scripts", "backup.ts")} >> ${path.join(process.cwd(), "backups", "backup.log")} 2>&1`);
}

runBackup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
