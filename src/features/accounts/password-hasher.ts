import { hash, verify } from "@node-rs/argon2";

/** Salted, adaptive argon2id hashes (L2-017). The library defaults to argon2id with a random salt. */
export function hashPassword(password: string) {
  return hash(password);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}
