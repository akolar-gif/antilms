import { LearningStore, CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateBlockInput, UpdateBlockInput } from "./types";
import { Course, Module, LearningBlock, Reflection, User, UserRecord, Role, Submission, SubmissionFeedback } from "@/types";
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
    type: row.type || "comprehensive",
    sprintCourseIds: Array.isArray(row.sprint_course_ids)
      ? row.sprint_course_ids
      : (typeof row.sprint_course_ids === "string"
          ? JSON.parse(row.sprint_course_ids || "[]")
          : (row.sprint_course_ids || [])),
    createdBy: row.created_by,
    isCustom: !!row.is_custom,
    learnerId: row.learner_id || undefined,
    price: row.price !== null && row.price !== undefined ? parseFloat(row.price) : undefined,
    learningOutcomes: Array.isArray(row.learning_outcomes) ? row.learning_outcomes : (typeof row.learning_outcomes === "string" ? JSON.parse(row.learning_outcomes || "[]") : (row.learning_outcomes || [])),
    competencyTags: Array.isArray(row.competency_tags) ? row.competency_tags : (typeof row.competency_tags === "string" ? JSON.parse(row.competency_tags || "[]") : (row.competency_tags || [])),
    estimatedMinutes: row.estimated_minutes !== null && row.estimated_minutes !== undefined ? parseInt(row.estimated_minutes) : undefined,
    difficulty: row.difficulty || undefined,
    prerequisiteCourseIds: Array.isArray(row.prerequisite_course_ids) ? row.prerequisite_course_ids : (typeof row.prerequisite_course_ids === "string" ? JSON.parse(row.prerequisite_course_ids || "[]") : (row.prerequisite_course_ids || [])),
    curriculumSyllabus: row.curriculum_syllabus || undefined,
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
    competencyTags: Array.isArray(row.competency_tags) ? row.competency_tags : (row.competency_tags ? (typeof row.competency_tags === "string" ? JSON.parse(row.competency_tags) : row.competency_tags) : []),
    estimatedMinutes: row.estimated_minutes !== null && row.estimated_minutes !== undefined ? parseInt(row.estimated_minutes) : undefined,
    difficulty: row.difficulty || undefined,
    prerequisiteModuleIds: Array.isArray(row.prerequisite_module_ids) ? row.prerequisite_module_ids : (row.prerequisite_module_ids ? (typeof row.prerequisite_module_ids === "string" ? JSON.parse(row.prerequisite_module_ids) : row.prerequisite_module_ids) : []),
    successCriteria: Array.isArray(row.success_criteria) ? row.success_criteria : (row.success_criteria ? (typeof row.success_criteria === "string" ? JSON.parse(row.success_criteria) : row.success_criteria) : []),
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
    competencyTags: Array.isArray(row.competency_tags) ? row.competency_tags : (row.competency_tags ? (typeof row.competency_tags === "string" ? JSON.parse(row.competency_tags) : row.competency_tags) : []),
    estimatedMinutes: row.estimated_minutes !== null && row.estimated_minutes !== undefined ? parseInt(row.estimated_minutes) : undefined,
    assessmentRole: row.assessment_role || undefined,
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

function mapSubmissionFromDb(row: any): Submission {
  let versions = [];
  if (row.versions) {
    versions = typeof row.versions === "string" ? JSON.parse(row.versions) : row.versions;
  }
  return {
    id: row.id,
    learnerId: row.learner_id,
    blockId: row.block_id,
    versions,
    masteryStatus: row.mastery_status || "not_assessed",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Role,
    approved: !!row.approved,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function mapUserRecordFromDb(row: any): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Role,
    approved: !!row.approved,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    passwordHash: row.password_hash,
    resetToken: row.reset_token || undefined,
    resetTokenExpiry: row.reset_token_expiry instanceof Date ? row.reset_token_expiry.toISOString() : row.reset_token_expiry || undefined,
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
    const type = input.type || "comprehensive";
    const sprintCourseIds = JSON.stringify(input.sprintCourseIds || []);
    const isCustom = input.isCustom ?? false;
    const learnerId = input.learnerId || null;
    const { rows } = await pool.query(
      `INSERT INTO courses (id, title, description, target_group, category, image_url, status, type, sprint_course_ids, is_custom, learner_id, created_by, price, learning_outcomes, competency_tags, estimated_minutes, difficulty, prerequisite_course_ids, curriculum_syllabus, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15, $16, $17::jsonb, $18, NOW(), NOW())
       RETURNING *`,
      [
        id,
        input.title,
        input.description || "",
        input.targetGroup || "",
        input.category || "Uncategorized",
        input.imageUrl || null,
        type,
        sprintCourseIds,
        isCustom,
        learnerId,
        input.createdBy,
        input.price !== undefined ? input.price : null,
        JSON.stringify(input.learningOutcomes || []),
        JSON.stringify(input.competencyTags || []),
        input.estimatedMinutes !== undefined ? input.estimatedMinutes : null,
        input.difficulty || null,
        JSON.stringify(input.prerequisiteCourseIds || []),
        input.curriculumSyllabus || null
      ]
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
    if (input.type !== undefined) {
      setClause.push(`type = $${paramIdx++}`);
      values.push(input.type);
    }
    if (input.sprintCourseIds !== undefined) {
      setClause.push(`sprint_course_ids = $${paramIdx++}`);
      values.push(JSON.stringify(input.sprintCourseIds));
    }
    if (input.isCustom !== undefined) {
      setClause.push(`is_custom = $${paramIdx++}`);
      values.push(input.isCustom);
    }
    if (input.learnerId !== undefined) {
      setClause.push(`learner_id = $${paramIdx++}`);
      values.push(input.learnerId);
    }
    if (input.price !== undefined) {
      setClause.push(`price = $${paramIdx++}`);
      values.push(input.price);
    }
    if (input.learningOutcomes !== undefined) {
      setClause.push(`learning_outcomes = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.learningOutcomes));
    }
    if (input.competencyTags !== undefined) {
      setClause.push(`competency_tags = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.competencyTags));
    }
    if (input.estimatedMinutes !== undefined) {
      setClause.push(`estimated_minutes = $${paramIdx++}`);
      values.push(input.estimatedMinutes);
    }
    if (input.difficulty !== undefined) {
      setClause.push(`difficulty = $${paramIdx++}`);
      values.push(input.difficulty);
    }
    if (input.curriculumSyllabus !== undefined) {
      setClause.push(`curriculum_syllabus = $${paramIdx++}`);
      values.push(input.curriculumSyllabus);
    }
    if (input.prerequisiteCourseIds !== undefined) {
      setClause.push(`prerequisite_course_ids = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.prerequisiteCourseIds));
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
      `INSERT INTO modules (id, course_id, title, description, display_order, learning_objectives, competency_tags, estimated_minutes, difficulty, prerequisite_module_ids, success_criteria)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10::jsonb, $11::jsonb)
       RETURNING *`,
      [
        id,
        input.courseId,
        input.title,
        input.description,
        displayOrder,
        JSON.stringify(input.learningObjectives),
        JSON.stringify(input.competencyTags || []),
        input.estimatedMinutes !== undefined ? input.estimatedMinutes : null,
        input.difficulty || null,
        JSON.stringify(input.prerequisiteModuleIds || []),
        JSON.stringify(input.successCriteria || [])
      ]
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
    if (input.competencyTags !== undefined) {
      setClause.push(`competency_tags = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.competencyTags));
    }
    if (input.estimatedMinutes !== undefined) {
      setClause.push(`estimated_minutes = $${paramIdx++}`);
      values.push(input.estimatedMinutes);
    }
    if (input.difficulty !== undefined) {
      setClause.push(`difficulty = $${paramIdx++}`);
      values.push(input.difficulty);
    }
    if (input.prerequisiteModuleIds !== undefined) {
      setClause.push(`prerequisite_module_ids = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.prerequisiteModuleIds));
    }
    if (input.successCriteria !== undefined) {
      setClause.push(`success_criteria = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.successCriteria));
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
      `INSERT INTO blocks (id, module_id, type, title, content, display_order, learning_mode, source, metadata, competency_tags, estimated_minutes, assessment_role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12)
       RETURNING *`,
      [
        id,
        input.moduleId,
        input.type,
        input.title,
        input.content,
        displayOrder,
        input.learningMode || "understand",
        input.source,
        JSON.stringify(input.metadata || {}),
        JSON.stringify(input.competencyTags || []),
        input.estimatedMinutes !== undefined ? input.estimatedMinutes : null,
        input.assessmentRole || "none"
      ]
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
    if (input.competencyTags !== undefined) {
      setClause.push(`competency_tags = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(input.competencyTags));
    }
    if (input.estimatedMinutes !== undefined) {
      setClause.push(`estimated_minutes = $${paramIdx++}`);
      values.push(input.estimatedMinutes);
    }
    if (input.assessmentRole !== undefined) {
      setClause.push(`assessment_role = $${paramIdx++}`);
      values.push(input.assessmentRole);
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

  async getCourseProgress(courseId: string): Promise<{ userId: string; userName: string; completedBlocks: string[] }[]> {
    const { rows } = await pool.query(
      `SELECT p.user_id, u.name as user_name, p.completed_blocks
       FROM progress p
       JOIN users u ON u.id = p.user_id
       WHERE p.course_id = $1`,
      [courseId]
    );
    return rows.map(r => ({
      userId: r.user_id,
      userName: r.user_name,
      completedBlocks: Array.isArray(r.completed_blocks) ? r.completed_blocks : []
    }));
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

  async getCourseReflections(courseId: string): Promise<(Reflection & { userName: string; blockTitle: string })[]> {
    const { rows } = await pool.query(
      `SELECT r.*, u.name as user_name, b.title as block_title
       FROM reflections r
       JOIN users u ON u.id = r.learner_id
       JOIN blocks b ON b.id = r.block_id
       JOIN modules m ON m.id = b.module_id
       WHERE m.course_id = $1
       ORDER BY r.created_at DESC`,
      [courseId]
    );
    return rows.map(r => ({
      id: r.id,
      learnerId: r.learner_id,
      blockId: r.block_id,
      content: r.content,
      confidence: r.confidence,
      difficulty: r.difficulty,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
      userName: r.user_name,
      blockTitle: r.block_title
    }));
  }

  async clearUserData(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM progress WHERE user_id = $1", [userId]);
      await client.query("DELETE FROM reflections WHERE learner_id = $1", [userId]);
      await client.query("DELETE FROM submissions WHERE learner_id = $1", [userId]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getUser(id: string): Promise<User | null> {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows.length > 0 ? mapUserFromDb(rows[0]) : null;
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows.length > 0 ? mapUserRecordFromDb(rows[0]) : null;
  }

  async createUser(input: { name: string; email: string; passwordHash: string; role: Role }): Promise<User> {
    const id = "user-" + Date.now();
    const { rows } = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, approved, archived, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, FALSE, FALSE, NOW(), NOW())
       RETURNING *`,
      [id, input.name, input.email, input.passwordHash, input.role]
    );
    return mapUserFromDb(rows[0]);
  }

  async getUsers(): Promise<User[]> {
    const { rows } = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    return rows.map(mapUserFromDb);
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<void> {
    const { rowCount } = await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2, updated_at = NOW() WHERE LOWER(email) = LOWER($3)",
      [token, expiry, email]
    );
    if (rowCount === 0) {
      throw new Error("User not found");
    }
  }

  async getUserByResetToken(token: string): Promise<UserRecord | null> {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [token]
    );
    return rows.length > 0 ? mapUserRecordFromDb(rows[0]) : null;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    const { rowCount } = await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() WHERE id = $2",
      [passwordHash, userId]
    );
    if (rowCount === 0) {
      throw new Error("User not found");
    }
  }

  async updateUserApproval(userId: string, approved: boolean): Promise<void> {
    const { rowCount } = await pool.query(
      "UPDATE users SET approved = $1, updated_at = NOW() WHERE id = $2",
      [approved, userId]
    );
    if (rowCount === 0) {
      throw new Error("User not found");
    }
  }

  async updateUserArchived(userId: string, archived: boolean): Promise<void> {
    const { rowCount } = await pool.query(
      "UPDATE users SET archived = $1, updated_at = NOW() WHERE id = $2",
      [archived, userId]
    );
    if (rowCount === 0) {
      throw new Error("User not found");
    }
  }

  async deleteUser(userId: string): Promise<void> {
    // 1. Clear related progress & reflections data
    await this.clearUserData(userId);

    // 2. Remove user record
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    if (rowCount === 0) {
      throw new Error("User not found");
    }
  }

  async getSystemSetting(key: string, defaultValue: string): Promise<string> {
    const { rows } = await pool.query("SELECT value FROM system_settings WHERE key = $1", [key]);
    return rows.length > 0 ? rows[0].value : defaultValue;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    await pool.query(
      `INSERT INTO system_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value]
    );
  }

  async bookCourse(userId: string, courseId: string): Promise<void> {
    await pool.query(
      `INSERT INTO bookings (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [userId, courseId]
    );
  }

  async revokeCourseBooking(userId: string, courseId: string): Promise<void> {
    await pool.query(
      "DELETE FROM bookings WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );
  }

  async isCourseBooked(userId: string, courseId: string): Promise<boolean> {
    const { rows } = await pool.query(
      "SELECT 1 FROM bookings WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );
    return rows.length > 0;
  }

  async getUserBookings(userId: string): Promise<string[]> {
    const { rows } = await pool.query(
      "SELECT course_id FROM bookings WHERE user_id = $1",
      [userId]
    );
    return rows.map(r => r.course_id);
  }

  // Submission methods
  async getSubmission(userId: string, blockId: string): Promise<Submission | null> {
    const { rows } = await pool.query(
      "SELECT * FROM submissions WHERE learner_id = $1 AND block_id = $2",
      [userId, blockId]
    );
    return rows.length > 0 ? mapSubmissionFromDb(rows[0]) : null;
  }

  async saveSubmission(userId: string, blockId: string, solution: string, reflection?: string): Promise<Submission> {
    const existing = await this.getSubmission(userId, blockId);
    
    const initialVersion = {
      solution,
      reflection: reflection || null,
      feedback: [],
      createdAt: new Date().toISOString()
    };

    if (existing) {
      const updatedVersions = [...existing.versions, initialVersion];
      const { rows } = await pool.query(
        `UPDATE submissions 
         SET versions = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [JSON.stringify(updatedVersions), existing.id]
      );
      return mapSubmissionFromDb(rows[0]);
    } else {
      const id = "sub-" + Date.now();
      const { rows } = await pool.query(
        `INSERT INTO submissions (id, learner_id, block_id, versions, mastery_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [id, userId, blockId, JSON.stringify([initialVersion]), "not_assessed"]
      );
      return mapSubmissionFromDb(rows[0]);
    }
  }

  async updateSubmissionFeedback(id: string, feedback: SubmissionFeedback[]): Promise<Submission> {
    const { rows: findRows } = await pool.query("SELECT * FROM submissions WHERE id = $1", [id]);
    if (findRows.length === 0) throw new Error("Submission not found");
    const sub = mapSubmissionFromDb(findRows[0]);
    const versions = [...sub.versions];
    if (versions.length > 0) {
      const lastIdx = versions.length - 1;
      versions[lastIdx] = {
        ...versions[lastIdx],
        feedback: [...(versions[lastIdx].feedback || []), ...feedback]
      };
    }

    const { rows } = await pool.query(
      `UPDATE submissions 
       SET versions = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [JSON.stringify(versions), id]
    );
    return mapSubmissionFromDb(rows[0]);
  }

  async saveSubmissionRevision(id: string, solution: string, reflection?: string): Promise<Submission> {
    const { rows: findRows } = await pool.query("SELECT * FROM submissions WHERE id = $1", [id]);
    if (findRows.length === 0) throw new Error("Submission not found");
    const sub = mapSubmissionFromDb(findRows[0]);
    
    const newVer = { 
      solution, 
      reflection: reflection || null, 
      feedback: [], 
      createdAt: new Date().toISOString() 
    };

    const { rows } = await pool.query(
      `UPDATE submissions 
       SET versions = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [JSON.stringify([...sub.versions, newVer]), id]
    );
    return mapSubmissionFromDb(rows[0]);
  }

  async updateMasteryStatus(id: string, status: "not_assessed" | "developing" | "demonstrated"): Promise<Submission> {
    const { rows } = await pool.query(
      `UPDATE submissions 
       SET mastery_status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );
    if (rows.length === 0) throw new Error("Submission not found");
    return mapSubmissionFromDb(rows[0]);
  }
}
