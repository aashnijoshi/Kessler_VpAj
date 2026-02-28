"use client"

import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Orbit, Activity, Clock } from "lucide-react"
import Link from "next/link"

interface TopBarProps {
  isSimulating: boolean
  onSimulateToggle: (value: boolean) => void
  globalStatus: "nominal" | "watch" | "alert"
}

export function TopBar({ isSimulating, onSimulateToggle, globalStatus }: TopBarProps) {
  const statusConfig = {
    nominal: {
      label: "All Systems Nominal",
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    watch: {
      label: "Active Monitoring",
      color: "bg-yellow-500",
      textColor: "text-yellow-400",
      badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    alert: {
      label: "Attention Required",
      color: "bg-red-500",
      textColor: "text-red-400",
      badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  }

  const status = statusConfig[globalStatus]

  return (
    <header className="min-h-14 border-b border-border/50 glass-panel flex items-center justify-between gap-4 px-4 py-2">
      {/* Logo & Title: allow wrap so subtitle and "mission" never clip */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Orbit className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight">Kessler OS</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest break-words">
              real-time collision risk + one-click avoidance recommendations
            </p>
          </div>
        </Link>
      </div>

      {/* Center - Status */}
      <div className="flex items-center gap-4 shrink-0">
        <Badge variant="outline" className={cn("flex items-center gap-2", status.badgeClass)}>
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.color)} />
          {status.label}
        </Badge>
        
        {/* Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="tabular-nums">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })} UTC
          </span>
        </div>
      </div>

      {/* Right - Simulation Toggle */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className={cn("w-4 h-4", isSimulating ? "text-primary" : "text-muted-foreground")} />
          <span className="text-xs text-muted-foreground">Simulate</span>
          <Switch checked={isSimulating} onCheckedChange={onSimulateToggle} />
        </div>
      </div>
    </header>
  )
}
