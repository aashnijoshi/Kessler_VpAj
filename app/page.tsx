"use client"

import { useState, useCallback, useMemo } from "react"
import { TopBar } from "@/components/TopBar"
import { ObjectList } from "@/components/ObjectList"
import { OrbitCanvas } from "@/components/OrbitCanvas"
import { RightSidebar } from "@/components/RightSidebar"
import {
  mockObjects,
  mockCloseApproaches,
  mockEnvironment,
  mockAlerts,
  getCloseApproachesForObject,
  dedupeObjects,
  SpaceObject,
  Alert,
  ManeuverPlan,
  CloseApproachEvent,
} from "@/lib/mockData"
import { computeRiskScore, statusFromRisk } from "@/lib/risk"
import { Toaster, toast } from "sonner"

export default function Dashboard() {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>("fengyun-1c")
  const [isSimulating, setIsSimulating] = useState(true)
  const [planByObjectId, setPlanByObjectId] = useState<Record<string, ManeuverPlan>>({})
  const [executedByObjectId, setExecutedByObjectId] = useState<Record<string, boolean>>({})
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [objects] = useState<SpaceObject[]>(() => dedupeObjects(mockObjects))
  const [closeApproaches, setCloseApproaches] = useState<CloseApproachEvent[]>(mockCloseApproaches)

  const maneuverPlan = selectedObjectId ? planByObjectId[selectedObjectId] ?? null : null
  const maneuverExecuted = selectedObjectId ? executedByObjectId[selectedObjectId] ?? false : false

  // Single source of truth: derive status from risk.ts
  const displayObjects = useMemo(() => {
    return objects.map((obj) => {
      const events = getCloseApproachesForObject(obj.id, closeApproaches)
      const score = computeRiskScore(obj, events)
      const status = statusFromRisk(score)
      return { ...obj, status }
    })
  }, [objects, closeApproaches])

  const selectedObject = useMemo(
    () =>
      selectedObjectId
        ? displayObjects.find((o) => o.id === selectedObjectId) ?? null
        : null,
    [selectedObjectId, displayObjects]
  )

  const selectedObjectRiskScore = useMemo(() => {
    if (!selectedObject) return 0
    const events = getCloseApproachesForObject(selectedObject.id, closeApproaches)
    return computeRiskScore(selectedObject, events)
  }, [selectedObject, closeApproaches])

  const globalStatus = useMemo(() => {
    const hasCritical = displayObjects.some((o) => o.status === "critical")
    const hasWatch = displayObjects.some((o) => o.status === "watch")
    if (hasCritical) return "alert" as const
    if (hasWatch) return "watch" as const
    return "nominal" as const
  }, [displayObjects])

  const handleObjectSelect = useCallback((id: string) => {
    setSelectedObjectId(id)
  }, [])

  const handleManeuverGenerated = useCallback((plan: ManeuverPlan) => {
    setPlanByObjectId((prev) => ({ ...prev, [plan.objectId]: plan }))
  }, [])

  const handleExecuteManeuver = useCallback((plan: ManeuverPlan) => {
    setCloseApproaches((prev) =>
      prev.map((e) => {
        if (e.id !== plan.primaryEventId) return e
        return {
          ...e,
          probability: 0.03,
          missDistanceKm: e.missDistanceKm * 8,
          severity: "low" as const,
        }
      })
    )
    setExecutedByObjectId((prev) => ({ ...prev, [plan.objectId]: true }))
    toast.success("Maneuver executed.", {
      description: `Avoided conjunction with ${plan.secondaryObjectName}. Risk reduced ${plan.riskBeforePercent.toFixed(0)}% → ${plan.riskAfterPercent.toFixed(0)}%.`,
    })
  }, [])

  const handleSendAlert = useCallback(
    (alertData: Omit<Alert, "id" | "createdAt" | "status">) => {
      const newAlert: Alert = {
        ...alertData,
        id: `alert-${Date.now()}`,
        createdAt: new Date(),
        status: "sent",
      }
      setAlerts((prev) => [newAlert, ...prev])
    },
    []
  )

  const maneuverApplied = useMemo(() => {
    if (!selectedObjectId || !maneuverPlan || !maneuverExecuted) return null
    return {
      objectId: maneuverPlan.objectId,
      altitudeShift: maneuverPlan.action.deltaAltitudeKm,
    }
  }, [selectedObjectId, maneuverPlan, maneuverExecuted])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "glass-panel border-border/50",
        }}
      />

      <TopBar
        isSimulating={isSimulating}
        onSimulateToggle={setIsSimulating}
        globalStatus={globalStatus}
      />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-border/50 glass-panel overflow-hidden flex flex-col">
          <ObjectList
            objects={displayObjects}
            selectedObjectId={selectedObjectId}
            onSelectObject={handleObjectSelect}
          />
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <OrbitCanvas
            objects={displayObjects}
            selectedObjectId={selectedObjectId}
            onObjectClick={handleObjectSelect}
            isSimulating={isSimulating}
            maneuverApplied={maneuverApplied}
          />
        </main>

        <aside className="w-80 border-l border-border/50 glass-panel overflow-hidden">
          <RightSidebar
            selectedObject={selectedObject}
            objects={displayObjects}
            closeApproaches={closeApproaches}
            environment={mockEnvironment}
            alerts={alerts}
            maneuverPlan={maneuverPlan}
            maneuverExecuted={maneuverExecuted}
            onManeuverGenerated={handleManeuverGenerated}
            onExecuteManeuver={handleExecuteManeuver}
            onSendAlert={handleSendAlert}
            selectedObjectRiskScore={selectedObjectRiskScore}
          />
        </aside>
      </div>
    </div>
  )
}
