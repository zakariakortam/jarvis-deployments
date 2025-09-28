// Data Generator for Clinical Trial Monitoring Platform

class ClinicalTrialDataGenerator {
    constructor() {
        this.patients = [];
        this.sites = [];
        this.sideEffects = [];
        this.labResults = [];
        this.costs = [];
        this.enrollmentData = [];
        
        // Configuration
        this.config = {
            numSites: 50,
            patientsPerSite: { min: 20, max: 100 },
            updateInterval: 100, // ms
            enrollmentRate: 0.02, // 2% chance per update
            sideEffectRate: 0.005, // 0.5% chance per patient per update
            labUpdateRate: 0.01, // 1% chance per patient per update
            costUpdateRate: 0.001 // 0.1% chance per site per update
        };
        
        // Common side effects for simulation
        this.sideEffectTypes = [
            { name: 'Headache', severity: 'mild' },
            { name: 'Nausea', severity: 'mild' },
            { name: 'Fatigue', severity: 'mild' },
            { name: 'Dizziness', severity: 'moderate' },
            { name: 'Insomnia', severity: 'mild' },
            { name: 'Rash', severity: 'moderate' },
            { name: 'Abdominal Pain', severity: 'moderate' },
            { name: 'Joint Pain', severity: 'moderate' },
            { name: 'Fever', severity: 'severe' },
            { name: 'Allergic Reaction', severity: 'severe' }
        ];
        
        // Lab test types
        this.labTestTypes = [
            'Complete Blood Count',
            'Liver Function',
            'Kidney Function',
            'Glucose Level',
            'Lipid Panel',
            'Thyroid Function',
            'Electrolyte Panel',
            'Cardiac Markers'
        ];
        
        // Generate initial data
        this.generateInitialData();
    }
    
    generateInitialData() {
        // Generate sites
        for (let i = 0; i < this.config.numSites; i++) {
            const site = this.generateSite(i);
            this.sites.push(site);
            
            // Generate patients for each site
            const numPatients = this.randomBetween(
                this.config.patientsPerSite.min,
                this.config.patientsPerSite.max
            );
            
            for (let j = 0; j < numPatients; j++) {
                const patient = this.generatePatient(site.id, this.patients.length);
                this.patients.push(patient);
                
                // Generate initial lab results
                this.generateInitialLabResults(patient.id);
                
                // Initial enrollment data point
                if (patient.status === 'enrolled' || patient.status === 'active') {
                    this.enrollmentData.push({
                        timestamp: patient.enrollDate,
                        total: this.patients.filter(p => 
                            p.enrollDate <= patient.enrollDate && 
                            (p.status === 'enrolled' || p.status === 'active')
                        ).length
                    });
                }
            }
            
            // Generate initial cost data
            this.generateInitialCosts(site.id);
        }
        
        // Sort enrollment data by timestamp
        this.enrollmentData.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    generateSite(index) {
        const cities = [
            { name: 'New York, NY', region: 'Northeast' },
            { name: 'Los Angeles, CA', region: 'West' },
            { name: 'Chicago, IL', region: 'Midwest' },
            { name: 'Houston, TX', region: 'South' },
            { name: 'Phoenix, AZ', region: 'West' },
            { name: 'Philadelphia, PA', region: 'Northeast' },
            { name: 'San Antonio, TX', region: 'South' },
            { name: 'San Diego, CA', region: 'West' },
            { name: 'Dallas, TX', region: 'South' },
            { name: 'San Jose, CA', region: 'West' },
            { name: 'Austin, TX', region: 'South' },
            { name: 'Jacksonville, FL', region: 'South' },
            { name: 'Boston, MA', region: 'Northeast' },
            { name: 'Denver, CO', region: 'West' },
            { name: 'Seattle, WA', region: 'West' },
            { name: 'Atlanta, GA', region: 'South' },
            { name: 'Miami, FL', region: 'South' },
            { name: 'Portland, OR', region: 'West' },
            { name: 'Minneapolis, MN', region: 'Midwest' },
            { name: 'Detroit, MI', region: 'Midwest' }
        ];
        
        const city = cities[index % cities.length];
        const siteNumber = Math.floor(index / cities.length) + 1;
        
        return {
            id: `SITE-${String(index + 1).padStart(3, '0')}`,
            name: `${city.name} Medical Center ${siteNumber > 1 ? siteNumber : ''}`,
            location: city.name,
            region: city.region,
            enrolled: 0,
            target: this.randomBetween(50, 150),
            performanceScore: this.randomBetween(70, 100),
            qualityScore: this.randomBetween(75, 100),
            monthlyCost: this.randomBetween(50000, 200000),
            active: true,
            startDate: new Date(Date.now() - this.randomBetween(180, 365) * 24 * 60 * 60 * 1000)
        };
    }
    
    generatePatient(siteId, index) {
        const genders = ['Male', 'Female', 'Other'];
        const statuses = ['enrolled', 'active', 'completed', 'withdrawn'];
        const statusWeights = [0.2, 0.5, 0.2, 0.1];
        
        const enrollDate = new Date(Date.now() - this.randomBetween(1, 180) * 24 * 60 * 60 * 1000);
        const status = this.weightedRandom(statuses, statusWeights);
        
        return {
            id: `PT-${String(index + 1).padStart(5, '0')}`,
            siteId: siteId,
            age: this.randomBetween(18, 85),
            gender: genders[Math.floor(Math.random() * genders.length)],
            enrollDate: enrollDate,
            status: status,
            compliance: status === 'active' ? this.randomBetween(70, 100) : 
                       status === 'completed' ? this.randomBetween(80, 100) : 
                       this.randomBetween(40, 80),
            sideEffects: [],
            labResults: [],
            dosesReceived: status === 'active' ? this.randomBetween(1, 20) : 
                          status === 'completed' ? this.randomBetween(20, 30) : 
                          this.randomBetween(0, 15),
            dosesScheduled: 30,
            lastVisit: new Date(Date.now() - this.randomBetween(1, 30) * 24 * 60 * 60 * 1000),
            nextVisit: status === 'active' ? 
                      new Date(Date.now() + this.randomBetween(1, 30) * 24 * 60 * 60 * 1000) : null
        };
    }
    
    generateInitialLabResults(patientId) {
        const numResults = this.randomBetween(3, 8);
        for (let i = 0; i < numResults; i++) {
            const result = {
                patientId: patientId,
                testType: this.labTestTypes[Math.floor(Math.random() * this.labTestTypes.length)],
                value: this.randomBetween(50, 150),
                unit: 'mg/dL',
                normal: Math.random() > 0.2,
                timestamp: new Date(Date.now() - this.randomBetween(1, 90) * 24 * 60 * 60 * 1000)
            };
            this.labResults.push(result);
        }
    }
    
    generateInitialCosts(siteId) {
        const months = 6;
        for (let i = 0; i < months; i++) {
            const cost = {
                siteId: siteId,
                amount: this.randomBetween(40000, 250000),
                category: this.weightedRandom(
                    ['Personnel', 'Equipment', 'Supplies', 'Administrative', 'Other'],
                    [0.4, 0.2, 0.2, 0.15, 0.05]
                ),
                timestamp: new Date(Date.now() - (months - i) * 30 * 24 * 60 * 60 * 1000)
            };
            this.costs.push(cost);
        }
    }
    
    // Real-time data generation methods
    generateRealtimeUpdates() {
        const updates = {
            newEnrollments: [],
            sideEffects: [],
            labResults: [],
            costs: [],
            patientStatusChanges: [],
            siteUpdates: []
        };
        
        // Check for new enrollments
        if (Math.random() < this.config.enrollmentRate) {
            const site = this.sites[Math.floor(Math.random() * this.sites.length)];
            if (site.enrolled < site.target) {
                const patient = this.generatePatient(site.id, this.patients.length);
                patient.status = 'enrolled';
                patient.enrollDate = new Date();
                this.patients.push(patient);
                site.enrolled++;
                updates.newEnrollments.push(patient);
                
                this.enrollmentData.push({
                    timestamp: patient.enrollDate,
                    total: this.patients.filter(p => 
                        p.status === 'enrolled' || p.status === 'active'
                    ).length
                });
            }
        }
        
        // Generate side effects
        const activePatientsSubset = this.patients
            .filter(p => p.status === 'active')
            .slice(0, Math.min(100, this.patients.length)); // Sample for performance
            
        activePatientsSubset.forEach(patient => {
            if (Math.random() < this.config.sideEffectRate) {
                const sideEffect = {
                    patientId: patient.id,
                    ...this.sideEffectTypes[Math.floor(Math.random() * this.sideEffectTypes.length)],
                    reportDate: new Date(),
                    resolved: false
                };
                this.sideEffects.push(sideEffect);
                patient.sideEffects.push(sideEffect);
                updates.sideEffects.push(sideEffect);
            }
        });
        
        // Generate lab results
        activePatientsSubset.forEach(patient => {
            if (Math.random() < this.config.labUpdateRate) {
                const result = {
                    patientId: patient.id,
                    testType: this.labTestTypes[Math.floor(Math.random() * this.labTestTypes.length)],
                    value: this.randomBetween(50, 150),
                    unit: 'mg/dL',
                    normal: Math.random() > 0.2,
                    timestamp: new Date()
                };
                this.labResults.push(result);
                updates.labResults.push(result);
            }
        });
        
        // Update patient statuses
        this.patients.forEach(patient => {
            if (patient.status === 'enrolled' && Math.random() < 0.01) {
                patient.status = 'active';
                patient.dosesReceived = 1;
                updates.patientStatusChanges.push(patient);
            } else if (patient.status === 'active') {
                // Update compliance
                patient.compliance = Math.max(0, Math.min(100, 
                    patient.compliance + this.randomBetween(-5, 5)));
                
                // Check for dose updates
                if (Math.random() < 0.05) {
                    patient.dosesReceived = Math.min(patient.dosesScheduled, 
                        patient.dosesReceived + 1);
                    
                    // Check for completion
                    if (patient.dosesReceived >= patient.dosesScheduled) {
                        patient.status = 'completed';
                        updates.patientStatusChanges.push(patient);
                    }
                }
                
                // Small chance of withdrawal
                if (Math.random() < 0.0005) {
                    patient.status = 'withdrawn';
                    updates.patientStatusChanges.push(patient);
                }
            }
        });
        
        // Update costs
        this.sites.forEach(site => {
            if (Math.random() < this.config.costUpdateRate) {
                const cost = {
                    siteId: site.id,
                    amount: this.randomBetween(1000, 50000),
                    category: this.weightedRandom(
                        ['Personnel', 'Equipment', 'Supplies', 'Administrative', 'Other'],
                        [0.4, 0.2, 0.2, 0.15, 0.05]
                    ),
                    timestamp: new Date()
                };
                this.costs.push(cost);
                updates.costs.push(cost);
                
                // Update site monthly cost
                site.monthlyCost = Math.round(site.monthlyCost * 0.95 + cost.amount * 0.05);
            }
            
            // Update site performance metrics
            site.performanceScore = Math.max(0, Math.min(100,
                site.performanceScore + this.randomBetween(-2, 2)));
            site.qualityScore = Math.max(0, Math.min(100,
                site.qualityScore + this.randomBetween(-1, 1)));
        });
        
        return updates;
    }
    
    // Utility methods
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }
    
    // Data access methods
    getPatientsByStatus(status) {
        return this.patients.filter(p => p.status === status);
    }
    
    getPatientsBySite(siteId) {
        return this.patients.filter(p => p.siteId === siteId);
    }
    
    getSideEffectsBySeverity(severity) {
        return this.sideEffects.filter(se => se.severity === severity);
    }
    
    getRecentEnrollments(days = 30) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.patients.filter(p => p.enrollDate > cutoff);
    }
    
    getCostsByCategory() {
        const categories = {};
        this.costs.forEach(cost => {
            if (!categories[cost.category]) {
                categories[cost.category] = 0;
            }
            categories[cost.category] += cost.amount;
        });
        return categories;
    }
    
    getTrialMetrics() {
        const activePatients = this.getPatientsByStatus('active').length;
        const enrolledPatients = this.getPatientsByStatus('enrolled').length;
        const completedPatients = this.getPatientsByStatus('completed').length;
        const withdrawnPatients = this.getPatientsByStatus('withdrawn').length;
        
        const totalPatients = this.patients.length;
        const targetEnrollment = this.sites.reduce((sum, site) => sum + site.target, 0);
        
        return {
            activeTrials: 1, // In real system, would support multiple trials
            totalParticipants: totalPatients,
            activeSites: this.sites.filter(s => s.active).length,
            enrollmentRate: totalPatients > 0 ? 
                ((activePatients + completedPatients) / targetEnrollment * 100).toFixed(1) : 0,
            retentionRate: totalPatients > 0 ? 
                ((totalPatients - withdrawnPatients) / totalPatients * 100).toFixed(1) : 0,
            averageCompliance: activePatients > 0 ?
                (this.getPatientsByStatus('active')
                    .reduce((sum, p) => sum + p.compliance, 0) / activePatients).toFixed(1) : 0,
            dataQualityScore: this.calculateDataQualityScore()
        };
    }
    
    calculateDataQualityScore() {
        // Simulated data quality calculation
        let score = 95; // Base score
        
        // Deduct for missing data
        const patientsWithoutRecentLabs = this.patients.filter(p => {
            if (p.status !== 'active') return false;
            const recentLabs = this.labResults.filter(lr => 
                lr.patientId === p.id && 
                lr.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            );
            return recentLabs.length === 0;
        });
        
        score -= (patientsWithoutRecentLabs.length / Math.max(1, this.getPatientsByStatus('active').length)) * 10;
        
        return Math.max(0, Math.min(100, score)).toFixed(1);
    }
}

// Export for use in other modules
window.ClinicalTrialDataGenerator = ClinicalTrialDataGenerator;