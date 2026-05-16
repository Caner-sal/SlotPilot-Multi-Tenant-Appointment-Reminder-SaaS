type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

const redactedKeys = [
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "accessToken",
  "refreshToken",
  "email",
  "phone",
  "fullname",
];

function redactValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactValue);

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(input)) {
    const lower = key.toLowerCase();
    if (redactedKeys.some((k) => lower.includes(k))) {
      output[key] = "[REDACTED]";
      continue;
    }
    output[key] = redactValue(val);
  }

  return output;
}

function write(level: LogLevel, message: string, meta: LogMeta = {}) {
  const safeMeta = redactValue(meta);
  const normalizedMeta =
    typeof safeMeta === "object" && safeMeta !== null && !Array.isArray(safeMeta)
      ? (safeMeta as Record<string, unknown>)
      : { meta: safeMeta };
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...normalizedMeta,
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    write("info", message, meta);
  },
  warn(message: string, meta?: LogMeta) {
    write("warn", message, meta);
  },
  error(message: string, meta?: LogMeta) {
    write("error", message, meta);
  },
};
