export function getRequestId(headers: Headers): string {
  const existing = headers.get("x-request-id");
  if (existing && existing.trim().length > 0) return existing;
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}`;
  }
}
