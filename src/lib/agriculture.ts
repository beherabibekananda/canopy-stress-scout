export type FarmMetrics = {
  fieldsMonitored: number;
  criticalAlerts: number;
  nitrogenIndex: number;
  modelConfidence: number;
};

export const demoMetrics: FarmMetrics = {
  fieldsMonitored: 24,
  criticalAlerts: 3,
  nitrogenIndex: 18.4,
  modelConfidence: 96.8,
};

export function metricsFromAnalytics(payload: unknown): FarmMetrics | null {
  if (payload === null || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const numberAt = (key: string) => {
    const value = record[key];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  };
  const fieldsMonitored = numberAt("fields_monitored") ?? numberAt("total_fields_monitored");
  const criticalAlerts = numberAt("critical_alerts");
  const nitrogenIndex = numberAt("nitrogen_deficiency_index");
  const modelConfidence = numberAt("model_confidence_score");

  if (
    fieldsMonitored === undefined ||
    criticalAlerts === undefined ||
    nitrogenIndex === undefined ||
    modelConfidence === undefined
  ) {
    return null;
  }

  return { fieldsMonitored, criticalAlerts, nitrogenIndex, modelConfidence };
}

export function apiBaseUrl() {
  return (import.meta.env["VITE_FASTAPI_BASE_URL"] || "http://localhost:8000").replace(/\/$/, "");
}