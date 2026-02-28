import type { SpaceObject, CloseApproachEvent, ObjectStatus, Severity } from "./mockData"

/**
 * Single source of truth for risk derivation.
 * Do not store risk score or status elsewhere — compute from this module.
 */

/** Compute risk score 0–100 from selected object and its close approach events. */
export function computeRiskScore(
  _selectedObject: SpaceObject,
  eventsForObject: CloseApproachEvent[]
): number {
  if (eventsForObject.length === 0) return 0
  // Use max probability scaled to 0–100; time factor slightly boosts imminent events
  const scores = eventsForObject.map((e) => {
    const timeFactor = 1 + Math.max(0, 0.2 * (1 - e.tMinusMinutes / 1440))
    return e.probability * 100 * timeFactor
  })
  return Math.min(100, Math.max(...scores))
}

/** Map probability (0–1) to severity for display. */
export function severityFromProbability(p: number): Severity {
  if (p >= 0.5) return "critical"
  if (p >= 0.15) return "high"
  if (p >= 0.03) return "med"
  return "low"
}

/** Map risk score (0–100) to object status. */
export function statusFromRisk(score: number): ObjectStatus {
  if (score >= 50) return "critical"
  if (score >= 10) return "watch"
  return "nominal"
}
