## 🚀 Quick Start

### 1. Run 
```bash
cd telemetry-backend
npm install
npm run dev
cd telemetry-frontend
npm install
npm run electron
```

# 📡 Embedded Controller Live Telemetry Dashboard

A real-time telemetry monitoring application built with **Angular (Standalone Component)**, **Highcharts**, **Express.js / WebSockets**, and packaged as a **Desktop Application using Electron**.

---

## 🛠️ Project Structure

```text
telemetry/
├── telemetry-backend/          # Express.js Node.js Server & WebSocket Server
│   ├── src/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
└── telemetry-frontend/         # Angular Frontend & Electron Wrapper
    ├── main.js                 # Electron Main Entry Point
    ├── src/
    │   └── app/
    │       ├── services/
    │       │   ├── telemetry.service.ts
    │       │   └── unit-conversion.service.ts
    │       ├── app.component.ts
    │       ├── app.component.html
    │       └── app.component.scss
    ├── angular.json
    └── package.json
 ```   

    ---

## 🚀 Features

* **Real-time Data Streaming:** Live 1-second dynamic telemetry updates via WebSockets (with HTTP Polling fallback).
* **Interactive Visualizations:**
  * Circular Gauges using Highcharts SolidGauge module.
  * Real-Time Trend Line Charts (History up to 100 samples) with Pan & Zoom controls.
* **On-the-fly Unit Conversions:** Client-side dynamic switching for:
  * **Velocity:** `cm/s`, `mm/s`, `m/s`, `km/h`, `ft/s`
  * **Pressure:** `mbar`, `Pa`, `kPa`, `bar`, `psi`, `atm`
  * **Temperature:** `°C`, `°F`, `K`
* **Theme Switching:** Dark / Light theme support.
* **Desktop Application:** Packaged using Electron for cross-platform desktop execution.

---
