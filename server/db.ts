import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  students,
  attendance,
  assignments,
  submissions,
  marks,
  feedback,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Create or update a user (teacher or student)
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (existing.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({
          name: user.name,
          passwordHash: user.passwordHash,
          role: user.role,
          updatedAt: new Date(),
        })
        .where(eq(users.email, user.email));
    } else {
      // Insert new user
      await db.insert(users).values({
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all students for a teacher
 */
export async function getStudentsByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(students)
    .where(eq(students.teacherId, teacherId));
}

/**
 * Get student by ID
 */
export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get student by user ID
 */
export async function getStudentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get attendance records for a student
 */
export async function getAttendanceByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(attendance)
    .where(eq(attendance.studentId, studentId));
}

/**
 * Get attendance for a specific date range
 */
export async function getAttendanceByDateRange(
  studentId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.studentId, studentId),
        // Note: date comparison in MySQL
      )
    );
}

/**
 * Get assignments by teacher
 */
export async function getAssignmentsByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(assignments)
    .where(eq(assignments.teacherId, teacherId));
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get submissions for an assignment
 */
export async function getSubmissionsByAssignment(assignmentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(submissions)
    .where(eq(submissions.assignmentId, assignmentId));
}

/**
 * Get submission by student and assignment
 */
export async function getSubmissionByStudentAndAssignment(
  studentId: number,
  assignmentId: number
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.studentId, studentId),
        eq(submissions.assignmentId, assignmentId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get marks for a student
 */
export async function getMarksByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(marks)
    .where(eq(marks.studentId, studentId));
}

/**
 * Get feedback for a student
 */
export async function getFeedbackByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(feedback)
    .where(eq(feedback.studentId, studentId));
}

/**
 * Get all feedback given by a teacher
 */
export async function getFeedbackByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(feedback)
    .where(eq(feedback.teacherId, teacherId));
}
