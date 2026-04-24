import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, teacherProcedure } from "./_core/trpc";
import * as authService from "./auth";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { exportRouter } from "./routers/export";
import { uploadRouter } from "./routers/upload";

export const appRouter = router({
  system: systemRouter,
  
  // Authentication routes
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    signup: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().min(2),
          password: z.string().min(6),
          role: z.enum(["teacher", "student"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Check if user already exists
          const existing = await db.getUserByEmail(input.email);
          if (existing) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User already exists",
            });
          }

          // Register user
          const user = await authService.registerUser(
            input.email,
            input.name,
            input.password,
            input.role
          );

          if (!user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user",
            });
          }

          // Create JWT token
          const token = await authService.createToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          return {
            user,
            token,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Auth] Signup failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Signup failed",
          });
        }
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await authService.authenticateUser(
            input.email,
            input.password
          );

          if (!result) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid email or password",
            });
          }

          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, result.token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          return {
            user: result.user,
            token: result.token,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Auth] Login failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Login failed",
          });
        }
      }),
  }),

  // Student management (teacher only)
  students: router({
    list: teacherProcedure.query(async ({ ctx }) => {
      return await db.getStudentsByTeacher(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.id);
        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }
        
        // Check authorization
        if (ctx.user.role === "teacher" && student.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }
        
        return student;
      }),

    create: teacherProcedure
      .input(
        z.object({
          rollNumber: z.string(),
          className: z.string(),
          section: z.string().optional(),
          parentEmail: z.string().email().optional(),
          phoneNumber: z.string().optional(),
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Create user account for student
          const user = await authService.registerUser(
            input.email,
            input.name,
            input.password,
            "student"
          );

          if (!user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create student account",
            });
          }

          // Create student record
          const db_instance = await db.getDb();
          if (!db_instance) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Database not available",
            });
          }

          const { students } = await import("../drizzle/schema");
          await db_instance.insert(students).values({
            userId: user.id,
            teacherId: ctx.user.id,
            rollNumber: input.rollNumber,
            className: input.className,
            section: input.section,
            parentEmail: input.parentEmail,
            phoneNumber: input.phoneNumber,
          });

          return { success: true, userId: user.id };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Students] Create failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create student",
          });
        }
      }),

    update: teacherProcedure
      .input(
        z.object({
          id: z.number(),
          rollNumber: z.string().optional(),
          className: z.string().optional(),
          section: z.string().optional(),
          parentEmail: z.string().email().optional(),
          phoneNumber: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.id);
        if (!student || student.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { students } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        await db_instance
          .update(students)
          .set({
            ...(input.rollNumber && { rollNumber: input.rollNumber }),
            ...(input.className && { className: input.className }),
            ...(input.section !== undefined && { section: input.section }),
            ...(input.parentEmail !== undefined && { parentEmail: input.parentEmail }),
            ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
          })
          .where(eq(students.id, input.id));

        return { success: true };
      }),

    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.id);
        if (!student || student.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { students } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        await db_instance.delete(students).where(eq(students.id, input.id));

        return { success: true };
      }),

    search: teacherProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input, ctx }) => {
        const students = await db.getStudentsByTeacher(ctx.user.id);
        const query = input.query.toLowerCase();
        return students.filter(
          s =>
            s.rollNumber.toLowerCase().includes(query) ||
            s.className.toLowerCase().includes(query)
        );
      }),
  }),

  // Attendance routes
  attendance: router({
    mark: teacherProcedure
      .input(
        z.object({
          studentId: z.number(),
          date: z.string(),
          status: z.enum(["present", "absent", "leave"]),
          remarks: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student || student.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { attendance } = await import("../drizzle/schema");
        await db_instance.insert(attendance).values({
          studentId: input.studentId,
          teacherId: ctx.user.id,
          date: new Date(input.date),
          status: input.status,
          remarks: input.remarks,
        });

        return { success: true };
      }),

    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        // Check authorization
        if (ctx.user.role === "student" && student.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        return await db.getAttendanceByStudent(input.studentId);
      }),

    getPercentage: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        const records = await db.getAttendanceByStudent(input.studentId);
        if (records.length === 0) {
          return { percentage: 0, present: 0, total: 0 };
        }

        const present = records.filter(r => r.status === "present").length;
        const total = records.length;
        const percentage = Math.round((present / total) * 100);

        return { percentage, present, total };
      }),
  }),

  // Assignment routes
  assignments: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role === "teacher") {
        return await db.getAssignmentsByTeacher(ctx.user.id);
      }
      // Students see all assignments
      const db_instance = await db.getDb();
      if (!db_instance) return [];
      const { assignments } = await import("../drizzle/schema");
      return await db_instance.select().from(assignments);
    }),

    create: teacherProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          deadline: z.string(),
          fileUrl: z.string().optional(),
          fileKey: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { assignments } = await import("../drizzle/schema");
        await db_instance.insert(assignments).values({
          teacherId: ctx.user.id,
          title: input.title,
          description: input.description,
          deadline: new Date(input.deadline),
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
        });

        return { success: true };
      }),

    delete: teacherProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const assignment = await db.getAssignmentById(input.id);
        if (!assignment || assignment.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { assignments } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db_instance.delete(assignments).where(eq(assignments.id, input.id));

        return { success: true };
      }),
  }),

  // Submission routes
  submissions: router({
    submit: protectedProcedure
      .input(
        z.object({
          assignmentId: z.number(),
          fileUrl: z.string(),
          fileKey: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Student record not found",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { submissions } = await import("../drizzle/schema");
        const existing = await db.getSubmissionByStudentAndAssignment(
          student.id,
          input.assignmentId
        );

        if (existing) {
          const { eq } = await import("drizzle-orm");
          await db_instance
            .update(submissions)
            .set({
              fileUrl: input.fileUrl,
              fileKey: input.fileKey,
              submittedAt: new Date(),
              status: "submitted",
            })
            .where(eq(submissions.id, existing.id));
        } else {
          await db_instance.insert(submissions).values({
            assignmentId: input.assignmentId,
            studentId: student.id,
            fileUrl: input.fileUrl,
            fileKey: input.fileKey,
            submittedAt: new Date(),
            status: "submitted",
          });
        }

        return { success: true };
      }),

    getByAssignment: teacherProcedure
      .input(z.object({ assignmentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const assignment = await db.getAssignmentById(input.assignmentId);
        if (!assignment || assignment.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        return await db.getSubmissionsByAssignment(input.assignmentId);
      }),

    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        if (ctx.user.role === "student" && student.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) return [];

        const { submissions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        return await db_instance
          .select()
          .from(submissions)
          .where(eq(submissions.studentId, input.studentId));
      }),
  }),

  // Marks routes
  marks: router({
    add: teacherProcedure
      .input(
        z.object({
          studentId: z.number(),
          subject: z.string(),
          marks: z.number(),
          totalMarks: z.number().default(100),
          grade: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student || student.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { marks: marksTable } = await import("../drizzle/schema");
        await db_instance.insert(marksTable).values({
          studentId: input.studentId,
          teacherId: ctx.user.id,
          subject: input.subject,
          marks: String(input.marks),
          totalMarks: String(input.totalMarks),
          grade: input.grade,
        });

        return { success: true };
      }),

    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        if (ctx.user.role === "student" && student.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        return await db.getMarksByStudent(input.studentId);
      }),
  }),

  // Export routes
  export: exportRouter,

  // Upload routes
  upload: uploadRouter,

  // Feedback routes
  feedback: router({
    add: teacherProcedure
      .input(
        z.object({
          studentId: z.number(),
          content: z.string(),
          category: z.enum(["academic", "behavior", "attendance", "general"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student || student.teacherId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const db_instance = await db.getDb();
        if (!db_instance) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        const { feedback } = await import("../drizzle/schema");
        await db_instance.insert(feedback).values({
          studentId: input.studentId,
          teacherId: ctx.user.id,
          content: input.content,
          category: input.category,
        });

        return { success: true };
      }),

    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input, ctx }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        if (ctx.user.role === "student" && student.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        return await db.getFeedbackByStudent(input.studentId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
