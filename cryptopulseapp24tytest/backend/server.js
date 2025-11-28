import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import apiRoutes from './src/routes/index.js';
import { broadcastPriceUpdates } from './src/services/websocket.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// CORS configuration - allow frontend in development and production
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

// Health check endpoint (required for docker-compose healthcheck)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes - mount at /api for consistency between dev and production
app.use('/api', apiRoutes);

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Crypto Pulse WebSocket',
    timestamp: new Date().toISOString()
  }));
});

// Broadcast price updates every 3 seconds
setInterval(() => {
  broadcastPriceUpdates(wss);
}, 3000);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
