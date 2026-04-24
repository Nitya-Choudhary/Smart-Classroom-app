import { SignJWT, jwtVerify } from "jose";
import * as bcrypt from "bcrypt";
import { getUserByEmail, upsertUser } from "./db";
import type { User } from "../drizzle/schema";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
const JWT_EXPIRATION = "7d";

export type SessionPayload = {
  userId: number;
  email: string;
  role: "teacher" | "student";
};

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Create a JWT token
 */
export async function createToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionPayload;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Register a new user (teacher or student)
 */
export async function registerUser(
  email: string,
  name: string,
  password: string,
  role: "teacher" | "student"
): Promise<User | null> {
  try {
    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await upsertUser({
      email,
      name,
      passwordHash,
      role,
    });

    // Return the created user
    const user = await getUserByEmail(email);
    return user || null;
  } catch (error) {
    console.error("[Auth] Registration failed:", error);
    throw error;
  }
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return null;
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  } catch (error) {
    console.error("[Auth] Authentication failed:", error);
    return null;
  }
}
