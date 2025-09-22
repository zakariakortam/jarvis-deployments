class PatientTableManager {
    constructor() {
        this.currentSort = { column: null, direction: 'asc' };
        this.currentFilter = { status: 'all', search: '' };
        this.initializeTable();
        this.startTableUpdates();
    }

    initializeTable() {
        // Add event listeners for sorting
        document.querySelectorAll('th[data-sort]').forEach(header => {
            header.addEventListener('click', (e) => {
                this.handleSort(e.target.dataset.sort);
            });
            header.style.cursor = 'pointer';
        });

        // Add event listeners for filtering
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value.toLowerCase();
            this.renderTable();
        });

        document.getElementById('filter-status').addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.renderTable();
        });

        // Initial render
        setTimeout(() => this.renderTable(), 1500);
    }

    handleSort(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }
        
        this.updateSortIndicators();
        this.renderTable();
    }

    updateSortIndicators() {
        // Remove all existing sort indicators
        document.querySelectorAll('th[data-sort]').forEach(header => {
            header.innerHTML = header.innerHTML.replace(' ↑', '').replace(' ↓', '');
        });

        // Add sort indicator to current column
        if (this.currentSort.column) {
            const header = document.querySelector(`th[data-sort="${this.currentSort.column}"]`);
            if (header) {
                const indicator = this.currentSort.direction === 'asc' ? ' ↑' : ' ↓';
                header.innerHTML += indicator;
            }
        }
    }

    filterAndSortPatients(patients) {
        let filteredPatients = [...patients];

        // Apply search filter
        if (this.currentFilter.search) {
            filteredPatients = filteredPatients.filter(patient => 
                patient.name.toLowerCase().includes(this.currentFilter.search) ||
                patient.id.toLowerCase().includes(this.currentFilter.search) ||
                patient.status.toLowerCase().includes(this.currentFilter.search) ||
                patient.room.toLowerCase().includes(this.currentFilter.search)
            );
        }

        // Apply status filter
        if (this.currentFilter.status !== 'all') {
            filteredPatients = filteredPatients.filter(patient => 
                patient.status === this.currentFilter.status
            );
        }

        // Apply sorting
        if (this.currentSort.column) {
            filteredPatients.sort((a, b) => {
                let aVal = a[this.currentSort.column];
                let bVal = b[this.currentSort.column];

                // Handle different data types
                if (this.currentSort.column === 'age' || this.currentSort.column === 'heartRate' || 
                    this.currentSort.column === 'oxygen' || this.currentSort.column === 'temperature' ||
                    this.currentSort.column === 'cost') {
                    aVal = parseFloat(aVal);
                    bVal = parseFloat(bVal);
                } else if (this.currentSort.column === 'name' || this.currentSort.column === 'id' || 
                          this.currentSort.column === 'status') {
                    aVal = aVal.toString().toLowerCase();
                    bVal = bVal.toString().toLowerCase();
                }

                if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filteredPatients;
    }

    renderTable() {
        if (!window.dataGenerator) return;

        const patients = window.dataGenerator.getPatients();
        const filteredPatients = this.filterAndSortPatients(patients);
        const tbody = document.getElementById('patient-table-body');
        const t = window.translationManager ? window.translationManager.getTranslation.bind(window.translationManager) : (key) => key;

        tbody.innerHTML = '';

        filteredPatients.forEach(patient => {
            const row = document.createElement('tr');
            
            // Add hover effect class
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'rgba(74, 144, 226, 0.1)';
            });
            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });

            const statusClass = `status-${patient.status}`;
            const statusText = t(patient.status);
            const cost = patient.cost.toLocaleString();

            row.innerHTML = `
                <td><strong>${patient.id}</strong></td>
                <td>${patient.name}</td>
                <td>${patient.age}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${Math.round(patient.heartRate)}</td>
                <td>${Math.round(patient.oxygen)}%</td>
                <td>${patient.temperature.toFixed(1)}°C</td>
                <td>¥${cost}</td>
            `;

            tbody.appendChild(row);
        });

        // Update patient count in header if needed
        document.getElementById('active-patients').textContent = 
            window.translationManager ? 
            (window.translationManager.getCurrentLanguage() === 'ja' ? `対象患者数：${patients.length}名` : `Active Patients: ${patients.length}`) :
            `Active Patients: ${patients.length}`;
    }

    startTableUpdates() {
        // Update table every 5 seconds to show new data
        setInterval(() => {
            this.renderTable();
        }, 5000);
    }
}

class DashboardManager {
    constructor() {
        this.updateInterval = null;
        this.initializeDashboard();
        this.startRealTimeUpdates();
    }

    initializeDashboard() {
        // Update current time
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);

        // Initialize components after data generator is ready
        setTimeout(() => {
            this.updateVitalCards();
            this.updateCostCards();
            this.updateFooterStats();
        }, 2000);
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        });
        document.getElementById('current-time').textContent = timeString;
    }

    updateVitalCards() {
        if (!window.dataGenerator) return;

        const vitals = window.dataGenerator.getAverageVitals();
        
        // Update values with animation
        this.animateValue('heart-rate', vitals.heartRate, 0);
        this.animateValue('oxygen-level', vitals.oxygen, 1);
        this.animateValue('temperature', vitals.temperature, 1);
        
        document.getElementById('blood-pressure').textContent = vitals.bloodPressure;

        // Update trend indicators (simulate trends)
        this.updateTrendIndicators();
    }

    animateValue(elementId, targetValue, decimals) {
        const element = document.getElementById(elementId);
        const currentValue = parseFloat(element.textContent) || 0;
        const difference = targetValue - currentValue;
        const steps = 20;
        const stepValue = difference / steps;
        let currentStep = 0;

        const animation = setInterval(() => {
            currentStep++;
            const newValue = currentValue + (stepValue * currentStep);
            element.textContent = newValue.toFixed(decimals);

            if (currentStep >= steps) {
                clearInterval(animation);
                element.textContent = targetValue.toFixed(decimals);
            }
        }, 50);
    }

    updateTrendIndicators() {
        const trends = [
            { element: document.querySelector('.heart-rate .vital-trend'), change: (Math.random() - 0.5) * 5 },
            { element: document.querySelector('.oxygen .vital-trend'), change: (Math.random() - 0.5) * 2 },
            { element: document.querySelector('.temperature .vital-trend'), change: (Math.random() - 0.5) * 1 },
            { element: document.querySelector('.blood-pressure .vital-trend'), change: (Math.random() - 0.5) * 3 }
        ];

        trends.forEach(trend => {
            const absChange = Math.abs(trend.change);
            const direction = trend.change > 0 ? '↑' : trend.change < 0 ? '↓' : '→';
            
            trend.element.textContent = `${direction} ${absChange.toFixed(1)}%`;
            
            // Update trend classes
            trend.element.className = 'vital-trend';
            if (trend.change > 0.5) {
                trend.element.classList.add('trend-up');
            } else if (trend.change < -0.5) {
                trend.element.classList.add('trend-down');
            } else {
                trend.element.classList.add('trend-stable');
            }
        });
    }

    updateCostCards() {
        if (!window.dataGenerator) return;

        const dailyCost = window.dataGenerator.getDailyCost();
        const monthlyCost = window.dataGenerator.getMonthlyEstimate();
        const avgCost = window.dataGenerator.getAverageCostPerPatient();

        document.getElementById('daily-cost').textContent = `¥${dailyCost.toLocaleString()}`;
        document.getElementById('monthly-cost').textContent = `¥${monthlyCost.toLocaleString()}`;
        document.getElementById('avg-cost').textContent = `¥${avgCost.toLocaleString()}`;
    }

    updateFooterStats() {
        if (!window.dataGenerator) return;

        const dataCount = window.dataGenerator.getDataPointCount();
        const now = new Date();
        const updateTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        document.getElementById('data-count').textContent = dataCount.toLocaleString();
        document.getElementById('update-time').textContent = updateTime;
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateVitalCards();
            this.updateCostCards();
            this.updateFooterStats();
        }, 3000);
    }

    addAlert(type, message, duration = 5000) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type}`;
        alertContainer.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        const dashboard = document.querySelector('.dashboard-container');
        dashboard.insertBefore(alertContainer, dashboard.firstChild);

        setTimeout(() => {
            alertContainer.remove();
        }, duration);
    }

    // Extensible framework methods
    addCustomKPI(containerId, kpiConfig) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const kpiElement = document.createElement('div');
        kpiElement.className = 'custom-kpi';
        kpiElement.innerHTML = `
            <div class="kpi-header">
                <h4>${kpiConfig.title}</h4>
            </div>
            <div class="kpi-content">
                <div class="kpi-value" id="${kpiConfig.valueId}">--</div>
                <div class="kpi-label">${kpiConfig.label}</div>
            </div>
        `;

        container.appendChild(kpiElement);

        // If update function is provided, add to update cycle
        if (kpiConfig.updateFunction) {
            this.customKPIs = this.customKPIs || [];
            this.customKPIs.push(kpiConfig.updateFunction);
        }
    }

    addCustomChart(containerId, chartConfig) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const chartContainer = document.createElement('div');
        chartContainer.className = 'card custom-chart';
        chartContainer.innerHTML = `
            <div class="card-header">
                <h3>${chartConfig.title}</h3>
            </div>
            <div class="chart-container">
                <canvas id="${chartConfig.canvasId}"></canvas>
            </div>
        `;

        container.appendChild(chartContainer);

        // Initialize chart if configuration is provided
        if (chartConfig.chartOptions) {
            const ctx = document.getElementById(chartConfig.canvasId).getContext('2d');
            new Chart(ctx, chartConfig.chartOptions);
        }
    }

    simulateSystemEvents() {
        const events = [
            { type: 'success', message: 'Patient vital signs normalized' },
            { type: 'warning', message: 'High medication usage detected' },
            { type: 'success', message: 'New patient admitted successfully' },
            { type: 'warning', message: 'Equipment maintenance required' }
        ];

        // Randomly trigger events
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                const event = events[Math.floor(Math.random() * events.length)];
                this.addAlert(event.type, event.message);
            }
        }, 30000); // Check every 30 seconds
    }
}

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all managers in sequence
    setTimeout(() => {
        window.patientTableManager = new PatientTableManager();
    }, 1000);
    
    setTimeout(() => {
        window.dashboardManager = new DashboardManager();
        window.dashboardManager.simulateSystemEvents();
    }, 2000);

    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add loading states to cards
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
    });

    // Animate cards in sequence
    setTimeout(() => {
        document.querySelectorAll('.card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 500);
});

// Export dashboard manager for external use
window.DashboardManager = DashboardManager;