"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SpaceObject,
  CloseApproachEvent,
  ManeuverPlan,
  getObjectById,
  getCloseApproachesForObject,
  getPrimaryConjunctionEvent,
  generateManeuverPlan,
  formatTimeDelta,
} from "@/lib/mockData"
import { computeRiskScore, severityFromProbability, statusFromRisk } from "@/lib/risk"
import type { Severity } from "@/lib/mockData"
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Shield, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskPanelProps {
  selectedObject: SpaceObject | null
  objects: SpaceObject[]
  closeApproaches: CloseApproachEvent[]
  onManeuverGenerated: (plan: ManeuverPlan) => void
  onExecuteManeuver?: (plan: ManeuverPlan) => void
  maneuverPlan: ManeuverPlan | null
  maneuverExecuted?: boolean
}

const severityBadgeClass: Record<Severity, string> = {
  low: "bg-emerald-500/20 text-emerald-400",
  med: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  critical: "bg-red-500/20 text-red-400",
}

const statusToLabel: Record<"nominal" | "watch" | "critical", string> = {
  nominal: "Low",
  watch: "Watch",
  critical: "Critical",
}

export function RiskPanel({
  selectedObject,
  objects,
  closeApproaches,
  onManeuverGenerated,
  onExecuteManeuver,
  maneuverPlan,
  maneuverExecuted = false,
}: RiskPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  if (!selectedObject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-sm">
          Select an object to view risk analysis
        </p>
      </div>
    )
  }

  const objectApproaches = getCloseApproachesForObject(selectedObject.id, closeApproaches)
  const riskScore = computeRiskScore(selectedObject, objectApproaches)
  const status = statusFromRisk(riskScore)
  const riskLevelLabel = statusToLabel[status]
  const riskLevelColor =
    status === "critical"
      ? "text-red-400"
      : status === "watch"
        ? "text-yellow-400"
        : "text-emerald-400"
  const hasManeuverPlan = maneuverPlan?.objectId === selectedObject.id
  const isSatellite = selectedObject.type === "satellite"
  const canGeneratePlan = isSatellite && objectApproaches.length > 0

  const handleGeneratePlan = async () => {
    if (!canGeneratePlan) return
    const primaryEvent = getPrimaryConjunctionEvent(selectedObject.id, closeApproaches)
    if (!primaryEvent) return
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    const plan = generateManeuverPlan(selectedObject.id, primaryEvent, riskScore, objects)
    onManeuverGenerated(plan)
    setIsGenerating(false)
  }

  return (
    <TooltipProvider>
      <div className="p-4 space-y-4">
        {/* Risk Score Card */}
        <Card className="glass-panel border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Collision Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-4xl font-bold tabular-nums", riskLevelColor)}>
                {riskScore.toFixed(1)}%
              </span>
              <span className="text-muted-foreground text-sm">{riskLevelLabel} Risk</span>
            </div>
            {hasManeuverPlan && maneuverExecuted && maneuverPlan && (
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Reduced from {maneuverPlan.currentRisk.toFixed(0)}% after maneuver
                </span>
              </div>
            )}
            {selectedObject.id === "fengyun-1c" && !maneuverExecuted && (
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Fengyun-1C is in a high-traffic orbital band with debris from the 2007 ASAT test.
                A close approach with a debris object is predicted in the next 30 minutes with
                high collision probability. An avoidance maneuver is recommended.
              </p>
            )}
            {selectedObject.id !== "fengyun-1c" && (
              <p className="text-xs text-muted-foreground mt-3">
                Based on {objectApproaches.length} tracked close approach
                {objectApproaches.length !== 1 ? "es" : ""} within the next 24 hours.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Close Approaches Table */}
        <Card className="glass-panel border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Close Approaches</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {objectApproaches.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No close approaches detected
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs h-8">Object</TableHead>
                    <TableHead className="text-xs h-8">Time</TableHead>
                    <TableHead className="text-xs h-8">Miss Dist.</TableHead>
                    <TableHead className="text-xs h-8">Probability</TableHead>
                    <TableHead className="text-xs h-8">Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {objectApproaches.slice(0, 5).map((ca) => {
                    const otherId =
                      ca.primaryObjectId === selectedObject.id
                        ? ca.secondaryObjectId
                        : ca.primaryObjectId
                    const otherObject = getObjectById(otherId)
                    const severity = severityFromProbability(ca.probability)
                    return (
                      <TableRow key={ca.id} className="border-border/30">
                        <TableCell className="text-xs py-2 font-medium">
                          {otherObject?.name || otherId}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-muted-foreground">
                          {formatTimeDelta(ca.tMinusMinutes)}
                        </TableCell>
                        <TableCell className="text-xs py-2 tabular-nums">
                          {ca.missDistanceKm.toFixed(1)} km
                        </TableCell>
                        <TableCell className="text-xs py-2 tabular-nums">
                          {(ca.probability * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-xs py-2">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] border-0", severityBadgeClass[severity])}
                          >
                            {severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Generate Avoidance Plan - always visible */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block w-full">
              <Button
                onClick={handleGeneratePlan}
                disabled={!canGeneratePlan || isGenerating}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Computing trajectory...
                  </>
                ) : (
                  <>
                    Generate Avoidance Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px]">
            {!isSatellite
              ? "Select a satellite to generate a plan."
              : objectApproaches.length === 0
                ? "No close approaches detected."
                : "Generate a recommended maneuver to reduce collision risk."}
          </TooltipContent>
        </Tooltip>

        {/* Avoidance Plan Card */}
        {hasManeuverPlan && maneuverPlan && (
          <Card className="glass-panel border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Avoidance Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md bg-background/60 p-2.5 border border-border/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Predicted conjunction
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedObject.name} ↔ {maneuverPlan.secondaryObjectName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  T-{maneuverPlan.conjunction.tMinusMinutes} min · Miss {maneuverPlan.conjunction.missDistanceKm.toFixed(1)} km · Rel vel {maneuverPlan.conjunction.relativeVelocityKmS} km/s · P(coll) {(maneuverPlan.conjunction.probability * 100).toFixed(2)}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Action
                  </p>
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {maneuverPlan.action.type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Delta altitude
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {maneuverPlan.action.deltaAltitudeKm} km
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Execute in
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {maneuverPlan.action.executeInMinutes} min
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Burn duration
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {maneuverPlan.action.burnDurationSeconds} s
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-background/50 p-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Before vs After
                </p>
                <p className="text-sm font-semibold text-emerald-400">
                  {maneuverPlan.expectedRiskReduction}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Risk reduced after maneuver
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Rationale
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {maneuverPlan.rationaleBullets.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {!maneuverExecuted && onExecuteManeuver && (
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => onExecuteManeuver(maneuverPlan)}
                >
                  <Rocket className="w-4 h-4" />
                  Execute maneuver
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
