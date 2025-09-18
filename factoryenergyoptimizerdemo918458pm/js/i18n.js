/**
 * Internationalization (i18n) Module
 * Provides bilingual support for English and Japanese
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = this.initializeTranslations();
        this.observers = [];
        this.isInitialized = false;
    }

    initializeTranslations() {
        return {
            en: {
                // Application
                app: {
                    title: "Factory Energy Optimization Dashboard",
                    subtitle: "Intelligent Power Management & Cost Reduction"
                },
                
                // Navigation
                nav: {
                    overview: "Overview",
                    production: "Production Lines",
                    energy: "Energy Analysis",
                    aiInsights: "AI Insights",
                    recommendations: "Recommendations",
                    settings: "Settings"
                },
                
                // Status
                status: {
                    connected: "Connected",
                    disconnected: "Disconnected",
                    lastUpdate: "Last Update"
                },
                
                // KPIs
                kpi: {
                    powerConsumption: "Power Consumption",
                    energyCost: "Energy Cost",
                    efficiency: "Energy Efficiency",
                    productionOutput: "Production Output",
                    vsYesterday: "vs yesterday",
                    vsTarget: "vs target"
                },
                
                // Time ranges
                time: {
                    lastHour: "Last Hour",
                    last4Hours: "Last 4 Hours",
                    last24Hours: "Last 24 Hours",
                    lastWeek: "Last Week",
                    lastMonth: "Last Month"
                },
                
                // Charts
                charts: {
                    realTimePower: "Real-time Power Consumption",
                    productionLines: "Production Lines Status",
                    temperatureTrend: "Temperature Trend",
                    efficiencyAnalysis: "Efficiency Analysis",
                    costBreakdown: "Cost Breakdown"
                },
                
                // Production Lines
                lines: {
                    line1: "Assembly Line 1",
                    line2: "Assembly Line 2",
                    line3: "Packaging Line"
                },
                
                // Production
                production: {
                    title: "Production Line Analysis",
                    status: {
                        running: "Running",
                        stopped: "Stopped",
                        maintenance: "Maintenance",
                        warning: "Warning",
                        error: "Error"
                    },
                    metrics: {
                        output: "Output",
                        efficiency: "Efficiency",
                        power: "Power",
                        temperature: "Temperature",
                        voltage: "Voltage",
                        current: "Current"
                    }
                },
                
                // Energy
                energy: {
                    title: "Energy Consumption Analysis",
                    peakHours: "Peak Hours",
                    offPeakHours: "Off-Peak Hours",
                    demandCharges: "Demand Charges",
                    totalCost: "Total Cost"
                },
                
                // AI
                ai: {
                    title: "AI-Powered Analytics",
                    insights: "AI-Generated Insights",
                    refresh: "Refresh Analysis",
                    confidence: "Confidence",
                    anomalyDetection: "Anomaly Detection",
                    predictiveAnalysis: "Predictive Analysis",
                    optimization: "Optimization Suggestions"
                },
                
                // Recommendations
                recommendations: {
                    title: "Optimization Recommendations",
                    priority: {
                        high: "High Priority",
                        medium: "Medium Priority",
                        low: "Low Priority"
                    },
                    category: {
                        immediate: "Immediate Action",
                        operational: "Operational",
                        strategic: "Strategic",
                        maintenance: "Maintenance"
                    },
                    estimatedSavings: "Estimated Savings",
                    implementationTime: "Implementation Time",
                    roi: "Return on Investment"
                },
                
                // Alerts
                alerts: {
                    title: "Active Alerts",
                    types: {
                        critical: "Critical",
                        warning: "Warning",
                        info: "Information"
                    },
                    acknowledge: "Acknowledge",
                    dismiss: "Dismiss",
                    viewDetails: "View Details"
                },
                
                // Settings
                settings: {
                    title: "Configuration & Settings",
                    general: "General Settings",
                    thresholds: "Alert Thresholds",
                    notifications: "Notifications",
                    dataRetention: "Data Retention",
                    language: "Language",
                    theme: "Theme",
                    units: "Units",
                    timezone: "Timezone"
                },
                
                // Loading states
                loading: {
                    analyzing: "Analyzing sensor data...",
                    generating: "Generating recommendations...",
                    updating: "Updating dashboard...",
                    calculating: "Calculating optimization potential..."
                },
                
                // Actions
                actions: {
                    save: "Save",
                    cancel: "Cancel",
                    apply: "Apply",
                    reset: "Reset",
                    export: "Export",
                    import: "Import",
                    refresh: "Refresh",
                    configure: "Configure"
                },
                
                // Units
                units: {
                    kw: "kW",
                    kwh: "kWh",
                    celsius: "°C",
                    fahrenheit: "°F",
                    volts: "V",
                    amperes: "A",
                    percent: "%",
                    yen: "¥",
                    hours: "hours",
                    minutes: "minutes",
                    seconds: "seconds"
                },
                
                // Messages
                messages: {
                    success: {
                        saved: "Settings saved successfully",
                        applied: "Changes applied successfully",
                        exported: "Data exported successfully"
                    },
                    errors: {
                        loadFailed: "Failed to load data",
                        saveFailed: "Failed to save settings",
                        networkError: "Network connection error"
                    },
                    warnings: {
                        unsavedChanges: "You have unsaved changes",
                        highTemperature: "High temperature detected",
                        lowEfficiency: "Low efficiency detected"
                    }
                },
                
                // Tooltips
                tooltips: {
                    powerConsumption: "Current total power consumption across all production lines",
                    energyEfficiency: "Overall energy efficiency based on power input vs production output",
                    productionOutput: "Combined production output from all active lines",
                    clickToExpand: "Click to expand details",
                    dragToReorder: "Drag to reorder"
                }
            },
            
            ja: {
                // Application
                app: {
                    title: "工場エネルギー最適化ダッシュボード",
                    subtitle: "インテリジェント電力管理・コスト削減"
                },
                
                // Navigation
                nav: {
                    overview: "概要",
                    production: "生産ライン",
                    energy: "エネルギー分析",
                    aiInsights: "AI洞察",
                    recommendations: "推奨事項",
                    settings: "設定"
                },
                
                // Status
                status: {
                    connected: "接続中",
                    disconnected: "切断",
                    lastUpdate: "最終更新"
                },
                
                // KPIs
                kpi: {
                    powerConsumption: "電力消費",
                    energyCost: "エネルギーコスト",
                    efficiency: "エネルギー効率",
                    productionOutput: "生産量",
                    vsYesterday: "前日比",
                    vsTarget: "目標比"
                },
                
                // Time ranges
                time: {
                    lastHour: "過去1時間",
                    last4Hours: "過去4時間",
                    last24Hours: "過去24時間",
                    lastWeek: "過去1週間",
                    lastMonth: "過去1ヶ月"
                },
                
                // Charts
                charts: {
                    realTimePower: "リアルタイム電力消費",
                    productionLines: "生産ラインステータス",
                    temperatureTrend: "温度トレンド",
                    efficiencyAnalysis: "効率分析",
                    costBreakdown: "コスト内訳"
                },
                
                // Production Lines
                lines: {
                    line1: "組立ライン1",
                    line2: "組立ライン2",
                    line3: "包装ライン"
                },
                
                // Production
                production: {
                    title: "生産ライン分析",
                    status: {
                        running: "稼働中",
                        stopped: "停止",
                        maintenance: "メンテナンス",
                        warning: "警告",
                        error: "エラー"
                    },
                    metrics: {
                        output: "生産量",
                        efficiency: "効率",
                        power: "電力",
                        temperature: "温度",
                        voltage: "電圧",
                        current: "電流"
                    }
                },
                
                // Energy
                energy: {
                    title: "エネルギー消費分析",
                    peakHours: "ピーク時間",
                    offPeakHours: "オフピーク時間",
                    demandCharges: "需要料金",
                    totalCost: "総コスト"
                },
                
                // AI
                ai: {
                    title: "AI駆動分析",
                    insights: "AI生成インサイト",
                    refresh: "分析更新",
                    confidence: "信頼度",
                    anomalyDetection: "異常検知",
                    predictiveAnalysis: "予測分析",
                    optimization: "最適化提案"
                },
                
                // Recommendations
                recommendations: {
                    title: "最適化推奨事項",
                    priority: {
                        high: "高優先度",
                        medium: "中優先度",
                        low: "低優先度"
                    },
                    category: {
                        immediate: "即座の対応",
                        operational: "運用",
                        strategic: "戦略的",
                        maintenance: "メンテナンス"
                    },
                    estimatedSavings: "推定節約額",
                    implementationTime: "実装時間",
                    roi: "投資収益率"
                },
                
                // Alerts
                alerts: {
                    title: "アクティブアラート",
                    types: {
                        critical: "重要",
                        warning: "警告",
                        info: "情報"
                    },
                    acknowledge: "確認",
                    dismiss: "解除",
                    viewDetails: "詳細表示"
                },
                
                // Settings
                settings: {
                    title: "設定・構成",
                    general: "一般設定",
                    thresholds: "アラート閾値",
                    notifications: "通知",
                    dataRetention: "データ保持",
                    language: "言語",
                    theme: "テーマ",
                    units: "単位",
                    timezone: "タイムゾーン"
                },
                
                // Loading states
                loading: {
                    analyzing: "センサーデータを分析中...",
                    generating: "推奨事項を生成中...",
                    updating: "ダッシュボードを更新中...",
                    calculating: "最適化ポテンシャルを計算中..."
                },
                
                // Actions
                actions: {
                    save: "保存",
                    cancel: "キャンセル",
                    apply: "適用",
                    reset: "リセット",
                    export: "エクスポート",
                    import: "インポート",
                    refresh: "更新",
                    configure: "設定"
                },
                
                // Units
                units: {
                    kw: "kW",
                    kwh: "kWh",
                    celsius: "°C",
                    fahrenheit: "°F",
                    volts: "V",
                    amperes: "A",
                    percent: "%",
                    yen: "¥",
                    hours: "時間",
                    minutes: "分",
                    seconds: "秒"
                },
                
                // Messages
                messages: {
                    success: {
                        saved: "設定が正常に保存されました",
                        applied: "変更が正常に適用されました",
                        exported: "データが正常にエクスポートされました"
                    },
                    errors: {
                        loadFailed: "データの読み込みに失敗しました",
                        saveFailed: "設定の保存に失敗しました",
                        networkError: "ネットワーク接続エラー"
                    },
                    warnings: {
                        unsavedChanges: "未保存の変更があります",
                        highTemperature: "高温が検出されました",
                        lowEfficiency: "低効率が検出されました"
                    }
                },
                
                // Tooltips
                tooltips: {
                    powerConsumption: "全生産ライン合計の現在の電力消費量",
                    energyEfficiency: "電力入力対生産出力に基づく総合エネルギー効率",
                    productionOutput: "稼働中の全ラインの生産出力合計",
                    clickToExpand: "クリックで詳細を展開",
                    dragToReorder: "ドラッグして並べ替え"
                }
            }
        };
    }

    initialize() {
        if (this.isInitialized) return;

        this.detectLanguage();
        this.bindLanguageSelector();
        this.updateDocumentLanguage();
        this.translatePage();
        this.isInitialized = true;

        console.log(`I18n Manager initialized with language: ${this.currentLanguage}`);
    }

    detectLanguage() {
        // Check for saved preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            return;
        }

        // Detect browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage.startsWith('ja')) {
            this.currentLanguage = 'ja';
        } else {
            this.currentLanguage = 'en';
        }
    }

    bindLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;

        languageSelect.value = this.currentLanguage;
        languageSelect.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
    }

    setLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language '${language}' not supported`);
            return;
        }

        const previousLanguage = this.currentLanguage;
        this.currentLanguage = language;
        
        // Save preference
        localStorage.setItem('preferredLanguage', language);
        
        // Update document
        this.updateDocumentLanguage();
        this.translatePage();
        
        // Notify observers
        this.notifyLanguageChange(language, previousLanguage);
        
        console.log(`Language changed to: ${language}`);
    }

    updateDocumentLanguage() {
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.setAttribute('data-lang', this.currentLanguage);
    }

    translatePage() {
        // Translate elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation !== key) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }
    }

    translate(key, params = {}) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (translation && typeof translation === 'object' && translation[k]) {
                translation = translation[k];
            } else {
                // Fallback to English if key not found
                let fallback = this.translations.en;
                for (const fk of keys) {
                    if (fallback && typeof fallback === 'object' && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if no translation found
                    }
                }
                translation = fallback;
                break;
            }
        }

        if (typeof translation !== 'string') {
            return key;
        }

        // Replace parameters
        return this.interpolate(translation, params);
    }

    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    formatNumber(number, options = {}) {
        const locale = this.getNumberLocale();
        return new Intl.NumberFormat(locale, options).format(number);
    }

    formatCurrency(amount, currency = 'JPY') {
        const locale = this.getNumberLocale();
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(date, options = {}) {
        const locale = this.getDateLocale();
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
    }

    formatTime(date, options = {}) {
        const locale = this.getDateLocale();
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
    }

    getNumberLocale() {
        return this.currentLanguage === 'ja' ? 'ja-JP' : 'en-US';
    }

    getDateLocale() {
        return this.currentLanguage === 'ja' ? 'ja-JP' : 'en-US';
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return Object.keys(this.translations);
    }

    isRTL() {
        // Neither English nor Japanese are RTL languages
        return false;
    }

    // Observer pattern for language changes
    addLanguageChangeObserver(observer) {
        if (typeof observer === 'function') {
            this.observers.push(observer);
        }
    }

    removeLanguageChangeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyLanguageChange(newLanguage, previousLanguage) {
        this.observers.forEach(observer => {
            try {
                observer(newLanguage, previousLanguage);
            } catch (error) {
                console.error('Error in language change observer:', error);
            }
        });

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('languageChange', {
            detail: {
                newLanguage,
                previousLanguage,
                translations: this.translations[newLanguage]
            }
        }));
    }

    // Utility methods for dynamic content
    translateElement(element, key, params = {}) {
        if (!element) return;
        
        const translation = this.translate(key, params);
        
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
        
        // Set data-i18n attribute for future translations
        element.setAttribute('data-i18n', key);
    }

    createTranslatedElement(tagName, key, params = {}) {
        const element = document.createElement(tagName);
        this.translateElement(element, key, params);
        return element;
    }

    // Template helpers
    getTranslationObject(namespace = '') {
        if (!namespace) {
            return this.translations[this.currentLanguage];
        }
        
        const keys = namespace.split('.');
        let obj = this.translations[this.currentLanguage];
        
        for (const key of keys) {
            if (obj && typeof obj === 'object' && obj[key]) {
                obj = obj[key];
            } else {
                return {};
            }
        }
        
        return obj || {};
    }

    // Pluralization support
    pluralize(key, count, params = {}) {
        const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
        let translation = this.translate(pluralKey, { ...params, count });
        
        // Fallback to base key if plural forms not found
        if (translation === pluralKey) {
            translation = this.translate(key, { ...params, count });
        }
        
        return translation;
    }

    // Context-aware translation
    translateWithContext(key, context = 'default', params = {}) {
        const contextKey = `${key}.${context}`;
        let translation = this.translate(contextKey, params);
        
        // Fallback to base key if context not found
        if (translation === contextKey) {
            translation = this.translate(key, params);
        }
        
        return translation;
    }

    // Dynamic content helpers
    updatePageTitle(titleKey, params = {}) {
        const title = this.translate(titleKey, params);
        document.title = title;
    }

    updateMetaDescription(descriptionKey, params = {}) {
        const description = this.translate(descriptionKey, params);
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = description;
        }
    }

    // Validation messages
    getValidationMessage(field, rule, params = {}) {
        const key = `validation.${field}.${rule}`;
        return this.translate(key, params);
    }

    // Export translations for external use
    exportTranslations(language = null) {
        const lang = language || this.currentLanguage;
        return JSON.stringify(this.translations[lang], null, 2);
    }

    // Import additional translations
    importTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        
        // Deep merge translations
        this.translations[language] = this.deepMerge(this.translations[language], translations);
        
        // Retranslate page if current language
        if (language === this.currentLanguage) {
            this.translatePage();
        }
    }

    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
}

// Create global instance
const i18n = new I18nManager();

// Export for use in other modules
window.I18nManager = I18nManager;
window.i18n = i18n;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        i18n.initialize();
    });
} else {
    i18n.initialize();
}