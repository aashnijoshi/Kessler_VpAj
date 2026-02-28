import { SpaceObject, ObjectStatus } from "./mockData"

export interface SimulationState {
  time: number // Elapsed time in seconds
  isRunning: boolean
  speed: number // Simulation speed multiplier
}

export interface ObjectPosition {
  x: number
  y: number
  angle: number
}

// Calculate position of an object at a given time
export function calculatePosition(
  obj: SpaceObject,
  time: number,
  centerX: number,
  centerY: number,
  maxRadius: number
): ObjectPosition {
  const angle = (obj.initialAngle + time * obj.orbitSpeed) % 360
  const radians = (angle * Math.PI) / 180
  const radius = obj.orbitRadius * maxRadius
  
  return {
    x: centerX + Math.cos(radians) * radius,
    y: centerY + Math.sin(radians) * radius,
    angle,
  }
}

// Check for potential close approaches (simplified)
export function checkCloseApproach(
  obj1: SpaceObject,
  obj2: SpaceObject,
  time: number,
  maxRadius: number
): { isClose: boolean; distance: number } {
  const pos1 = calculatePosition(obj1, time, 0, 0, maxRadius)
  const pos2 = calculatePosition(obj2, time, 0, 0, maxRadius)
  
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Consider objects "close" if within 5% of max radius
  const threshold = maxRadius * 0.05
  
  return {
    isClose: distance < threshold,
    distance,
  }
}

// Get status-based glow color
export function getGlowColor(status: ObjectStatus): string {
  switch (status) {
    case "critical":
      return "rgba(239, 68, 68, 0.8)" // red-500
    case "watch":
      return "rgba(234, 179, 8, 0.6)" // yellow-500
    case "nominal":
      return "rgba(16, 185, 129, 0.5)" // emerald-500
  }
}

// Get object fill color
export function getObjectColor(status: ObjectStatus): string {
  switch (status) {
    case "critical":
      return "#ef4444" // red-500
    case "watch":
      return "#eab308" // yellow-500
    case "nominal":
      return "#10b981" // emerald-500
  }
}

// Get object icon path based on type
export function getObjectSize(type: string): number {
  switch (type) {
    case "satellite":
      return 8
    case "servicer":
      return 10
    case "debris":
      return 5
    default:
      return 6
  }
}

// Animation frame timing
export function createAnimationLoop(
  callback: (time: number) => void,
  fps: number = 60
): { start: () => void; stop: () => void } {
  let animationId: number | null = null
  let startTime: number | null = null
  let lastFrameTime = 0
  const frameInterval = 1000 / fps
  
  const animate = (currentTime: number) => {
    if (startTime === null) {
      startTime = currentTime
    }
    
    const elapsed = currentTime - lastFrameTime
    
    if (elapsed >= frameInterval) {
      const time = (currentTime - startTime) / 1000
      callback(time)
      lastFrameTime = currentTime
    }
    
    animationId = requestAnimationFrame(animate)
  }
  
  return {
    start: () => {
      if (animationId === null) {
        animationId = requestAnimationFrame(animate)
      }
    },
    stop: () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
        animationId = null
        startTime = null
      }
    },
  }
}

// Easing function for smooth transitions
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// Linear interpolation
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}
