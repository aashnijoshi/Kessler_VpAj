
# 🛰 Kessler OS

**AI Command Center for Low Earth Orbit**

Kessler OS is a simple operations dashboard for satellites in Low Earth Orbit (LEO). It helps operators detect potential collisions, understand risk, and simulate avoidance maneuvers in seconds.

As orbit becomes more crowded, satellite teams need faster ways to make decisions. Kessler OS turns complex orbital data into clear, actionable insights.

---

## The Problem

Low Earth Orbit is getting crowded.

Thousands of satellites and debris objects are moving around Earth at extremely high speeds. When two objects pass close to each other, operators must decide quickly whether to maneuver their satellite.

These decisions are difficult because:

* Collision warnings can be complex
* Maneuvers use fuel, which shortens mission lifetime
* Teams often rely on fragmented tools or manual analysis

The challenge is not just detecting risk — it’s deciding what to do about it.

---

## The Idea

Kessler OS acts like **traffic control for space**.

It gives operators a clear view of objects in orbit and helps them respond quickly when a collision risk appears.

The system can:

* Visualize satellites and debris in orbit
* Highlight high-risk close approaches
* Identify the objects involved in a potential collision
* Generate a recommended avoidance maneuver
* Show how that maneuver reduces risk

---

## Example Scenario

A satellite such as **Fengyun-1C** is flagged as high risk.

The dashboard shows:

* A close approach in ~23 minutes
* Miss distance of ~0.4 km
* Relative velocity of ~8 km/s

Kessler OS recommends a small altitude change to avoid the debris.
Simulating the maneuver reduces the collision probability from ~82% to ~3%.

---

## Features

**Collision Risk Dashboard**
View satellites and debris and see which objects require attention.

**Avoidance Planning**
Generate simple maneuver recommendations and simulate their impact.

**Environment Monitoring**
View basic space weather indicators like solar activity and solar wind.

**Alerts**
Send notifications when a high-risk event requires action.

**Mission Timeline**
Track the lifecycle of an event from detection to resolution.

---

## Who This Helps

Kessler OS is designed for:

* Small satellite operators
* University CubeSat teams
* Emerging space programs
* Space risk analysts

These groups often lack large mission control systems but still need clear operational insight.

---

## Tech Stack

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

All current data is simulated for demonstration purposes.

---

## Team

**Aashni Joshi**
Astrophysics & Data Science
NASA ISAM • Stanford Space Research

**Vyoma**
EECS & Business
Blue Origin

---

## Summary

Kessler OS helps satellite operators understand collision risk and respond quickly — keeping satellites safe as Earth’s orbit becomes more crowded.
