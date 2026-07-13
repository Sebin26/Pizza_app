import crypto from "crypto";
import { cookies } from "next/headers";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const COOKIE_NAME = "pizza_session";

function getKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, "sha256");
}

export function encryptSession(data: any): string {
  const secret = process.env.SESSION_SECRET || "pizza-mvp-super-secret-development-key-32";
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(secret, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptSession(token: string): any {
  try {
    const secret = process.env.SESSION_SECRET || "pizza-mvp-super-secret-development-key-32";
    const parts = token.split(":");
    if (parts.length !== 4) return null;

    const [saltHex, ivHex, tagHex, encryptedHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const key = getKey(secret, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}

export interface SessionUser {
  id: string;
  username: string;
  role: "STAFF" | "ADMIN";
  name: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;

  const payload = decryptSession(cookie.value);
  if (!payload) return null;

  if (payload.expiresAt && Date.now() > payload.expiresAt) {
    return null;
  }

  return payload.user;
}

export async function setSession(user: SessionUser, durationMs = 24 * 60 * 60 * 1000) {
  const expiresAt = Date.now() + durationMs;
  const token = encryptSession({ user, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
