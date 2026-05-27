import { LearningStore, CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateBlockInput, UpdateBlockInput } from "./types";
import { Course, Module, LearningBlock, Reflection } from "@/types";
import { pool } from "../db";

function mapCourseFromDb(row: any): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    targetGroup: row.target_group,
    category: row.category,
    imageUrl: row.image_url,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

function mapModuleFromDb(row: any): Module {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    order: row.display_order,
    learningObjectives: Array.isArray(row.learning_objectives) 
      ? row.learning_objectives 
      : JSON.parse(row.learning_objectives || "[]"),
  };
}

function mapBlockFromDb(row: any): LearningBlock {
  return {
    id: row.id,
    moduleId: row.module_id,
    type: row.type,
    title: row.title,
    content: row.content,
    order: row.display_order,
    learningMode: row.learning_mode,
    source: row.source,
    metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined,
  };
}

function mapReflectionFromDb(row: any): Reflection {
  return {
    id: row.id,
    learnerId: row.learner_id,
    blockId: row.block_id,
    content: row.content,
    confidence: row.confidence,
    difficulty: row.difficulty,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export class PostgresStore implements LearningStore {
  async getCourses(): Promise<Course[]> {
    const { rows } = await pool.query("SELECT * FROM courses ORDER BY created_at DESC");
    return rows.map(mapCourseFromDb);
  }

  async getCourse(id: string): Promise<Course | null> {
    const { rows } = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    return rows.length > 0 ? mapCourseFromDb(rows[0]) : null;
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const id = "course-" + Date.now();
    const { rows } = await pool.query(
      `INSERT INTO courses (id, title, description, target_group, category, image_url, status, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, NOW(), NOW())
       RETURNING *`,
      [id, input.title, input.description, input.targetGroup, input.category || "Uncategorized", input.imageUrl, input.createdBy]
    );
    return mapCourseFromDb(rows[0]);
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (input.title !== undefined) {
      setClause.push(`title = $${paramIdx++}`);
      values.push(input.title);
    }
    if (input.description !== undefined) {
      setClause.push(`description = $${paramIdx++}`);
      values.push(input.description);
    }
    if (input.targetGroup !== undefined) {
      setClause.push(`target_group = $${paramIdx++}`);
      values.push(input.targetGroup);
    }
    if (input.category !== undefined) {
      setClause.push(`category = $${paramIdx++}`);
      values.push(input.category);
    }
    if (input.imageUrl !== undefined) {
      setClause.push(`image_url = $${paramIdx++}`);
      values.push(input.imageUrl);
    }
    if (input.status !== undefined) {
      setClause.push(`status = $${paramIdx++}`);
      values.push(input.status);
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE courses SET ${setClause.join(", ")} WHERE id = $${paramIdx} RETURNING *`,
      values
    );
    return mapCourseFromDb(rows[0]);
  }

  async deleteCourse(id: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows: modules } = await client.query("SELECT id FROM modules WHERE course_id = $1", [id]);
      const moduleIds = modules.map(m => m.id);

      if (moduleIds.length > 0) {
        await client.query("DELETE FROM blocks WHERE module_id = ANY($1)", [moduleIds]);
      }
      await client.query("DELETE FROM modules WHERE course_id = $1", [id]);
      await client.query("DELETE FROM progress WHERE course_id = $1", [id]);
      await client.query("DELETE FROM courses WHERE id = $1", [id]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getModules(courseId: string): Promise<Module[]> {
    const { rows } = await pool.query("SELECT * FROM modules WHERE course_id = $1 ORDER BY display_order ASC", [courseId]);
    return rows.map(mapModuleFromDb);
  }

  async createModule(input: CreateModuleInput): Promise<Module> {
    const id = "module-" + Date.now();
    const { rows: countRows } = await pool.query("SELECT COUNT(*) FROM modules WHERE course_id = $1", [input.courseId]);
    const displayOrder = parseInt(countRows[0].count);

    const { rows } = await pool.query(
      `INSERT INTO modules (id, course_id, title, description, display_order, learning_objectives)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING *`,
      [id, input.courseId, input.title, input.description, displayOrder, JSON.stringify(input.learningObjectives)]
    );
    return mapModuleFromDb(rows[0]);
  }

  async updateModule(id: string, input: UpdateModuleInput): Promise<Module> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (input.title !== undefined) {
      setClause.push(`title = $${paramIdx++}`);
      values.push(input.title);
    }
    if (input.description !== undefined) {
      setClause.push(`description = $${paramIdx++}`);
      values.push(input.description);
    }
    if (input.learningObjectives !== undefined) {
      setClause.push(`learning_objectives = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.learningObjectives));
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE modules SET ${setClause.join(", ")} WHERE id = $${paramIdx} RETURNING *`,
      values
    );
    return mapModuleFromDb(rows[0]);
  }

  async deleteModule(id: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM blocks WHERE module_id = $1", [id]);
      await client.query("DELETE FROM modules WHERE id = $1", [id]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getBlocks(moduleId: string): Promise<LearningBlock[]> {
    const { rows } = await pool.query("SELECT * FROM blocks WHERE module_id = $1 ORDER BY display_order ASC", [moduleId]);
    return rows.map(mapBlockFromDb);
  }

  async createBlock(input: CreateBlockInput): Promise<LearningBlock> {
    const id = "block-" + Date.now() + Math.floor(Math.random() * 1000);
    const { rows: countRows } = await pool.query("SELECT COUNT(*) FROM blocks WHERE module_id = $1", [input.moduleId]);
    const displayOrder = parseInt(countRows[0].count);

    const { rows } = await pool.query(
      `INSERT INTO blocks (id, module_id, type, title, content, display_order, learning_mode, source, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
       RETURNING *`,
      [id, input.moduleId, input.type, input.title, input.content, displayOrder, input.learningMode || "understand", input.source, JSON.stringify(input.metadata || {})]
    );
    return mapBlockFromDb(rows[0]);
  }

  async updateBlock(id: string, input: UpdateBlockInput): Promise<LearningBlock> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (input.title !== undefined) {
      setClause.push(`title = $${paramIdx++}`);
      values.push(input.title);
    }
    if (input.content !== undefined) {
      setClause.push(`content = $${paramIdx++}`);
      values.push(input.content);
    }
    if (input.learningMode !== undefined) {
      setClause.push(`learning_mode = $${paramIdx++}`);
      values.push(input.learningMode);
    }
    if (input.source !== undefined) {
      setClause.push(`source = $${paramIdx++}`);
      values.push(input.source);
    }
    if (input.metadata !== undefined) {
      setClause.push(`metadata = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.metadata));
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE blocks SET ${setClause.join(", ")} WHERE id = $${paramIdx} RETURNING *`,
      values
    );
    return mapBlockFromDb(rows[0]);
  }

  async deleteBlock(id: string): Promise<void> {
    await pool.query("DELETE FROM blocks WHERE id = $1", [id]);
  }

  async reorderBlocks(moduleId: string, orderedBlockIds: string[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (let i = 0; i < orderedBlockIds.length; i++) {
        await client.query(
          "UPDATE blocks SET display_order = $1 WHERE id = $2 AND module_id = $3",
          [i, orderedBlockIds[i], moduleId]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getUserProgress(userId: string, courseId: string): Promise<{ completedBlocks: string[] }> {
    const { rows } = await pool.query("SELECT completed_blocks FROM progress WHERE user_id = $1 AND course_id = $2", [userId, courseId]);
    if (rows.length === 0) return { completedBlocks: [] };
    return {
      completedBlocks: Array.isArray(rows[0].completed_blocks)
        ? rows[0].completed_blocks
        : JSON.parse(rows[0].completed_blocks || "[]"),
    };
  }

  async markBlockCompleted(userId: string, courseId: string, blockId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query("SELECT completed_blocks FROM progress WHERE user_id = $1 AND course_id = $2", [userId, courseId]);
      
      if (rows.length === 0) {
        await client.query(
          "INSERT INTO progress (user_id, course_id, completed_blocks) VALUES ($1, $2, $3::jsonb)",
          [userId, courseId, JSON.stringify([blockId])]
        );
      } else {
        const completed: string[] = Array.isArray(rows[0].completed_blocks)
          ? rows[0].completed_blocks
          : JSON.parse(rows[0].completed_blocks || "[]");
        
        if (!completed.includes(blockId)) {
          completed.push(blockId);
          await client.query(
            "UPDATE progress SET completed_blocks = $1::jsonb WHERE user_id = $2 AND course_id = $3",
            [JSON.stringify(completed), userId, courseId]
          );
        }
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getReflections(userId: string): Promise<Reflection[]> {
    const { rows } = await pool.query("SELECT * FROM reflections WHERE learner_id = $1 ORDER BY created_at DESC", [userId]);
    return rows.map(mapReflectionFromDb);
  }

  async saveReflection(userId: string, blockId: string, content: string, confidence: number, difficulty: number): Promise<Reflection> {
    const id = "reflection-" + Date.now();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM reflections WHERE learner_id = $1 AND block_id = $2", [userId, blockId]);
      
      const { rows } = await client.query(
        `INSERT INTO reflections (id, learner_id, block_id, content, confidence, difficulty, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [id, userId, blockId, content, confidence, difficulty]
      );
      
      await client.query("COMMIT");
      return mapReflectionFromDb(rows[0]);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async clearUserData(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM progress WHERE user_id = $1", [userId]);
      await client.query("DELETE FROM reflections WHERE learner_id = $1", [userId]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}
