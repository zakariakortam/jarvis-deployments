class PatientDataGenerator {
    constructor() {
        this.patients = this.generateInitialPatients();
        this.vitalHistory = new Map();
        this.medicationData = this.generateMedicationData();
        this.costData = this.generateCostData();
        this.dataPointCount = 0;
        
        this.initializeVitalHistory();
        this.startDataGeneration();
    }

    generateInitialPatients() {
        const firstNames = ['Hiroshi', 'Yuki', 'Akira', 'Mei', 'Takeshi', 'Sakura', 'Kenji', 'Nana', 'Ryo', 'Emi', 'Daichi', 'Yui'];
        const lastNames = ['Tanaka', 'Suzuki', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi'];
        const statuses = ['critical', 'stable', 'recovery'];
        
        const patients = [];
        
        for (let i = 1; i <= 12; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            const patient = {
                id: `P${String(i).padStart(3, '0')}`,
                name: `${firstName} ${lastName}`,
                age: Math.floor(Math.random() * 60) + 20,
                status: status,
                heartRate: this.generateVitalValue('heartRate', status),
                oxygen: this.generateVitalValue('oxygen', status),
                temperature: this.generateVitalValue('temperature', status),
                bloodPressure: this.generateBloodPressure(status),
                cost: Math.floor(Math.random() * 500000) + 50000,
                admissionDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
                room: `${Math.floor(Math.random() * 5) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`
            };
            
            patients.push(patient);
        }
        
        return patients;
    }

    generateVitalValue(type, status) {
        const ranges = {
            heartRate: {
                critical: [45, 55, 140, 160],
                stable: [60, 100],
                recovery: [65, 85]
            },
            oxygen: {
                critical: [85, 92],
                stable: [95, 100],
                recovery: [93, 98]
            },
            temperature: {
                critical: [35.0, 35.5, 38.5, 40.0],
                stable: [36.0, 37.2],
                recovery: [36.2, 37.0]
            }
        };

        const range = ranges[type][status];
        
        if (status === 'critical' && range.length === 4) {
            // Critical patients can have values in danger zones
            const useHighRange = Math.random() > 0.5;
            const min = useHighRange ? range[2] : range[0];
            const max = useHighRange ? range[3] : range[1];
            return Math.random() * (max - min) + min;
        } else {
            const min = range[0];
            const max = range[1];
            return Math.random() * (max - min) + min;
        }
    }

    generateBloodPressure(status) {
        const ranges = {
            critical: { systolic: [90, 110, 160, 180], diastolic: [50, 65, 100, 120] },
            stable: { systolic: [110, 140], diastolic: [70, 90] },
            recovery: { systolic: [115, 130], diastolic: [75, 85] }
        };

        const range = ranges[status];
        
        let systolic, diastolic;
        
        if (status === 'critical') {
            const useHighRange = Math.random() > 0.5;
            systolic = useHighRange ? 
                Math.random() * (range.systolic[3] - range.systolic[2]) + range.systolic[2] :
                Math.random() * (range.systolic[1] - range.systolic[0]) + range.systolic[0];
            diastolic = useHighRange ?
                Math.random() * (range.diastolic[3] - range.diastolic[2]) + range.diastolic[2] :
                Math.random() * (range.diastolic[1] - range.diastolic[0]) + range.diastolic[0];
        } else {
            systolic = Math.random() * (range.systolic[1] - range.systolic[0]) + range.systolic[0];
            diastolic = Math.random() * (range.diastolic[1] - range.diastolic[0]) + range.diastolic[0];
        }

        return `${Math.round(systolic)}/${Math.round(diastolic)}`;
    }

    generateMedicationData() {
        return {
            antibiotics: Math.floor(Math.random() * 30) + 20,
            painkillers: Math.floor(Math.random() * 25) + 15,
            cardiacMeds: Math.floor(Math.random() * 20) + 10,
            respiratoryMeds: Math.floor(Math.random() * 15) + 5,
            supplements: Math.floor(Math.random() * 35) + 25,
            other: Math.floor(Math.random() * 10) + 5
        };
    }

    generateCostData() {
        const today = new Date();
        const costs = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            costs.push({
                date: date,
                amount: Math.floor(Math.random() * 500000) + 800000
            });
        }
        
        return costs;
    }

    initializeVitalHistory() {
        const now = new Date();
        
        // Generate 24 hours of historical data
        for (let i = 0; i < 144; i++) { // Every 10 minutes for 24 hours
            const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
            
            if (!this.vitalHistory.has(timestamp.getTime())) {
                this.vitalHistory.set(timestamp.getTime(), {
                    heartRate: this.calculateAverageVital('heartRate'),
                    oxygen: this.calculateAverageVital('oxygen'),
                    temperature: this.calculateAverageVital('temperature'),
                    bloodPressureSystolic: this.calculateAverageBloodPressure('systolic'),
                    bloodPressureDiastolic: this.calculateAverageBloodPressure('diastolic')
                });
            }
        }
    }

    calculateAverageVital(type) {
        const values = this.patients.map(p => {
            if (type === 'heartRate') return parseFloat(p.heartRate);
            if (type === 'oxygen') return parseFloat(p.oxygen);
            if (type === 'temperature') return parseFloat(p.temperature);
        });
        
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateAverageBloodPressure(type) {
        const values = this.patients.map(p => {
            const [systolic, diastolic] = p.bloodPressure.split('/').map(parseFloat);
            return type === 'systolic' ? systolic : diastolic;
        });
        
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    updatePatientData() {
        this.patients.forEach(patient => {
            // Update vitals with realistic variations
            patient.heartRate = this.updateVital(patient.heartRate, 'heartRate', patient.status);
            patient.oxygen = this.updateVital(patient.oxygen, 'oxygen', patient.status);
            patient.temperature = this.updateVital(patient.temperature, 'temperature', patient.status);
            patient.bloodPressure = this.updateBloodPressure(patient.bloodPressure, patient.status);
            
            // Occasionally update status
            if (Math.random() < 0.01) { // 1% chance per update
                const statuses = ['critical', 'stable', 'recovery'];
                patient.status = statuses[Math.floor(Math.random() * statuses.length)];
            }
        });
        
        this.dataPointCount++;
        this.updateVitalHistory();
        this.updateMedicationData();
        this.updateCostData();
    }

    updateVital(currentValue, type, status) {
        const variation = {
            heartRate: 3,
            oxygen: 1,
            temperature: 0.2
        };

        const change = (Math.random() - 0.5) * 2 * variation[type];
        let newValue = currentValue + change;
        
        // Apply status-based constraints
        const constraints = {
            heartRate: { min: 30, max: 200 },
            oxygen: { min: 70, max: 100 },
            temperature: { min: 34.0, max: 42.0 }
        };

        newValue = Math.max(constraints[type].min, Math.min(constraints[type].max, newValue));
        
        return parseFloat(newValue.toFixed(type === 'temperature' ? 1 : 0));
    }

    updateBloodPressure(currentBP, status) {
        const [currentSystolic, currentDiastolic] = currentBP.split('/').map(parseFloat);
        
        const systolicChange = (Math.random() - 0.5) * 10;
        const diastolicChange = (Math.random() - 0.5) * 6;
        
        let newSystolic = currentSystolic + systolicChange;
        let newDiastolic = currentDiastolic + diastolicChange;
        
        newSystolic = Math.max(70, Math.min(220, newSystolic));
        newDiastolic = Math.max(40, Math.min(140, newDiastolic));
        
        return `${Math.round(newSystolic)}/${Math.round(newDiastolic)}`;
    }

    updateVitalHistory() {
        const now = new Date();
        
        this.vitalHistory.set(now.getTime(), {
            heartRate: this.calculateAverageVital('heartRate'),
            oxygen: this.calculateAverageVital('oxygen'),
            temperature: this.calculateAverageVital('temperature'),
            bloodPressureSystolic: this.calculateAverageBloodPressure('systolic'),
            bloodPressureDiastolic: this.calculateAverageBloodPressure('diastolic')
        });

        // Keep only last 24 hours
        const cutoff = now.getTime() - (24 * 60 * 60 * 1000);
        for (const [timestamp] of this.vitalHistory) {
            if (timestamp < cutoff) {
                this.vitalHistory.delete(timestamp);
            }
        }
    }

    updateMedicationData() {
        if (Math.random() < 0.1) { // 10% chance to update medication data
            Object.keys(this.medicationData).forEach(med => {
                const change = Math.floor((Math.random() - 0.5) * 4);
                this.medicationData[med] = Math.max(0, this.medicationData[med] + change);
            });
        }
    }

    updateCostData() {
        if (Math.random() < 0.05) { // 5% chance to add new cost data
            const today = new Date();
            const existingToday = this.costData.find(c => 
                c.date.toDateString() === today.toDateString()
            );
            
            if (!existingToday) {
                this.costData.push({
                    date: new Date(today),
                    amount: Math.floor(Math.random() * 500000) + 800000
                });
                
                // Keep only last 7 days
                if (this.costData.length > 7) {
                    this.costData.shift();
                }
            }
        }
    }

    startDataGeneration() {
        setInterval(() => {
            this.updatePatientData();
        }, 2000); // Update every 2 seconds for impressive real-time effect
    }

    getPatients() {
        return this.patients;
    }

    getVitalHistory(timeRange = '24h') {
        const now = new Date();
        let cutoff;
        
        switch(timeRange) {
            case '1h':
                cutoff = now.getTime() - (60 * 60 * 1000);
                break;
            case '6h':
                cutoff = now.getTime() - (6 * 60 * 60 * 1000);
                break;
            case '24h':
            default:
                cutoff = now.getTime() - (24 * 60 * 60 * 1000);
                break;
        }

        const filteredHistory = new Map();
        for (const [timestamp, data] of this.vitalHistory) {
            if (timestamp >= cutoff) {
                filteredHistory.set(timestamp, data);
            }
        }

        return filteredHistory;
    }

    getMedicationData() {
        return this.medicationData;
    }

    getCostData() {
        return this.costData;
    }

    getDataPointCount() {
        return this.dataPointCount;
    }

    getAverageVitals() {
        return {
            heartRate: this.calculateAverageVital('heartRate'),
            oxygen: this.calculateAverageVital('oxygen'),
            temperature: this.calculateAverageVital('temperature'),
            bloodPressure: this.getAverageBloodPressure()
        };
    }

    getAverageBloodPressure() {
        const systolic = this.calculateAverageBloodPressure('systolic');
        const diastolic = this.calculateAverageBloodPressure('diastolic');
        return `${Math.round(systolic)}/${Math.round(diastolic)}`;
    }

    getStatusCounts() {
        const counts = { critical: 0, stable: 0, recovery: 0 };
        this.patients.forEach(patient => {
            counts[patient.status]++;
        });
        return counts;
    }

    getDailyCost() {
        return this.patients.reduce((sum, patient) => sum + patient.cost, 0);
    }

    getMonthlyEstimate() {
        return this.getDailyCost() * 30;
    }

    getAverageCostPerPatient() {
        return Math.round(this.getDailyCost() / this.patients.length);
    }
}

// Initialize the data generator
window.dataGenerator = new PatientDataGenerator();