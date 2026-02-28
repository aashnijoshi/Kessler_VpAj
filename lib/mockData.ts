// Data Types
export type ObjectType = "satellite" | "debris" | "servicer"
export type ObjectStatus = "nominal" | "watch" | "critical"
export type Severity = "low" | "med" | "high" | "critical"
export type AlertStatus = "sent" | "queued" | "failed"
export type MissionPhase = "detection" | "assessment" | "recommended" | "executed" | "resolved"

export interface SpaceObject {
  id: string
  name: string
  type: ObjectType
  noradId?: string
  altitudeKm: number
  inclinationDeg: number
  velocityKmS: number
  status: ObjectStatus
  lastUpdate: Date
  notes: string
  orbitRadius: number // For visualization (0-1 normalized)
  orbitSpeed: number // Degrees per second
  initialAngle: number // Starting position in degrees
}

export interface CloseApproachEvent {
  id: string
  primaryObjectId: string
  secondaryObjectId: string
  tMinusMinutes: number
  missDistanceKm: number
  relativeVelocityKmS: number
  probability: number // 0-1
  severity: Severity
}

export interface Environment {
  solarKpIndex: number // 0-9
  solarWindSpeed: number // km/s
  geomagneticStormLevel: "none" | "minor" | "moderate" | "severe"
  updatedAt: Date
}

export interface Alert {
  id: string
  severity: Severity
  title: string
  message: string
  createdAt: Date
  status: AlertStatus
}

export type ManeuverAction = "raise_altitude" | "lower_altitude"

export interface ConjunctionSnapshot {
  tMinusMinutes: number
  missDistanceKm: number
  relativeVelocityKmS: number
  probability: number
}

export interface ManeuverPlanAction {
  type: ManeuverAction
  deltaAltitudeKm: number
  executeInMinutes: number
  burnDurationSeconds: number
}

export interface ManeuverPlan {
  id: string
  objectId: string
  primaryObjectId: string
  secondaryObjectId: string
  primaryEventId: string
  conjunction: ConjunctionSnapshot
  riskBeforePercent: number
  riskAfterPercent: number
  action: ManeuverPlanAction
  rationaleBullets: string[]
  expectedRiskReduction: string
  secondaryObjectName: string
  createdAt: Date
  // Legacy flat fields for consumers that expect them
  recommendedAltitudeChange: number
  delta_altitude_km: number
  execute_in_minutes: number
  burn_duration_seconds: number
  timeWindow: string
  currentRisk: number
  expectedRisk: number
  explanation: string
  rationale: string[]
}

export interface MissionTimeline {
  objectId: string
  phases: {
    phase: MissionPhase
    timestamp: Date
    status: "completed" | "in-progress" | "pending"
  }[]
}

// Mock Space Objects
export const mockObjects: SpaceObject[] = [
  {
    id: "iss",
    name: "ISS (Zarya)",
    type: "satellite",
    noradId: "25544",
    altitudeKm: 420,
    inclinationDeg: 51.6,
    velocityKmS: 7.66,
    status: "nominal",
    lastUpdate: new Date(),
    notes: "International Space Station - Primary tracking target",
    orbitRadius: 0.35,
    orbitSpeed: 0.8,
    initialAngle: 0,
  },
  {
    id: "starlink-1234",
    name: "Starlink-1234",
    type: "satellite",
    noradId: "45678",
    altitudeKm: 550,
    inclinationDeg: 53.0,
    velocityKmS: 7.59,
    status: "nominal",
    lastUpdate: new Date(),
    notes: "SpaceX Starlink constellation satellite",
    orbitRadius: 0.45,
    orbitSpeed: 0.65,
    initialAngle: 45,
  },
  {
    id: "fengyun-1c",
    name: "Fengyun-1C",
    type: "satellite",
    noradId: "25730",
    altitudeKm: 865,
    inclinationDeg: 99.1,
    velocityKmS: 7.42,
    status: "critical",
    lastUpdate: new Date(),
    notes: "Weather satellite; high collision risk from debris cloud in same orbital regime.",
    orbitRadius: 0.55,
    orbitSpeed: 0.95,
    initialAngle: 200,
  },
  {
    id: "cosmos-debris-1",
    name: "COSMOS 2251 DEB",
    type: "debris",
    noradId: "33579",
    altitudeKm: 485,
    inclinationDeg: 74.0,
    velocityKmS: 7.62,
    status: "watch",
    lastUpdate: new Date(),
    notes: "Debris from 2009 Cosmos-Iridium collision",
    orbitRadius: 0.4,
    orbitSpeed: 1.1,
    initialAngle: 120,
  },
  {
    id: "fengyun-debris-4",
    name: "FY-1C Debris",
    type: "debris",
    altitudeKm: 865,
    inclinationDeg: 99.1,
    velocityKmS: 7.42,
    status: "critical",
    lastUpdate: new Date(),
    notes: "Debris from 2007 ASAT test; conjunction risk with Fengyun-1C satellite",
    orbitRadius: 0.55,
    orbitSpeed: 0.95,
    initialAngle: 200,
  },
  {
    id: "servicer-alpha",
    name: "Servicer Alpha",
    type: "servicer",
    noradId: "99001",
    altitudeKm: 400,
    inclinationDeg: 51.6,
    velocityKmS: 7.67,
    status: "nominal",
    lastUpdate: new Date(),
    notes: "On-orbit servicing vehicle - Available for tasking",
    orbitRadius: 0.32,
    orbitSpeed: 0.85,
    initialAngle: 270,
  },
  {
    id: "sentinel-6a",
    name: "Sentinel-6A",
    type: "satellite",
    noradId: "46984",
    altitudeKm: 1336,
    inclinationDeg: 66.0,
    velocityKmS: 7.12,
    status: "nominal",
    lastUpdate: new Date(),
    notes: "Ocean topography mission - ESA/NASA",
    orbitRadius: 0.7,
    orbitSpeed: 0.5,
    initialAngle: 315,
  },
  {
    id: "unknown-debris-7",
    name: "TBA - To Be Assigned",
    type: "debris",
    altitudeKm: 450,
    inclinationDeg: 82.5,
    velocityKmS: 7.64,
    status: "watch",
    lastUpdate: new Date(),
    notes: "Recently detected object - Analysis pending",
    orbitRadius: 0.38,
    orbitSpeed: 1.2,
    initialAngle: 90,
  },
  {
    id: "gps-iif-12",
    name: "GPS IIF-12",
    type: "satellite",
    noradId: "41019",
    altitudeKm: 20200,
    inclinationDeg: 55.0,
    velocityKmS: 3.87,
    status: "nominal",
    lastUpdate: new Date(),
    notes: "GPS navigation constellation",
    orbitRadius: 0.85,
    orbitSpeed: 0.25,
    initialAngle: 180,
  },
  {
    id: "rocket-body-sl4",
    name: "SL-4 R/B",
    type: "debris",
    altitudeKm: 620,
    inclinationDeg: 65.0,
    velocityKmS: 7.55,
    status: "nominal",
    lastUpdate: new Date(),
    notes: "Spent rocket body - Tracked but low risk",
    orbitRadius: 0.5,
    orbitSpeed: 0.75,
    initialAngle: 150,
  },
]

// Mock Close Approach Events (fengyun-1c is canonical high-risk; deterministic 70–95% risk)
export const mockCloseApproaches: CloseApproachEvent[] = [
  {
    id: "ca-fy1c",
    primaryObjectId: "fengyun-1c",
    secondaryObjectId: "fengyun-debris-4",
    tMinusMinutes: 23,
    missDistanceKm: 0.4,
    relativeVelocityKmS: 8.2,
    probability: 0.82,
    severity: "critical",
  },
  {
    id: "ca-001",
    primaryObjectId: "iss",
    secondaryObjectId: "cosmos-debris-1",
    tMinusMinutes: 45,
    missDistanceKm: 0.8,
    relativeVelocityKmS: 12.4,
    probability: 0.00072,
    severity: "high",
  },
  {
    id: "ca-002",
    primaryObjectId: "iss",
    secondaryObjectId: "fengyun-debris-4",
    tMinusMinutes: 180,
    missDistanceKm: 2.1,
    relativeVelocityKmS: 14.2,
    probability: 0.00015,
    severity: "med",
  },
  {
    id: "ca-003",
    primaryObjectId: "starlink-1234",
    secondaryObjectId: "unknown-debris-7",
    tMinusMinutes: 320,
    missDistanceKm: 5.5,
    relativeVelocityKmS: 8.7,
    probability: 0.00003,
    severity: "low",
  },
  {
    id: "ca-004",
    primaryObjectId: "sentinel-6a",
    secondaryObjectId: "rocket-body-sl4",
    tMinusMinutes: 720,
    missDistanceKm: 12.0,
    relativeVelocityKmS: 6.2,
    probability: 0.000005,
    severity: "low",
  },
]

// Mock Environment Data
export const mockEnvironment: Environment = {
  solarKpIndex: 4,
  solarWindSpeed: 450,
  geomagneticStormLevel: "minor",
  updatedAt: new Date(),
}

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    severity: "high",
    title: "Close Approach Warning",
    message: "ISS conjunction with COSMOS 2251 DEB predicted in T-45 minutes. Probability of collision: 0.072%",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    status: "sent",
  },
  {
    id: "alert-002",
    severity: "med",
    title: "Space Weather Advisory",
    message: "Elevated Kp index detected. Minor geomagnetic storm conditions expected for next 6 hours.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
    status: "sent",
  },
  {
    id: "alert-003",
    severity: "low",
    title: "Routine Tracking Update",
    message: "GPS IIF-12 telemetry nominal. No anomalies detected in last 24-hour observation window.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: "sent",
  },
]

// Helper functions

/** Dedupe: by id keep first; by same name + noradId keep first. Ensures only one Fengyun-1C (or any id) exists. */
export function dedupeObjects(objects: SpaceObject[]): SpaceObject[] {
  const byId = new Map<string, SpaceObject>()
  const byNameNorad = new Map<string, SpaceObject>()
  for (const obj of objects) {
    if (byId.has(obj.id)) continue
    const key = `${obj.name}|${obj.noradId ?? ""}`
    if (byNameNorad.has(key)) continue
    byId.set(obj.id, obj)
    byNameNorad.set(key, obj)
  }
  return Array.from(byId.values())
}

export function getObjectById(id: string, objects: SpaceObject[] = mockObjects): SpaceObject | undefined {
  return objects.find(obj => obj.id === id)
}

/** Get close approach events for an object. Pass events to use state (e.g. after execute). */
export function getCloseApproachesForObject(
  objectId: string,
  events: CloseApproachEvent[] = mockCloseApproaches
): CloseApproachEvent[] {
  return events.filter(
    ca => ca.primaryObjectId === objectId || ca.secondaryObjectId === objectId
  )
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "critical": return "text-red-400"
    case "high": return "text-orange-400"
    case "med": return "text-yellow-400"
    case "low": return "text-emerald-400"
  }
}

export function getStatusColor(status: ObjectStatus): string {
  switch (status) {
    case "critical": return "bg-red-500"
    case "watch": return "bg-yellow-500"
    case "nominal": return "bg-emerald-500"
  }
}

export function formatTimeDelta(minutes: number): string {
  if (minutes < 60) return `T-${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `T-${hours}h ${mins}m`
}

/** Pick the highest-probability close approach for the given object (primary event for the plan). */
export function getPrimaryConjunctionEvent(
  objectId: string,
  events: CloseApproachEvent[]
): CloseApproachEvent | undefined {
  const forObject = getCloseApproachesForObject(objectId, events)
  if (forObject.length === 0) return undefined
  return [...forObject].sort((a, b) => b.probability - a.probability)[0]
}

export function generateManeuverPlan(
  objectId: string,
  primaryEvent: CloseApproachEvent,
  currentRisk: number,
  objects: SpaceObject[]
): ManeuverPlan {
  const primary = getObjectById(objectId, objects)
  const secondaryId = primaryEvent.primaryObjectId === objectId ? primaryEvent.secondaryObjectId : primaryEvent.primaryObjectId
  const secondary = getObjectById(secondaryId, objects)
  const secondaryName = secondary?.name ?? secondaryId

  const deltaAltitudeKm = objectId === "fengyun-1c" ? 0.95 : 0.5
  const executeInMinutes = objectId === "fengyun-1c" ? 12 : 45
  const burnDurationSeconds = objectId === "fengyun-1c" ? 42 : 60
  const riskAfterPercent = objectId === "fengyun-1c" ? 3 : Math.max(1, currentRisk * 0.04)
  const actionType: ManeuverAction = "raise_altitude"

  const rationaleBullets = [
    `Predicted conjunction with ${secondaryName} in T-${primaryEvent.tMinusMinutes} min; acting before then maximizes separation.`,
    `We raise altitude by +${deltaAltitudeKm} km before T-${executeInMinutes} min to increase miss distance beyond the current ${primaryEvent.missDistanceKm.toFixed(1)} km.`,
    "Burn duration and timing are chosen to minimize propellant while achieving safe separation.",
    `Expected collision probability drops from ${currentRisk.toFixed(0)}% to about ${riskAfterPercent.toFixed(0)}%.`,
    "Orbit remains within operational envelope; no mission impact.",
  ]

  return {
    id: `plan-${Date.now()}`,
    objectId,
    primaryObjectId: objectId,
    secondaryObjectId: secondaryId,
    primaryEventId: primaryEvent.id,
    conjunction: {
      tMinusMinutes: primaryEvent.tMinusMinutes,
      missDistanceKm: primaryEvent.missDistanceKm,
      relativeVelocityKmS: primaryEvent.relativeVelocityKmS,
      probability: primaryEvent.probability,
    },
    riskBeforePercent: currentRisk,
    riskAfterPercent,
    action: {
      type: actionType,
      deltaAltitudeKm,
      executeInMinutes,
      burnDurationSeconds,
    },
    rationaleBullets,
    expectedRiskReduction: `${currentRisk.toFixed(0)}% → ${riskAfterPercent.toFixed(0)}%`,
    secondaryObjectName: secondaryName,
    createdAt: new Date(),
    recommendedAltitudeChange: deltaAltitudeKm,
    delta_altitude_km: deltaAltitudeKm,
    execute_in_minutes: executeInMinutes,
    burn_duration_seconds: burnDurationSeconds,
    timeWindow: `Execute within ${executeInMinutes} minutes`,
    currentRisk: currentRisk,
    expectedRisk: riskAfterPercent,
    explanation: `We raise altitude by +${deltaAltitudeKm} km before T-${executeInMinutes} min to increase miss distance to ${secondaryName} beyond threshold.`,
    rationale: rationaleBullets,
  }
}

export function getMissionTimeline(
  objectId: string,
  riskScore: number,
  hasPlan: boolean = false,
  maneuverExecuted: boolean = false
): MissionTimeline {
  const hasRisk = riskScore > 10
  const isResolved = maneuverExecuted && riskScore <= 10
  
  return {
    objectId,
    phases: [
      {
        phase: "detection",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "completed",
      },
      {
        phase: "assessment",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: hasRisk || hasPlan ? "completed" : "in-progress",
      },
      {
        phase: "recommended",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        status: hasPlan ? "completed" : hasRisk ? "in-progress" : "pending",
      },
      {
        phase: "executed",
        timestamp: new Date(),
        status: maneuverExecuted ? "completed" : hasPlan ? "in-progress" : "pending",
      },
      {
        phase: "resolved",
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 4),
        status: isResolved ? "completed" : maneuverExecuted ? "in-progress" : "pending",
      },
    ],
  }
}

export function getSpaceWeatherImpact(objectId: string, env: Environment): string {
  const obj = getObjectById(objectId)
  if (!obj) return "No data available"
  
  if (obj.altitudeKm < 500) {
    if (env.solarKpIndex >= 5) {
      return "High atmospheric drag expected. Monitor altitude decay closely."
    } else if (env.solarKpIndex >= 3) {
      return "Moderate atmospheric expansion. Slight drag increase possible."
    }
  }
  
  if (obj.altitudeKm > 1000 && env.geomagneticStormLevel !== "none") {
    return "Elevated radiation environment. Monitor electronics for single-event upsets."
  }
  
  return "Current space weather conditions nominal for this orbital regime."
}
