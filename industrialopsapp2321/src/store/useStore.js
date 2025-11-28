import { create } from 'zustand';
import { plants, generateMachines, generateProcessLines, generateEnergyData, generateQualityData, generateMaintenanceData, generateKPIData, generateAlerts } from '../utils/mockData';

const allMachines = plants.flatMap(plant => generateMachines(plant.id));
const allProcessLines = plants.flatMap(plant => generateProcessLines(plant.id));

export const useStore = create((set, get) => ({
  theme: 'dark',
  selectedPlant: null,
  selectedMachine: null,
  selectedLine: null,

  plants,
  machines: allMachines,
  processLines: allProcessLines,
  energyData: plants.reduce((acc, plant) => {
    acc[plant.id] = generateEnergyData(plant.id);
    return acc;
  }, {}),
  qualityData: plants.reduce((acc, plant) => {
    acc[plant.id] = generateQualityData(plant.id, 500);
    return acc;
  }, {}),
  maintenanceData: generateMaintenanceData(allMachines),
  kpiData: generateKPIData(),
  alerts: generateAlerts(plants, allMachines),

  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark'
  })),

  setSelectedPlant: (plantId) => set({
    selectedPlant: plantId,
    selectedMachine: null,
    selectedLine: null
  }),

  setSelectedMachine: (machineId) => set({ selectedMachine: machineId }),

  setSelectedLine: (lineId) => set({ selectedLine: lineId }),

  getMachinesByPlant: (plantId) => {
    return get().machines.filter(m => m.plantId === plantId);
  },

  getLinesByPlant: (plantId) => {
    return get().processLines.filter(l => l.plantId === plantId);
  },

  getAlertsByPlant: (plantId) => {
    return get().alerts.filter(a => a.plantId === plantId);
  },

  updateMachineData: (machineId, data) => set((state) => ({
    machines: state.machines.map(m =>
      m.id === machineId ? { ...m, ...data } : m
    )
  })),

  updateLineData: (lineId, data) => set((state) => ({
    processLines: state.processLines.map(l =>
      l.id === lineId ? { ...l, ...data } : l
    )
  })),

  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    )
  })),

  refreshKPIData: () => set({ kpiData: generateKPIData() })
}));
