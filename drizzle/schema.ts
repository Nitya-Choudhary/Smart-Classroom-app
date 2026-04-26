import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table for authentication.
 * Supports both teachers and students.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["teacher", "student"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Student records managed by teachers.
 * Linked to users table for student accounts.
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  teacherId: int("teacherId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rollNumber: varchar("rollNumber", { length: 50 }).notNull(),
  className: varchar("className", { length: 100 }).notNull(),
  section: varchar("section", { length: 10 }),
  parentEmail: varchar("parentEmail", { length: 320 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Attendance tracking with date-wise records.
 */
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  teacherId: int("teacherId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: mysqlEnum("status", ["present", "absent", "leave"]).notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Assignments created by teachers.
 */
export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  deadline: timestamp("deadline").notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileKey: varchar("fileKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

/**
 * Assignment submissions by students.
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  studentId: int("studentId")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileKey: varchar("fileKey", { length: 255 }),
  submittedAt: timestamp("submittedAt"),
  status: mysqlEnum("status", ["pending", "submitted", "graded"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * Marks/grades for students across subjects.
 */
export const marks = mysqlTable("marks", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  teacherId: int("teacherId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 100 }).notNull(),
  marks: decimal("marks", { precision: 5, scale: 2 }).notNull(),
  totalMarks: decimal("totalMarks", { precision: 5, scale: 2 }).default("100"),
  grade: varchar("grade", { length: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mark = typeof marks.$inferSelect;
export type InsertMark = typeof marks.$inferInsert;

/**
 * Feedback and suggestions from teachers to students.
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  teacherId: int("teacherId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["academic", "behavior", "attendance", "general"]).default("general"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
