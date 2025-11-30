const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const FleetSimulator = require('./src/services/FleetSimulator');
const GalacticMapSimulator = require('./src/services/GalacticMapSimulator');
const MissionSimulator = require('./src/services/MissionSimulator');
const CrewSimulator = require('./src/services/CrewSimulator');
const EngineeringSimulator = require('./src/services/EngineeringSimulator');
const AlertSimulator = require('./src/services/AlertSimulator');
const CommandTerminal = require('./src/services/CommandTerminal');

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize simulators
const fleetSimulator = new FleetSimulator();
const galacticMapSimulator = new GalacticMapSimulator();
const missionSimulator = new MissionSimulator();
const crewSimulator = new CrewSimulator();
const engineeringSimulator = new EngineeringSimulator();
const alertSimulator = new AlertSimulator();
const commandTerminal = new CommandTerminal(
  fleetSimulator,
  galacticMapSimulator,
  engineeringSimulator,
  alertSimulator
);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Fleet endpoints
app.get('/api/fleet', (req, res) => {
  res.json({
    ships: fleetSimulator.getAllShips(),
    summary: fleetSimulator.getFleetSummary()
  });
});

app.get('/api/fleet/ship/:id', (req, res) => {
  const ship = fleetSimulator.getShip(req.params.id);
  if (ship) {
    res.json(ship);
  } else {
    res.status(404).json({ error: 'Ship not found' });
  }
});

// Galactic map endpoints
app.get('/api/map', (req, res) => {
  res.json(galacticMapSimulator.getMapData());
});

app.get('/api/map/object/:id', (req, res) => {
  const object = galacticMapSimulator.getCelestialObject(req.params.id);
  if (object) {
    res.json(object);
  } else {
    res.status(404).json({ error: 'Object not found' });
  }
});

app.get('/api/map/type/:type', (req, res) => {
  res.json(galacticMapSimulator.getObjectsByType(req.params.type));
});

app.post('/api/map/waypoint', (req, res) => {
  const waypoint = galacticMapSimulator.addWaypoint(req.body);
  res.json(waypoint);
});

app.delete('/api/map/waypoint/:id', (req, res) => {
  const waypoints = galacticMapSimulator.removeWaypoint(req.params.id);
  res.json(waypoints);
});

// Mission endpoints
app.get('/api/missions', (req, res) => {
  res.json(missionSimulator.getTimelineData());
});

app.get('/api/missions/event/:id', (req, res) => {
  const event = missionSimulator.getEvent(req.params.id);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Crew endpoints
app.get('/api/crew', (req, res) => {
  res.json({
    crew: crewSimulator.crew,
    departments: crewSimulator.departments,
    summary: crewSimulator.getSummary()
  });
});

app.get('/api/crew/:id', (req, res) => {
  const member = crewSimulator.getCrewMember(req.params.id);
  if (member) {
    res.json(member);
  } else {
    res.status(404).json({ error: 'Crew member not found' });
  }
});

app.get('/api/crew/department/:department', (req, res) => {
  res.json(crewSimulator.getCrewByDepartment(req.params.department));
});

app.get('/api/crew/ship/:ship', (req, res) => {
  res.json(crewSimulator.getCrewByShip(req.params.ship));
});

app.post('/api/crew/:id/reassign', (req, res) => {
  const { newShip, newPosition } = req.body;
  const success = crewSimulator.reassignCrew(req.params.id, newShip, newPosition);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Crew member not found' });
  }
});

// Engineering endpoints
app.get('/api/engineering', (req, res) => {
  res.json(engineeringSimulator.getEngineeringData());
});

app.post('/api/engineering/reroute', (req, res) => {
  const { from, to, amount } = req.body;
  const result = engineeringSimulator.reroutePower(from, to, amount);
  res.json(result);
});

app.post('/api/engineering/diagnostic/:system', (req, res) => {
  const diagnostic = engineeringSimulator.runDiagnostic(req.params.system);
  res.json(diagnostic);
});

app.post('/api/engineering/maintenance', (req, res) => {
  const { system, priority } = req.body;
  const task = engineeringSimulator.scheduleMaintenance(system, priority);
  res.json(task);
});

// Alert endpoints
app.get('/api/alerts', (req, res) => {
  res.json(alertSimulator.getAlertData());
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const success = alertSimulator.acknowledgeAlert(req.params.id);
  res.json({ success });
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const success = alertSimulator.resolveAlert(req.params.id);
  res.json({ success });
});

// Command terminal endpoint
app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command required' });
  }

  const result = await commandTerminal.execute(command);
  res.json(result);
});

app.get('/api/command/history', (req, res) => {
  res.json(commandTerminal.getHistory());
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);

  // Send initial data
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      fleet: fleetSimulator.getAllShips(),
      fleetSummary: fleetSimulator.getFleetSummary(),
      map: galacticMapSimulator.getMapData(),
      missions: missionSimulator.getTimelineData(),
      crew: crewSimulator.getSummary(),
      engineering: engineeringSimulator.getEngineeringData(),
      alerts: alertSimulator.getAlertData()
    }
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'command') {
        const result = await commandTerminal.execute(data.command);
        ws.send(JSON.stringify({
          type: 'commandResult',
          data: result
        }));
      }

      if (data.type === 'subscribe') {
        // Handle subscription to specific data streams
        ws.subscriptions = data.streams || ['all'];
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast function
function broadcast(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Simulation update loop
let tickCount = 0;

function simulationTick() {
  tickCount++;

  // Update all simulators
  const fleetData = fleetSimulator.update();
  const mapData = galacticMapSimulator.update();
  const missionData = missionSimulator.update();
  const crewData = crewSimulator.update();
  const engineeringData = engineeringSimulator.update();
  const alertData = alertSimulator.update();

  // Broadcast updates to all connected clients
  broadcast('update', {
    tick: tickCount,
    fleet: {
      ships: fleetData,
      summary: fleetSimulator.getFleetSummary()
    },
    map: mapData,
    missions: missionData,
    crew: crewData,
    engineering: engineeringData,
    alerts: alertData
  });

  // Check for new alerts to broadcast separately
  const newAlerts = alertData.alerts.filter(a => a.isNew);
  if (newAlerts.length > 0) {
    broadcast('newAlert', { alerts: newAlerts });
    // Clear the isNew flag
    newAlerts.forEach(a => { a.isNew = false; });
  }

  // Check for new events
  const newEvents = missionData.timeline.filter(e => e.isNew);
  if (newEvents.length > 0) {
    broadcast('newEvent', { events: newEvents });
    newEvents.forEach(e => { e.isNew = false; });
  }
}

// Run simulation every second
setInterval(simulationTick, 1000);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Cosmos Omni-Command Backend running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
