import { updateAllPrices } from '../models/cryptocurrency.js';

// Broadcast price updates to all connected WebSocket clients
export function broadcastPriceUpdates(wss) {
  // Update all prices
  const updates = updateAllPrices();

  // Prepare the message
  const message = JSON.stringify({
    type: 'priceUpdate',
    data: updates,
    timestamp: new Date().toISOString()
  });

  // Broadcast to all connected clients
  let clientCount = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = WebSocket.OPEN
      client.send(message);
      clientCount++;
    }
  });

  if (clientCount > 0) {
    console.log(`Price update broadcast to ${clientCount} client(s)`);
  }
}

// Send initial data to a newly connected client
export function sendInitialData(ws, getAllCoins) {
  const coins = getAllCoins();

  const message = JSON.stringify({
    type: 'initialData',
    data: coins,
    timestamp: new Date().toISOString()
  });

  ws.send(message);
}
