"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SpaceObject, Environment, getSpaceWeatherImpact } from "@/lib/mockData"
import { Sun, Wind, Gauge, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnvironmentPanelProps {
  environment: Environment
  selectedObject: SpaceObject | null
}

export function EnvironmentPanel({ environment, selectedObject }: EnvironmentPanelProps) {
  const getKpColor = (kp: number): string => {
    if (kp <= 2) return "text-emerald-400"
    if (kp <= 4) return "text-yellow-400"
    if (kp <= 6) return "text-orange-400"
    return "text-red-400"
  }

  const getKpLabel = (kp: number): string => {
    if (kp <= 2) return "Quiet"
    if (kp <= 4) return "Unsettled"
    if (kp <= 6) return "Active"
    return "Storm"
  }

  const getStormBadgeClass = (level: string): string => {
    switch (level) {
      case "none":
        return "bg-emerald-500/20 text-emerald-400"
      case "minor":
        return "bg-yellow-500/20 text-yellow-400"
      case "moderate":
        return "bg-orange-500/20 text-orange-400"
      case "severe":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getSolarWindStatus = (speed: number): { label: string; color: string } => {
    if (speed < 400) return { label: "Slow", color: "text-emerald-400" }
    if (speed < 500) return { label: "Normal", color: "text-yellow-400" }
    if (speed < 600) return { label: "Fast", color: "text-orange-400" }
    return { label: "Very Fast", color: "text-red-400" }
  }

  const solarWindStatus = getSolarWindStatus(environment.solarWindSpeed)
  const impactNote = selectedObject ? getSpaceWeatherImpact(selectedObject.id, environment) : null

  return (
    <div className="p-4 space-y-4">
      {/* Kp Index Card */}
      <Card className="glass-panel border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Solar Activity Index (Kp)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className={cn("text-4xl font-bold tabular-nums", getKpColor(environment.solarKpIndex))}>
              {environment.solarKpIndex}
            </span>
            <span className="text-muted-foreground text-sm">{getKpLabel(environment.solarKpIndex)}</span>
          </div>
          {/* Kp Scale Visualization */}
          <div className="mt-4">
            <div className="flex gap-0.5 h-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-sm transition-all",
                    i < environment.solarKpIndex
                      ? i <= 2
                        ? "bg-emerald-500"
                        : i <= 4
                          ? "bg-yellow-500"
                          : i <= 6
                            ? "bg-orange-500"
                            : "bg-red-500"
                      : "bg-muted/50"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>0</span>
              <span>9</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solar Wind Speed */}
      <Card className="glass-panel border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wind className="w-4 h-4" />
            Solar Wind Speed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className={cn("text-3xl font-bold tabular-nums", solarWindStatus.color)}>
              {environment.solarWindSpeed}
            </span>
            <span className="text-muted-foreground text-sm">km/s</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {solarWindStatus.label} stream detected. {" "}
            {environment.solarWindSpeed > 500
              ? "Increased atmospheric drag expected for LEO assets."
              : "Nominal conditions for orbital mechanics."}
          </p>
        </CardContent>
      </Card>

      {/* Geomagnetic Storm Level */}
      <Card className="glass-panel border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Geomagnetic Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant="outline"
            className={cn("text-sm border-0 px-3 py-1", getStormBadgeClass(environment.geomagneticStormLevel))}
          >
            {environment.geomagneticStormLevel === "none"
              ? "No Storm"
              : `${environment.geomagneticStormLevel.charAt(0).toUpperCase()}${environment.geomagneticStormLevel.slice(1)} Storm`}
          </Badge>
          <p className="text-xs text-muted-foreground mt-3">
            {environment.geomagneticStormLevel === "none"
              ? "Quiet geomagnetic conditions. No significant impacts expected."
              : environment.geomagneticStormLevel === "minor"
                ? "Minor fluctuations in power grids. Possible aurora at high latitudes."
                : environment.geomagneticStormLevel === "moderate"
                  ? "Voltage corrections may be required. HF radio intermittent at higher latitudes."
                  : "Potential widespread voltage control problems. Degraded satellite navigation."}
          </p>
        </CardContent>
      </Card>

      {/* Impact Note for Selected Object */}
      {selectedObject && impactNote && (
        <Card className="glass-panel border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Impact on {selectedObject.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{impactNote}</p>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-xs text-muted-foreground">
        Last updated:{" "}
        {environment.updatedAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  )
}
