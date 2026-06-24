import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}

// Candidate database names to test
const dbNames = ["akolar", "antilms", "innoversity", "db", "app", "innoversity_lms"];

async function testDb(dbName: string) {
  let urlStr = databaseUrl;
  try {
    const url = new URL(databaseUrl);
    url.pathname = "/" + dbName;
    urlStr = url.toString();
  } catch (e) {
    console.error(`Error parsing url for ${dbName}:`, e);
    return false;
  }

  const client = new Client({
    connectionString: urlStr,
  });

  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to database: "${dbName}"`);
    await client.end();
    return true;
  } catch (err: any) {
    console.log(`[FAILED] Database "${dbName}": ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("Testing connection to candidate databases...");
  let found = false;
  for (const db of dbNames) {
    const ok = await testDb(db);
    if (ok) {
      found = true;
    }
  }
  
  if (!found) {
    console.log("\nNone of the candidate databases worked.");
    console.log("Please check your IONOS Cloud Panel -> PostgreSQL -> Databases to find the exact database name you created.");
  }
}

main();
