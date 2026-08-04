import crypto from "crypto";
import { cookies } from "next/headers";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const COOKIE_NAME = "customer_session";

function getKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, "sha256");
}

export function encryptCustomerSession(data: unknown): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(secret, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptCustomerSession(token: string): { customer?: CustomerSessionUser; expiresAt?: number } | null {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error("SESSION_SECRET environment variable is not set");
    }
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
  } catch {
    return null;
  }
}

export interface CustomerSessionUser {
  id: string;
  phone: string;
  name?: string | null;
}

export async function getCustomerSession(): Promise<CustomerSessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;

  const payload = decryptCustomerSession(cookie.value);
  if (!payload) return null;

  if (payload.expiresAt && Date.now() > payload.expiresAt) {
    return null;
  }

  return payload.customer || null;
}

export async function setCustomerSession(
  customer: CustomerSessionUser,
  durationMs = 30 * 24 * 60 * 60 * 1000 // 30 days default for customer session
) {
  const expiresAt = Date.now() + durationMs;
  const token = encryptCustomerSession({ customer, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroyCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
