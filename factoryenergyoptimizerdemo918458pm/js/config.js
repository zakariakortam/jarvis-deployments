/**
 * Application Configuration
 * Central configuration management for the Factory Energy Optimizer
 */

const CONFIG = {
    // Application metadata
    app: {
        name: "Factory Energy Optimization Dashboard",
        version: "1.0.0",
        build: "2024-01-01",
        author: "OKI Electric Industry Co., Ltd."
    },

    // API endpoints (for future real sensor integration)
    api: {
        baseUrl: "/api/v1",
        endpoints: {
            sensors: "/sensors",
            production: "/production",
            energy: "/energy",
            alerts: "/alerts",
            recommendations: "/recommendations",
            settings: "/settings"
        },
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000 // 1 second
    },

    // Sensor data configuration
    sensors: {
        updateInterval: 1000, // 1 second
        dataRetentionHours: 24,
        maxHistoryPoints: 1440, // 24 hours * 60 minutes
        anomalyDetectionEnabled: true,
        realTimeThreshold: 5000 // 5 seconds for real-time consideration
    },

    // Production line configuration
    production: {
        lines: [
            {
                id: "line1",
                name: "Assembly Line 1",
                type: "assembly",
                capacity: 100, // units per hour
                powerRating: 150, // kW
                optimalTemperature: 35, // °C
                criticalTemperature: 55, // °C
                maintenanceSchedule: "weekly"
            },
            {
                id: "line2",
                name: "Assembly Line 2",
                type: "assembly",
                capacity: 120,
                powerRating: 180,
                optimalTemperature: 35,
                criticalTemperature: 55,
                maintenanceSchedule: "weekly"
            },
            {
                id: "line3",
                name: "Packaging Line",
                type: "packaging",
                capacity: 200,
                powerRating: 95,
                optimalTemperature: 30,
                criticalTemperature: 50,
                maintenanceSchedule: "biweekly"
            }
        ],
        defaultEfficiencyTarget: 0.85, // 85%
        minEfficiencyThreshold: 0.60, // 60%
        warningEfficiencyThreshold: 0.75 // 75%
    },

    // Energy management configuration
    energy: {
        currency: "JPY",
        rates: {
            peak: {
                rate: 28.5, // ¥/kWh
                hours: { start: 9, end: 17 }, // 9 AM to 5 PM
                weekdaysOnly: true
            },
            offPeak: {
                rate: 18.2 // ¥/kWh
            },
            demand: {
                charge: 1520, // ¥/kW per month
                billingPeriod: "monthly"
            }
        },
        targets: {
            dailyConsumption: 8000, // kWh
            monthlyBudget: 2000000, // ¥
            efficiencyImprovement: 0.15, // 15% annual improvement target
            carbonReduction: 0.20 // 20% carbon footprint reduction target
        },
        thresholds: {
            powerLimit: 500, // kW maximum demand
            costAlert: 100000, // ¥ daily cost alert threshold
            efficiencyWarning: 0.70 // 70% efficiency warning threshold
        }
    },

    // AI and analytics configuration
    ai: {
        anomalyDetection: {
            enabled: true,
            sensitivity: 0.7, // 0.0 to 1.0
            confidenceThreshold: 0.75,
            historicalWindowMinutes: 60,
            alertThreshold: 0.8
        },
        optimization: {
            enabled: true,
            updateInterval: 300000, // 5 minutes
            learningRate: 0.1,
            maxRecommendations: 10,
            minROIThreshold: 0.15 // 15% minimum ROI for recommendations
        },
        prediction: {
            enabled: true,
            forecastHours: 24,
            updateInterval: 900000, // 15 minutes
            confidenceLevel: 0.95
        }
    },

    // Alert and notification configuration
    alerts: {
        enabled: true,
        levels: {
            info: {
                priority: 1,
                autoAcknowledge: true,
                autoAcknowledgeDelay: 300000 // 5 minutes
            },
            warning: {
                priority: 2,
                autoAcknowledge: false,
                escalationDelay: 900000 // 15 minutes
            },
            critical: {
                priority: 3,
                autoAcknowledge: false,
                escalationDelay: 300000 // 5 minutes
            }
        },
        thresholds: {
            temperature: {
                warning: 45, // °C
                critical: 55 // °C
            },
            power: {
                warning: 400, // kW
                critical: 480 // kW
            },
            efficiency: {
                warning: 75, // %
                critical: 60 // %
            }
        },
        notifications: {
            email: false, // Would be configured for real deployment
            sms: false,
            dashboard: true,
            sound: false
        }
    },

    // UI and display configuration
    ui: {
        theme: {
            default: "light",
            options: ["light", "dark", "auto"]
        },
        language: {
            default: "en",
            supported: ["en", "ja"],
            fallback: "en"
        },
        dashboard: {
            autoRefresh: true,
            refreshInterval: 1000, // 1 second
            chartAnimations: true,
            compactMode: false
        },
        charts: {
            defaultTimeRange: "24h",
            maxDataPoints: 100,
            smoothLines: true,
            showDataLabels: false,
            exportFormats: ["png", "csv", "json"]
        },
        accessibility: {
            highContrast: false,
            fontSize: "normal", // "small", "normal", "large"
            reducedMotion: false,
            screenReader: false
        }
    },

    // Data persistence configuration
    storage: {
        type: "localStorage", // "localStorage", "sessionStorage", "indexedDB"
        prefix: "factory_optimizer_",
        encryption: false,
        compression: false,
        maxSize: 10 * 1024 * 1024, // 10MB
        dataRetention: {
            settings: "permanent",
            sensorData: "7d", // 7 days
            alerts: "30d", // 30 days
            recommendations: "90d" // 90 days
        }
    },

    // Performance and optimization
    performance: {
        enableLazyLoading: true,
        enableCaching: true,
        cacheExpiration: 300000, // 5 minutes
        maxConcurrentRequests: 5,
        debounceDelay: 300, // milliseconds
        throttleDelay: 1000, // milliseconds
        virtualScrolling: true,
        imageOptimization: true
    },

    // Debug and development
    debug: {
        enabled: false, // Set to true for development
        logLevel: "info", // "error", "warn", "info", "debug"
        showPerformanceMetrics: false,
        enableConsoleCommands: false,
        mockDataEnabled: true, // Always true for this demo
        verboseLogging: false
    },

    // Integration settings (for future expansion)
    integrations: {
        erp: {
            enabled: false,
            apiEndpoint: "",
            syncInterval: 3600000 // 1 hour
        },
        mes: {
            enabled: false,
            apiEndpoint: "",
            syncInterval: 300000 // 5 minutes
        },
        scada: {
            enabled: false,
            apiEndpoint: "",
            realTimeEnabled: false
        },
        maintenance: {
            enabled: false,
            apiEndpoint: "",
            syncInterval: 86400000 // 24 hours
        }
    },

    // Security configuration
    security: {
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 3,
        passwordPolicy: {
            minLength: 8,
            requireNumbers: true,
            requireSymbols: true,
            requireMixedCase: true
        },
        dataValidation: {
            strictMode: true,
            sanitizeInput: true,
            validateTypes: true
        },
        cors: {
            allowedOrigins: ["*"], // Configure for production
            allowedMethods: ["GET", "POST", "PUT", "DELETE"],
            allowCredentials: true
        }
    },

    // Backup and recovery
    backup: {
        enabled: false, // Would be enabled in production
        interval: 86400000, // 24 hours
        retention: 30, // days
        compression: true,
        encryption: true,
        location: "local" // "local", "cloud", "external"
    },

    // Feature flags
    features: {
        experimentalAI: false,
        advancedAnalytics: true,
        customDashboards: true,
        realTimeAlerts: true,
        predictiveMaintenance: false,
        energyTrading: false,
        mobileDashboard: false,
        offlineMode: false
    }
};

// Environment-specific overrides
const ENVIRONMENT = 'development'; // 'development', 'staging', 'production'

const ENV_CONFIGS = {
    development: {
        debug: {
            enabled: true,
            logLevel: "debug",
            showPerformanceMetrics: true,
            enableConsoleCommands: true,
            verboseLogging: true
        },
        api: {
            timeout: 10000
        }
    },
    staging: {
        debug: {
            enabled: true,
            logLevel: "info",
            showPerformanceMetrics: false
        }
    },
    production: {
        debug: {
            enabled: false,
            logLevel: "error",
            mockDataEnabled: false
        },
        performance: {
            enableCaching: true,
            cacheExpiration: 600000 // 10 minutes
        }
    }
};

// Apply environment-specific configuration
function applyEnvironmentConfig() {
    const envConfig = ENV_CONFIGS[ENVIRONMENT];
    if (envConfig) {
        // Deep merge environment config into main config
        Object.keys(envConfig).forEach(key => {
            if (CONFIG[key] && typeof CONFIG[key] === 'object') {
                Object.assign(CONFIG[key], envConfig[key]);
            } else {
                CONFIG[key] = envConfig[key];
            }
        });
    }
}

applyEnvironmentConfig();

// Configuration validation
function validateConfig() {
    const requiredKeys = ['app', 'sensors', 'production', 'energy', 'ui'];
    const missing = requiredKeys.filter(key => !CONFIG[key]);
    
    if (missing.length > 0) {
        console.error('Missing required configuration keys:', missing);
        return false;
    }
    
    // Validate sensor update interval
    if (CONFIG.sensors.updateInterval < 100) {
        console.warn('Sensor update interval is very low, may impact performance');
    }
    
    // Validate production lines
    if (!CONFIG.production.lines || CONFIG.production.lines.length === 0) {
        console.error('No production lines configured');
        return false;
    }
    
    return true;
}

// Initialize configuration
if (!validateConfig()) {
    console.error('Configuration validation failed');
}

// Export configuration
window.CONFIG = CONFIG;

// Utility functions for configuration access
window.getConfig = function(path, defaultValue = null) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && value[key] !== undefined) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
};

window.setConfig = function(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let obj = CONFIG;
    
    for (const key of keys) {
        if (!obj[key] || typeof obj[key] !== 'object') {
            obj[key] = {};
        }
        obj = obj[key];
    }
    
    obj[lastKey] = value;
    
    // Persist to storage if enabled
    if (CONFIG.storage.type === 'localStorage') {
        try {
            localStorage.setItem(CONFIG.storage.prefix + 'config', JSON.stringify(CONFIG));
        } catch (error) {
            console.error('Failed to persist configuration:', error);
        }
    }
};

// Load saved configuration from storage
function loadSavedConfig() {
    if (CONFIG.storage.type === 'localStorage') {
        try {
            const saved = localStorage.getItem(CONFIG.storage.prefix + 'config');
            if (saved) {
                const savedConfig = JSON.parse(saved);
                // Only merge user-configurable settings
                const mergeableKeys = ['ui', 'alerts', 'energy'];
                mergeableKeys.forEach(key => {
                    if (savedConfig[key]) {
                        Object.assign(CONFIG[key], savedConfig[key]);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load saved configuration:', error);
        }
    }
}

loadSavedConfig();

console.log('Configuration loaded:', ENVIRONMENT, 'mode');