/**
 * Configuration and Multilingual Support for Factory Energy Optimization System
 * Handles user settings, language switching, and dashboard customization
 */

class ConfigurationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.settings = {
            language: 'en',
            theme: 'default',
            refreshInterval: 1000,
            targetEfficiency: 90,
            costThreshold: 25,
            analysisPeriod: '24h',
            autoRefresh: true,
            enableNotifications: true,
            chartType: 'line',
            decimalPlaces: 1
        };
        
        this.translations = {
            en: {
                // Navigation and Headers
                'system_title': 'Factory Energy Optimization System',
                'emergency_stop': 'EMERGENCY STOP',
                'system_controls': 'System Controls',
                'connection_status_connected': 'OPC UA Connected',
                'connection_status_disconnected': 'OPC UA Disconnected',
                
                // Dashboard Cards
                'power_consumption': 'Power Consumption',
                'production_metrics': 'Production Metrics',
                'ai_recommendations': 'AI Optimization Recommendations',
                
                // KPI Labels
                'current_kw': 'Current (kW)',
                'daily_avg_kw': 'Daily Avg (kW)',
                'cost_today': 'Cost Today',
                'efficiency': 'Efficiency',
                'units_hour': 'Units/Hour',
                'today_total': 'Today Total',
                'oee': 'OEE',
                'kw_unit': 'kW/Unit',
                
                // Control Panel
                'target_efficiency': 'Target Efficiency (%)',
                'cost_threshold': 'Cost Threshold (¥/kWh)',
                'analysis_period': 'Analysis Period',
                'apply_settings': 'Apply Settings',
                
                // Time Periods
                '1_hour': '1 Hour',
                '8_hours': '8 Hours', 
                '24_hours': '24 Hours',
                '7_days': '7 Days',
                
                // Buttons and Actions
                'language_toggle': 'Japanese',
                'refresh_data': 'Refresh Data',
                'export_data': 'Export Data',
                'view_details': 'View Details'
            },
            ja: {
                // Navigation and Headers
                'system_title': '工場エネルギー最適化システム',
                'emergency_stop': '緊急停止',
                'system_controls': 'システム制御',
                'connection_status_connected': 'OPC UA 接続済み',
                'connection_status_disconnected': 'OPC UA 切断',
                
                // Dashboard Cards
                'power_consumption': '消費電力',
                'production_metrics': '生産指標',
                'ai_recommendations': 'AI最適化推奨事項',
                
                // KPI Labels
                'current_kw': '現在 (kW)',
                'daily_avg_kw': '日平均 (kW)',
                'cost_today': '今日のコスト',
                'efficiency': '効率',
                'units_hour': '個/時',
                'today_total': '本日合計',
                'oee': 'OEE',
                'kw_unit': 'kW/個',
                
                // Control Panel
                'target_efficiency': '目標効率 (%)',
                'cost_threshold': 'コスト閾値 (¥/kWh)',
                'analysis_period': '分析期間',
                'apply_settings': '設定を適用',
                
                // Time Periods
                '1_hour': '1時間',
                '8_hours': '8時間',
                '24_hours': '24時間',
                '7_days': '7日間',
                
                // Buttons and Actions
                'language_toggle': 'English',
                'refresh_data': 'データを更新',
                'export_data': 'データをエクスポート',
                'view_details': '詳細を表示'
            }
        };

        this.charts = {
            power: null,
            production: null
        };

        this.loadSettings();
        this.initializeCharts();
        this.startDataUpdates();
    }

    loadSettings() {
        const saved = localStorage.getItem('factory_optimizer_settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                this.currentLanguage = this.settings.language;
                console.log('✅ Settings loaded from localStorage');
            } catch (error) {
                console.warn('⚠️ Failed to load settings from localStorage:', error);
            }
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('factory_optimizer_settings', JSON.stringify(this.settings));
            console.log('✅ Settings saved to localStorage');
        } catch (error) {
            console.warn('⚠️ Failed to save settings to localStorage:', error);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Apply setting immediately if applicable
        switch (key) {
            case 'language':
                this.currentLanguage = value;
                this.updateLanguage();
                break;
            case 'refreshInterval':
                this.restartDataUpdates();
                break;
        }
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    updateLanguage() {
        document.querySelectorAll('[data-en]').forEach(element => {
            if (this.currentLanguage === 'ja' && element.getAttribute('data-ja')) {
                element.textContent = element.getAttribute('data-ja');
            } else {
                element.textContent = element.getAttribute('data-en');
            }
        });

        // Update language toggle button
        const langText = document.getElementById('langText');
        if (langText) {
            langText.textContent = this.getTranslation('language_toggle');
        }

        // Update select options
        document.querySelectorAll('option[data-en]').forEach(option => {
            if (this.currentLanguage === 'ja' && option.getAttribute('data-ja')) {
                option.textContent = option.getAttribute('data-ja');
            } else {
                option.textContent = option.getAttribute('data-en');
            }
        });

        console.log(`🌐 Language updated to: ${this.currentLanguage}`);
    }

    initializeCharts() {
        this.initializePowerChart();
        this.initializeProductionChart();
    }

    initializePowerChart() {
        const ctx = document.getElementById('powerChart');
        if (!ctx) return;

        this.charts.power = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: this.getTranslation('power_consumption'),
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: this.getTranslation('efficiency'),
                        data: [],
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ddd',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Power (kW)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    initializeProductionChart() {
        const ctx = document.getElementById('productionChart');
        if (!ctx) return;

        this.charts.production = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: this.getTranslation('units_hour'),
                        data: [],
                        backgroundColor: 'rgba(52, 152, 219, 0.6)',
                        borderColor: '#3498db',
                        borderWidth: 2
                    },
                    {
                        label: this.getTranslation('oee'),
                        data: [],
                        backgroundColor: 'rgba(155, 89, 182, 0.6)',
                        borderColor: '#9b59b6',
                        borderWidth: 2,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Units/Hour'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'OEE (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    startDataUpdates() {
        if (this.dataUpdateInterval) {
            clearInterval(this.dataUpdateInterval);
        }

        this.dataUpdateInterval = setInterval(() => {
            if (this.settings.autoRefresh && window.dataService) {
                this.updateDashboard();
                this.updateCharts();
            }
        }, this.settings.refreshInterval);

        console.log(`📊 Data updates started with ${this.settings.refreshInterval}ms interval`);
    }

    restartDataUpdates() {
        this.startDataUpdates();
    }

    updateDashboard() {
        const data = window.dataService?.getAllData();
        if (!data) return;

        // Update power KPIs
        this.updateElement('currentPower', data.power?.active_power?.toFixed(1) || '0');
        this.updateElement('dailyAvg', (data.power?.active_power * 0.8)?.toFixed(1) || '0'); // Simulate daily average
        this.updateElement('costValue', (data.derived?.cost_per_hour * 24)?.toFixed(0) || '0');
        this.updateElement('efficiency', data.derived?.efficiency?.toFixed(1) + '%' || '0%');

        // Update production KPIs
        this.updateElement('currentProduction', data.production?.units_per_hour?.toFixed(0) || '0');
        this.updateElement('todayProduction', (data.production?.units_per_hour * 8)?.toFixed(0) || '0'); // Simulate daily total
        this.updateElement('oee', ((data.production?.oee || 0) * 100).toFixed(1) + '%');
        this.updateElement('powerPerUnit', data.derived?.power_per_unit?.toFixed(3) || '0');

        // Update status indicators
        this.updateStatusIndicator('powerStatus', data.power?.active_power > 280 ? 'warning' : '');
        this.updateStatusIndicator('productionStatus', data.production?.units_per_hour < 1100 ? 'warning' : '');
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateStatusIndicator(id, status) {
        const element = document.getElementById(id);
        if (element) {
            element.className = `status-indicator ${status}`;
        }
    }

    updateCharts() {
        if (!window.dataService) return;

        const historicalData = window.dataService.getHistoricalData('power', this.settings.analysisPeriod);
        const productionData = window.dataService.getHistoricalData('production', this.settings.analysisPeriod);
        const derivedData = window.dataService.getHistoricalData('derived', this.settings.analysisPeriod);

        this.updatePowerChart(historicalData, derivedData);
        this.updateProductionChart(productionData);
    }

    updatePowerChart(powerData, derivedData) {
        if (!this.charts.power) return;

        const labels = powerData.map(d => new Date(d.timestamp).toLocaleTimeString());
        const powerValues = powerData.map(d => d.active_power);
        const efficiencyValues = derivedData.map(d => d.efficiency);

        this.charts.power.data.labels = labels.slice(-20); // Keep last 20 points
        this.charts.power.data.datasets[0].data = powerValues.slice(-20);
        this.charts.power.data.datasets[1].data = efficiencyValues.slice(-20);
        
        this.charts.power.update('none');
    }

    updateProductionChart(productionData) {
        if (!this.charts.production) return;

        const labels = productionData.map(d => new Date(d.timestamp).toLocaleTimeString());
        const unitsValues = productionData.map(d => d.units_per_hour);
        const oeeValues = productionData.map(d => d.oee * 100);

        this.charts.production.data.labels = labels.slice(-10); // Keep last 10 points
        this.charts.production.data.datasets[0].data = unitsValues.slice(-10);
        this.charts.production.data.datasets[1].data = oeeValues.slice(-10);
        
        this.charts.production.update('none');
    }

    exportData(format = 'csv') {
        const data = window.dataService?.getAllData();
        if (!data) {
            alert(this.getTranslation('no_data_available') || 'No data available');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `factory_data_${timestamp}.${format}`;

        if (format === 'csv') {
            this.exportToCSV(data, filename);
        } else if (format === 'json') {
            this.exportToJSON(data, filename);
        }
    }

    exportToCSV(data, filename) {
        const csv = this.convertToCSV(data);
        this.downloadFile(csv, filename, 'text/csv');
    }

    exportToJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    }

    convertToCSV(data) {
        const headers = ['timestamp', 'active_power', 'units_per_hour', 'efficiency', 'cost_per_hour', 'oee'];
        const rows = [headers.join(',')];

        const timestamp = new Date().toISOString();
        const row = [
            timestamp,
            data.power?.active_power || '',
            data.production?.units_per_hour || '',
            data.derived?.efficiency || '',
            data.derived?.cost_per_hour || '',
            data.production?.oee || ''
        ];
        
        rows.push(row.join(','));
        return rows.join('\n');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        console.log(`📄 Data exported as ${filename}`);
    }
}

// Global functions
function toggleLanguage() {
    const newLang = configManager.currentLanguage === 'en' ? 'ja' : 'en';
    configManager.updateSetting('language', newLang);
}

function getCurrentLanguage() {
    return configManager?.currentLanguage || 'en';
}

function applySettings() {
    const targetEfficiency = document.getElementById('targetEfficiency')?.value;
    const costThreshold = document.getElementById('costThreshold')?.value;
    const analysisPeriod = document.getElementById('analysisPeriod')?.value;

    if (targetEfficiency) configManager.updateSetting('targetEfficiency', parseInt(targetEfficiency));
    if (costThreshold) configManager.updateSetting('costThreshold', parseInt(costThreshold));
    if (analysisPeriod) configManager.updateSetting('analysisPeriod', analysisPeriod);

    alert(configManager.getTranslation('settings_applied') || 'Settings applied successfully!');
    console.log('⚙️ Settings applied:', configManager.settings);
}

function emergencyStop() {
    if (confirm(configManager.getTranslation('confirm_emergency_stop') || 'Are you sure you want to initiate emergency stop?')) {
        // In a real implementation, this would send a stop command to PLCs
        console.log('🛑 EMERGENCY STOP initiated');
        
        // Stop AI analysis
        if (window.aiSystem) {
            window.aiSystem.stopAnalysis();
        }
        
        // Show emergency status
        document.body.style.background = 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)';
        alert(configManager.getTranslation('emergency_stop_activated') || 'Emergency stop activated. System halted.');
        
        // Restore after 10 seconds (for demo)
        setTimeout(() => {
            document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            if (window.aiSystem) {
                window.aiSystem.startAnalysisIfStopped();
            }
        }, 10000);
    }
}

// Initialize configuration manager
let configManager;

document.addEventListener('DOMContentLoaded', () => {
    configManager = new ConfigurationManager();
    window.configManager = configManager;
    
    // Apply initial language
    setTimeout(() => configManager.updateLanguage(), 100);
    
    console.log('⚙️ Configuration Manager initialized');
});