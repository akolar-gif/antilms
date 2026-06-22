import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs/promises";

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

import { hashPassword } from "../src/lib/crypto";

async function main() {
  console.log("Reading data.json...");
  const jsonPath = path.resolve(process.cwd(), "data.json");
  let fileData: string;
  try {
    fileData = await fs.readFile(jsonPath, "utf-8");
  } catch (error) {
    console.error(`Error: Could not read data.json from ${jsonPath}:`, error);
    process.exit(1);
  }

  const dbData = JSON.parse(fileData);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 0. Seed Users
    console.log("Seeding users...");
    const defaultUsers = [
      { id: "user-admin", name: "Innoversity Admin", email: "admin@innoversity.com", passwordHash: "admin123", role: "admin" },
      { id: "user-trainer", name: "Innoversity Trainer", email: "trainer@innoversity.com", passwordHash: "trainer123", role: "trainer" },
      { id: "user-learner", name: "Innoversity Learner", email: "learner@innoversity.com", passwordHash: "learner123", role: "learner" },
    ];

    const usersToSeed = dbData.users && dbData.users.length > 0 ? dbData.users : defaultUsers;
    for (const u of usersToSeed) {
      const passwordHash = u.passwordHash.includes(":") ? u.passwordHash : hashPassword(u.passwordHash || "password123");
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.name, u.email, passwordHash, u.role]
      );
    }

    // 1. Seed Courses
    if (dbData.courses && dbData.courses.length > 0) {
      console.log(`Seeding ${dbData.courses.length} courses...`);
      for (const course of dbData.courses) {
        await client.query(
          `INSERT INTO courses (id, title, description, target_group, category, image_url, status, created_by, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            course.id,
            course.title,
            course.description,
            course.targetGroup || "General",
            course.category || "Uncategorized",
            course.imageUrl || null,
            course.status || "draft",
            course.createdBy || "Trainer",
            course.createdAt || new Date().toISOString(),
            course.updatedAt || new Date().toISOString(),
          ]
        );
      }
    }

    // 2. Seed Modules
    if (dbData.modules && dbData.modules.length > 0) {
      console.log(`Seeding ${dbData.modules.length} modules...`);
      for (const mod of dbData.modules) {
        await client.query(
          `INSERT INTO modules (id, course_id, title, description, display_order, learning_objectives)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [
            mod.id,
            mod.courseId,
            mod.title,
            mod.description,
            mod.order !== undefined ? mod.order : 0,
            JSON.stringify(mod.learningObjectives || []),
          ]
        );
      }
    }

    // 3. Seed Blocks
    if (dbData.blocks && dbData.blocks.length > 0) {
      console.log(`Seeding ${dbData.blocks.length} blocks...`);
      for (const block of dbData.blocks) {
        await client.query(
          `INSERT INTO blocks (id, module_id, type, title, content, display_order, learning_mode, source, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [
            block.id,
            block.moduleId,
            block.type,
            block.title,
            block.content,
            block.order !== undefined ? block.order : 0,
            block.learningMode || "understand",
            block.source || null,
            JSON.stringify(block.metadata || {}),
          ]
        );
      }
    }

    // 4. Seed Progress
    if (dbData.progress && dbData.progress.length > 0) {
      console.log(`Seeding ${dbData.progress.length} progress entries...`);
      for (const prog of dbData.progress) {
        await client.query(
          `INSERT INTO progress (user_id, course_id, completed_blocks)
           VALUES ($1, $2, $3::jsonb)
           ON CONFLICT (user_id, course_id) DO NOTHING`,
          [
            prog.userId,
            prog.courseId,
            JSON.stringify(prog.completedBlocks || []),
          ]
        );
      }
    }

    // 5. Seed Reflections
    if (dbData.reflections && dbData.reflections.length > 0) {
      console.log(`Seeding ${dbData.reflections.length} reflection entries...`);
      for (const refl of dbData.reflections) {
        await client.query(
          `INSERT INTO reflections (id, learner_id, block_id, content, confidence, difficulty, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [
            refl.id,
            refl.learnerId,
            refl.blockId,
            refl.content,
            refl.confidence,
            refl.difficulty,
            refl.createdAt || new Date().toISOString(),
          ]
        );
      }
    }

    await client.query("COMMIT");
    console.log("Seeding completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
