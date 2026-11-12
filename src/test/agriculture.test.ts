import { describe, expect, it } from "vitest";

import { demoMetrics, metricsFromAnalytics } from "@/lib/agriculture";

describe("crop analytics metrics", () => {
  it("uses the specified four dashboard metrics in demo mode", () => {
    expect(demoMetrics).toEqual({
      fieldsMonitored: 24,
      criticalAlerts: 3,
      nitrogenIndex: 18.4,
      modelConfidence: 96.8,
    });
  });

  it("maps numeric analytics response fields to dashboard metrics", () => {
    expect(metricsFromAnalytics({
      fields_monitored: 10,
      critical_alerts: 2,
      nitrogen_deficiency_index: 14.5,
      model_confidence_score: 92.1,
    })).toEqual({
      fieldsMonitored: 10,
      criticalAlerts: 2,
      nitrogenIndex: 14.5,
      modelConfidence: 92.1,
    });
  });

  it("rejects incomplete or non-numeric analytics responses", () => {
    expect(metricsFromAnalytics({ fields_monitored: "10" })).toBeNull();
    expect(metricsFromAnalytics(null)).toBeNull();
  });
});