export type LogFields = Record<string, unknown>;

const SECRET_FIELD = /password|token|cookie/i;

/** Blanks every field whose name suggests a secret (L2-019 AC3). */
export function redact(fields: LogFields): LogFields {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, SECRET_FIELD.test(key) ? "[redacted]" : value]),
  );
}

/** One JSON line per entry on stdout/stderr. */
export function log(level: "info" | "error", fields: LogFields) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, ...redact(fields) });
  (level === "error" ? console.error : console.log)(line);
}
