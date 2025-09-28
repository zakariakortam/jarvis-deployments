// Visualization Components for Clinical Trial Monitoring Platform

class TrialVisualizations {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#2563eb',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
            purple: '#8b5cf6',
            pink: '#ec4899',
            gray: '#6b7280'
        };
        
        // Chart.js defaults
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#374151';
    }
    
    initializeCharts() {
        this.initEnrollmentChart();
        this.initDoseComplianceChart();
        this.initGauges();
        this.initDemographicCharts();
        this.initSafetyCharts();
        this.initCostCharts();
    }
    
    initEnrollmentChart() {
        const ctx = document.getElementById('enrollmentChart').getContext('2d');
        this.charts.enrollment = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Enrolled',
                    data: [],
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Target',
                    data: [],
                    borderColor: this.colors.gray,
                    borderDash: [5, 5],
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Enrollment Progress Over Time'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Participants'
                        }
                    }
                }
            }
        });
    }
    
    initDoseComplianceChart() {
        const ctx = document.getElementById('doseComplianceChart').getContext('2d');
        this.charts.doseCompliance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Doses Administered',
                    data: [],
                    backgroundColor: this.colors.success,
                    borderWidth: 0
                }, {
                    label: 'Doses Scheduled',
                    data: [],
                    backgroundColor: this.colors.gray + '40',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Dosing Schedule Compliance'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Week'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Doses'
                        }
                    }
                }
            }
        });
    }
    
    initGauges() {
        // Initialize gauge charts
        const gaugeOptions = {
            type: 'doughnut',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                circumference: 180,
                rotation: 270,
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        };
        
        // Enrollment Rate Gauge
        const enrollCtx = document.getElementById('enrollmentRateGauge').getContext('2d');
        this.charts.enrollmentGauge = new Chart(enrollCtx, {
            ...gaugeOptions,
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [this.colors.primary, '#e5e7eb'],
                    borderWidth: 0
                }]
            }
        });
        
        // Retention Rate Gauge
        const retentionCtx = document.getElementById('retentionRateGauge').getContext('2d');
        this.charts.retentionGauge = new Chart(retentionCtx, {
            ...gaugeOptions,
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [this.colors.success, '#e5e7eb'],
                    borderWidth: 0
                }]
            }
        });
        
        // Compliance Gauge
        const complianceCtx = document.getElementById('complianceGauge').getContext('2d');
        this.charts.complianceGauge = new Chart(complianceCtx, {
            ...gaugeOptions,
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [this.colors.info, '#e5e7eb'],
                    borderWidth: 0
                }]
            }
        });
        
        // Data Quality Gauge
        const qualityCtx = document.getElementById('dataQualityGauge').getContext('2d');
        this.charts.dataQualityGauge = new Chart(qualityCtx, {
            ...gaugeOptions,
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [this.colors.purple, '#e5e7eb'],
                    borderWidth: 0
                }]
            }
        });
    }
    
    initDemographicCharts() {
        // Age Distribution
        const ageCtx = document.getElementById('ageDistributionChart').getContext('2d');
        this.charts.ageDistribution = new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: ['18-30', '31-40', '41-50', '51-60', '61-70', '71+'],
                datasets: [{
                    label: 'Participants',
                    data: [],
                    backgroundColor: this.colors.info
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Age Distribution'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Gender Distribution
        const genderCtx = document.getElementById('genderDistributionChart').getContext('2d');
        this.charts.genderDistribution = new Chart(genderCtx, {
            type: 'pie',
            data: {
                labels: ['Male', 'Female', 'Other'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.pink,
                        this.colors.purple
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Gender Distribution'
                    }
                }
            }
        });
        
        // Site Distribution
        const siteCtx = document.getElementById('siteDistributionChart').getContext('2d');
        this.charts.siteDistribution = new Chart(siteCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Enrolled Patients',
                    data: [],
                    backgroundColor: this.colors.success
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Sites by Enrollment'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    initSafetyCharts() {
        // Side Effects by Type
        const sideEffectsCtx = document.getElementById('sideEffectsChart').getContext('2d');
        this.charts.sideEffects = new Chart(sideEffectsCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reported Cases',
                    data: [],
                    backgroundColor: this.colors.warning
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Side Effects by Type'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Severity Distribution
        const severityCtx = document.getElementById('severityChart').getContext('2d');
        this.charts.severity = new Chart(severityCtx, {
            type: 'doughnut',
            data: {
                labels: ['Mild', 'Moderate', 'Severe'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        this.colors.success,
                        this.colors.warning,
                        this.colors.danger
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Side Effects by Severity'
                    }
                }
            }
        });
    }
    
    initCostCharts() {
        // Cost Trend
        const costTrendCtx = document.getElementById('costTrendChart').getContext('2d');
        this.charts.costTrend = new Chart(costTrendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Monthly Cost',
                    data: [],
                    borderColor: this.colors.purple,
                    backgroundColor: this.colors.purple + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Cost Trend'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
        
        // Cost Breakdown
        const costBreakdownCtx = document.getElementById('costBreakdownChart').getContext('2d');
        this.charts.costBreakdown = new Chart(costBreakdownCtx, {
            type: 'pie',
            data: {
                labels: ['Personnel', 'Equipment', 'Supplies', 'Administrative', 'Other'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.info,
                        this.colors.success,
                        this.colors.warning,
                        this.colors.gray
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cost Distribution by Category'
                    }
                }
            }
        });
    }
    
    updateGauge(gauge, value) {
        gauge.data.datasets[0].data[0] = value;
        gauge.data.datasets[0].data[1] = 100 - value;
        gauge.update('none');
    }
    
    updateAllCharts(dataGenerator) {
        // Update enrollment chart
        const enrollmentData = dataGenerator.enrollmentData.slice(-90); // Last 90 days
        const targetEnrollment = dataGenerator.sites.reduce((sum, site) => sum + site.target, 0);
        
        this.charts.enrollment.data.labels = enrollmentData.map(d => d.timestamp);
        this.charts.enrollment.data.datasets[0].data = enrollmentData.map(d => d.total);
        this.charts.enrollment.data.datasets[1].data = enrollmentData.map(() => targetEnrollment);
        this.charts.enrollment.update();
        
        // Update dose compliance
        const weeks = 12;
        const weekLabels = [];
        const dosesAdministered = [];
        const dosesScheduled = [];
        
        for (let i = 0; i < weeks; i++) {
            weekLabels.push(`Week ${i + 1}`);
            const weekPatients = dataGenerator.patients.filter(p => 
                p.status === 'active' || p.status === 'completed'
            );
            
            const administered = weekPatients.reduce((sum, p) => 
                sum + Math.min(p.dosesReceived, (i + 1) * 2), 0
            );
            const scheduled = weekPatients.length * (i + 1) * 2;
            
            dosesAdministered.push(administered);
            dosesScheduled.push(scheduled);
        }
        
        this.charts.doseCompliance.data.labels = weekLabels;
        this.charts.doseCompliance.data.datasets[0].data = dosesAdministered;
        this.charts.doseCompliance.data.datasets[1].data = dosesScheduled;
        this.charts.doseCompliance.update();
        
        // Update gauges
        const metrics = dataGenerator.getTrialMetrics();
        this.updateGauge(this.charts.enrollmentGauge, parseFloat(metrics.enrollmentRate));
        this.updateGauge(this.charts.retentionGauge, parseFloat(metrics.retentionRate));
        this.updateGauge(this.charts.complianceGauge, parseFloat(metrics.averageCompliance));
        this.updateGauge(this.charts.dataQualityGauge, parseFloat(metrics.dataQualityScore));
        
        // Update demographics
        this.updateDemographicCharts(dataGenerator);
        
        // Update safety charts
        this.updateSafetyCharts(dataGenerator);
        
        // Update cost charts
        this.updateCostCharts(dataGenerator);
    }
    
    updateDemographicCharts(dataGenerator) {
        // Age distribution
        const ageRanges = {
            '18-30': 0, '31-40': 0, '41-50': 0,
            '51-60': 0, '61-70': 0, '71+': 0
        };
        
        dataGenerator.patients.forEach(patient => {
            if (patient.age <= 30) ageRanges['18-30']++;
            else if (patient.age <= 40) ageRanges['31-40']++;
            else if (patient.age <= 50) ageRanges['41-50']++;
            else if (patient.age <= 60) ageRanges['51-60']++;
            else if (patient.age <= 70) ageRanges['61-70']++;
            else ageRanges['71+']++;
        });
        
        this.charts.ageDistribution.data.datasets[0].data = Object.values(ageRanges);
        this.charts.ageDistribution.update();
        
        // Gender distribution
        const genderCounts = { Male: 0, Female: 0, Other: 0 };
        dataGenerator.patients.forEach(patient => {
            genderCounts[patient.gender]++;
        });
        
        this.charts.genderDistribution.data.datasets[0].data = Object.values(genderCounts);
        this.charts.genderDistribution.update();
        
        // Top sites
        const topSites = dataGenerator.sites
            .sort((a, b) => b.enrolled - a.enrolled)
            .slice(0, 10);
        
        this.charts.siteDistribution.data.labels = topSites.map(s => s.name);
        this.charts.siteDistribution.data.datasets[0].data = topSites.map(s => s.enrolled);
        this.charts.siteDistribution.update();
    }
    
    updateSafetyCharts(dataGenerator) {
        // Side effects by type
        const effectCounts = {};
        dataGenerator.sideEffects.forEach(se => {
            if (!effectCounts[se.name]) effectCounts[se.name] = 0;
            effectCounts[se.name]++;
        });
        
        const sortedEffects = Object.entries(effectCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        
        this.charts.sideEffects.data.labels = sortedEffects.map(e => e[0]);
        this.charts.sideEffects.data.datasets[0].data = sortedEffects.map(e => e[1]);
        this.charts.sideEffects.update();
        
        // Severity distribution
        const severityCounts = { mild: 0, moderate: 0, severe: 0 };
        dataGenerator.sideEffects.forEach(se => {
            severityCounts[se.severity]++;
        });
        
        this.charts.severity.data.datasets[0].data = Object.values(severityCounts);
        this.charts.severity.update();
    }
    
    updateCostCharts(dataGenerator) {
        // Cost trend (last 6 months)
        const monthlyTotals = {};
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        dataGenerator.costs
            .filter(cost => cost.timestamp > sixMonthsAgo)
            .forEach(cost => {
                const month = cost.timestamp.toISOString().substring(0, 7);
                if (!monthlyTotals[month]) monthlyTotals[month] = 0;
                monthlyTotals[month] += cost.amount;
            });
        
        const sortedMonths = Object.keys(monthlyTotals).sort();
        this.charts.costTrend.data.labels = sortedMonths.map(m => new Date(m + '-01'));
        this.charts.costTrend.data.datasets[0].data = sortedMonths.map(m => monthlyTotals[m]);
        this.charts.costTrend.update();
        
        // Cost breakdown
        const costsByCategory = dataGenerator.getCostsByCategory();
        this.charts.costBreakdown.data.datasets[0].data = Object.values(costsByCategory);
        this.charts.costBreakdown.update();
    }
    
    // Gauge value display
    renderGaugeValues(metrics) {
        const gaugeContainers = document.querySelectorAll('.gauge-container');
        const values = [
            metrics.enrollmentRate + '%',
            metrics.retentionRate + '%',
            metrics.averageCompliance + '%',
            metrics.dataQualityScore + '%'
        ];
        
        gaugeContainers.forEach((container, index) => {
            let valueDisplay = container.querySelector('.gauge-value');
            if (!valueDisplay) {
                valueDisplay = document.createElement('div');
                valueDisplay.className = 'gauge-value';
                container.appendChild(valueDisplay);
            }
            valueDisplay.textContent = values[index];
        });
    }
}

// Export for use in other modules
window.TrialVisualizations = TrialVisualizations;