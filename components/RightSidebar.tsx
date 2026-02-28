"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RiskPanel } from "@/components/RiskPanel"
import { EnvironmentPanel } from "@/components/EnvironmentPanel"
import { AlertsPanel } from "@/components/AlertsPanel"
import { MissionPanel } from "@/components/MissionPanel"
import {
  SpaceObject,
  CloseApproachEvent,
  Environment,
  Alert,
  ManeuverPlan,
} from "@/lib/mockData"
import { Shield, Sun, Bell, Target } from "lucide-react"

interface RightSidebarProps {
  selectedObject: SpaceObject | null
  objects: SpaceObject[]
  closeApproaches: CloseApproachEvent[]
  environment: Environment
  alerts: Alert[]
  maneuverPlan: ManeuverPlan | null
  maneuverExecuted: boolean
  onManeuverGenerated: (plan: ManeuverPlan) => void
  onExecuteManeuver?: (plan: ManeuverPlan) => void
  onSendAlert: (alert: Omit<Alert, "id" | "createdAt" | "status">) => void
  selectedObjectRiskScore?: number
}

export function RightSidebar({
  selectedObject,
  objects,
  closeApproaches,
  environment,
  alerts,
  maneuverPlan,
  maneuverExecuted,
  onManeuverGenerated,
  onExecuteManeuver,
  onSendAlert,
  selectedObjectRiskScore = 0,
}: RightSidebarProps) {
  return (
    <Tabs defaultValue="risk" className="h-full flex flex-col">
      <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-11 px-2 overflow-x-auto overflow-y-hidden flex-nowrap [scrollbar-width:thin]">
        <TabsTrigger
          value="risk"
          className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-xs gap-1.5 !flex-none min-w-[3.5rem]"
        >
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Risk</span>
        </TabsTrigger>
        <TabsTrigger
          value="environment"
          className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-xs gap-1.5 !flex-none min-w-[5.5rem]"
        >
          <Sun className="w-3.5 h-3.5 shrink-0" />
          <span>Environment</span>
        </TabsTrigger>
        <TabsTrigger
          value="alerts"
          className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-xs gap-1.5 !flex-none min-w-[4rem]"
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          <span>Alerts</span>
        </TabsTrigger>
        <TabsTrigger
          value="mission"
          className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-xs gap-1.5 !flex-none min-w-[4.5rem]"
        >
          <Target className="w-3.5 h-3.5 shrink-0" />
          <span>Mission</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="risk" className="flex-1 m-0 overflow-auto">
        <RiskPanel
          selectedObject={selectedObject}
          objects={objects}
          closeApproaches={closeApproaches}
          onManeuverGenerated={onManeuverGenerated}
          onExecuteManeuver={onExecuteManeuver}
          maneuverPlan={maneuverPlan}
          maneuverExecuted={maneuverExecuted}
        />
      </TabsContent>

      <TabsContent value="environment" className="flex-1 m-0 overflow-auto">
        <EnvironmentPanel environment={environment} selectedObject={selectedObject} />
      </TabsContent>

      <TabsContent value="alerts" className="flex-1 m-0 overflow-auto">
        <AlertsPanel alerts={alerts} onSendAlert={onSendAlert} />
      </TabsContent>

      <TabsContent value="mission" className="flex-1 m-0 overflow-auto">
        <MissionPanel
          selectedObject={selectedObject}
          maneuverPlan={maneuverPlan}
          closeApproaches={closeApproaches}
          maneuverExecuted={maneuverExecuted}
          riskScore={selectedObjectRiskScore}
        />
      </TabsContent>
    </Tabs>
  )
}
