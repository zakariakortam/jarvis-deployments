/**
 * AI Agent System for Factory Energy Optimization
 * Multi-agent system for anomaly detection, cost optimization, and decision making
 */

class AIAgentSystem {
    constructor(dataService) {
        this.dataService = dataService;
        this.agents = new Map();
        this.recommendations = [];
        this.analysisHistory = [];
        this.isRunning = false;
        
        this.initializeAgents();
        this.startAnalysis();
    }

    initializeAgents() {
        // Anomaly Detection Agent
        this.agents.set('anomaly_detector', new AnomalyDetectionAgent(this.dataService));
        
        // Cost Optimization Agent  
        this.agents.set('cost_optimizer', new CostOptimizationAgent(this.dataService));
        
        // Production Efficiency Agent
        this.agents.set('efficiency_agent', new EfficiencyAgent(this.dataService));
        
        // Predictive Maintenance Agent
        this.agents.set('maintenance_agent', new PredictiveMaintenanceAgent(this.dataService));
        
        // Decision Coordinator Agent
        this.agents.set('coordinator', new DecisionCoordinatorAgent(this.dataService, this.agents));
        
        console.log('🤖 AI Agent System initialized with', this.agents.size, 'agents');
    }

    startAnalysis() {
        this.isRunning = true;
        
        // Run agent analysis every 30 seconds
        setInterval(() => {
            if (this.isRunning) {
                this.runAnalysisCycle();
            }
        }, 30000);

        // Generate initial recommendations
        setTimeout(() => this.runAnalysisCycle(), 5000);
    }

    async runAnalysisCycle() {
        console.log('🔍 Starting AI analysis cycle...');
        
        const currentData = this.dataService.getAllData();
        if (Object.keys(currentData).length === 0) return;

        const results = await Promise.all([
            this.agents.get('anomaly_detector').analyze(currentData),
            this.agents.get('cost_optimizer').analyze(currentData),
            this.agents.get('efficiency_agent').analyze(currentData),
            this.agents.get('maintenance_agent').analyze(currentData)
        ]);

        // Coordinator processes all results
        const coordinatedRecommendations = await this.agents.get('coordinator').coordinate(results);
        
        this.updateRecommendations(coordinatedRecommendations);
        this.updateUI();
        
        console.log('✅ Analysis cycle complete, generated', coordinatedRecommendations.length, 'recommendations');
    }

    updateRecommendations(newRecommendations) {
        // Add timestamps and IDs to recommendations
        const timestampedRecs = newRecommendations.map(rec => ({
            ...rec,
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            status: 'active'
        }));

        // Merge with existing recommendations, removing duplicates
        this.recommendations = this.mergerecommendations(this.recommendations, timestampedRecs);
        
        // Keep only the latest 20 recommendations
        this.recommendations = this.recommendations.slice(0, 20);
    }

    mergerecommendations(existing, newRecs) {
        const merged = [...existing];
        
        newRecs.forEach(newRec => {
            const existingIndex = merged.findIndex(rec => 
                rec.type === newRec.type && rec.category === newRec.category
            );
            
            if (existingIndex !== -1) {
                // Update existing recommendation
                merged[existingIndex] = newRec;
            } else {
                // Add new recommendation
                merged.unshift(newRec);
            }
        });
        
        return merged;
    }

    updateUI() {
        const recommendationList = document.getElementById('recommendationList');
        if (!recommendationList) return;

        recommendationList.innerHTML = '';
        
        this.recommendations.forEach(rec => {
            const recElement = this.createRecommendationElement(rec);
            recommendationList.appendChild(recElement);
        });

        // Update AI status indicator
        const aiStatus = document.getElementById('aiStatus');
        if (aiStatus) {
            aiStatus.className = `status-indicator ${this.recommendations.length > 0 ? 'warning' : ''}`;
        }
    }

    createRecommendationElement(rec) {
        const div = document.createElement('div');
        div.className = `recommendation-item ${rec.severity}`;
        
        const lang = getCurrentLanguage();
        const title = lang === 'ja' && rec.title_ja ? rec.title_ja : rec.title;
        const description = lang === 'ja' && rec.description_ja ? rec.description_ja : rec.description;
        
        div.innerHTML = `
            <div class="rec-header">
                <span class="rec-title">${title}</span>
                <span class="rec-impact">${rec.impact}</span>
            </div>
            <div class="rec-description">${description}</div>
            <div style="margin-top: 8px; font-size: 12px; color: #7f8c8d;">
                Agent: ${rec.agent} | Confidence: ${rec.confidence}%
            </div>
        `;
        
        return div;
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    getRecommendations() {
        return this.recommendations;
    }

    stopAnalysis() {
        this.isRunning = false;
        console.log('🛑 AI analysis stopped');
    }

    startAnalysisIfStopped() {
        if (!this.isRunning) {
            this.isRunning = true;
            console.log('▶️ AI analysis resumed');
        }
    }
}

class AnomalyDetectionAgent {
    constructor(dataService) {
        this.dataService = dataService;
        this.name = 'Anomaly Detector';
        this.confidence = 0.85;
        this.thresholds = {
            power_spike: 300,
            power_dip: 150,
            efficiency_low: 70,
            production_low: 1000,
            temperature_high: 30,
            vibration_high: 0.5
        };
    }

    async analyze(data) {
        const recommendations = [];
        
        // Power anomaly detection
        if (data.power && data.power.active_power > this.thresholds.power_spike) {
            recommendations.push({
                type: 'power_anomaly',
                category: 'energy',
                severity: 'warning',
                agent: this.name,
                confidence: 90,
                impact: '¥2,400/day',
                title: 'Power Consumption Spike Detected',
                title_ja: '消費電力のスパイクを検出',
                description: `Power consumption (${data.power.active_power.toFixed(1)}kW) exceeds normal range. Investigate equipment efficiency.`,
                description_ja: `消費電力（${data.power.active_power.toFixed(1)}kW）が通常範囲を超えています。機器効率を調査してください。`,
                action: 'investigate_equipment',
                priority: 'high'
            });
        }

        // Low efficiency detection
        if (data.derived && data.derived.efficiency < this.thresholds.efficiency_low) {
            recommendations.push({
                type: 'efficiency_anomaly',
                category: 'efficiency',
                severity: 'warning',
                agent: this.name,
                confidence: 85,
                impact: '¥1,800/day',
                title: 'Low Energy Efficiency Detected',
                title_ja: 'エネルギー効率の低下を検出',
                description: `Current efficiency (${data.derived.efficiency.toFixed(1)}%) is below target. Consider equipment maintenance.`,
                description_ja: `現在の効率（${data.derived.efficiency.toFixed(1)}%）が目標を下回っています。機器のメンテナンスを検討してください。`,
                action: 'schedule_maintenance',
                priority: 'medium'
            });
        }

        // Production anomaly detection
        if (data.production && data.production.units_per_hour < this.thresholds.production_low) {
            recommendations.push({
                type: 'production_anomaly',
                category: 'production',
                severity: 'critical',
                agent: this.name,
                confidence: 95,
                impact: '¥15,000/hour',
                title: 'Low Production Rate Detected',
                title_ja: '生産率の低下を検出',
                description: `Production rate (${data.production.units_per_hour.toFixed(0)} units/hour) is critically low.`,
                description_ja: `生産率（${data.production.units_per_hour.toFixed(0)} 個/時）が危険なレベルまで低下しています。`,
                action: 'immediate_intervention',
                priority: 'critical'
            });
        }

        // Temperature anomaly
        if (data.environment && data.environment.temperature > this.thresholds.temperature_high) {
            recommendations.push({
                type: 'temperature_anomaly',
                category: 'environment',
                severity: 'warning',
                agent: this.name,
                confidence: 80,
                impact: '¥800/day',
                title: 'High Temperature Detected',
                title_ja: '高温を検出',
                description: `Equipment temperature (${data.environment.temperature.toFixed(1)}°C) may affect efficiency.`,
                description_ja: `機器温度（${data.environment.temperature.toFixed(1)}°C）が効率に影響する可能性があります。`,
                action: 'check_cooling',
                priority: 'medium'
            });
        }

        return recommendations;
    }
}

class CostOptimizationAgent {
    constructor(dataService) {
        this.dataService = dataService;
        this.name = 'Cost Optimizer';
        this.confidence = 0.90;
        this.costThresholds = {
            hourly_cost: 500,
            daily_cost: 12000,
            efficiency_target: 85
        };
    }

    async analyze(data) {
        const recommendations = [];

        if (!data.derived) return recommendations;

        // High cost per hour detection
        if (data.derived.cost_per_hour > this.costThresholds.hourly_cost) {
            recommendations.push({
                type: 'cost_optimization',
                category: 'cost',
                severity: 'warning',
                agent: this.name,
                confidence: 92,
                impact: `¥${((data.derived.cost_per_hour - this.costThresholds.hourly_cost) * 24).toFixed(0)}/day`,
                title: 'High Energy Costs Detected',
                title_ja: '高いエネルギーコストを検出',
                description: 'Implement load scheduling during off-peak hours to reduce costs by up to 30%.',
                description_ja: 'オフピーク時間帯での負荷スケジューリングを実装して、最大30%のコスト削減を実現してください。',
                action: 'implement_load_scheduling',
                priority: 'high'
            });
        }

        // Power factor optimization
        if (data.power && data.power.power_factor < 0.85) {
            const potentialSavings = data.power.active_power * 0.15; // 15% potential savings
            recommendations.push({
                type: 'power_factor_optimization',
                category: 'efficiency',
                severity: 'normal',
                agent: this.name,
                confidence: 88,
                impact: `¥${(potentialSavings * 25).toFixed(0)}/hour`,
                title: 'Power Factor Correction Opportunity',
                title_ja: '力率改善の機会',
                description: 'Install capacitor banks to improve power factor and reduce reactive power charges.',
                description_ja: 'コンデンサバンクを設置して力率を改善し、無効電力料金を削減してください。',
                action: 'install_capacitors',
                priority: 'medium'
            });
        }

        // Peak demand management
        const currentHour = new Date().getHours();
        if (currentHour >= 9 && currentHour <= 17 && data.power && data.power.active_power > 250) {
            recommendations.push({
                type: 'peak_demand_management',
                category: 'cost',
                severity: 'normal',
                agent: this.name,
                confidence: 85,
                impact: '¥3,200/month',
                title: 'Peak Demand Reduction Opportunity',
                title_ja: 'ピーク需要削減の機会',
                description: 'Shift non-critical operations to off-peak hours to reduce demand charges.',
                description_ja: '重要でない作業をオフピーク時間に移して需要料金を削減してください。',
                action: 'schedule_operations',
                priority: 'low'
            });
        }

        return recommendations;
    }
}

class EfficiencyAgent {
    constructor(dataService) {
        this.dataService = dataService;
        this.name = 'Efficiency Optimizer';
        this.confidence = 0.87;
    }

    async analyze(data) {
        const recommendations = [];

        if (!data.production || !data.power) return recommendations;

        // Energy intensity analysis
        const energyIntensity = data.power.active_power / (data.production.units_per_hour || 1);
        const targetIntensity = 0.15; // kW per unit

        if (energyIntensity > targetIntensity * 1.2) {
            recommendations.push({
                type: 'energy_intensity_improvement',
                category: 'efficiency',
                severity: 'normal',
                agent: this.name,
                confidence: 90,
                impact: `¥${((energyIntensity - targetIntensity) * data.production.units_per_hour * 25).toFixed(0)}/hour`,
                title: 'Energy Intensity Optimization',
                title_ja: 'エネルギー原単位の最適化',
                description: `Current energy intensity (${energyIntensity.toFixed(3)} kW/unit) exceeds optimal levels. Consider equipment upgrades.`,
                description_ja: `現在のエネルギー原単位（${energyIntensity.toFixed(3)} kW/個）が最適レベルを超えています。機器のアップグレードを検討してください。`,
                action: 'upgrade_equipment',
                priority: 'medium'
            });
        }

        // OEE improvement opportunities
        if (data.production.oee < 0.90) {
            const oeeImprovement = (0.90 - data.production.oee) * 100;
            recommendations.push({
                type: 'oee_improvement',
                category: 'production',
                severity: 'normal',
                agent: this.name,
                confidence: 85,
                impact: `¥${(oeeImprovement * 100).toFixed(0)}/hour`,
                title: 'OEE Improvement Opportunity',
                title_ja: 'OEE改善の機会',
                description: `Current OEE (${(data.production.oee * 100).toFixed(1)}%) can be improved through predictive maintenance and process optimization.`,
                description_ja: `現在のOEE（${(data.production.oee * 100).toFixed(1)}%）は予知保全とプロセス最適化により改善できます。`,
                action: 'optimize_processes',
                priority: 'medium'
            });
        }

        return recommendations;
    }
}

class PredictiveMaintenanceAgent {
    constructor(dataService) {
        this.dataService = dataService;
        this.name = 'Predictive Maintenance';
        this.confidence = 0.82;
    }

    async analyze(data) {
        const recommendations = [];

        if (!data.environment) return recommendations;

        // Vibration analysis
        if (data.environment.vibration > 0.4) {
            recommendations.push({
                type: 'maintenance_alert',
                category: 'maintenance',
                severity: 'warning',
                agent: this.name,
                confidence: 88,
                impact: '¥50,000 avoided',
                title: 'Equipment Maintenance Required',
                title_ja: '機器メンテナンスが必要',
                description: `High vibration levels (${data.environment.vibration.toFixed(2)}mm/s) indicate potential bearing wear.`,
                description_ja: `高い振動レベル（${data.environment.vibration.toFixed(2)}mm/s）はベアリング摩耗の可能性を示しています。`,
                action: 'schedule_maintenance',
                priority: 'high'
            });
        }

        // Temperature-based maintenance prediction
        if (data.environment.temperature > 28) {
            recommendations.push({
                type: 'cooling_maintenance',
                category: 'maintenance',
                severity: 'normal',
                agent: this.name,
                confidence: 75,
                impact: '¥25,000 avoided',
                title: 'Cooling System Check Required',
                title_ja: '冷却システムの点検が必要',
                description: 'Elevated temperatures suggest cooling system maintenance may be needed.',
                description_ja: '温度上昇により冷却システムのメンテナンスが必要な可能性があります。',
                action: 'check_cooling_system',
                priority: 'low'
            });
        }

        return recommendations;
    }
}

class DecisionCoordinatorAgent {
    constructor(dataService, agents) {
        this.dataService = dataService;
        this.agents = agents;
        this.name = 'Decision Coordinator';
        this.confidence = 0.93;
    }

    async coordinate(agentResults) {
        // Flatten all recommendations from all agents
        const allRecommendations = agentResults.flat();
        
        // Remove duplicates and prioritize
        const uniqueRecommendations = this.deduplicateRecommendations(allRecommendations);
        
        // Sort by priority and impact
        const sortedRecommendations = this.prioritizeRecommendations(uniqueRecommendations);
        
        // Add coordinator insights
        const coordinatorRecommendations = this.generateCoordinatorRecommendations();
        
        return [...sortedRecommendations, ...coordinatorRecommendations];
    }

    deduplicateRecommendations(recommendations) {
        const unique = new Map();
        
        recommendations.forEach(rec => {
            const key = `${rec.type}_${rec.category}`;
            if (!unique.has(key) || unique.get(key).confidence < rec.confidence) {
                unique.set(key, rec);
            }
        });
        
        return Array.from(unique.values());
    }

    prioritizeRecommendations(recommendations) {
        const priorityOrder = { critical: 0, high: 1, warning: 2, medium: 3, normal: 4, low: 5 };
        
        return recommendations.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Sort by confidence if priorities are equal
            return b.confidence - a.confidence;
        });
    }

    generateCoordinatorRecommendations() {
        const data = this.dataService.getAllData();
        if (!data.power || !data.production) return [];

        const recommendations = [];

        // Overall system optimization
        const overallEfficiency = data.derived ? data.derived.efficiency : 0;
        if (overallEfficiency > 0 && overallEfficiency < 85) {
            recommendations.push({
                type: 'system_optimization',
                category: 'overall',
                severity: 'normal',
                agent: this.name,
                confidence: 95,
                impact: '¥5,000/day',
                title: 'Comprehensive System Optimization',
                title_ja: '包括的システム最適化',
                description: 'Coordinate multiple improvement initiatives for maximum cost reduction and efficiency gains.',
                description_ja: '最大のコスト削減と効率向上のために複数の改善施策を調整してください。',
                action: 'coordinate_improvements',
                priority: 'medium'
            });
        }

        return recommendations;
    }
}

// Initialize AI Agent System
let aiSystem;

document.addEventListener('DOMContentLoaded', () => {
    if (window.dataService) {
        aiSystem = new AIAgentSystem(window.dataService);
        window.aiSystem = aiSystem;
        console.log('🤖 AI Agent System ready');
    }
});