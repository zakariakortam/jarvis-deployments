class LanguageController {
    constructor() {
        this.currentLanguage = 'en';
        this.subscribers = [];
        
        this.translations = {
            en: {
                // Header
                'dashboard_title': 'Global Logistics Hub',
                'live_status': 'LIVE',
                
                // KPIs
                'kpi_title': 'Key Performance Indicators',
                'active_trucks': 'Active Trucks',
                'deliveries_today': 'Deliveries Today',
                'avg_fuel': 'Avg Fuel/100km',
                'cost_savings': 'Cost Savings',
                
                // Map
                'fleet_tracking': 'Real-Time Fleet Tracking',
                'in_transit': 'In Transit',
                'at_warehouse': 'At Warehouse',
                'maintenance': 'Maintenance',
                
                // Charts
                'delivery_performance': 'Delivery Performance',
                'fuel_consumption': 'Fuel Consumption',
                'cost_analysis': 'Cost Analysis',
                
                // Table
                'active_shipments': 'Active Shipments',
                'search_placeholder': 'Search shipments...',
                'all_status': 'All Status',
                'delivered': 'Delivered',
                'delayed': 'Delayed',
                'shipment_id': 'Shipment ID',
                'origin': 'Origin',
                'destination': 'Destination',
                'status': 'Status',
                'eta': 'ETA',
                'driver': 'Driver',
                'priority': 'Priority',
                
                // Warehouse
                'warehouse_status': 'Warehouse Status',
                'items': 'Items',
                'inbound': 'Inbound',
                'outbound': 'Outbound',
                
                // Status values
                'pending': 'Pending',
                'high': 'High',
                'medium': 'Medium',
                'low': 'Low'
            },
            jp: {
                // Header
                'dashboard_title': 'グローバル物流ハブ',
                'live_status': 'ライブ',
                
                // KPIs
                'kpi_title': '主要業績評価指標',
                'active_trucks': '稼働中トラック',
                'deliveries_today': '本日の配送',
                'avg_fuel': '平均燃費/100km',
                'cost_savings': 'コスト削減',
                
                // Map
                'fleet_tracking': 'リアルタイム車両追跡',
                'in_transit': '輸送中',
                'at_warehouse': '倉庫内',
                'maintenance': 'メンテナンス',
                
                // Charts
                'delivery_performance': '配送パフォーマンス',
                'fuel_consumption': '燃料消費',
                'cost_analysis': 'コスト分析',
                
                // Table
                'active_shipments': 'アクティブな出荷',
                'search_placeholder': '出荷を検索...',
                'all_status': '全ステータス',
                'delivered': '配送完了',
                'delayed': '遅延',
                'shipment_id': '出荷ID',
                'origin': '出発地',
                'destination': '目的地',
                'status': 'ステータス',
                'eta': '到着予定',
                'driver': 'ドライバー',
                'priority': '優先度',
                
                // Warehouse
                'warehouse_status': '倉庫状況',
                'items': 'アイテム',
                'inbound': '入庫予定',
                'outbound': '出庫予定',
                
                // Status values
                'pending': '保留中',
                'high': '高',
                'medium': '中',
                'low': '低'
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyLanguage(this.currentLanguage);
    }

    setupEventListeners() {
        // Language toggle buttons
        document.getElementById('lang-en')?.addEventListener('click', () => {
            this.switchLanguage('en');
        });
        
        document.getElementById('lang-jp')?.addEventListener('click', () => {
            this.switchLanguage('jp');
        });
    }

    switchLanguage(language) {
        if (this.currentLanguage === language) return;
        
        this.currentLanguage = language;
        this.updateLanguageButtons();
        this.applyLanguage(language);
        this.notifySubscribers(language);
        
        // Store preference
        localStorage.setItem('preferred-language', language);
    }

    updateLanguageButtons() {
        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`lang-${this.currentLanguage}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    applyLanguage(language) {
        // Update elements with data-lang attributes
        document.querySelectorAll('[data-lang-en]').forEach(element => {
            const key = element.getAttribute(`data-lang-${language}`);
            if (key) {
                element.textContent = key;
            }
        });
        
        // Update placeholder attributes
        document.querySelectorAll('[data-placeholder-en]').forEach(element => {
            const placeholder = element.getAttribute(`data-placeholder-${language}`);
            if (placeholder) {
                element.placeholder = placeholder;
            }
        });
        
        // Update select options
        document.querySelectorAll('select option[data-lang-en]').forEach(option => {
            const text = option.getAttribute(`data-lang-${language}`);
            if (text) {
                option.textContent = text;
            }
        });
        
        // Update document title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = language === 'jp' ? '物流指令センター' : 'Logistics Command Center';
        }
        
        // Update chart titles and labels
        this.updateChartLanguage(language);
        
        // Update KPI labels with animation
        this.updateKPILanguage(language);
        
        // Update map legend
        this.updateMapLanguage(language);
        
        // Update table if it exists
        if (window.tableController) {
            window.tableController.currentLanguage = language;
            window.tableController.renderTable();
        }
    }

    updateChartLanguage(language) {
        if (window.chartController && window.chartController.currentChart) {
            const chartType = window.chartController.currentChartType;
            let title = '';
            
            switch (chartType) {
                case 'deliveries':
                    title = language === 'jp' ? '配送パフォーマンス - 過去24時間' : 'Delivery Performance - Last 24 Hours';
                    break;
                case 'fuel':
                    title = language === 'jp' ? '燃料消費と効率 - 過去24時間' : 'Fuel Consumption & Efficiency - Last 24 Hours';
                    break;
                case 'costs':
                    title = language === 'jp' ? '平均コスト内訳 - 過去24時間' : 'Average Cost Breakdown - Last 24 Hours';
                    break;
            }
            
            if (window.chartController.currentChart.options.plugins.title) {
                window.chartController.currentChart.options.plugins.title.text = title;
                window.chartController.currentChart.update();
            }
        }
    }

    updateKPILanguage(language) {
        const kpiLabels = document.querySelectorAll('.kpi-label');
        const labelKeys = ['active_trucks', 'deliveries_today', 'avg_fuel', 'cost_savings'];
        
        kpiLabels.forEach((label, index) => {
            if (labelKeys[index] && this.translations[language][labelKeys[index]]) {
                // Add animation
                label.style.opacity = '0';
                label.style.transform = 'translateY(5px)';
                
                setTimeout(() => {
                    label.textContent = this.translations[language][labelKeys[index]];
                    label.style.transition = 'all 0.3s ease';
                    label.style.opacity = '1';
                    label.style.transform = 'translateY(0)';
                }, 150);
            }
        });
    }

    updateMapLanguage(language) {
        const legendItems = document.querySelectorAll('.legend-item span');
        const legendKeys = ['in_transit', 'at_warehouse', 'maintenance'];
        
        legendItems.forEach((item, index) => {
            if (legendKeys[index] && this.translations[language][legendKeys[index]]) {
                item.textContent = this.translations[language][legendKeys[index]];
            }
        });
    }

    getTranslation(key, language = this.currentLanguage) {
        return this.translations[language]?.[key] || key;
    }

    formatNumber(number, language = this.currentLanguage) {
        const locale = language === 'jp' ? 'ja-JP' : 'en-US';
        return new Intl.NumberFormat(locale).format(number);
    }

    formatCurrency(amount, language = this.currentLanguage) {
        const locale = language === 'jp' ? 'ja-JP' : 'en-US';
        const currency = language === 'jp' ? 'JPY' : 'USD';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDateTime(date, language = this.currentLanguage) {
        const locale = language === 'jp' ? 'ja-JP' : 'en-US';
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat(locale, options).format(new Date(date));
    }

    formatRelativeTime(date, language = this.currentLanguage) {
        const locale = language === 'jp' ? 'ja-JP' : 'en-US';
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        const now = new Date();
        const target = new Date(date);
        const diffMs = target.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        
        if (Math.abs(diffHours) < 1) {
            const diffMinutes = Math.round(diffMs / (1000 * 60));
            return rtf.format(diffMinutes, 'minute');
        } else if (Math.abs(diffHours) < 24) {
            return rtf.format(diffHours, 'hour');
        } else {
            const diffDays = Math.round(diffHours / 24);
            return rtf.format(diffDays, 'day');
        }
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notifySubscribers(language) {
        this.subscribers.forEach(callback => {
            try {
                callback(language);
            } catch (error) {
                console.error('Language change notification error:', error);
            }
        });
    }

    // Advanced localization features
    updateTimeDisplay() {
        const timeDisplay = document.getElementById('current-time');
        if (timeDisplay) {
            const now = new Date();
            const locale = this.currentLanguage === 'jp' ? 'ja-JP' : 'en-US';
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            };
            
            timeDisplay.textContent = now.toLocaleTimeString(locale, options);
        }
    }

    initializeTimeUpdates() {
        // Update time display every second
        setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
    }

    // Export/Import language preferences
    exportLanguageConfig() {
        const config = {
            currentLanguage: this.currentLanguage,
            customTranslations: this.customTranslations || {},
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'language-config.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importLanguageConfig(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                if (config.currentLanguage) {
                    this.switchLanguage(config.currentLanguage);
                }
                if (config.customTranslations) {
                    this.customTranslations = config.customTranslations;
                }
            } catch (error) {
                console.error('Failed to import language config:', error);
            }
        };
        reader.readAsText(file);
    }

    // Auto-detect browser language
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const preferredLang = localStorage.getItem('preferred-language');
        
        if (preferredLang) {
            return preferredLang;
        } else if (browserLang.startsWith('ja')) {
            return 'jp';
        } else {
            return 'en';
        }
    }

    // Initialize with browser detection
    initializeWithDetection() {
        const detectedLang = this.detectBrowserLanguage();
        this.switchLanguage(detectedLang);
        this.initializeTimeUpdates();
    }
}

// Initialize language controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageController = new LanguageController();
    window.languageController.initializeWithDetection();
});