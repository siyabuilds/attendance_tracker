import { z } from "zod";

export const adminSessionCookieName = "admin_session";
export const adminSessionDurationSeconds = 60 * 60 * 24 * 7;

export const loginSchema = z.object({
  email: z
    .email({ error: "Enter a valid email address." })
    .trim()
    .toLowerCase(),
  password: z.string().min(1, "Enter your password.").trim(),
});

export type AdminSession = {
  adminId: string;
  email: string;
  expiresAt: number;
};

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      formError?: string;
    }
  | undefined;

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function base64UrlEncode(bytes: Uint8Array) {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return base64ToBytes(padded);
}

async function getSessionKey() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ??
    process.env.SESSION_SECRET ??
    "attendance-tracker-development-session-secret";

  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAdminSessionToken(session: AdminSession) {
  const payload = base64UrlEncode(textEncoder.encode(JSON.stringify(session)));
  const key = await getSessionKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payload),
  );

  return `${payload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function readAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  try {
    const key = await getSessionKey();
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      textEncoder.encode(payload),
    );

    if (!isValid) {
      return null;
    }

    const session = JSON.parse(
      textDecoder.decode(base64UrlDecode(payload)),
    ) as AdminSession;

    if (!session.expiresAt || session.expiresAt <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function readAdminSession(cookieStore: CookieStoreLike) {
  return readAdminSessionToken(cookieStore.get(adminSessionCookieName)?.value);
}

export function createAdminSessionCookieValue(
  session: Omit<AdminSession, "expiresAt">,
) {
  return createAdminSessionToken({
    ...session,
    expiresAt: Date.now() + adminSessionDurationSeconds * 1000,
  });
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionDurationSeconds,
  };
}
