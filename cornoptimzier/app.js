class CornOptimizer {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeChart();
        this.startMonitoring();
    }

    initializeElements() {
        this.elements = {
            cornMoisture: document.getElementById('cornMoisture'),
            temperature: document.getElementById('temperature'),
            flowRate: document.getElementById('flowRate'),
            currentPH: document.getElementById('currentPH'),
            targetViscosity: document.getElementById('targetViscosity'),
            optimizeBtn: document.getElementById('optimize'),
            optimalPH: document.getElementById('optimalPH'),
            acidRate: document.getElementById('acidRate'),
            efficiency: document.getElementById('efficiency'),
            costReduction: document.getElementById('costReduction'),
            processStatus: document.getElementById('processStatus'),
            phDeviation: document.getElementById('phDeviation'),
            thinningRate: document.getElementById('thinningRate'),
            recommendationsList: document.getElementById('recommendationsList'),
            processChart: document.getElementById('processChart')
        };
    }

    setupEventListeners() {
        this.elements.optimizeBtn.addEventListener('click', () => this.optimizeProcess());
        
        // Real-time parameter updates
        Object.keys(this.elements).forEach(key => {
            if (this.elements[key].tagName === 'INPUT') {
                this.elements[key].addEventListener('input', () => this.validateInputs());
            }
        });
    }

    initializeChart() {
        this.chartContext = this.elements.processChart.getContext('2d');
        this.chartData = {
            time: [],
            ph: [],
            viscosity: [],
            efficiency: []
        };
        this.maxDataPoints = 50;
        this.drawChart();
    }

    drawChart() {
        const ctx = this.chartContext;
        const canvas = this.elements.processChart;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Chart background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = (canvas.width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 6; i++) {
            const y = (canvas.height / 6) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw data lines
        if (this.chartData.time.length > 1) {
            this.drawLine(this.chartData.ph, '#4CAF50', 'pH');
            this.drawLine(this.chartData.viscosity, '#2196F3', 'Viscosity');
            this.drawLine(this.chartData.efficiency, '#FF9800', 'Efficiency');
        }
        
        // Chart labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Time →', canvas.width - 50, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Process Values', 0, 0);
        ctx.restore();
        
        // Legend
        this.drawLegend();
    }

    drawLine(data, color, label) {
        if (data.length < 2) return;
        
        const ctx = this.chartContext;
        const canvas = this.elements.processChart;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const x = (canvas.width / (this.maxDataPoints - 1)) * i;
            const normalizedValue = Math.max(0, Math.min(1, data[i] / 100));
            const y = canvas.height - (normalizedValue * canvas.height);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }

    drawLegend() {
        const ctx = this.chartContext;
        const canvas = this.elements.processChart;
        const legends = [
            { color: '#4CAF50', label: 'pH Level' },
            { color: '#2196F3', label: 'Viscosity' },
            { color: '#FF9800', label: 'Efficiency' }
        ];
        
        legends.forEach((legend, index) => {
            const x = canvas.width - 150;
            const y = 20 + (index * 20);
            
            ctx.fillStyle = legend.color;
            ctx.fillRect(x, y, 15, 10);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.fillText(legend.label, x + 20, y + 8);
        });
    }

    optimizeProcess() {
        this.elements.optimizeBtn.classList.add('processing');
        this.elements.optimizeBtn.textContent = ' Optimizing...';
        
        // Simulate optimization calculation
        setTimeout(() => {
            const params = this.getInputParameters();
            const results = this.calculateOptimalSetPoint(params);
            
            this.displayResults(results);
            this.updateRecommendations(results);
            this.updateStatusIndicators(results);
            
            this.elements.optimizeBtn.classList.remove('processing');
            this.elements.optimizeBtn.textContent = ' Optimize Acid Set Point';
        }, 2000);
    }

    getInputParameters() {
        return {
            cornMoisture: parseFloat(this.elements.cornMoisture.value),
            temperature: parseFloat(this.elements.temperature.value),
            flowRate: parseFloat(this.elements.flowRate.value),
            currentPH: parseFloat(this.elements.currentPH.value),
            targetViscosity: parseFloat(this.elements.targetViscosity.value)
        };
    }

    calculateOptimalSetPoint(params) {
        // Advanced optimization algorithm for corn dry thinning
        const moistureFactor = (25 - params.cornMoisture) / 15; // Normalize moisture impact
        const tempFactor = (params.temperature - 60) / 60; // Temperature efficiency factor
        const flowFactor = Math.log(params.flowRate / 100) / Math.log(50); // Flow rate optimization
        const viscosityTarget = params.targetViscosity / 500; // Viscosity normalization
        
        // Optimal pH calculation based on process parameters
        const baseOptimalPH = 4.2;
        const moistureAdjustment = moistureFactor * 0.8;
        const tempAdjustment = tempFactor * 0.6;
        const flowAdjustment = flowFactor * 0.4;
        
        const optimalPH = baseOptimalPH + moistureAdjustment - tempAdjustment + flowAdjustment;
        
        // Acid addition rate calculation (mL/min)
        const phDifference = Math.abs(params.currentPH - optimalPH);
        const acidRate = (phDifference * params.flowRate * 0.02) + (viscosityTarget * 15);
        
        // Process efficiency calculation
        const moistureEfficiency = Math.max(0, 100 - Math.abs(params.cornMoisture - 15) * 3);
        const tempEfficiency = Math.max(0, 100 - Math.abs(params.temperature - 85) * 2);
        const phEfficiency = Math.max(0, 100 - phDifference * 10);
        const efficiency = (moistureEfficiency + tempEfficiency + phEfficiency) / 3;
        
        // Cost reduction calculation
        const baselineWaste = 15; // 15% baseline process waste
        const optimizedWaste = baselineWaste * (1 - (efficiency / 100) * 0.6);
        const costReduction = ((baselineWaste - optimizedWaste) / baselineWaste) * 100;
        
        return {
            optimalPH: Math.round(optimalPH * 10) / 10,
            acidRate: Math.round(acidRate * 10) / 10,
            efficiency: Math.round(efficiency * 10) / 10,
            costReduction: Math.round(costReduction * 10) / 10,
            params: params
        };
    }

    displayResults(results) {
        this.elements.optimalPH.textContent = results.optimalPH;
        this.elements.acidRate.textContent = results.acidRate;
        this.elements.efficiency.textContent = results.efficiency;
        this.elements.costReduction.textContent = results.costReduction;
        
        // Animate result cards
        document.querySelectorAll('.result-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
    }

    updateRecommendations(results) {
        const recommendations = [];
        
        if (results.efficiency > 90) {
            recommendations.push("Excellent process efficiency achieved! Current settings are optimal.");
        } else if (results.efficiency > 80) {
            recommendations.push("Good process efficiency. Consider minor temperature adjustments for improvement.");
        } else {
            recommendations.push("Process efficiency can be improved. Check moisture content and temperature settings.");
        }
        
        if (Math.abs(results.params.currentPH - results.optimalPH) > 0.5) {
            recommendations.push(`Significant pH adjustment needed. Gradually adjust from ${results.params.currentPH} to ${results.optimalPH}.`);
        }
        
        if (results.params.cornMoisture > 18) {
            recommendations.push("High moisture content detected. Consider pre-drying to improve process efficiency.");
        }
        
        if (results.params.temperature < 80) {
            recommendations.push("Temperature below optimal range. Increase to 85-90°C for better thinning results.");
        }
        
        if (results.costReduction > 10) {
            recommendations.push(`Significant cost savings potential: ${results.costReduction}% reduction in process waste.`);
        }
        
        this.elements.recommendationsList.innerHTML = recommendations
            .map(rec => `<li>${rec}</li>`)
            .join('');
    }

    updateStatusIndicators(results) {
        // Update process status
        if (results.efficiency > 90) {
            this.updateStatusElement(this.elements.processStatus, 'Optimal', 'optimal');
        } else if (results.efficiency > 75) {
            this.updateStatusElement(this.elements.processStatus, 'Good', 'warning');
        } else {
            this.updateStatusElement(this.elements.processStatus, 'Needs Attention', 'critical');
        }
        
        // Update pH deviation
        const phDeviation = Math.abs(results.params.currentPH - results.optimalPH);
        this.elements.phDeviation.textContent = `±${phDeviation.toFixed(1)}`;
        
        // Update thinning rate
        const thinningRate = Math.min(100, results.efficiency + 10);
        this.elements.thinningRate.textContent = `${Math.round(thinningRate)}%`;
    }

    updateStatusElement(element, text, statusClass) {
        element.textContent = text;
        element.className = `status-value ${statusClass}`;
    }

    validateInputs() {
        const params = this.getInputParameters();
        let isValid = true;
        
        // Validate ranges
        if (params.cornMoisture < 10 || params.cornMoisture > 25) isValid = false;
        if (params.temperature < 60 || params.temperature > 120) isValid = false;
        if (params.flowRate < 100 || params.flowRate > 5000) isValid = false;
        if (params.currentPH < 3.0 || params.currentPH > 8.0) isValid = false;
        if (params.targetViscosity < 50 || params.targetViscosity > 500) isValid = false;
        
        this.elements.optimizeBtn.disabled = !isValid;
        
        if (!isValid) {
            this.elements.optimizeBtn.style.background = '#ccc';
        } else {
            this.elements.optimizeBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        }
    }

    startMonitoring() {
        // Simulate real-time data
        setInterval(() => {
            this.updateChartData();
        }, 2000);
    }

    updateChartData() {
        const params = this.getInputParameters();
        const time = new Date().toLocaleTimeString();
        
        // Simulate fluctuating values around the set points
        const currentPH = params.currentPH + (Math.random() - 0.5) * 0.2;
        const viscosity = params.targetViscosity + (Math.random() - 0.5) * 20;
        const efficiency = 75 + Math.random() * 20;
        
        this.chartData.time.push(time);
        this.chartData.ph.push(currentPH * 20); // Scale for visualization
        this.chartData.viscosity.push(viscosity / 5); // Scale for visualization
        this.chartData.efficiency.push(efficiency);
        
        // Keep only latest data points
        if (this.chartData.time.length > this.maxDataPoints) {
            this.chartData.time.shift();
            this.chartData.ph.shift();
            this.chartData.viscosity.shift();
            this.chartData.efficiency.shift();
        }
        
        this.drawChart();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CornOptimizer();
});

// Add some utility functions for advanced calculations
class ProcessOptimization {
    static calculateEnzymeActivity(temperature, ph, moisture) {
        // Enzymatic activity calculation for corn processing
        const tempOptimal = 85;
        const phOptimal = 4.5;
        const moistureOptimal = 15;
        
        const tempFactor = 1 - Math.pow((temperature - tempOptimal) / 40, 2);
        const phFactor = 1 - Math.pow((ph - phOptimal) / 2, 2);
        const moistureFactor = 1 - Math.pow((moisture - moistureOptimal) / 10, 2);
        
        return Math.max(0, tempFactor * phFactor * moistureFactor);
    }
    
    static predictViscosityReduction(currentViscosity, enzymeActivity, time) {
        // Predict viscosity reduction over time
        const reductionRate = enzymeActivity * 0.1;
        return currentViscosity * Math.exp(-reductionRate * time);
    }
    
    static calculateEnergyConsumption(flowRate, viscosity, temperature) {
        // Calculate energy consumption for the process
        const baseEnergy = flowRate * 0.01; // kWh
        const viscosityFactor = Math.log(viscosity / 100);
        const temperatureFactor = (temperature - 25) * 0.02;
        
        return baseEnergy * (1 + viscosityFactor + temperatureFactor);
    }
}