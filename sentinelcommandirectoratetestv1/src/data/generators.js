// Seeded random number generator for deterministic simulation
class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick(array) {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Global seeded random instance
export const rng = new SeededRandom(42);

// ==================== NAME GENERATORS ====================

const FIRST_NAMES = [
  'Alexander', 'Viktor', 'Nikolai', 'Dmitri', 'Sergei', 'Ivan', 'Boris', 'Andrei',
  'Chen', 'Wei', 'Ming', 'Jian', 'Hui', 'Li', 'Zhang', 'Wang',
  'Mohammad', 'Ahmed', 'Omar', 'Khalid', 'Hassan', 'Ali', 'Ibrahim', 'Yusuf',
  'James', 'William', 'Michael', 'David', 'Robert', 'John', 'Thomas', 'Charles',
  'Klaus', 'Friedrich', 'Hans', 'Wolfgang', 'Stefan', 'Dieter', 'Heinrich', 'Otto',
  'Pierre', 'Jean', 'François', 'Jacques', 'Louis', 'Henri', 'Michel', 'Alain',
  'Carlos', 'Miguel', 'Juan', 'Diego', 'Rafael', 'Fernando', 'Antonio', 'Pedro',
  'Hiroshi', 'Takeshi', 'Kenji', 'Masashi', 'Yuki', 'Ryo', 'Taro', 'Akira'
];

const LAST_NAMES = [
  'Volkov', 'Petrov', 'Kuznetsov', 'Sokolov', 'Ivanov', 'Popov', 'Morozov', 'Kozlov',
  'Liu', 'Wang', 'Zhang', 'Chen', 'Yang', 'Huang', 'Zhou', 'Wu',
  'Al-Rashid', 'Al-Farsi', 'Al-Hassan', 'Al-Mahmoud', 'Al-Zahrani', 'Al-Bakr', 'Al-Qasim', 'Al-Naimi',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Hoffmann',
  'Dubois', 'Laurent', 'Moreau', 'Bernard', 'Leroy', 'Roux', 'David', 'Bertrand',
  'Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Hernandez', 'Perez', 'Sanchez',
  'Tanaka', 'Yamamoto', 'Watanabe', 'Suzuki', 'Takahashi', 'Kobayashi', 'Sato', 'Ito'
];

const CODE_NAMES = [
  'SHADOW WOLF', 'IRON BEAR', 'NIGHT HAWK', 'STORM EAGLE', 'SILENT SERPENT',
  'CRIMSON TIGER', 'GHOST FALCON', 'DARK PHOENIX', 'ICE DRAGON', 'THUNDER LION',
  'BLACK WIDOW', 'SILVER FOX', 'RED SCORPION', 'BLUE RAVEN', 'GOLDEN VIPER',
  'STEEL PANTHER', 'ARCTIC WOLF', 'DESERT STORM', 'OCEAN BREEZE', 'MOUNTAIN SHADOW',
  'PHANTOM BLADE', 'WINTER FROST', 'SUMMER BLAZE', 'AUTUMN LEAF', 'SPRING TIDE',
  'NEBULA', 'PULSAR', 'QUASAR', 'NOVA', 'ECLIPSE', 'COMET', 'METEOR', 'AURORA'
];

// ==================== LOCATION DATA ====================

export const COUNTRIES = [
  { code: 'RU', name: 'Russia', region: 'EURASIA', coords: [55.7558, 37.6173], threatLevel: 'critical' },
  { code: 'CN', name: 'China', region: 'ASIA-PACIFIC', coords: [39.9042, 116.4074], threatLevel: 'critical' },
  { code: 'IR', name: 'Iran', region: 'MIDDLE-EAST', coords: [35.6892, 51.3890], threatLevel: 'high' },
  { code: 'KP', name: 'North Korea', region: 'ASIA-PACIFIC', coords: [39.0392, 125.7625], threatLevel: 'critical' },
  { code: 'SY', name: 'Syria', region: 'MIDDLE-EAST', coords: [33.5138, 36.2765], threatLevel: 'high' },
  { code: 'VE', name: 'Venezuela', region: 'SOUTH-AMERICA', coords: [10.4806, -66.9036], threatLevel: 'elevated' },
  { code: 'CU', name: 'Cuba', region: 'CARIBBEAN', coords: [23.1136, -82.3666], threatLevel: 'guarded' },
  { code: 'BY', name: 'Belarus', region: 'EURASIA', coords: [53.9045, 27.5615], threatLevel: 'elevated' },
  { code: 'PK', name: 'Pakistan', region: 'SOUTH-ASIA', coords: [33.6844, 73.0479], threatLevel: 'elevated' },
  { code: 'AF', name: 'Afghanistan', region: 'SOUTH-ASIA', coords: [34.5553, 69.2075], threatLevel: 'critical' },
  { code: 'IQ', name: 'Iraq', region: 'MIDDLE-EAST', coords: [33.3152, 44.3661], threatLevel: 'high' },
  { code: 'LY', name: 'Libya', region: 'NORTH-AFRICA', coords: [32.8872, 13.1913], threatLevel: 'elevated' },
  { code: 'YE', name: 'Yemen', region: 'MIDDLE-EAST', coords: [15.3694, 44.1910], threatLevel: 'high' },
  { code: 'SO', name: 'Somalia', region: 'EAST-AFRICA', coords: [2.0469, 45.3182], threatLevel: 'high' },
  { code: 'MM', name: 'Myanmar', region: 'SOUTHEAST-ASIA', coords: [19.7633, 96.0785], threatLevel: 'elevated' },
  { code: 'US', name: 'United States', region: 'NORTH-AMERICA', coords: [38.9072, -77.0369], threatLevel: 'guarded' },
  { code: 'GB', name: 'United Kingdom', region: 'EUROPE', coords: [51.5074, -0.1278], threatLevel: 'low' },
  { code: 'DE', name: 'Germany', region: 'EUROPE', coords: [52.5200, 13.4050], threatLevel: 'low' },
  { code: 'FR', name: 'France', region: 'EUROPE', coords: [48.8566, 2.3522], threatLevel: 'low' },
  { code: 'JP', name: 'Japan', region: 'ASIA-PACIFIC', coords: [35.6762, 139.6503], threatLevel: 'low' },
  { code: 'IL', name: 'Israel', region: 'MIDDLE-EAST', coords: [31.7683, 35.2137], threatLevel: 'elevated' },
  { code: 'UA', name: 'Ukraine', region: 'EURASIA', coords: [50.4501, 30.5234], threatLevel: 'critical' },
  { code: 'TW', name: 'Taiwan', region: 'ASIA-PACIFIC', coords: [25.0330, 121.5654], threatLevel: 'high' },
  { code: 'IN', name: 'India', region: 'SOUTH-ASIA', coords: [28.6139, 77.2090], threatLevel: 'guarded' },
];

export const CITIES = [
  { name: 'Moscow', country: 'RU', coords: [55.7558, 37.6173], population: 12500000 },
  { name: 'Beijing', country: 'CN', coords: [39.9042, 116.4074], population: 21540000 },
  { name: 'Tehran', country: 'IR', coords: [35.6892, 51.3890], population: 8694000 },
  { name: 'Pyongyang', country: 'KP', coords: [39.0392, 125.7625], population: 2870000 },
  { name: 'Damascus', country: 'SY', coords: [33.5138, 36.2765], population: 2079000 },
  { name: 'Caracas', country: 'VE', coords: [10.4806, -66.9036], population: 2935000 },
  { name: 'Havana', country: 'CU', coords: [23.1136, -82.3666], population: 2130000 },
  { name: 'Minsk', country: 'BY', coords: [53.9045, 27.5615], population: 1982000 },
  { name: 'Kabul', country: 'AF', coords: [34.5553, 69.2075], population: 4222000 },
  { name: 'Baghdad', country: 'IQ', coords: [33.3152, 44.3661], population: 7665000 },
  { name: 'Kyiv', country: 'UA', coords: [50.4501, 30.5234], population: 2952000 },
  { name: 'Shanghai', country: 'CN', coords: [31.2304, 121.4737], population: 24870000 },
  { name: 'Hong Kong', country: 'CN', coords: [22.3193, 114.1694], population: 7500000 },
  { name: 'Taipei', country: 'TW', coords: [25.0330, 121.5654], population: 2646000 },
  { name: 'Seoul', country: 'KR', coords: [37.5665, 126.9780], population: 9776000 },
  { name: 'Tokyo', country: 'JP', coords: [35.6762, 139.6503], population: 13960000 },
  { name: 'Washington DC', country: 'US', coords: [38.9072, -77.0369], population: 705749 },
  { name: 'London', country: 'GB', coords: [51.5074, -0.1278], population: 8982000 },
  { name: 'Berlin', country: 'DE', coords: [52.5200, 13.4050], population: 3645000 },
  { name: 'Paris', country: 'FR', coords: [48.8566, 2.3522], population: 2161000 },
];

// ==================== ORGANIZATION DATA ====================

export const THREAT_ACTORS = [
  { id: 'APT28', name: 'APT28 / Fancy Bear', origin: 'RU', type: 'state', capability: 'elite', focus: ['cyber', 'espionage', 'influence'] },
  { id: 'APT29', name: 'APT29 / Cozy Bear', origin: 'RU', type: 'state', capability: 'elite', focus: ['cyber', 'espionage'] },
  { id: 'APT41', name: 'APT41 / Double Dragon', origin: 'CN', type: 'state', capability: 'elite', focus: ['cyber', 'espionage', 'financial'] },
  { id: 'APT10', name: 'APT10 / Stone Panda', origin: 'CN', type: 'state', capability: 'advanced', focus: ['cyber', 'espionage'] },
  { id: 'LAZARUS', name: 'Lazarus Group', origin: 'KP', type: 'state', capability: 'elite', focus: ['cyber', 'financial', 'sabotage'] },
  { id: 'CHARMING', name: 'Charming Kitten', origin: 'IR', type: 'state', capability: 'advanced', focus: ['cyber', 'espionage', 'influence'] },
  { id: 'SANDWORM', name: 'Sandworm Team', origin: 'RU', type: 'state', capability: 'elite', focus: ['cyber', 'sabotage', 'infrastructure'] },
  { id: 'TURLA', name: 'Turla / Snake', origin: 'RU', type: 'state', capability: 'elite', focus: ['cyber', 'espionage'] },
  { id: 'EQUATION', name: 'Equation Group', origin: 'US', type: 'state', capability: 'nation-state', focus: ['cyber', 'espionage'] },
  { id: 'ISIS', name: 'Islamic State', origin: 'GLOBAL', type: 'terror', capability: 'degraded', focus: ['terror', 'influence', 'recruitment'] },
  { id: 'ALQAEDA', name: 'Al-Qaeda Network', origin: 'GLOBAL', type: 'terror', capability: 'resilient', focus: ['terror', 'recruitment'] },
  { id: 'HEZBOLLAH', name: 'Hezbollah', origin: 'LB', type: 'proxy', capability: 'advanced', focus: ['military', 'terror', 'political'] },
  { id: 'WAGNER', name: 'Wagner Group', origin: 'RU', type: 'proxy', capability: 'advanced', focus: ['military', 'mercenary', 'destabilization'] },
  { id: 'CARTEL', name: 'Sinaloa Cartel', origin: 'MX', type: 'criminal', capability: 'advanced', focus: ['trafficking', 'financial', 'violence'] },
  { id: 'TRIADS', name: 'Chinese Triads', origin: 'CN', type: 'criminal', capability: 'advanced', focus: ['trafficking', 'financial', 'cyber'] },
];

export const AGENCIES = [
  { id: 'CIA', name: 'Central Intelligence Agency', country: 'US', type: 'intel', color: '#6366f1' },
  { id: 'NSA', name: 'National Security Agency', country: 'US', type: 'sigint', color: '#00d4ff' },
  { id: 'FBI', name: 'Federal Bureau of Investigation', country: 'US', type: 'law', color: '#f59e0b' },
  { id: 'DIA', name: 'Defense Intelligence Agency', country: 'US', type: 'defense', color: '#22c55e' },
  { id: 'USCYBER', name: 'US Cyber Command', country: 'US', type: 'cyber', color: '#00d4ff' },
  { id: 'NGA', name: 'National Geospatial Agency', country: 'US', type: 'geoint', color: '#8b5cf6' },
  { id: 'STATE', name: 'State Department INR', country: 'US', type: 'foreign', color: '#ec4899' },
  { id: 'SOF', name: 'Special Operations Forces', country: 'US', type: 'covert', color: '#ef4444' },
  { id: 'MI6', name: 'Secret Intelligence Service', country: 'GB', type: 'intel', color: '#6366f1' },
  { id: 'GCHQ', name: 'Government Communications HQ', country: 'GB', type: 'sigint', color: '#00d4ff' },
  { id: 'MOSSAD', name: 'Mossad', country: 'IL', type: 'intel', color: '#6366f1' },
  { id: 'BND', name: 'Bundesnachrichtendienst', country: 'DE', type: 'intel', color: '#6366f1' },
  { id: 'DGSE', name: 'Direction Générale de la Sécurité Extérieure', country: 'FR', type: 'intel', color: '#6366f1' },
];

// ==================== GENERATOR FUNCTIONS ====================

let idCounters = {
  threat: 0,
  operation: 0,
  intercept: 0,
  cyberEvent: 0,
  asset: 0,
  document: 0,
  incident: 0,
  influence: 0,
};

export function generateId(type) {
  idCounters[type] = (idCounters[type] || 0) + 1;
  return `${type.toUpperCase()}-${String(idCounters[type]).padStart(6, '0')}`;
}

export function generateName() {
  return `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
}

export function generateCodeName() {
  return rng.pick(CODE_NAMES);
}

export function generateThreatLevel() {
  const levels = ['critical', 'high', 'elevated', 'guarded', 'low'];
  const weights = [0.1, 0.2, 0.3, 0.25, 0.15];
  const rand = rng.next();
  let cumulative = 0;
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return levels[i];
  }
  return 'guarded';
}

export function generateClassification() {
  const levels = ['TOP SECRET//SCI', 'TOP SECRET', 'SECRET', 'CONFIDENTIAL', 'UNCLASSIFIED'];
  const weights = [0.15, 0.25, 0.35, 0.15, 0.1];
  const rand = rng.next();
  let cumulative = 0;
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return levels[i];
  }
  return 'SECRET';
}

export function generateTimestamp(hoursBack = 24) {
  const now = Date.now();
  const offset = rng.nextInt(0, hoursBack * 60 * 60 * 1000);
  return new Date(now - offset);
}

export function generateCoordinates(baseCoords = null, radiusKm = 500) {
  if (baseCoords) {
    const latOffset = (rng.next() - 0.5) * (radiusKm / 111);
    const lonOffset = (rng.next() - 0.5) * (radiusKm / 111);
    return [baseCoords[0] + latOffset, baseCoords[1] + lonOffset];
  }
  return [rng.next() * 140 - 70, rng.next() * 360 - 180];
}

export function generateThreat() {
  const actor = rng.pick(THREAT_ACTORS);
  const country = COUNTRIES.find(c => c.code === actor.origin) || rng.pick(COUNTRIES);
  const threatTypes = [
    'Cyber Intrusion Campaign',
    'Espionage Operation',
    'Influence Operation',
    'Military Buildup',
    'Weapons Proliferation',
    'Terror Plot',
    'Infrastructure Attack',
    'Financial Crime Network',
    'Assassination Threat',
    'Sabotage Operation',
    'Recruitment Campaign',
    'Arms Trafficking',
    'Nuclear Development',
    'Chemical Weapons Activity',
    'Hostile Intelligence Operation',
  ];

  return {
    id: generateId('threat'),
    type: rng.pick(threatTypes),
    actor: actor,
    threatLevel: generateThreatLevel(),
    classification: generateClassification(),
    origin: country,
    targets: rng.shuffle(COUNTRIES.filter(c => c.threatLevel === 'low')).slice(0, rng.nextInt(1, 4)),
    timestamp: generateTimestamp(72),
    status: rng.pick(['active', 'developing', 'imminent', 'suspected', 'confirmed']),
    confidence: rng.nextInt(40, 99),
    briefing: generateThreatBriefing(actor, country),
    escalationTree: generateEscalationTree(),
    riskVectors: generateRiskVectors(),
    relatedEntities: [],
  };
}

function generateThreatBriefing(actor, country) {
  const templates = [
    `Intelligence indicates ${actor.name} has initiated a new campaign targeting critical infrastructure. Multiple indicators suggest coordination with state-level resources in ${country.name}.`,
    `SIGINT intercepts reveal communications between ${actor.name} operatives discussing imminent operations. Pattern analysis indicates high probability of execution within 72 hours.`,
    `Human intelligence assets report significant activity within ${actor.name} networks. Assessment suggests preparation for multi-vector attack.`,
    `Geospatial analysis has identified unusual activity at facilities associated with ${actor.name} in ${country.name}. Imagery shows logistics buildup consistent with operational preparation.`,
    `Cyber operations detected multiple intrusion attempts originating from infrastructure known to be controlled by ${actor.name}. Targets include defense contractors and government networks.`,
  ];
  return rng.pick(templates);
}

function generateEscalationTree() {
  return [
    { level: 1, action: 'Initial Detection', probability: 100, response: 'Enhanced Monitoring' },
    { level: 2, action: 'Pattern Confirmation', probability: rng.nextInt(60, 90), response: 'Intelligence Sharing' },
    { level: 3, action: 'Threat Materialization', probability: rng.nextInt(30, 70), response: 'Defensive Posture' },
    { level: 4, action: 'Active Engagement', probability: rng.nextInt(10, 40), response: 'Countermeasures' },
    { level: 5, action: 'Full Escalation', probability: rng.nextInt(5, 20), response: 'Crisis Response' },
  ];
}

function generateRiskVectors() {
  const vectors = [
    { name: 'Cyber', score: rng.nextInt(20, 100), trend: rng.pick(['rising', 'stable', 'declining']) },
    { name: 'Physical', score: rng.nextInt(20, 100), trend: rng.pick(['rising', 'stable', 'declining']) },
    { name: 'Economic', score: rng.nextInt(20, 100), trend: rng.pick(['rising', 'stable', 'declining']) },
    { name: 'Political', score: rng.nextInt(20, 100), trend: rng.pick(['rising', 'stable', 'declining']) },
    { name: 'Social', score: rng.nextInt(20, 100), trend: rng.pick(['rising', 'stable', 'declining']) },
  ];
  return vectors;
}

export function generateOperation() {
  const operationTypes = [
    'Intelligence Collection',
    'Counterterrorism Strike',
    'Cyber Defense',
    'Asset Extraction',
    'Surveillance Operation',
    'Covert Action',
    'Joint Task Force',
    'Maritime Interdiction',
    'Special Reconnaissance',
    'Information Operation',
    'Counterintelligence',
    'Technical Collection',
    'Human Intelligence',
    'Signals Intelligence',
  ];

  const phases = ['Planning', 'Preparation', 'Execution', 'Exploitation', 'Assessment'];
  const currentPhase = rng.nextInt(0, phases.length - 1);
  const leadAgency = rng.pick(AGENCIES.filter(a => a.country === 'US'));
  const supportingAgencies = rng.shuffle(AGENCIES.filter(a => a.id !== leadAgency.id)).slice(0, rng.nextInt(1, 4));

  return {
    id: generateId('operation'),
    codeName: `OPERATION ${generateCodeName()}`,
    type: rng.pick(operationTypes),
    classification: generateClassification(),
    leadAgency: leadAgency,
    supportingAgencies: supportingAgencies,
    status: rng.pick(['active', 'standby', 'completed', 'suspended', 'planning']),
    phase: phases[currentPhase],
    phaseProgress: rng.nextInt(10, 100),
    startDate: generateTimestamp(720),
    targetRegion: rng.pick(COUNTRIES),
    objectives: generateObjectives(),
    assets: generateOperationAssets(),
    timeline: generateOperationTimeline(phases, currentPhase),
    dependencies: [],
    risks: generateOperationRisks(),
    secureChannels: rng.nextInt(2, 8),
    personnelCount: rng.nextInt(5, 150),
  };
}

function generateObjectives() {
  const objectiveTypes = [
    'Neutralize high-value target network',
    'Collect strategic intelligence on weapons programs',
    'Disrupt enemy communications infrastructure',
    'Extract compromised asset from hostile territory',
    'Establish persistent surveillance capability',
    'Conduct cyber exploitation of target systems',
    'Support allied operations in theater',
    'Counter adversary influence operations',
  ];
  return rng.shuffle(objectiveTypes).slice(0, rng.nextInt(2, 4)).map((obj, i) => ({
    id: i + 1,
    description: obj,
    status: rng.pick(['pending', 'in-progress', 'completed', 'blocked']),
    priority: rng.pick(['critical', 'high', 'medium', 'low']),
  }));
}

function generateOperationAssets() {
  const assetTypes = ['HUMINT', 'SIGINT', 'GEOINT', 'CYBER', 'SOF', 'AIR', 'MARITIME', 'TECHNICAL'];
  return rng.shuffle(assetTypes).slice(0, rng.nextInt(2, 5)).map(type => ({
    type,
    count: rng.nextInt(1, 20),
    status: rng.pick(['deployed', 'standby', 'in-transit', 'compromised']),
    location: rng.pick(CITIES),
  }));
}

function generateOperationTimeline(phases, currentPhase) {
  return phases.map((phase, i) => ({
    phase,
    status: i < currentPhase ? 'completed' : i === currentPhase ? 'active' : 'pending',
    startDate: new Date(Date.now() - (phases.length - i) * 7 * 24 * 60 * 60 * 1000),
    duration: `${rng.nextInt(1, 4)} weeks`,
    milestones: rng.nextInt(2, 6),
  }));
}

function generateOperationRisks() {
  return [
    { type: 'Operational Security', level: rng.pick(['low', 'medium', 'high', 'critical']), mitigation: 'Enhanced OPSEC protocols' },
    { type: 'Asset Compromise', level: rng.pick(['low', 'medium', 'high', 'critical']), mitigation: 'Redundant communication channels' },
    { type: 'Political Exposure', level: rng.pick(['low', 'medium', 'high', 'critical']), mitigation: 'Deniability measures' },
    { type: 'Collateral Impact', level: rng.pick(['low', 'medium', 'high', 'critical']), mitigation: 'Precision targeting protocols' },
  ];
}

export function generateIntercept() {
  const protocols = ['SATCOM', 'HF-BURST', 'VHF-ENCRYPTED', 'CELLULAR-4G', 'CELLULAR-5G', 'FIBER-TAP', 'WIFI-MESH', 'MICROWAVE', 'SUBMARINE-CABLE'];
  const encryptionSchemes = ['AES-256', 'RSA-4096', 'GOST', 'SM4', 'PROPRIETARY-A', 'PROPRIETARY-B', 'QUANTUM-RESISTANT', 'UNENCRYPTED'];
  const actor = rng.pick(THREAT_ACTORS);
  const city = rng.pick(CITIES);

  return {
    id: generateId('intercept'),
    protocol: rng.pick(protocols),
    encryption: rng.pick(encryptionSchemes),
    decryptionStatus: rng.pick(['encrypted', 'partial', 'decrypted', 'processing']),
    origin: {
      coords: generateCoordinates(city.coords, 50),
      city: city,
      confidence: rng.nextInt(50, 99),
    },
    destination: {
      coords: generateCoordinates(rng.pick(CITIES).coords, 50),
      confidence: rng.nextInt(40, 95),
    },
    timestamp: generateTimestamp(48),
    duration: rng.nextInt(5, 3600),
    frequency: rng.pick(['2.4 GHz', '5.8 GHz', '14.5 GHz', '28 GHz', 'HF', 'VHF', 'UHF']),
    signalStrength: rng.nextInt(-90, -30),
    suspectedActor: actor,
    classification: generateClassification(),
    metadata: generateInterceptMetadata(),
    content: rng.next() > 0.5 ? generateInterceptContent() : null,
    tags: generateInterceptTags(),
    correlations: rng.nextInt(0, 15),
    anomalyFlags: rng.next() > 0.7 ? generateAnomalyFlags() : [],
  };
}

function generateInterceptMetadata() {
  return {
    packetCount: rng.nextInt(100, 50000),
    byteSize: rng.nextInt(1024, 10485760),
    errorRate: (rng.next() * 5).toFixed(2) + '%',
    latency: rng.nextInt(10, 500) + 'ms',
    hopCount: rng.nextInt(1, 12),
    sessionId: Array(16).fill(0).map(() => rng.nextInt(0, 15).toString(16)).join('').toUpperCase(),
  };
}

function generateInterceptContent() {
  const contents = [
    '[TRANSLATED] Meeting confirmed for next week. Bring the documents we discussed.',
    '[PARTIAL] ...operational readiness... target facility... extraction timeline...',
    '[MACHINE TRANSLATION] The package will arrive at coordinates provided. Confirm receipt.',
    '[REDACTED] Financial transfer of [AMOUNT] to [ACCOUNT] scheduled for [DATE].',
    '[VOICE PRINT MATCH] Subject ALPHA discussing logistics with unknown contact.',
  ];
  return rng.pick(contents);
}

function generateInterceptTags() {
  const allTags = ['HIGH-PRIORITY', 'WEAPONS', 'FINANCIAL', 'LOGISTICS', 'PERSONNEL', 'OPERATIONAL', 'STRATEGIC', 'TACTICAL', 'CRYPTO', 'ANOMALOUS'];
  return rng.shuffle(allTags).slice(0, rng.nextInt(1, 4));
}

function generateAnomalyFlags() {
  const flags = [
    'Unusual transmission pattern detected',
    'New encryption signature identified',
    'Burst transmission outside normal schedule',
    'Geographic origin mismatch',
    'Protocol deviation observed',
  ];
  return rng.shuffle(flags).slice(0, rng.nextInt(1, 3));
}

export function generateCyberEvent() {
  const eventTypes = [
    'Intrusion Attempt',
    'Data Exfiltration',
    'Malware Detection',
    'DDoS Attack',
    'Phishing Campaign',
    'Zero-Day Exploit',
    'Ransomware',
    'Supply Chain Compromise',
    'Credential Theft',
    'Lateral Movement',
    'Command & Control',
    'Persistence Mechanism',
  ];

  const targets = [
    'Defense Contractor Network',
    'Government Email System',
    'Critical Infrastructure SCADA',
    'Financial Institution',
    'Healthcare Database',
    'Energy Grid Control',
    'Telecommunications Provider',
    'Research Laboratory',
    'Military Command System',
    'Intelligence Database',
  ];

  const actor = rng.pick(THREAT_ACTORS.filter(a => a.focus.includes('cyber')));

  return {
    id: generateId('cyberEvent'),
    type: rng.pick(eventTypes),
    severity: rng.pick(['critical', 'high', 'medium', 'low']),
    target: rng.pick(targets),
    suspectedActor: actor,
    timestamp: generateTimestamp(24),
    status: rng.pick(['active', 'contained', 'investigating', 'remediated', 'escalated']),
    classification: generateClassification(),
    indicators: generateCyberIndicators(),
    affectedSystems: rng.nextInt(1, 500),
    dataAtRisk: rng.nextInt(0, 10000) + ' GB',
    attackVector: rng.pick(['email', 'web', 'network', 'physical', 'supply-chain', 'insider']),
    malwareFamily: rng.next() > 0.3 ? generateMalwareName() : null,
    mitreTactics: generateMitreTactics(),
    networkNodes: generateNetworkNodes(),
    timeline: generateCyberTimeline(),
  };
}

function generateCyberIndicators() {
  return {
    ips: Array(rng.nextInt(1, 10)).fill(0).map(() =>
      `${rng.nextInt(1, 255)}.${rng.nextInt(0, 255)}.${rng.nextInt(0, 255)}.${rng.nextInt(1, 254)}`
    ),
    domains: Array(rng.nextInt(1, 5)).fill(0).map(() =>
      `${['cdn', 'api', 'update', 'secure', 'cloud'][rng.nextInt(0, 4)]}-${rng.nextInt(1000, 9999)}.${['com', 'net', 'org', 'io'][rng.nextInt(0, 3)]}`
    ),
    hashes: Array(rng.nextInt(1, 3)).fill(0).map(() =>
      Array(64).fill(0).map(() => rng.nextInt(0, 15).toString(16)).join('')
    ),
    signatures: rng.nextInt(5, 50),
  };
}

function generateMalwareName() {
  const prefixes = ['Dark', 'Shadow', 'Phantom', 'Ghost', 'Stealth', 'Covert', 'Silent', 'Hidden'];
  const suffixes = ['Worm', 'Trojan', 'RAT', 'Loader', 'Dropper', 'Beacon', 'Agent', 'Kit'];
  return `${rng.pick(prefixes)}${rng.pick(suffixes)}`;
}

function generateMitreTactics() {
  const tactics = [
    'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation',
    'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement',
    'Collection', 'Command and Control', 'Exfiltration', 'Impact'
  ];
  return rng.shuffle(tactics).slice(0, rng.nextInt(2, 6));
}

function generateNetworkNodes() {
  const nodeTypes = ['server', 'workstation', 'firewall', 'router', 'database', 'controller'];
  return Array(rng.nextInt(5, 20)).fill(0).map((_, i) => ({
    id: `NODE-${i + 1}`,
    type: rng.pick(nodeTypes),
    status: rng.pick(['clean', 'infected', 'isolated', 'unknown']),
    ip: `192.168.${rng.nextInt(1, 254)}.${rng.nextInt(1, 254)}`,
    connections: rng.nextInt(1, 8),
  }));
}

function generateCyberTimeline() {
  const events = [
    'Initial compromise detected',
    'Lateral movement observed',
    'Privilege escalation attempt',
    'Data staging identified',
    'Exfiltration blocked',
    'Containment measures deployed',
  ];
  return events.slice(0, rng.nextInt(2, events.length)).map((event, i) => ({
    time: new Date(Date.now() - (events.length - i) * 3600000),
    event,
    severity: rng.pick(['info', 'warning', 'critical']),
  }));
}

export function generateAsset() {
  const assetTypes = [
    { type: 'agent', subtype: 'NOC' },
    { type: 'agent', subtype: 'Foreign National' },
    { type: 'informant', subtype: 'Government' },
    { type: 'informant', subtype: 'Criminal' },
    { type: 'contact', subtype: 'Diplomatic' },
    { type: 'contact', subtype: 'Business' },
    { type: 'liaison', subtype: 'Allied Service' },
    { type: 'target', subtype: 'Hostile Actor' },
  ];

  const assetInfo = rng.pick(assetTypes);
  const country = rng.pick(COUNTRIES);
  const city = CITIES.find(c => c.country === country.code) || rng.pick(CITIES);

  return {
    id: generateId('asset'),
    codeName: generateCodeName(),
    realName: generateName(),
    type: assetInfo.type,
    subtype: assetInfo.subtype,
    nationality: country.name,
    location: city,
    status: rng.pick(['active', 'dormant', 'compromised', 'terminated', 'unknown']),
    reliability: rng.pick(['A', 'B', 'C', 'D', 'E', 'F']),
    classification: generateClassification(),
    recruitedDate: generateTimestamp(3650),
    lastContact: generateTimestamp(90),
    handler: generateName(),
    agency: rng.pick(AGENCIES.filter(a => a.country === 'US')),
    psychProfile: generatePsychProfile(),
    travelHistory: generateTravelHistory(),
    knownAssociates: Array(rng.nextInt(2, 8)).fill(0).map(() => ({
      name: generateName(),
      relationship: rng.pick(['family', 'colleague', 'handler', 'contact', 'target']),
      trustLevel: rng.pick(['trusted', 'verified', 'unverified', 'suspected']),
    })),
    operationalHistory: generateOperationalHistory(),
    biometrics: generateBiometrics(),
    riskAssessment: {
      compromiseRisk: rng.pick(['low', 'medium', 'high', 'critical']),
      doubleAgentProbability: rng.nextInt(1, 40) + '%',
      loyaltyScore: rng.nextInt(40, 100),
    },
    communications: generateCommunicationsLog(),
  };
}

function generatePsychProfile() {
  return {
    motivation: rng.pick(['ideological', 'financial', 'coerced', 'ego', 'revenge', 'patriotic']),
    reliability: rng.pick(['highly reliable', 'generally reliable', 'unreliable', 'untested']),
    vulnerabilities: rng.shuffle(['financial pressure', 'family ties', 'substance use', 'gambling', 'romantic involvement', 'ego', 'ideology']).slice(0, rng.nextInt(1, 3)),
    strengths: rng.shuffle(['access', 'technical skills', 'language', 'social network', 'position', 'travel ability']).slice(0, rng.nextInt(1, 3)),
    assessmentDate: generateTimestamp(180),
  };
}

function generateTravelHistory() {
  return Array(rng.nextInt(3, 10)).fill(0).map(() => ({
    destination: rng.pick(CITIES),
    date: generateTimestamp(365),
    duration: rng.nextInt(1, 30) + ' days',
    purpose: rng.pick(['operational', 'personal', 'business', 'unknown']),
    flagged: rng.next() > 0.8,
  }));
}

function generateOperationalHistory() {
  return Array(rng.nextInt(2, 8)).fill(0).map(() => ({
    operation: `OP-${rng.nextInt(1000, 9999)}`,
    role: rng.pick(['primary source', 'support', 'access agent', 'courier', 'surveillance']),
    outcome: rng.pick(['success', 'partial', 'failed', 'ongoing']),
    date: generateTimestamp(1095),
  }));
}

function generateBiometrics() {
  return {
    fingerprints: rng.next() > 0.2,
    faceRecognition: rng.next() > 0.3,
    voicePrint: rng.next() > 0.5,
    dna: rng.next() > 0.7,
    gait: rng.next() > 0.8,
  };
}

function generateCommunicationsLog() {
  return Array(rng.nextInt(3, 15)).fill(0).map(() => ({
    date: generateTimestamp(90),
    type: rng.pick(['dead drop', 'secure call', 'encrypted message', 'in-person', 'covert signal']),
    summary: rng.pick([
      'Routine check-in, no new intelligence',
      'Provided documents on target organization',
      'Requested extraction, situation deteriorating',
      'New access opportunity identified',
      'Warning of counterintelligence activity',
    ]),
    verified: rng.next() > 0.3,
  }));
}

export function generateDocument() {
  const docTypes = [
    'Strategic Assessment',
    'Intelligence Brief',
    'Field Report',
    'Intercepted Communication',
    'Surveillance Summary',
    'Threat Analysis',
    'Operational Plan',
    'After Action Report',
    'Asset Debrief',
    'Technical Report',
    'National Intelligence Estimate',
    'Presidential Daily Brief',
  ];

  const topics = [
    'Russian Military Capabilities',
    'Chinese Cyber Operations',
    'Iranian Nuclear Program',
    'North Korean Missile Development',
    'Global Terror Networks',
    'Critical Infrastructure Vulnerabilities',
    'Emerging Technology Threats',
    'Economic Warfare Indicators',
    'Political Stability Analysis',
    'Weapons Proliferation',
  ];

  return {
    id: generateId('document'),
    title: `${rng.pick(docTypes)}: ${rng.pick(topics)}`,
    type: rng.pick(docTypes),
    classification: generateClassification(),
    date: generateTimestamp(365),
    author: rng.pick(AGENCIES),
    pages: rng.nextInt(2, 150),
    status: rng.pick(['draft', 'final', 'revised', 'archived']),
    distribution: rng.shuffle(['NOFORN', 'FVEY', 'NATO', 'ORCON', 'REL TO']).slice(0, rng.nextInt(1, 3)),
    summary: generateDocumentSummary(),
    content: generateDocumentContent(),
    redactions: rng.nextInt(0, 50),
    crossReferences: Array(rng.nextInt(0, 10)).fill(0).map(() => generateId('document')),
    relatedThreats: [],
    relatedOperations: [],
    metadata: {
      created: generateTimestamp(365),
      modified: generateTimestamp(30),
      accessCount: rng.nextInt(5, 500),
      lastAccessed: generateTimestamp(7),
    },
  };
}

function generateDocumentSummary() {
  const summaries = [
    'This assessment examines recent developments in adversary capabilities and intentions. Key findings indicate increased operational tempo and resource allocation toward strategic objectives.',
    'Field reporting indicates significant changes in target organization structure. New leadership has implemented enhanced security protocols.',
    'Technical analysis of intercepted communications reveals coordination between multiple threat actors. Pattern analysis suggests imminent operational activity.',
    'Surveillance operations have identified key nodes in target network. Recommendations for expanded collection follow.',
    'After-action review identifies lessons learned and areas for improvement in operational tradecraft.',
  ];
  return rng.pick(summaries);
}

function generateDocumentContent() {
  return `[DOCUMENT CONTENT]

1. EXECUTIVE SUMMARY
${generateParagraph()}

2. BACKGROUND
${generateParagraph()}
${generateParagraph()}

3. KEY FINDINGS
${generateParagraph()}
${generateParagraph()}

4. ANALYSIS
${generateParagraph()}
${generateParagraph()}
${generateParagraph()}

5. IMPLICATIONS
${generateParagraph()}

6. RECOMMENDATIONS
${generateParagraph()}

7. SOURCES
[REDACTED] - Multiple intelligence sources
[REDACTED] - SIGINT collection
[REDACTED] - HUMINT reporting
`;
}

function generateParagraph() {
  const sentences = [
    'Intelligence indicates sustained operational activity in the region.',
    'Multiple sources corroborate the assessment with high confidence.',
    'Pattern analysis reveals coordination between previously unconnected entities.',
    'Technical indicators suggest advanced capabilities beyond previous estimates.',
    'Counterintelligence considerations require enhanced operational security.',
    'Regional dynamics continue to evolve in response to external pressures.',
    'Strategic implications extend beyond the immediate area of concern.',
    'Resource allocation patterns indicate prioritization of key objectives.',
    'Communication intercepts provide insight into command decision-making.',
    'Human intelligence complements technical collection in this assessment.',
  ];
  return rng.shuffle(sentences).slice(0, rng.nextInt(3, 6)).join(' ');
}

export function generateInfluenceOperation() {
  const platforms = ['Twitter/X', 'Facebook', 'Telegram', 'TikTok', 'YouTube', 'Reddit', 'WeChat', 'VKontakte'];
  const narratives = [
    'Election interference campaign',
    'Political destabilization',
    'Social division amplification',
    'Disinformation about health',
    'Economic panic induction',
    'Military capability misinformation',
    'Alliance disruption narrative',
    'Conspiracy theory propagation',
  ];

  const actor = rng.pick(THREAT_ACTORS.filter(a => a.focus.includes('influence')));

  return {
    id: generateId('influence'),
    name: `Campaign ${generateCodeName()}`,
    actor: actor,
    narrative: rng.pick(narratives),
    platforms: rng.shuffle(platforms).slice(0, rng.nextInt(2, 5)),
    status: rng.pick(['active', 'dormant', 'emerging', 'declining', 'countered']),
    startDate: generateTimestamp(180),
    reachEstimate: rng.nextInt(10000, 50000000),
    accountsIdentified: rng.nextInt(50, 10000),
    engagementRate: (rng.next() * 10).toFixed(2) + '%',
    targetAudience: rng.pick(['general public', 'political right', 'political left', 'military families', 'youth', 'minorities']),
    targetRegions: rng.shuffle(COUNTRIES.filter(c => c.threatLevel === 'low')).slice(0, rng.nextInt(1, 4)),
    sentimentTrend: generateSentimentTrend(),
    propagationMap: generatePropagationMap(),
    psychologicalProfile: generateInfluenceProfile(),
    counterMeasures: generateCounterMeasures(),
    linguisticPatterns: generateLinguisticPatterns(),
  };
}

function generateSentimentTrend() {
  return Array(30).fill(0).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    positive: rng.nextInt(10, 40),
    negative: rng.nextInt(20, 60),
    neutral: rng.nextInt(20, 50),
    volume: rng.nextInt(1000, 100000),
  }));
}

function generatePropagationMap() {
  return Array(rng.nextInt(5, 15)).fill(0).map(() => ({
    origin: rng.pick(CITIES),
    reach: rng.nextInt(1000, 1000000),
    velocity: rng.nextInt(100, 10000) + '/hour',
    peakTime: generateTimestamp(7),
  }));
}

function generateInfluenceProfile() {
  return {
    primaryEmotion: rng.pick(['fear', 'anger', 'outrage', 'distrust', 'confusion']),
    targetBeliefs: rng.shuffle(['institutional trust', 'media credibility', 'political allegiance', 'social cohesion']).slice(0, 2),
    techniques: rng.shuffle(['bot amplification', 'sockpuppets', 'hashtag hijacking', 'coordinated inauthentic behavior', 'deepfakes', 'selective editing']).slice(0, rng.nextInt(2, 4)),
    sophistication: rng.pick(['basic', 'intermediate', 'advanced', 'state-level']),
  };
}

function generateCounterMeasures() {
  return [
    { action: 'Account suspension requests', status: rng.pick(['pending', 'partial', 'complete']), effectiveness: rng.nextInt(20, 80) + '%' },
    { action: 'Counter-narrative deployment', status: rng.pick(['pending', 'active', 'complete']), effectiveness: rng.nextInt(10, 60) + '%' },
    { action: 'Attribution publication', status: rng.pick(['pending', 'active', 'complete']), effectiveness: rng.nextInt(30, 70) + '%' },
    { action: 'Platform coordination', status: rng.pick(['pending', 'active', 'complete']), effectiveness: rng.nextInt(40, 90) + '%' },
  ];
}

function generateLinguisticPatterns() {
  return {
    primaryLanguages: rng.shuffle(['English', 'Russian', 'Chinese', 'Arabic', 'Spanish', 'Farsi']).slice(0, rng.nextInt(1, 3)),
    grammarAnomalies: rng.nextInt(0, 50),
    vocabularyFingerprint: `LANG-${rng.nextInt(1000, 9999)}`,
    automationIndicators: rng.nextInt(10, 90) + '%',
  };
}

export function generateInfrastructureIncident() {
  const sectors = [
    { name: 'Power Grid', criticality: 'critical', icon: 'Zap' },
    { name: 'Water Systems', criticality: 'critical', icon: 'Droplet' },
    { name: 'Telecommunications', criticality: 'high', icon: 'Radio' },
    { name: 'Transportation', criticality: 'high', icon: 'Truck' },
    { name: 'Financial Systems', criticality: 'critical', icon: 'DollarSign' },
    { name: 'Healthcare', criticality: 'critical', icon: 'Heart' },
    { name: 'Government Facilities', criticality: 'high', icon: 'Building' },
    { name: 'Nuclear Facilities', criticality: 'critical', icon: 'Radiation' },
  ];

  const incidentTypes = [
    'Cyber Intrusion',
    'Physical Breach',
    'System Failure',
    'Sabotage Suspected',
    'Anomalous Activity',
    'Environmental Event',
    'Supply Chain Disruption',
    'Personnel Incident',
  ];

  const sector = rng.pick(sectors);
  const city = rng.pick(CITIES.filter(c => ['US', 'GB', 'DE', 'FR', 'JP'].includes(c.country)));

  return {
    id: generateId('incident'),
    type: rng.pick(incidentTypes),
    sector: sector,
    facility: `${city.name} ${sector.name} Facility ${rng.nextInt(1, 20)}`,
    location: city,
    severity: rng.pick(['critical', 'high', 'medium', 'low']),
    status: rng.pick(['active', 'contained', 'resolved', 'investigating', 'monitoring']),
    timestamp: generateTimestamp(48),
    classification: generateClassification(),
    affectedPopulation: rng.nextInt(1000, 5000000),
    systemStatus: generateSystemStatus(),
    sensorReadings: generateSensorReadings(),
    forensicAnalysis: generateForensicAnalysis(),
    emergencyResponse: generateEmergencyResponse(),
    cascadingRisks: generateCascadingRisks(),
    timeline: generateIncidentTimeline(),
  };
}

function generateSystemStatus() {
  return {
    primarySystems: rng.pick(['operational', 'degraded', 'failed', 'isolated']),
    backupSystems: rng.pick(['operational', 'standby', 'activated', 'failed']),
    redundancy: rng.nextInt(0, 100) + '%',
    capacityUtilization: rng.nextInt(20, 100) + '%',
    lastMaintenance: generateTimestamp(90),
  };
}

function generateSensorReadings() {
  return Array(10).fill(0).map((_, i) => ({
    sensor: `SENSOR-${String(i + 1).padStart(3, '0')}`,
    type: rng.pick(['temperature', 'pressure', 'flow', 'voltage', 'radiation', 'vibration']),
    value: rng.nextInt(0, 1000),
    unit: rng.pick(['C', 'PSI', 'L/s', 'V', 'mSv', 'Hz']),
    status: rng.pick(['normal', 'warning', 'critical', 'offline']),
    trend: rng.pick(['rising', 'stable', 'falling']),
  }));
}

function generateForensicAnalysis() {
  return {
    sabotageIndicators: rng.nextInt(0, 100),
    naturalCauseIndicators: rng.nextInt(0, 100),
    cyberAttackIndicators: rng.nextInt(0, 100),
    equipmentFailureIndicators: rng.nextInt(0, 100),
    confidenceLevel: rng.pick(['low', 'medium', 'high', 'very high']),
    preliminaryFindings: rng.pick([
      'Evidence suggests coordinated cyber-physical attack vector',
      'Initial analysis indicates equipment failure as primary cause',
      'Investigation ongoing, multiple scenarios under consideration',
      'Forensic evidence points to insider threat involvement',
    ]),
  };
}

function generateEmergencyResponse() {
  return {
    alertLevel: rng.pick(['DEFCON 5', 'DEFCON 4', 'DEFCON 3', 'DEFCON 2', 'DEFCON 1']),
    responders: rng.nextInt(10, 500),
    evacuationStatus: rng.pick(['not required', 'partial', 'complete', 'in progress']),
    medicalCasualties: rng.nextInt(0, 50),
    estimatedRestoration: rng.nextInt(1, 72) + ' hours',
    resourcesDeployed: rng.shuffle(['FEMA', 'National Guard', 'Local PD', 'FBI', 'DHS', 'CDC']).slice(0, rng.nextInt(2, 5)),
  };
}

function generateCascadingRisks() {
  return [
    { system: 'Dependent Facilities', risk: rng.nextInt(10, 90), status: rng.pick(['monitoring', 'at risk', 'impacted']) },
    { system: 'Regional Grid', risk: rng.nextInt(10, 90), status: rng.pick(['monitoring', 'at risk', 'impacted']) },
    { system: 'Emergency Services', risk: rng.nextInt(10, 90), status: rng.pick(['monitoring', 'at risk', 'impacted']) },
    { system: 'Public Safety', risk: rng.nextInt(10, 90), status: rng.pick(['monitoring', 'at risk', 'impacted']) },
  ];
}

function generateIncidentTimeline() {
  const events = [
    'Initial anomaly detected',
    'Automated alerts triggered',
    'Human verification initiated',
    'Incident declared',
    'Response teams deployed',
    'Containment measures activated',
    'Investigation commenced',
    'Public notification issued',
  ];
  return events.slice(0, rng.nextInt(3, events.length)).map((event, i) => ({
    time: new Date(Date.now() - (events.length - i) * 1800000),
    event,
    actor: rng.pick(['automated', 'operator', 'supervisor', 'command']),
  }));
}

// ==================== BATCH GENERATORS ====================

export function generateInitialData() {
  return {
    threats: Array(50).fill(0).map(() => generateThreat()),
    operations: Array(30).fill(0).map(() => generateOperation()),
    intercepts: Array(100).fill(0).map(() => generateIntercept()),
    cyberEvents: Array(40).fill(0).map(() => generateCyberEvent()),
    assets: Array(80).fill(0).map(() => generateAsset()),
    documents: Array(60).fill(0).map(() => generateDocument()),
    influenceOps: Array(20).fill(0).map(() => generateInfluenceOperation()),
    incidents: Array(25).fill(0).map(() => generateInfrastructureIncident()),
  };
}

export function generateEvent() {
  const eventTypes = ['threat', 'intercept', 'cyberEvent', 'incident', 'influenceUpdate'];
  const type = rng.pick(eventTypes);

  switch (type) {
    case 'threat':
      return { type: 'NEW_THREAT', data: generateThreat() };
    case 'intercept':
      return { type: 'NEW_INTERCEPT', data: generateIntercept() };
    case 'cyberEvent':
      return { type: 'NEW_CYBER_EVENT', data: generateCyberEvent() };
    case 'incident':
      return { type: 'NEW_INCIDENT', data: generateInfrastructureIncident() };
    case 'influenceUpdate':
      return { type: 'INFLUENCE_UPDATE', data: { id: generateId('influence'), change: rng.pick(['escalation', 'decline', 'new_platform', 'countered']) } };
    default:
      return null;
  }
}

export { SeededRandom };
