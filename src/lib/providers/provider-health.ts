import { logger } from "@/lib/logger";

export interface AssertProductionProviderParams {
  envVarName: string;
  currentValue: string;
  fakeValues: string[];
  providerLabel: string;
  nodeEnv?: string;
}

/**
 * Guards against FAKE providers running silently in production.
 * - production: throws Error
 * - development: logs a warning
 * - test: no-op (allows fake providers for unit/integration tests)
 */
export function assertProductionProvider(params: AssertProductionProviderParams): void {
  const env = params.nodeEnv ?? process.env.NODE_ENV ?? "development";

  if (!params.fakeValues.includes(params.currentValue)) return;

  if (env === "production") {
    throw new Error(
      `[${params.providerLabel}] Production ortamında FAKE provider kullanılamaz. ` +
        `${params.envVarName} ortam değişkenini gerçek bir provider ile ayarlayın.`,
    );
  }

  if (env === "development") {
    logger.warn(`${params.providerLabel} provider FAKE olarak çalışıyor`, {
      envVarName: params.envVarName,
      hint: `Gerçek entegrasyon için ${params.envVarName} değişkenini ayarlayın.`,
    });
  }
  // test ortamında: hiçbir şey yapma
}
