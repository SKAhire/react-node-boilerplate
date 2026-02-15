/**
 * src/utils/token.ts
 *
 * Summary: Token generation utilities
 * - Generates cryptographically secure random tokens
 */

import crypto from "crypto";

/**
 * Generate a cryptographically secure random token
 * @param length - Token length in bytes (default: 32)
 * @returns Hex-encoded token string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate a URL-safe cryptographically secure random token
 * @param length - Token length in bytes (default: 32)
 * @returns Base64-encoded URL-safe token string
 */
export function generateUrlSafeToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("base64url");
}
