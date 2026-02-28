"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  SpaceObject,
  ManeuverPlan,
  MissionTimeline,
  getMissionTimeline,
  getCloseApproachesForObject,
  CloseApproachEvent,
} from "@/lib/mockData"
import {
  Target,
  Download,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  BarChart3,
  Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MissionPanelProps {
  selectedObject: SpaceObject | null
  maneuverPlan: ManeuverPlan | null
  closeApproaches: CloseApproachEvent[]
  maneuverExecuted?: boolean
  riskScore?: number
}

const phaseIcons = {
  detection: Search,
  assessment: BarChart3,
  recommended: Target,
  executed: Rocket,
  resolved: CheckCircle2,
}

const phaseLabels = {
  detection: "Detection",
  assessment: "Assessment",
  recommended: "Recommended Maneuver",
  executed: "Executed",
  resolved: "Resolved",
}

export function MissionPanel({ selectedObject, maneuverPlan, closeApproaches, maneuverExecuted = false, riskScore = 0 }: MissionPanelProps) {
  if (!selectedObject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">
          Select an object to view mission timeline
        </p>
      </div>
    )
  }

  const hasPlan = maneuverPlan !== null && maneuverPlan.objectId === selectedObject.id
  const timeline = getMissionTimeline(selectedObject.id, riskScore, hasPlan, maneuverExecuted)
  const objectApproaches = closeApproaches.filter(
    (ca) => ca.primaryObjectId === selectedObject.id || ca.secondaryObjectId === selectedObject.id
  )

  const handleExportBriefing = () => {
    const briefing = {
      generatedAt: new Date().toISOString(),
      object: {
        id: selectedObject.id,
        name: selectedObject.name,
        type: selectedObject.type,
        noradId: selectedObject.noradId,
        altitudeKm: selectedObject.altitudeKm,
        inclinationDeg: selectedObject.inclinationDeg,
        velocityKmS: selectedObject.velocityKmS,
        status: selectedObject.status,
        notes: selectedObject.notes,
      },
      closeApproaches: objectApproaches.map((ca) => ({
        id: ca.id,
        tMinusMinutes: ca.tMinusMinutes,
        missDistanceKm: ca.missDistanceKm,
        relativeVelocityKmS: ca.relativeVelocityKmS,
        probability: ca.probability,
        severity: ca.severity,
      })),
      recommendedPlan: maneuverPlan
        ? {
            recommendedAltitudeChange: maneuverPlan.recommendedAltitudeChange,
            timeWindow: maneuverPlan.timeWindow,
            currentRisk: maneuverPlan.currentRisk,
            expectedRisk: maneuverPlan.expectedRisk,
            explanation: maneuverPlan.explanation,
          }
        : null,
      timeline: timeline.phases.map((p) => ({
        phase: p.phase,
        timestamp: p.timestamp.toISOString(),
        status: p.status,
      })),
    }

    const blob = new Blob([JSON.stringify(briefing, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedObject.name.replace(/\s+/g, "_")}_briefing.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Briefing exported", {
      description: `${selectedObject.name} briefing downloaded successfully.`,
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Object Summary */}
      <Card className="glass-panel border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            {selectedObject.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{selectedObject.type}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
              <p
                className={cn(
                  "font-medium capitalize",
                  selectedObject.status === "nominal" && "text-emerald-400",
                  selectedObject.status === "watch" && "text-yellow-400",
                  selectedObject.status === "critical" && "text-red-400"
                )}
              >
                {selectedObject.status}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Altitude</p>
              <p className="font-medium tabular-nums">{selectedObject.altitudeKm.toLocaleString()} km</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Velocity</p>
              <p className="font-medium tabular-nums">{selectedObject.velocityKmS} km/s</p>
            </div>
          </div>
          {selectedObject.noradId && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">NORAD ID</p>
              <p className="font-mono text-sm">{selectedObject.noradId}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{selectedObject.notes}</p>
          </div>
        </CardContent>
      </Card>

      {/* Mission Timeline */}
      <Card className="glass-panel border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Mission Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/50" />
            
            <div className="space-y-4">
              {timeline.phases.map((phase, index) => {
                const Icon = phaseIcons[phase.phase]
                const isCompleted = phase.status === "completed"
                const isInProgress = phase.status === "in-progress"
                
                return (
                  <div key={phase.phase} className="flex items-start gap-3 relative">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0",
                        isCompleted && "bg-emerald-500/20 text-emerald-400",
                        isInProgress && "bg-primary/20 text-primary",
                        !isCompleted && !isInProgress && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isInProgress ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium text-sm",
                            isCompleted || isInProgress ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {phaseLabels[phase.phase]}
                        </span>
                        {isInProgress && (
                          <span className="text-[10px] text-primary uppercase tracking-wider">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {phase.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Button variant="outline" className="w-full" onClick={handleExportBriefing}>
        <Download className="w-4 h-4 mr-2" />
        Export Briefing
      </Button>
    </div>
  )
}
