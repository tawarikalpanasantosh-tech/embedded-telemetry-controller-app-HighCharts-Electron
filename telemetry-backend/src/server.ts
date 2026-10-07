import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import type { DashboardResponse, ParameterType, HistoryPoint } from './types.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
const server = http.createServer(app);

// Initialize WebSocket server with no auto-attach (noServer mode)
const wss = new WebSocketServer({ noServer: true });

const MAX_HISTORY = 100;
const BASE_VALUES: Record<ParameterType, number> = {
  velocity: 180.0,
  pressure: 1000.0,
  temperature: 35.0
};

const UNITS: Record<ParameterType, string> = {
  velocity: 'cm/s',
  pressure: 'mbar',
  temperature: '°C'
};

let cycleCount = 0;
const currentValues: Record<ParameterType, number> = { ...BASE_VALUES };
const historyData: Record<ParameterType, HistoryPoint[]> = {
  velocity: [],
  pressure: [],
  temperature: []
};

// Data Generation Logic
function generateDataPoint(): void {
  cycleCount++;
  const isCorrectionCycle = cycleCount % 5 === 0;

  const params: ParameterType[] = ['velocity', 'pressure', 'temperature'];

  params.forEach((param) => {
    let newVal: number;
    if (isCorrectionCycle) {
      // Pull value 50% back toward base value
      newVal = currentValues[param] + (BASE_VALUES[param] - currentValues[param]) * 0.5;
    } else {
      // Drift randomly by ~10%
      const variance = (Math.random() * 0.2 - 0.1) * currentValues[param];
      newVal = currentValues[param] + variance;
    }

    currentValues[param] = parseFloat(newVal.toFixed(2));

    const timeStr = new Date().toTimeString().split(' ')[0];
    historyData[param].push({ time: timeStr, value: currentValues[param] });

    // Maintain max 100 samples in memory
    if (historyData[param].length > MAX_HISTORY) {
      historyData[param].shift();
    }
  });
}

// llop
setInterval(generateDataPoint, 1000);
generateDataPoint();

// Helper to construct the standardized response object
function getDashboardData(): DashboardResponse {
  return {
    timestamp: new Date().toISOString(),
    velocity: {
      value: currentValues.velocity,
      unit: UNITS.velocity,
      history: [...historyData.velocity]
    },
    pressure: {
      value: currentValues.pressure,
      unit: UNITS.pressure,
      history: [...historyData.pressure]
    },
    temperature: {
      value: currentValues.temperature,
      unit: UNITS.temperature,
      history: [...historyData.temperature]
    }
  };
}

// 2. HTTP Upgrade Handler - Restrict WebSockets explicitly to /api/dashboard
server.on('upgrade', (request, socket, head) => {
  const host = request.headers.host || 'localhost:3000';
  const url = new URL(request.url || '', `http://${host}`);

  if (url.pathname === '/api/dashboard') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy(); // Reject connection on any other path
  }
});

// Broadcast live telemetry over WebSocket every 1 second
wss.on('connection', (ws: WebSocket) => {
  const sendTelemetry = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(getDashboardData()));
    }
  };

  sendTelemetry(); // Push immediate initial state
  const intervalId = setInterval(sendTelemetry, 1000);

  ws.on('close', () => clearInterval(intervalId));
});

// GET /api/dashboard 
app.get('/api/dashboard', (req: Request, res: Response) => {
  res.json(getDashboardData());
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🔗 REST API: http://localhost:${PORT}/api/dashboard`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/api/dashboard`);
});