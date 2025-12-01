export const ZONE_COLORS = {
  1: '#3b82f6',
  2: '#06b6d4',
  3: '#10b981',
  4: '#84cc16',
  5: '#eab308',
  6: '#f97316',
  7: '#ef4444',
  8: '#dc2626',
  9: '#be185d',
  10: '#9333ea',
};

export const THERMAL_COLORS = {
  cold: '#3b82f6',
  cool: '#06b6d4',
  warm: '#f59e0b',
  hot: '#ef4444',
  extreme: '#dc2626',
};

export const REFLOW_PROFILE_STAGES = {
  PREHEAT: { name: 'Preheat', minTemp: 25, maxTemp: 150, rampRate: '1-3' },
  SOAK: { name: 'Thermal Soak', minTemp: 150, maxTemp: 200, duration: '60-120s' },
  REFLOW: { name: 'Reflow', minTemp: 200, maxTemp: 250, peakTime: '30-60s' },
  COOLING: { name: 'Cooling', maxRate: '-6', targetTemp: 100 },
};

export const TEMPERATURE_LIMITS = {
  WARNING_HIGH: 260,
  CRITICAL_HIGH: 280,
  WARNING_LOW: 20,
  CRITICAL_LOW: 10,
  IDEAL_PREHEAT: { min: 140, max: 170 },
  IDEAL_SOAK: { min: 170, max: 200 },
  IDEAL_PEAK: { min: 230, max: 250 },
};

export const POWER_THRESHOLDS = {
  IDLE: 5,
  NORMAL: 35,
  HIGH: 50,
  CRITICAL: 60,
};

export const COLUMN_MAPPING = {
  timestamp: 'Logging time',
  fileName: 'File name',
  cumulativeEnergy: 'Cumulative electric energy (kWh)',
  current: 'Electric current (A)',
  voltage: 'Voltage (V)',
  activePower: 'Active power (kW)',
  reactivePower: 'Reactive power (kVAR)',
  apparentPower: 'Apparent power (kVA)',
  powerFactor: 'Power factor (PF)',
  frequency: 'AC frequency (Hz)',
  phaseShift: 'Phase shift',
  boardsInside: 'Number of boards inside equipment',
  boardsProduced: 'Number of boards produced',
  productNumber: 'Product number information',
  productionStart: 'Production start time',
  productionEnd: 'Production end time',
  conveyorSpeed: 'C/V (Conveyor speed m/min)',
  conveyorWidth: 'Conveyor width (mm)',
  warpWidth: 'Warp prevention width (mm)',
  status: 'Equipment status',
  alarms: 'Number of alarms',
  flowRate: 'Flow rate (L/min)',
  o2Concentration: 'O2 concentration (ppm)',
  cool1Upper: 'COOL1 upper',
  cool2Upper: 'COOL2 upper',
};

export const ZONE_COLUMNS = Array.from({ length: 10 }, (_, i) => ({
  zone: i + 1,
  upper: `ZONE${i + 1} UPPER Temperature (°C)`,
  lower: `ZONE${i + 1} LOWER Temperature (°C)`,
  blowerUpper: `BLOWER${i + 1} UPPER Temperature (°C)`,
  blowerLower: `BLOWER${i + 1} LOWER Temperature (°C)`,
}));

export const CHART_DEFAULTS = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  animationDuration: 300,
};

export const TIME_RANGES = [
  { label: '1 Hour', value: 360, unit: 'samples' },
  { label: '4 Hours', value: 1440, unit: 'samples' },
  { label: '8 Hours', value: 2880, unit: 'samples' },
  { label: '24 Hours', value: 8640, unit: 'samples' },
  { label: 'All Data', value: -1, unit: 'all' },
];

export const SAMPLE_RATE = 10; // seconds per sample

export const EXPORT_FORMATS = ['csv', 'json', 'xlsx'];
