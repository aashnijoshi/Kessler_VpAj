"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { SpaceObject } from "@/lib/mockData"
import { calculatePosition, getObjectColor, getGlowColor, getObjectSize } from "@/lib/sim"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface OrbitCanvasProps {
  objects: SpaceObject[]
  selectedObjectId: string | null
  onObjectClick: (id: string) => void
  isSimulating: boolean
  maneuverApplied?: { objectId: string; altitudeShift: number } | null
}

const MIN_ZOOM = 0.6
const MAX_ZOOM = 2.5
const DEFAULT_ZOOM = 1
const EARTH_RADIUS = 40

export function OrbitCanvas({
  objects,
  selectedObjectId,
  onObjectClick,
  isSimulating,
  maneuverApplied,
}: OrbitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  const earthImageRef = useRef<HTMLImageElement | null>(null)
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  
  // Zoom and pan state (using refs to avoid re-renders in animation loop)
  const zoomRef = useRef(DEFAULT_ZOOM)
  const panRef = useRef({ x: 0, y: 0 })
  const [zoomDisplay, setZoomDisplay] = useState(100)
  const isPanningRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })

  // Load earth image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/earth.jpg"
    img.onload = () => {
      earthImageRef.current = img
    }
  }, [])

  const getAdjustedOrbitRadius = useCallback(
    (obj: SpaceObject) => {
      if (maneuverApplied && obj.id === maneuverApplied.objectId) {
        return obj.orbitRadius + maneuverApplied.altitudeShift * 0.05
      }
      return obj.orbitRadius
    },
    [maneuverApplied]
  )

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      const zoom = zoomRef.current
      const pan = panRef.current
      const centerX = width / 2 + pan.x
      const centerY = height / 2 + pan.y
      const baseMaxRadius = Math.min(width, height) * 0.38
      const maxRadius = baseMaxRadius * zoom

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw subtle background grid
      ctx.save()
      ctx.strokeStyle = "rgba(100, 130, 180, 0.04)"
      ctx.lineWidth = 1
      const gridSize = 50 * zoom
      const offsetX = (centerX % gridSize)
      const offsetY = (centerY % gridSize)
      
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.restore()

      // Draw orbit rings (distance markers)
      ctx.strokeStyle = "rgba(100, 130, 180, 0.06)"
      ctx.lineWidth = 1
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, (maxRadius * i) / 5, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw Earth with real image
      const earthRadius = EARTH_RADIUS * zoom
      
      if (earthImageRef.current) {
        // Save context for clipping
        ctx.save()
        
        // Create circular clip path for Earth
        ctx.beginPath()
        ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2)
        ctx.clip()
        
        // Draw the earth image
        ctx.drawImage(
          earthImageRef.current,
          centerX - earthRadius,
          centerY - earthRadius,
          earthRadius * 2,
          earthRadius * 2
        )
        
        ctx.restore()
        
        // Add shading overlay (day/night effect)
        const shadeGradient = ctx.createLinearGradient(
          centerX - earthRadius,
          centerY - earthRadius,
          centerX + earthRadius,
          centerY + earthRadius
        )
        shadeGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)")
        shadeGradient.addColorStop(0.5, "rgba(0, 0, 0, 0)")
        shadeGradient.addColorStop(1, "rgba(0, 0, 0, 0.3)")
        ctx.beginPath()
        ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2)
        ctx.fillStyle = shadeGradient
        ctx.fill()
      } else {
        // Fallback gradient earth if image not loaded
        const earthGradient = ctx.createRadialGradient(
          centerX - earthRadius * 0.2,
          centerY - earthRadius * 0.2,
          0,
          centerX,
          centerY,
          earthRadius
        )
        earthGradient.addColorStop(0, "#4fa3e3")
        earthGradient.addColorStop(0.5, "#2d7dc4")
        earthGradient.addColorStop(1, "#1a4d7c")
        ctx.beginPath()
        ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2)
        ctx.fillStyle = earthGradient
        ctx.fill()
      }

      // Atmospheric glow (subtle)
      const glowRadius = earthRadius * 1.3
      const earthGlow = ctx.createRadialGradient(
        centerX, centerY, earthRadius * 0.9,
        centerX, centerY, glowRadius
      )
      earthGlow.addColorStop(0, "rgba(100, 180, 255, 0.15)")
      earthGlow.addColorStop(0.5, "rgba(80, 160, 240, 0.08)")
      earthGlow.addColorStop(1, "rgba(60, 140, 220, 0)")
      ctx.beginPath()
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = earthGlow
      ctx.fill()

      // Draw orbit rings for each object
      objects.forEach((obj) => {
        const orbitRadius = getAdjustedOrbitRadius(obj)
        const radius = orbitRadius * maxRadius
        const isSelected = obj.id === selectedObjectId
        const isHovered = obj.id === hoveredObjectId

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        const ringColor = isSelected
          ? obj.status === "critical"
            ? "rgba(239, 68, 68, 0.5)"
            : obj.status === "watch"
              ? "rgba(234, 179, 8, 0.45)"
              : "rgba(100, 180, 255, 0.4)"
          : isHovered
            ? "rgba(100, 180, 255, 0.25)"
            : "rgba(100, 130, 180, 0.12)"
        ctx.strokeStyle = ringColor
        ctx.lineWidth = isSelected ? 2 : 1
        ctx.stroke()
      })

      // Draw objects
      objects.forEach((obj) => {
        const orbitRadius = getAdjustedOrbitRadius(obj)
        const adjustedObj = { ...obj, orbitRadius }
        const pos = calculatePosition(adjustedObj, time, centerX, centerY, maxRadius)
        const isSelected = obj.id === selectedObjectId
        const isHovered = obj.id === hoveredObjectId
        const baseSize = getObjectSize(obj.type)
        const size = baseSize * Math.max(0.8, zoom * 0.9)
        const color = getObjectColor(obj.status)
        const glowColor = getGlowColor(obj.status)

        // Glow effect
        if (isSelected || obj.status === "critical") {
          const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 4)
          glow.addColorStop(0, glowColor)
          glow.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, size * 4, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Object
        ctx.beginPath()
        if (obj.type === "satellite") {
          // Diamond shape for satellites
          ctx.moveTo(pos.x, pos.y - size)
          ctx.lineTo(pos.x + size, pos.y)
          ctx.lineTo(pos.x, pos.y + size)
          ctx.lineTo(pos.x - size, pos.y)
          ctx.closePath()
        } else if (obj.type === "servicer") {
          // Square for servicers
          ctx.rect(pos.x - size / 2, pos.y - size / 2, size, size)
        } else {
          // Circle for debris
          ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2)
        }
        ctx.fillStyle = color
        ctx.fill()

        // Selection ring
        if (isSelected || isHovered) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, size + 6, 0, Math.PI * 2)
          ctx.strokeStyle = isSelected ? "#60a5fa" : "rgba(96, 165, 250, 0.5)"
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Label for selected object
        if (isSelected) {
          ctx.font = `${11 * Math.max(1, zoom * 0.8)}px system-ui, sans-serif`
          ctx.fillStyle = "#e2e8f0"
          ctx.textAlign = "center"
          ctx.fillText(obj.name, pos.x, pos.y - size - 12)
        }
      })

      // Draw scale indicator
      ctx.save()
      const scaleBarWidth = 60 * zoom
      const scaleX = 20
      const scaleY = height - 30
      ctx.strokeStyle = "rgba(150, 170, 200, 0.5)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(scaleX, scaleY)
      ctx.lineTo(scaleX + scaleBarWidth, scaleY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(scaleX, scaleY - 4)
      ctx.lineTo(scaleX, scaleY + 4)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(scaleX + scaleBarWidth, scaleY - 4)
      ctx.lineTo(scaleX + scaleBarWidth, scaleY + 4)
      ctx.stroke()
      ctx.font = "10px system-ui, sans-serif"
      ctx.fillStyle = "rgba(150, 170, 200, 0.7)"
      ctx.textAlign = "center"
      ctx.fillText("~500 km", scaleX + scaleBarWidth / 2, scaleY - 8)
      ctx.restore()
    },
    [objects, selectedObjectId, hoveredObjectId, getAdjustedOrbitRadius]
  )

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    if (isSimulating) {
      timeRef.current += 0.016 * 60
    }

    drawFrame(ctx, dimensions.width, dimensions.height, timeRef.current)
    animationRef.current = requestAnimationFrame(animate)
  }, [drawFrame, isSimulating, dimensions])

  // Handle resize
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          const dpr = window.devicePixelRatio || 1
          canvas.width = width * dpr
          canvas.height = height * dpr
          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.scale(dpr, dpr)
          }
          setDimensions({ width, height })
        }
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  // Animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  // Zoom handlers
  const handleZoom = useCallback((delta: number, clientX?: number, clientY?: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const centerX = clientX !== undefined ? clientX - rect.left : rect.width / 2
    const centerY = clientY !== undefined ? clientY - rect.top : rect.height / 2
    
    const oldZoom = zoomRef.current
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom + delta))
    
    if (newZoom !== oldZoom) {
      // Adjust pan to zoom toward cursor
      const zoomRatio = newZoom / oldZoom
      const dx = centerX - rect.width / 2 - panRef.current.x
      const dy = centerY - rect.height / 2 - panRef.current.y
      
      panRef.current.x -= dx * (zoomRatio - 1)
      panRef.current.y -= dy * (zoomRatio - 1)
      
      zoomRef.current = newZoom
      setZoomDisplay(Math.round(newZoom * 100))
    }
  }, [])

  const handleResetView = useCallback(() => {
    zoomRef.current = DEFAULT_ZOOM
    panRef.current = { x: 0, y: 0 }
    setZoomDisplay(100)
  }, [])

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = -e.deltaY * 0.001
      handleZoom(delta, e.clientX, e.clientY)
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", handleWheel)
  }, [handleZoom])

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle click or shift+left click to pan
      isPanningRef.current = true
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
  }, [])

  const handleMouseMoveInternal = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastMouseRef.current.x
        const dy = e.clientY - lastMouseRef.current.y
        panRef.current.x += dx
        panRef.current.y += dy
        lastMouseRef.current = { x: e.clientX, y: e.clientY }
        return
      }

      // Hover detection
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const zoom = zoomRef.current
      const pan = panRef.current
      const centerX = rect.width / 2 + pan.x
      const centerY = rect.height / 2 + pan.y
      const maxRadius = Math.min(rect.width, rect.height) * 0.38 * zoom

      let foundHover = false
      for (const obj of objects) {
        const orbitRadius = getAdjustedOrbitRadius(obj)
        const adjustedObj = { ...obj, orbitRadius }
        const pos = calculatePosition(adjustedObj, timeRef.current, centerX, centerY, maxRadius)
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
        const size = getObjectSize(obj.type)

        if (distance < size + 15) {
          setHoveredObjectId(obj.id)
          canvas.style.cursor = "pointer"
          foundHover = true
          break
        }
      }

      if (!foundHover) {
        setHoveredObjectId(null)
        canvas.style.cursor = "default"
      }
    },
    [objects, getAdjustedOrbitRadius]
  )

  // Handle click detection
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanningRef.current) return
      
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const zoom = zoomRef.current
      const pan = panRef.current
      const centerX = rect.width / 2 + pan.x
      const centerY = rect.height / 2 + pan.y
      const maxRadius = Math.min(rect.width, rect.height) * 0.38 * zoom

      // Check if click is near any object
      for (const obj of objects) {
        const orbitRadius = getAdjustedOrbitRadius(obj)
        const adjustedObj = { ...obj, orbitRadius }
        const pos = calculatePosition(adjustedObj, timeRef.current, centerX, centerY, maxRadius)
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
        const size = getObjectSize(obj.type)

        if (distance < size + 15) {
          onObjectClick(obj.id)
          return
        }
      }
    },
    [objects, onObjectClick, getAdjustedOrbitRadius]
  )

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMoveInternal}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full block"
      />
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="glass-subtle rounded-lg p-1 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleZoom(0.2)}
            disabled={zoomRef.current >= MAX_ZOOM}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleZoom(-0.2)}
            disabled={zoomRef.current <= MIN_ZOOM}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleResetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="glass-subtle rounded-lg px-2 py-1 text-center">
          <span className="text-xs text-muted-foreground font-mono">{zoomDisplay}%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-subtle rounded-lg px-3 py-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rotate-45 bg-emerald-500" />
            <span>Satellite</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Debris</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-emerald-500" />
            <span>Servicer</span>
          </div>
        </div>
      </div>
      
      {/* Status legend */}
      <div className="absolute bottom-4 right-4 glass-subtle rounded-lg px-3 py-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Nominal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Watch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Critical</span>
          </div>
        </div>
      </div>
      
      {/* Pan hint */}
      <div className="absolute bottom-14 left-4 text-[10px] text-muted-foreground/50">
        Shift+drag or middle-click to pan
      </div>
    </div>
  )
}
