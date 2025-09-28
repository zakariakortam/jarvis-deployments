// Main Application Controller

class ClinicalTrialMonitoringApp {
    constructor() {
        this.dataGenerator = new window.ClinicalTrialDataGenerator();
        this.visualizations = new window.TrialVisualizations();
        this.updateCounter = 0;
        this.updateInterval = null;
        this.sortState = {
            patient: { column: null, ascending: true },
            site: { column: null, ascending: true }
        };
    }
    
    init() {
        // Initialize visualizations
        this.visualizations.initializeCharts();
        
        // Initial data update
        this.updateDashboard();
        
        // Set up real-time updates
        this.startRealtimeUpdates();
        
        // Initialize tables
        this.initializeTables();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial header stats
        this.updateHeaderStats();
    }
    
    startRealtimeUpdates() {
        this.updateInterval = setInterval(() => {
            // Generate new data
            const updates = this.dataGenerator.generateRealtimeUpdates();
            
            // Update counter
            this.updateCounter++;
            
            // Update header stats
            this.updateHeaderStats();
            
            // Update charts every 5 updates
            if (this.updateCounter % 5 === 0) {
                this.updateDashboard();
            }
            
            // Update tables every 10 updates
            if (this.updateCounter % 10 === 0) {
                this.updateTables();
            }
            
            // Show update rate
            document.getElementById('updateRate').textContent = 
                (1000 / this.dataGenerator.config.updateInterval).toFixed(1);
        }, this.dataGenerator.config.updateInterval);
    }
    
    updateDashboard() {
        this.visualizations.updateAllCharts(this.dataGenerator);
        const metrics = this.dataGenerator.getTrialMetrics();
        this.visualizations.renderGaugeValues(metrics);
    }
    
    updateHeaderStats() {
        const metrics = this.dataGenerator.getTrialMetrics();
        document.getElementById('activeTrials').textContent = metrics.activeTrials;
        document.getElementById('totalParticipants').textContent = metrics.totalParticipants.toLocaleString();
        document.getElementById('activeSites').textContent = metrics.activeSites;
    }
    
    initializeTables() {
        this.updatePatientTable();
        this.updateSiteTable();
    }
    
    updateTables() {
        const patientSearch = document.getElementById('patientSearch').value.toLowerCase();
        const patientFilter = document.getElementById('patientFilter').value;
        this.updatePatientTable(patientSearch, patientFilter);
        
        const siteSearch = document.getElementById('siteSearch').value.toLowerCase();
        this.updateSiteTable(siteSearch);
    }
    
    updatePatientTable(searchTerm = '', statusFilter = '') {
        const tbody = document.getElementById('patientTableBody');
        let patients = [...this.dataGenerator.patients];
        
        // Apply filters
        if (searchTerm) {
            patients = patients.filter(p => 
                p.id.toLowerCase().includes(searchTerm) ||
                p.siteId.toLowerCase().includes(searchTerm)
            );
        }
        
        if (statusFilter) {
            patients = patients.filter(p => p.status === statusFilter);
        }
        
        // Apply sort
        if (this.sortState.patient.column) {
            patients = this.sortData(patients, this.sortState.patient.column, 
                this.sortState.patient.ascending);
        }
        
        // Limit to 100 rows for performance
        patients = patients.slice(0, 100);
        
        // Build table HTML
        tbody.innerHTML = patients.map(patient => {
            const sideEffectsCount = patient.sideEffects.length;
            const statusClass = `status-${patient.status}`;
            const complianceClass = patient.compliance < 70 ? 'low-compliance' : '';
            
            return `
                <tr>
                    <td>${patient.id}</td>
                    <td>${patient.siteId}</td>
                    <td>${patient.age}</td>
                    <td>${patient.gender}</td>
                    <td>${this.formatDate(patient.enrollDate)}</td>
                    <td><span class="status-badge ${statusClass}">${patient.status}</span></td>
                    <td class="${complianceClass}">${patient.compliance}%</td>
                    <td>${sideEffectsCount > 0 ? 
                        `<span class="side-effects-count">${sideEffectsCount}</span>` : '-'}</td>
                </tr>
            `;
        }).join('');
    }
    
    updateSiteTable(searchTerm = '') {
        const tbody = document.getElementById('siteTableBody');
        let sites = [...this.dataGenerator.sites];
        
        // Apply filters
        if (searchTerm) {
            sites = sites.filter(s => 
                s.id.toLowerCase().includes(searchTerm) ||
                s.name.toLowerCase().includes(searchTerm) ||
                s.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply sort
        if (this.sortState.site.column) {
            sites = this.sortData(sites, this.sortState.site.column, 
                this.sortState.site.ascending);
        }
        
        // Build table HTML
        tbody.innerHTML = sites.map(site => {
            const performanceClass = site.enrolled / site.target < 0.5 ? 'low-performance' : 
                                   site.enrolled >= site.target ? 'high-performance' : '';
            const enrollmentPercent = ((site.enrolled / site.target) * 100).toFixed(1);
            
            return `
                <tr>
                    <td>${site.id}</td>
                    <td>${site.name}</td>
                    <td>${site.location}</td>
                    <td>${site.enrolled}</td>
                    <td>${site.target}</td>
                    <td class="${performanceClass}">${enrollmentPercent}%</td>
                    <td>${site.qualityScore}</td>
                    <td>$${site.monthlyCost.toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    }
    
    setupEventListeners() {
        // Patient table search and filter
        document.getElementById('patientSearch').addEventListener('input', () => {
            this.updateTables();
        });
        
        document.getElementById('patientFilter').addEventListener('change', () => {
            this.updateTables();
        });
        
        // Site table search
        document.getElementById('siteSearch').addEventListener('input', () => {
            this.updateTables();
        });
        
        // Table sorting
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', (e) => {
                const table = e.target.closest('table').id;
                const column = e.target.dataset.sort;
                this.handleSort(table, column);
            });
        });
    }
    
    handleSort(table, column) {
        const stateKey = table === 'patientTable' ? 'patient' : 'site';
        const state = this.sortState[stateKey];
        
        if (state.column === column) {
            state.ascending = !state.ascending;
        } else {
            state.column = column;
            state.ascending = true;
        }
        
        this.updateTables();
        
        // Update sort indicators
        const tableEl = document.getElementById(table);
        tableEl.querySelectorAll('th[data-sort]').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === column) {
                th.classList.add(state.ascending ? 'sort-asc' : 'sort-desc');
            }
        });
    }
    
    sortData(data, column, ascending) {
        return data.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            // Handle dates
            if (aVal instanceof Date) {
                aVal = aVal.getTime();
                bVal = bVal.getTime();
            }
            
            // Handle strings
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new ClinicalTrialMonitoringApp();
    app.init();
});