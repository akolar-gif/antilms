import { Client } from "pg";

const host = "pg-ca61895e1212a85b.postgresql.de-fra.ionoscloud.com";
const user = "akolar";
const database = "antilms";
const passwords = ["4LGQtZvAnQgyQS5@", "V1izQ1Wa_123XYZ"];

async function testPassword(password: string) {
  const client = new Client({
    host,
    port: 5432,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }, // Bypass ALTNAME mismatch if any, just to test auth
  });

  try {
    await client.connect();
    console.log(`[SUCCESS] Connected using password: "${password}"`);
    await client.end();
    return true;
  } catch (err: any) {
    console.log(`[FAILED] Password "${password}": ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("Testing which password works for user 'akolar' on the new database cluster...");
  for (const pw of passwords) {
    await testPassword(pw);
  }
}

main();
