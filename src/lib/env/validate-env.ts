export function validateRequiredEnvVars(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Zorunlu env değişkenleri eksik: ${missing.join(", ")}`);
  }
}

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  validateRequiredEnvVars(["AUTH_SECRET", "DATABASE_URL", "NEXTAUTH_URL"]);
}
