import bcrypt from 'bcryptjs'

// Default users for demo
export const users = [
  {
    id: 1,
    username: 'operator',
    password: bcrypt.hashSync('operator123', 10),
    role: 'operator',
    name: 'John Operator',
    email: 'operator@plant.com',
  },
  {
    id: 2,
    username: 'engineer',
    password: bcrypt.hashSync('engineer123', 10),
    role: 'process_engineer',
    name: 'Sarah Engineer',
    email: 'engineer@plant.com',
  },
  {
    id: 3,
    username: 'quality',
    password: bcrypt.hashSync('quality123', 10),
    role: 'quality_engineer',
    name: 'Mike Quality',
    email: 'quality@plant.com',
  },
]

// Mock heat data
export let heats = []
let heatIdCounter = 1

// Generate sample heat data
export const generateSampleHeats = (count = 100) => {
  const sampleHeats = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 30 * 60 * 1000) // 30 min intervals

    sampleHeats.push({
      id: heatIdCounter++,
      heatNumber: `BOF-${String(heatIdCounter).padStart(6, '0')}`,
      timestamp: timestamp.toISOString(),
      temperature: 1650 + (Math.random() - 0.5) * 60,
      carbonContent: 0.08 + (Math.random() - 0.5) * 0.04,
      oxygenLevel: 99.5 + (Math.random() - 0.5) * 0.5,
      slagBasicity: 3.2 + (Math.random() - 0.5) * 0.4,
      phosphorus: 0.015 + (Math.random() - 0.5) * 0.01,
      sulfur: 0.010 + (Math.random() - 0.5) * 0.006,
      manganese: 0.80 + (Math.random() - 0.5) * 0.2,
      blowTime: 18 + (Math.random() - 0.5) * 4,
      oxygenFlow: 450 + (Math.random() - 0.5) * 60,
      slagWeight: 5000 + (Math.random() - 0.5) * 1000,
      operatorId: Math.floor(Math.random() * 3) + 1,
      status: 'completed',
      notes: '',
    })
  }

  heats = sampleHeats
  return sampleHeats
}

// Initialize with sample data
generateSampleHeats(100)

export const addHeat = (heatData) => {
  const newHeat = {
    id: heatIdCounter++,
    ...heatData,
    timestamp: new Date().toISOString(),
    status: 'completed',
  }
  heats.unshift(newHeat)
  return newHeat
}

export const getHeats = (limit = 100, offset = 0) => {
  return heats.slice(offset, offset + limit)
}

export const getHeatById = (id) => {
  return heats.find((h) => h.id === parseInt(id))
}

export const updateHeat = (id, updates) => {
  const index = heats.findIndex((h) => h.id === parseInt(id))
  if (index !== -1) {
    heats[index] = { ...heats[index], ...updates }
    return heats[index]
  }
  return null
}

export const deleteHeat = (id) => {
  const index = heats.findIndex((h) => h.id === parseInt(id))
  if (index !== -1) {
    heats.splice(index, 1)
    return true
  }
  return false
}
