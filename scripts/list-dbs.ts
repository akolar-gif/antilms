import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}

// Modify the connection URL to connect to the default 'postgres' database
let postgresUrl = databaseUrl;
try {
  const url = new URL(databaseUrl);
  url.pathname = "/postgres";
  postgresUrl = url.toString();
} catch (e) {
  console.error("Error parsing DATABASE_URL:", e);
}

const client = new Client({
  connectionString: postgresUrl,
});

async function main() {
  console.log(`Connecting to database at ${postgresUrl.replace(/:[^:@/]+@/, ":****@")}...`);
  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log("\nAvailable Databases on this cluster:");
    res.rows.forEach(row => {
      console.log(` - ${row.datname}`);
    });
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.end();
  }
}

main();
