const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

export const fleetApi = {
  getFleet: () => fetchApi('/fleet'),
  getShip: (id) => fetchApi(`/fleet/ship/${id}`)
};

export const mapApi = {
  getMap: () => fetchApi('/map'),
  getObject: (id) => fetchApi(`/map/object/${id}`),
  getByType: (type) => fetchApi(`/map/type/${type}`),
  addWaypoint: (waypoint) => fetchApi('/map/waypoint', {
    method: 'POST',
    body: JSON.stringify(waypoint)
  }),
  removeWaypoint: (id) => fetchApi(`/map/waypoint/${id}`, {
    method: 'DELETE'
  })
};

export const missionApi = {
  getMissions: () => fetchApi('/missions'),
  getEvent: (id) => fetchApi(`/missions/event/${id}`)
};

export const crewApi = {
  getCrew: () => fetchApi('/crew'),
  getCrewMember: (id) => fetchApi(`/crew/${id}`),
  getByDepartment: (department) => fetchApi(`/crew/department/${department}`),
  getByShip: (ship) => fetchApi(`/crew/ship/${encodeURIComponent(ship)}`),
  reassign: (id, newShip, newPosition) => fetchApi(`/crew/${id}/reassign`, {
    method: 'POST',
    body: JSON.stringify({ newShip, newPosition })
  })
};

export const engineeringApi = {
  getEngineering: () => fetchApi('/engineering'),
  reroutePower: (from, to, amount) => fetchApi('/engineering/reroute', {
    method: 'POST',
    body: JSON.stringify({ from, to, amount })
  }),
  runDiagnostic: (system) => fetchApi(`/engineering/diagnostic/${system}`, {
    method: 'POST'
  }),
  scheduleMaintenance: (system, priority) => fetchApi('/engineering/maintenance', {
    method: 'POST',
    body: JSON.stringify({ system, priority })
  })
};

export const alertApi = {
  getAlerts: () => fetchApi('/alerts'),
  acknowledge: (id) => fetchApi(`/alerts/${id}/acknowledge`, {
    method: 'POST'
  }),
  resolve: (id) => fetchApi(`/alerts/${id}/resolve`, {
    method: 'POST'
  })
};

export const commandApi = {
  execute: (command) => fetchApi('/command', {
    method: 'POST',
    body: JSON.stringify({ command })
  }),
  getHistory: () => fetchApi('/command/history')
};

export default {
  fleet: fleetApi,
  map: mapApi,
  mission: missionApi,
  crew: crewApi,
  engineering: engineeringApi,
  alert: alertApi,
  command: commandApi
};
