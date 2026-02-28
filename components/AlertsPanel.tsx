"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, Severity, AlertStatus } from "@/lib/mockData"
import { Bell, Send, CheckCircle, Clock, XCircle, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AlertsPanelProps {
  alerts: Alert[]
  onSendAlert: (alert: Omit<Alert, "id" | "createdAt" | "status">) => void
}

const severityIcons: Record<Severity, string> = {
  low: "text-emerald-400",
  med: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
}

const statusIcons: Record<AlertStatus, { icon: React.ReactNode; color: string }> = {
  sent: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-emerald-400" },
  queued: { icon: <Clock className="w-3.5 h-3.5" />, color: "text-yellow-400" },
  failed: { icon: <XCircle className="w-3.5 h-3.5" />, color: "text-red-400" },
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

export function AlertsPanel({ alerts, onSendAlert }: AlertsPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [newAlert, setNewAlert] = useState({
    severity: "med" as Severity,
    title: "",
    message: "",
  })

  const handleSendAlert = async () => {
    if (!newAlert.title || !newAlert.message) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSending(true)
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    onSendAlert(newAlert)
    toast.success("Alert sent successfully", {
      description: `${newAlert.title} has been dispatched to all stations.`,
    })
    
    setNewAlert({ severity: "med", title: "", message: "" })
    setIsDialogOpen(false)
    setIsSending(false)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Send Alert Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Send New Alert
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-panel border-border/50">
          <DialogHeader>
            <DialogTitle>Create Alert</DialogTitle>
            <DialogDescription>
              Dispatch an alert to mission control and relevant stations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={newAlert.severity}
                onValueChange={(value: Severity) =>
                  setNewAlert((prev) => ({ ...prev, severity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Alert title..."
                value={newAlert.title}
                onChange={(e) => setNewAlert((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Alert details..."
                value={newAlert.message}
                onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendAlert} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Alert
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerts History */}
      <Card className="glass-panel border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alert History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No alerts in history
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            alert.severity === "critical" && "bg-red-500",
                            alert.severity === "high" && "bg-orange-500",
                            alert.severity === "med" && "bg-yellow-500",
                            alert.severity === "low" && "bg-emerald-500"
                          )}
                        />
                        <span className="font-medium text-sm">{alert.title}</span>
                      </div>
                      <div className={cn("flex items-center gap-1", statusIcons[alert.status].color)}>
                        {statusIcons[alert.status].icon}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] border-0",
                          alert.severity === "critical" && "bg-red-500/20 text-red-400",
                          alert.severity === "high" && "bg-orange-500/20 text-orange-400",
                          alert.severity === "med" && "bg-yellow-500/20 text-yellow-400",
                          alert.severity === "low" && "bg-emerald-500/20 text-emerald-400"
                        )}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
