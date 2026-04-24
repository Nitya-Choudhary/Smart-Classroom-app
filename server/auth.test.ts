import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import * as authService from "./auth";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(user?: AuthenticatedUser): {
  ctx: TrpcContext;
  clearedCookies: Array<{ name: string; options: Record<string, unknown> }>;
  setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }>;
} {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
  const setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const defaultUser: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: user || defaultUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies, setCookies };
}

describe("Authentication", () => {
  describe("auth.logout", () => {
    it("clears the session cookie and reports success", async () => {
      const { ctx, clearedCookies } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(clearedCookies).toHaveLength(1);
      expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
      expect(clearedCookies[0]?.options).toMatchObject({
        maxAge: -1,
        secure: true,
        sameSite: "none",
        httpOnly: true,
        path: "/",
      });
    });
  });

  describe("auth.me", () => {
    it("returns the current user when authenticated", async () => {
      const user: AuthenticatedUser = {
        id: 42,
        openId: "test-user-42",
        email: "user42@example.com",
        name: "User 42",
        loginMethod: "email",
        role: "teacher",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-15"),
        lastSignedIn: new Date("2026-01-20"),
      };

      const { ctx } = createAuthContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toEqual(user);
    });

    it("returns null when not authenticated", async () => {
      const { ctx } = createAuthContext(undefined as any);
      ctx.user = null as any;
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });

  describe("Password hashing", () => {
    it("should hash passwords correctly", async () => {
      const password = "testPassword123";
      const hash = await authService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are long
    });

    it("should verify correct passwords", async () => {
      const password = "testPassword123";
      const hash = await authService.hashPassword(password);

      const isValid = await authService.comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect passwords", async () => {
      const password = "testPassword123";
      const hash = await authService.hashPassword(password);

      const isValid = await authService.comparePassword("wrongPassword", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("JWT token creation", () => {
    it("should create a valid JWT token", async () => {
      const payload = {
        userId: 1,
        email: "test@example.com",
        role: "teacher" as const,
      };

      const token = await authService.createToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should verify a valid JWT token", async () => {
      const payload = {
        userId: 1,
        email: "test@example.com",
        role: "student" as const,
      };

      const token = await authService.createToken(payload);
      const verified = await authService.verifyToken(token);

      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe(payload.role);
    });

    it("should reject invalid JWT tokens", async () => {
      const invalidToken = "invalid.jwt.token";

      const verified = await authService.verifyToken(invalidToken);

      expect(verified).toBeNull();
    });
  });
});
