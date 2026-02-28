"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SpaceObject, ObjectStatus, ObjectType, getStatusColor } from "@/lib/mockData"
import { Search, Satellite, CircleDot, Wrench, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ObjectListProps {
  objects: SpaceObject[]
  selectedObjectId: string | null
  onSelectObject: (id: string) => void
}

const typeIcons: Record<ObjectType, React.ReactNode> = {
  satellite: <Satellite className="w-4 h-4" />,
  debris: <CircleDot className="w-4 h-4" />,
  servicer: <Wrench className="w-4 h-4" />,
}

const statusLabels: Record<ObjectStatus, string> = {
  nominal: "Nominal",
  watch: "Watch",
  critical: "Critical",
}

const statusVariants: Record<ObjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  nominal: "default",
  watch: "secondary",
  critical: "destructive",
}

export function ObjectList({ objects, selectedObjectId, onSelectObject }: ObjectListProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<ObjectType[]>([])
  const [statusFilter, setStatusFilter] = useState<ObjectStatus[]>([])

  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => {
      const matchesSearch =
        search === "" ||
        obj.name.toLowerCase().includes(search.toLowerCase()) ||
        obj.noradId?.includes(search)

      const matchesType = typeFilter.length === 0 || typeFilter.includes(obj.type)
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(obj.status)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [objects, search, typeFilter, statusFilter])

  const toggleTypeFilter = (type: ObjectType) => {
    setTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleStatusFilter = (status: ObjectStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const hasFilters = typeFilter.length > 0 || statusFilter.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-sm font-medium text-foreground mb-3">Tracked Objects</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search objects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary/50 border-border/50"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-2 border-border/50",
                  hasFilters && "border-primary/50 text-primary"
                )}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Type</div>
              <DropdownMenuCheckboxItem
                checked={typeFilter.includes("satellite")}
                onCheckedChange={() => toggleTypeFilter("satellite")}
              >
                <Satellite className="w-3.5 h-3.5 mr-2" />
                Satellites
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter.includes("debris")}
                onCheckedChange={() => toggleTypeFilter("debris")}
              >
                <CircleDot className="w-3.5 h-3.5 mr-2" />
                Debris
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter.includes("servicer")}
                onCheckedChange={() => toggleTypeFilter("servicer")}
              >
                <Wrench className="w-3.5 h-3.5 mr-2" />
                Servicers
              </DropdownMenuCheckboxItem>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground mt-1">
                Status
              </div>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("nominal")}
                onCheckedChange={() => toggleStatusFilter("nominal")}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                Nominal
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("watch")}
                onCheckedChange={() => toggleStatusFilter("watch")}
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                Watch
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("critical")}
                onCheckedChange={() => toggleStatusFilter("critical")}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                Critical
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Object Count */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/30">
        {filteredObjects.length} of {objects.length} objects
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredObjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No objects match your filters
            </div>
          ) : (
            filteredObjects.map((obj) => (
              <button
                key={obj.id}
                onClick={() => onSelectObject(obj.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg mb-1 transition-all duration-200",
                  "hover:bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-primary/50",
                  selectedObjectId === obj.id
                    ? "bg-secondary/90 ring-1 ring-primary/30"
                    : "bg-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-md mt-0.5",
                      obj.status === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : obj.status === "watch"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-emerald-500/20 text-emerald-400"
                    )}
                  >
                    {typeIcons[obj.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">
                        {obj.name}
                      </span>
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getStatusColor(obj.status))} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {obj.altitudeKm.toLocaleString()} km
                      </span>
                      {obj.noradId && (
                        <span className="text-xs text-muted-foreground/70">
                          #{obj.noradId}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={statusVariants[obj.status]}
                      className={cn(
                        "mt-2 text-[10px] h-5",
                        obj.status === "nominal" && "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
                        obj.status === "watch" && "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
                        obj.status === "critical" && "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      )}
                    >
                      {statusLabels[obj.status]}
                    </Badge>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
