import { create } from 'zustand';

const FUEL_TYPES = {
  uranium235: { name: 'Uranium-235', reactivity: 1.0, meltdownTemp: 2800, color: '#00ff00', halfLife: 703800000 },
  plutonium239: { name: 'Plutonium-239', reactivity: 1.4, meltdownTemp: 2400, color: '#ff00ff', halfLife: 24110 },
  thorium232: { name: 'Thorium-232', reactivity: 0.7, meltdownTemp: 3300, color: '#00ffff', halfLife: 14000000000 },
  unstablium: { name: 'Unstablium-666', reactivity: 3.0, meltdownTemp: 1500, color: '#ff0000', halfLife: 666 },
  mox: { name: 'MOX Fuel', reactivity: 1.8, meltdownTemp: 2200, color: '#ffaa00', halfLife: 24110 },
  californium: { name: 'Californium-252', reactivity: 5.0, meltdownTemp: 800, color: '#ff00aa', halfLife: 2.645 },
};

const ACHIEVEMENTS = [
  { id: 'first_start', name: 'First Ignition', desc: 'Start the reactor for the first time', icon: '🔥' },
  { id: 'max_power', name: 'UNLIMITED POWER', desc: 'Reach 100% power output', icon: '⚡' },
  { id: 'overheat', name: 'Feeling the Heat', desc: 'Exceed safe temperature limits', icon: '🌡️' },
  { id: 'warning_ignored', name: 'I Know What I\'m Doing', desc: 'Ignore 10 warnings', icon: '🙈' },
  { id: 'coolant_disabled', name: 'Who Needs Cooling?', desc: 'Disable the coolant system', icon: '❄️' },
  { id: 'rods_removed', name: 'Yolo Mode', desc: 'Remove all control rods', icon: '🎰' },
  { id: 'meltdown', name: 'Oops', desc: 'Cause a core meltdown', icon: '☢️' },
  { id: 'explosion', name: 'Chernobyl Speedrun', desc: 'Cause a reactor explosion', icon: '💥' },
  { id: 'containment_breach', name: 'Sharing is Caring', desc: 'Breach containment', icon: '🏚️' },
  { id: 'triple_threat', name: 'Triple Threat', desc: 'Meltdown, explosion, and breach in one run', icon: '👑' },
  { id: 'speedrun', name: 'Speedrunner', desc: 'Achieve meltdown in under 30 seconds', icon: '⏱️' },
  { id: 'survivor', name: 'Against All Odds', desc: 'Recover from critical state', icon: '🦸' },
  { id: 'unstablium', name: 'Mad Scientist', desc: 'Use Unstablium-666 fuel', icon: '🧪' },
  { id: 'xenon_pit', name: 'Xenon Poisoning', desc: 'Experience xenon poisoning', icon: '☠️' },
  { id: 'city_destroyer', name: 'City Destroyer', desc: 'Contaminate the entire neighborhood', icon: '🏙️' },
  { id: 'groundwater_poison', name: 'Water Supply Ruined', desc: 'Contaminate the groundwater', icon: '💧' },
  { id: 'mass_evacuation', name: 'Ghost Town', desc: 'Force evacuation of 10,000+ people', icon: '🚗' },
  { id: 'china_syndrome', name: 'China Syndrome', desc: 'Melt through containment floor', icon: '🌏' },
  { id: 'hydrogen_explosion', name: 'Fukushima 2.0', desc: 'Cause a hydrogen explosion', icon: '💨' },
  { id: 'criticality_accident', name: 'Blue Flash', desc: 'Witness a criticality accident', icon: '🔵' },
  { id: 'weather_disaster', name: 'Perfect Storm', desc: 'Have a disaster during a storm', icon: '🌪️' },
  { id: 'night_terror', name: 'Night Terror', desc: 'Cause a disaster at night', icon: '🌙' },
  { id: 'californium_chaos', name: 'Instant Regret', desc: 'Try Californium-252', icon: '⚗️' },
  { id: 'population_devastation', name: 'Apocalypse', desc: 'Expose 50,000+ people to lethal radiation', icon: '💀' },
];

// Weather types
const WEATHER_TYPES = {
  clear: { name: 'Clear', windMultiplier: 1.0, spreadRate: 1.0, icon: '☀️' },
  cloudy: { name: 'Cloudy', windMultiplier: 0.8, spreadRate: 0.9, icon: '☁️' },
  rain: { name: 'Rain', windMultiplier: 0.6, spreadRate: 1.2, icon: '🌧️' },
  storm: { name: 'Storm', windMultiplier: 2.0, spreadRate: 2.5, icon: '⛈️' },
  fog: { name: 'Fog', windMultiplier: 0.3, spreadRate: 0.5, icon: '🌫️' },
};

// Building types for the neighborhood
const BUILDING_TYPES = {
  house: { name: 'House', population: 4, icon: '🏠' },
  apartment: { name: 'Apartment', population: 50, icon: '🏢' },
  school: { name: 'School', population: 500, icon: '🏫' },
  hospital: { name: 'Hospital', population: 200, icon: '🏥' },
  factory: { name: 'Factory', population: 100, icon: '🏭' },
  farm: { name: 'Farm', population: 5, icon: '🌾' },
  park: { name: 'Park', population: 20, icon: '🌳' },
  lake: { name: 'Lake', population: 0, icon: '🌊' },
};

// Generate neighborhood grid
const generateNeighborhood = () => {
  const grid = [];
  const gridSize = 20; // 20x20 grid

  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      // Center is the reactor (9,9 to 10,10)
      const distFromCenter = Math.sqrt(Math.pow(x - 9.5, 2) + Math.pow(y - 9.5, 2));

      if (distFromCenter < 1.5) {
        row.push({ type: 'reactor', radiation: 0, contaminated: false, evacuated: false });
      } else if (distFromCenter < 3) {
        // Exclusion zone - empty
        row.push({ type: 'exclusion', radiation: 0, contaminated: false, evacuated: false });
      } else {
        // Random building distribution
        const rand = Math.random();
        let type;
        if (rand < 0.4) type = 'house';
        else if (rand < 0.55) type = 'apartment';
        else if (rand < 0.6) type = 'school';
        else if (rand < 0.65) type = 'hospital';
        else if (rand < 0.7) type = 'factory';
        else if (rand < 0.8) type = 'farm';
        else if (rand < 0.9) type = 'park';
        else type = 'lake';

        const building = BUILDING_TYPES[type];
        row.push({
          type,
          population: building ? building.population : 0,
          radiation: 0,
          contaminated: false,
          evacuated: false,
          groundwaterContamination: 0,
          soilContamination: 0,
        });
      }
    }
    grid.push(row);
  }
  return grid;
};

// Generate groundwater grid (underground layer)
const generateGroundwater = () => {
  const grid = [];
  const gridSize = 20;

  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      row.push({
        contamination: 0,
        flowDirection: { x: (Math.random() - 0.5) * 0.1, y: Math.random() * 0.1 + 0.05 }, // Generally flows south
        depth: 10 + Math.random() * 20, // 10-30 meters deep
      });
    }
    grid.push(row);
  }
  return grid;
};

const useReactorStore = create((set, get) => ({
  // Reactor state
  isRunning: false,
  power: 0,
  targetPower: 0,
  temperature: 20,
  pressure: 1,
  radiation: 0,

  // Control systems
  controlRodPosition: 100,
  coolantFlow: 100,
  coolantEnabled: true,
  containmentIntegrity: 100,
  floorIntegrity: 100, // For china syndrome

  // Fuel
  fuelType: 'uranium235',
  fuelRemaining: 100,
  xenonLevel: 0,

  // Status flags
  isMeltdown: false,
  isExplosion: false,
  isContainmentBreach: false,
  isChinaSyndrome: false,
  isHydrogenExplosion: false,
  isCriticalityAccident: false,
  scramEnabled: true,
  autoScramDisabled: false,

  // Stats
  warningsIgnored: 0,
  startTime: null,
  runtime: 0,
  maxTempReached: 20,
  maxPowerReached: 0,
  totalPopulationExposed: 0,
  totalEvacuated: 0,
  lethalExposures: 0,

  // Achievements
  achievements: [],

  // Warnings/Events
  events: [],

  // Environment
  weather: 'clear',
  windDirection: 0, // 0-360 degrees
  windSpeed: 5, // m/s
  timeOfDay: 12, // 0-24 hours
  isNight: false,

  // Neighborhood
  neighborhood: generateNeighborhood(),
  groundwater: generateGroundwater(),
  radiationPlume: [], // Array of radiation particles for visualization
  airContamination: 0,
  groundContamination: 0,
  waterContamination: 0,

  // View state
  currentView: 'control', // 'control', 'map', 'underground', 'atmosphere'
  mapView: 'surface', // 'surface', 'underground', 'cross-section'

  // Actions
  setView: (view) => set({ currentView: view }),
  setMapView: (view) => set({ mapView: view }),

  startReactor: () => {
    const state = get();
    if (state.isMeltdown || state.isExplosion) return;

    set({
      isRunning: true,
      startTime: Date.now(),
      events: [...state.events, { time: Date.now(), type: 'info', message: 'Reactor started' }]
    });
    get().unlockAchievement('first_start');
  },

  stopReactor: () => {
    set(state => ({
      isRunning: false,
      events: [...state.events, { time: Date.now(), type: 'info', message: 'Reactor stopped' }]
    }));
  },

  setTargetPower: (power) => set({ targetPower: Math.max(0, Math.min(150, power)) }),

  setControlRods: (position) => {
    set({ controlRodPosition: Math.max(0, Math.min(100, position)) });
    if (position === 0) {
      get().unlockAchievement('rods_removed');
    }
  },

  setCoolantFlow: (flow) => set({ coolantFlow: Math.max(0, Math.min(100, flow)) }),

  toggleCoolant: () => {
    const state = get();
    const newEnabled = !state.coolantEnabled;
    set({
      coolantEnabled: newEnabled,
      events: [...state.events, {
        time: Date.now(),
        type: newEnabled ? 'info' : 'danger',
        message: newEnabled ? 'Coolant system enabled' : 'COOLANT SYSTEM DISABLED!'
      }]
    });
    if (!newEnabled) {
      get().unlockAchievement('coolant_disabled');
    }
  },

  setFuelType: (type) => {
    set({ fuelType: type });
    if (type === 'unstablium') {
      get().unlockAchievement('unstablium');
    }
    if (type === 'californium') {
      get().unlockAchievement('californium_chaos');
    }
  },

  toggleAutoScram: () => {
    const state = get();
    set({
      autoScramDisabled: !state.autoScramDisabled,
      events: [...state.events, {
        time: Date.now(),
        type: state.autoScramDisabled ? 'warning' : 'danger',
        message: state.autoScramDisabled ? 'Auto-SCRAM enabled' : 'AUTO-SCRAM DISABLED - You\'re on your own!'
      }]
    });
  },

  emergencyScram: () => {
    const state = get();
    if (!state.scramEnabled) return;

    set({
      controlRodPosition: 100,
      targetPower: 0,
      events: [...state.events, { time: Date.now(), type: 'warning', message: 'EMERGENCY SCRAM ACTIVATED' }]
    });
  },

  disableScram: () => {
    set(state => ({
      scramEnabled: false,
      events: [...state.events, { time: Date.now(), type: 'danger', message: 'SCRAM SYSTEM DISABLED - NO EMERGENCY SHUTDOWN AVAILABLE' }]
    }));
  },

  ignoreWarning: () => {
    const state = get();
    const newCount = state.warningsIgnored + 1;
    set({ warningsIgnored: newCount });
    if (newCount >= 10) {
      get().unlockAchievement('warning_ignored');
    }
  },

  // Weather controls
  setWeather: (weather) => {
    set({ weather });
    const weatherData = WEATHER_TYPES[weather];
    if (weatherData) {
      set(state => ({
        windSpeed: state.windSpeed * weatherData.windMultiplier,
        events: [...state.events, { time: Date.now(), type: 'info', message: `Weather changed to ${weatherData.name} ${weatherData.icon}` }]
      }));
    }
  },

  setWindDirection: (dir) => set({ windDirection: dir % 360 }),
  setWindSpeed: (speed) => set({ windSpeed: Math.max(0, Math.min(50, speed)) }),

  setTimeOfDay: (hour) => {
    const isNight = hour < 6 || hour > 20;
    set({ timeOfDay: hour, isNight });
  },

  // Chaos mode
  maxChaos: () => {
    const state = get();
    set({
      coolantEnabled: false,
      controlRodPosition: 0,
      autoScramDisabled: true,
      scramEnabled: false,
      events: [...state.events, {
        time: Date.now(),
        type: 'danger',
        message: '!!! MAXIMUM CHAOS MODE ACTIVATED !!!'
      }]
    });
  },

  // Trigger specific disasters
  triggerHydrogenExplosion: () => {
    const state = get();
    if (state.isHydrogenExplosion) return;
    set({
      isHydrogenExplosion: true,
      containmentIntegrity: Math.max(0, state.containmentIntegrity - 50),
      events: [...state.events, { time: Date.now(), type: 'danger', message: '!!! HYDROGEN EXPLOSION !!!' }]
    });
    get().unlockAchievement('hydrogen_explosion');
  },

  triggerCriticalityAccident: () => {
    const state = get();
    if (state.isCriticalityAccident) return;
    set({
      isCriticalityAccident: true,
      radiation: state.radiation + 5000,
      events: [...state.events, { time: Date.now(), type: 'danger', message: '!!! CRITICALITY ACCIDENT - BLUE FLASH OBSERVED !!!' }]
    });
    get().unlockAchievement('criticality_accident');
  },

  unlockAchievement: (id) => {
    const state = get();
    if (state.achievements.includes(id)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    set({
      achievements: [...state.achievements, id],
      events: [...state.events, {
        time: Date.now(),
        type: 'achievement',
        message: `Achievement Unlocked: ${achievement.icon} ${achievement.name}`
      }]
    });
  },

  addEvent: (type, message) => {
    set(state => ({
      events: [...state.events.slice(-99), { time: Date.now(), type, message }]
    }));
  },

  // Physics tick - called every frame
  tick: (deltaTime) => {
    const state = get();
    if (!state.isRunning && !state.isMeltdown && !state.isChinaSyndrome) return;

    const dt = deltaTime / 1000;
    const fuel = FUEL_TYPES[state.fuelType];
    const weatherData = WEATHER_TYPES[state.weather];

    // Calculate reactivity
    const rodReactivity = 1 - (state.controlRodPosition / 100);
    const xenonPoisoning = state.xenonLevel / 100;
    const effectiveReactivity = rodReactivity * fuel.reactivity * (1 - xenonPoisoning * 0.5);

    // Power changes
    let newPower = state.power;
    if (state.isRunning) {
      const powerDelta = (effectiveReactivity - 0.5) * 50 * dt;
      newPower = Math.max(0, state.power + powerDelta);

      if (effectiveReactivity > 0.7) {
        newPower *= 1 + (effectiveReactivity - 0.7) * dt * 2;
      }
    }

    // Temperature
    const heatGeneration = newPower * 30 * fuel.reactivity;
    const cooling = state.coolantEnabled ? state.coolantFlow * 20 : 5;
    const temperatureChange = (heatGeneration - cooling) * dt;
    let newTemp = Math.max(20, state.temperature + temperatureChange);

    // Pressure
    const newPressure = 1 + (newTemp - 20) / 100;

    // Radiation based on power and containment
    const baseRadiation = newPower * 10;
    let newRadiation = baseRadiation * (1 + (100 - state.containmentIntegrity) / 50);

    // Boost radiation during disasters
    if (state.isMeltdown) newRadiation *= 10;
    if (state.isContainmentBreach) newRadiation *= 50;
    if (state.isChinaSyndrome) newRadiation *= 100;

    // Xenon
    let newXenon = state.xenonLevel;
    if (newPower > 20 && newPower < 60) {
      newXenon = Math.min(100, newXenon + dt * 2);
    } else if (newPower > 80) {
      newXenon = Math.max(0, newXenon - dt * 5);
    }

    // Fuel consumption
    const fuelConsumption = newPower * dt * 0.001 * fuel.reactivity;
    const newFuel = Math.max(0, state.fuelRemaining - fuelConsumption);

    // Containment damage
    let newContainment = state.containmentIntegrity;
    let newFloor = state.floorIntegrity;
    if (newTemp > 2000 || newPressure > 20) {
      newContainment = Math.max(0, newContainment - dt * 5);
    }

    // Update stats
    const newMaxTemp = Math.max(state.maxTempReached, newTemp);
    const newMaxPower = Math.max(state.maxPowerReached, newPower);

    // Check for disasters
    let meltdown = state.isMeltdown;
    let explosion = state.isExplosion;
    let breach = state.isContainmentBreach;
    let chinaSyndrome = state.isChinaSyndrome;

    // Auto-SCRAM
    if (!state.autoScramDisabled && state.scramEnabled) {
      if (newTemp > fuel.meltdownTemp * 0.8 || newPressure > 15) {
        get().emergencyScram();
        get().addEvent('warning', 'Auto-SCRAM triggered due to dangerous conditions');
      }
    }

    // Meltdown
    if (newTemp >= fuel.meltdownTemp && !meltdown) {
      meltdown = true;
      get().unlockAchievement('meltdown');
      get().addEvent('danger', '!!! CORE MELTDOWN IN PROGRESS !!!');

      if (state.startTime && (Date.now() - state.startTime) < 30000) {
        get().unlockAchievement('speedrun');
      }

      if (state.isNight) {
        get().unlockAchievement('night_terror');
      }

      if (state.weather === 'storm') {
        get().unlockAchievement('weather_disaster');
      }
    }

    // China syndrome - melts through floor
    if (meltdown && newTemp > fuel.meltdownTemp * 1.5) {
      newFloor = Math.max(0, newFloor - dt * 10);
      if (newFloor <= 0 && !chinaSyndrome) {
        chinaSyndrome = true;
        get().unlockAchievement('china_syndrome');
        get().addEvent('danger', '!!! CHINA SYNDROME - CORIUM MELTING THROUGH CONTAINMENT FLOOR !!!');
      }
    }

    // Explosion
    if ((newPressure > 25 || newPower > 200) && !explosion) {
      explosion = true;
      get().unlockAchievement('explosion');
      get().addEvent('danger', '!!! REACTOR EXPLOSION !!!');
    }

    // Containment breach
    if (newContainment <= 0 && !breach) {
      breach = true;
      get().unlockAchievement('containment_breach');
      get().addEvent('danger', '!!! CONTAINMENT BREACH - RADIATION RELEASE !!!');
    }

    // Triple threat
    if (meltdown && explosion && breach) {
      get().unlockAchievement('triple_threat');
    }

    // Achievement checks
    if (newPower >= 100 && !state.achievements.includes('max_power')) {
      get().unlockAchievement('max_power');
    }
    if (newTemp > fuel.meltdownTemp * 0.7 && !state.achievements.includes('overheat')) {
      get().unlockAchievement('overheat');
    }
    if (newXenon > 80 && !state.achievements.includes('xenon_pit')) {
      get().unlockAchievement('xenon_pit');
    }

    // Update environment if there's a breach
    let newNeighborhood = state.neighborhood;
    let newGroundwater = state.groundwater;
    let newAirContamination = state.airContamination;
    let newGroundContamination = state.groundContamination;
    let newWaterContamination = state.waterContamination;
    let newTotalExposed = state.totalPopulationExposed;
    let newTotalEvacuated = state.totalEvacuated;
    let newLethalExposures = state.lethalExposures;

    if (breach || chinaSyndrome || explosion) {
      // Calculate radiation spread
      const spreadRate = weatherData.spreadRate * (state.windSpeed / 10);
      const windRad = (state.windDirection * Math.PI) / 180;

      // Update neighborhood radiation
      newNeighborhood = state.neighborhood.map((row, y) =>
        row.map((cell, x) => {
          if (cell.type === 'reactor' || cell.type === 'exclusion') return cell;

          const dx = x - 9.5;
          const dy = y - 9.5;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Wind-adjusted radiation spread
          const windX = Math.cos(windRad);
          const windY = Math.sin(windRad);
          const windAlignment = (dx * windX + dy * windY) / (dist || 1);
          const windBonus = windAlignment > 0 ? windAlignment * spreadRate : 0;

          // Base radiation decreases with distance squared
          const baseRad = newRadiation / (dist * dist + 1);
          const adjustedRad = baseRad * (1 + windBonus);
          const newCellRad = Math.max(cell.radiation, cell.radiation + adjustedRad * dt);

          // Ground contamination from fallout
          let newSoilContam = cell.soilContamination;
          if (state.weather === 'rain') {
            newSoilContam += adjustedRad * dt * 0.5; // Rain brings down contamination
          }

          // Groundwater contamination (especially during china syndrome)
          let newGwContam = cell.groundwaterContamination;
          if (chinaSyndrome && dist < 5) {
            newGwContam += dt * 100; // Direct contamination near reactor
          }

          // Check if contaminated
          const isContam = newCellRad > 100 || newSoilContam > 50 || newGwContam > 50;

          // Population tracking
          if (isContam && !cell.contaminated && cell.population > 0) {
            newTotalExposed += cell.population;
            if (newCellRad > 1000) {
              newLethalExposures += cell.population;
            }
          }

          // Evacuation (automatic at high radiation)
          const shouldEvacuate = newCellRad > 500 && !cell.evacuated;
          if (shouldEvacuate && cell.population > 0) {
            newTotalEvacuated += cell.population;
          }

          return {
            ...cell,
            radiation: newCellRad,
            soilContamination: newSoilContam,
            groundwaterContamination: newGwContam,
            contaminated: isContam,
            evacuated: cell.evacuated || shouldEvacuate,
          };
        })
      );

      // Update groundwater spread
      newGroundwater = state.groundwater.map((row, y) =>
        row.map((cell, x) => {
          // Get contamination from above-ground
          const surfaceCell = newNeighborhood[y]?.[x];
          const surfaceContam = surfaceCell?.groundwaterContamination || 0;

          // Spread from neighbors based on flow
          let neighborContam = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighbor = state.groundwater[y + dy]?.[x + dx];
              if (neighbor && neighbor.contamination > cell.contamination) {
                neighborContam += neighbor.contamination * 0.1 * dt;
              }
            }
          }

          return {
            ...cell,
            contamination: cell.contamination + surfaceContam * 0.01 * dt + neighborContam,
          };
        })
      );

      // Overall contamination levels
      newAirContamination = Math.min(100, state.airContamination + (newRadiation * dt * 0.01));
      newGroundContamination = Math.min(100, state.groundContamination + (chinaSyndrome ? dt * 5 : dt * 0.5));
      newWaterContamination = Math.min(100, state.waterContamination + (chinaSyndrome ? dt * 10 : dt * 0.2));

      // Check achievements
      if (newWaterContamination > 50 && !state.achievements.includes('groundwater_poison')) {
        get().unlockAchievement('groundwater_poison');
      }
      if (newTotalEvacuated > 10000 && !state.achievements.includes('mass_evacuation')) {
        get().unlockAchievement('mass_evacuation');
      }
      if (newLethalExposures > 50000 && !state.achievements.includes('population_devastation')) {
        get().unlockAchievement('population_devastation');
      }

      // Count contaminated cells for city destroyer
      const contaminatedCells = newNeighborhood.flat().filter(c => c.contaminated).length;
      if (contaminatedCells > 300 && !state.achievements.includes('city_destroyer')) {
        get().unlockAchievement('city_destroyer');
      }
    }

    set({
      power: newPower,
      temperature: newTemp,
      pressure: newPressure,
      radiation: newRadiation,
      xenonLevel: newXenon,
      fuelRemaining: newFuel,
      containmentIntegrity: newContainment,
      floorIntegrity: newFloor,
      maxTempReached: newMaxTemp,
      maxPowerReached: newMaxPower,
      isMeltdown: meltdown,
      isExplosion: explosion,
      isContainmentBreach: breach,
      isChinaSyndrome: chinaSyndrome,
      runtime: state.startTime ? Date.now() - state.startTime : 0,
      neighborhood: newNeighborhood,
      groundwater: newGroundwater,
      airContamination: newAirContamination,
      groundContamination: newGroundContamination,
      waterContamination: newWaterContamination,
      totalPopulationExposed: newTotalExposed,
      totalEvacuated: newTotalEvacuated,
      lethalExposures: newLethalExposures,
    });
  },

  // Reset everything
  reset: () => {
    set({
      isRunning: false,
      power: 0,
      targetPower: 0,
      temperature: 20,
      pressure: 1,
      radiation: 0,
      controlRodPosition: 100,
      coolantFlow: 100,
      coolantEnabled: true,
      containmentIntegrity: 100,
      floorIntegrity: 100,
      fuelType: 'uranium235',
      fuelRemaining: 100,
      xenonLevel: 0,
      isMeltdown: false,
      isExplosion: false,
      isContainmentBreach: false,
      isChinaSyndrome: false,
      isHydrogenExplosion: false,
      isCriticalityAccident: false,
      scramEnabled: true,
      autoScramDisabled: false,
      warningsIgnored: 0,
      startTime: null,
      runtime: 0,
      maxTempReached: 20,
      maxPowerReached: 0,
      totalPopulationExposed: 0,
      totalEvacuated: 0,
      lethalExposures: 0,
      neighborhood: generateNeighborhood(),
      groundwater: generateGroundwater(),
      airContamination: 0,
      groundContamination: 0,
      waterContamination: 0,
      events: [{ time: Date.now(), type: 'info', message: 'Reactor reset - Ready for ignition' }],
    });
  },
}));

export { FUEL_TYPES, ACHIEVEMENTS, WEATHER_TYPES, BUILDING_TYPES };
export default useReactorStore;
