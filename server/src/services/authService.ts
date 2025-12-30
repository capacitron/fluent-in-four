import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { users, refreshTokens, streaks } from '../db/schema.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  parseExpiresIn,
} from '../utils/jwt.js';
import { env } from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    role: string;
    totalXp: number;
    level: number;
  };
  accessToken: string;
  refreshToken: string;
}

export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  // Check if email already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    throw createError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      displayName,
      role: 'user',
    })
    .returning();

  // Create streak record
  await db.insert(streaks).values({
    userId: newUser.id,
  });

  // Generate tokens
  const accessToken = signAccessToken({
    sub: newUser.id,
    email: newUser.email!,
    role: newUser.role,
  });

  const tokenId = uuidv4();
  const refreshToken = signRefreshToken({
    sub: newUser.id,
    tokenId,
  });

  // Store refresh token
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES));
  await db.insert(refreshTokens).values({
    userId: newUser.id,
    token: refreshToken,
    expiresAt,
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email!,
      displayName: newUser.displayName,
      role: newUser.role,
      totalXp: newUser.totalXp,
      level: newUser.level,
    },
    accessToken,
    refreshToken,
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.passwordHash) {
    throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Check password
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // Update last active
  await db
    .update(users)
    .set({ lastActiveAt: new Date() })
    .where(eq(users.id, user.id));

  // Generate tokens
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email!,
    role: user.role,
  });

  const tokenId = uuidv4();
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId,
  });

  // Store refresh token
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES));
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  return {
    user: {
      id: user.id,
      email: user.email!,
      displayName: user.displayName,
      role: user.role,
      totalXp: user.totalXp,
      level: user.level,
    },
    accessToken,
    refreshToken,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
}

export async function refreshAccessToken(
  token: string
): Promise<{ accessToken: string; refreshToken: string }> {
  // Verify token
  const payload = verifyRefreshToken(token);
  if (!payload) {
    throw createError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
  }

  // Check if token exists in DB
  const storedToken = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, token),
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw createError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token');
  }

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.sub),
  });

  if (!user) {
    throw createError(401, 'USER_NOT_FOUND', 'User not found');
  }

  // Delete old token
  await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));

  // Generate new tokens
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email!,
    role: user.role,
  });

  const tokenId = uuidv4();
  const newRefreshToken = signRefreshToken({
    sub: user.id,
    tokenId,
  });

  // Store new refresh token
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES));
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: newRefreshToken,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw createError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    theme: user.theme,
    soundEffects: user.soundEffects,
    totalXp: user.totalXp,
    level: user.level,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
  };
}
