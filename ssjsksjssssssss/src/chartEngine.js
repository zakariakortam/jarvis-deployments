/**
 * Real-Time Chart Engine for Industrial Dashboard
 * Handles all chart rendering and updates using Canvas API
 */

class ChartEngine {
    constructor() {
        this.charts = new Map();
        this.animationFrames = new Map();
    }

    /**
     * Create a time-series line chart
     */
    createLineChart(canvasId, config = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const chart = {
            canvas,
            ctx,
            type: 'line',
            data: config.data || [],
            maxPoints: config.maxPoints || 50,
            labels: config.labels || [],
            colors: config.colors || ['#00A6FF', '#00D4AA', '#FFB800', '#FF6B6B'],
            title: config.title || '',
            yMin: config.yMin || 0,
            yMax: config.yMax || 100,
            unit: config.unit || '',
            showGrid: config.showGrid !== false,
            showLegend: config.showLegend !== false,
            smooth: config.smooth !== false
        };

        this.charts.set(canvasId, chart);
        this.renderLineChart(chart);
        return chart;
    }

    /**
     * Render line chart with smooth animations
     */
    renderLineChart(chart) {
        const { ctx, canvas, data, colors, title, yMin, yMax, unit, showGrid, showLegend, smooth } = chart;
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 40, right: 30, bottom: 40, left: 60 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        if (showGrid) {
            this.drawGrid(ctx, padding, plotWidth, plotHeight, 5, 5);
        }

        // Draw axes
        this.drawAxes(ctx, padding, plotWidth, plotHeight, yMin, yMax, unit);

        // Draw title
        if (title) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, width / 2, 20);
        }

        // Draw data series
        if (data && data.length > 0) {
            data.forEach((series, index) => {
                const color = colors[index % colors.length];
                this.drawLineSeries(ctx, series, padding, plotWidth, plotHeight, yMin, yMax, color, smooth);
            });
        }

        // Draw legend
        if (showLegend && chart.labels && chart.labels.length > 0) {
            this.drawLegend(ctx, chart.labels, colors, width - padding.right - 150, padding.top);
        }
    }

    /**
     * Draw grid lines
     */
    drawGrid(ctx, padding, width, height, xDivisions, yDivisions) {
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 0; i <= xDivisions; i++) {
            const x = padding.left + (width / xDivisions) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= yDivisions; i++) {
            const y = padding.top + (height / yDivisions) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + width, y);
            ctx.stroke();
        }
    }

    /**
     * Draw axes with labels
     */
    drawAxes(ctx, padding, width, height, yMin, yMax, unit) {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, padding.top + height);
        ctx.stroke();

        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + height);
        ctx.lineTo(padding.left + width, padding.top + height);
        ctx.stroke();

        // Y-axis labels
        ctx.fillStyle = '#999';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const value = yMin + ((yMax - yMin) / ySteps) * (ySteps - i);
            const y = padding.top + (height / ySteps) * i;
            ctx.fillText(value.toFixed(0) + (unit ? ` ${unit}` : ''), padding.left - 10, y);
        }

        // X-axis label
        ctx.textAlign = 'center';
        ctx.fillText('Time', padding.left + width / 2, padding.top + height + 30);
    }

    /**
     * Draw a data series line
     */
    drawLineSeries(ctx, series, padding, width, height, yMin, yMax, color, smooth) {
        if (!series || series.length === 0) return;

        const points = series.map((point, index) => {
            const x = padding.left + (width / (series.length - 1)) * index;
            const normalizedY = (point - yMin) / (yMax - yMin);
            const y = padding.top + height - (normalizedY * height);
            return { x, y, value: point };
        });

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        if (smooth && points.length > 2) {
            // Smooth curve using bezier
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        } else {
            // Straight lines
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(point => ctx.lineTo(point.x, point.y));
        }

        ctx.stroke();

        // Draw area under line
        ctx.lineTo(points[points.length - 1].x, padding.top + height);
        ctx.lineTo(points[0].x, padding.top + height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + height);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw points
        points.forEach(point => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Draw legend
     */
    drawLegend(ctx, labels, colors, x, y) {
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        labels.forEach((label, index) => {
            const yPos = y + index * 20;
            const color = colors[index % colors.length];

            // Color box
            ctx.fillStyle = color;
            ctx.fillRect(x, yPos - 6, 12, 12);

            // Label text
            ctx.fillStyle = '#fff';
            ctx.fillText(label, x + 18, yPos);
        });
    }

    /**
     * Update chart with new data
     */
    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;

        chart.data = newData;
        this.renderLineChart(chart);
    }

    /**
     * Add data point to chart
     */
    addDataPoint(canvasId, seriesIndex, value) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;

        if (!chart.data[seriesIndex]) {
            chart.data[seriesIndex] = [];
        }

        chart.data[seriesIndex].push(value);

        // Keep max points
        if (chart.data[seriesIndex].length > chart.maxPoints) {
            chart.data[seriesIndex].shift();
        }

        this.renderLineChart(chart);
    }

    /**
     * Create a gauge chart
     */
    createGauge(canvasId, config = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const gauge = {
            canvas,
            ctx,
            type: 'gauge',
            value: config.value || 0,
            min: config.min || 0,
            max: config.max || 100,
            title: config.title || '',
            unit: config.unit || '',
            thresholds: config.thresholds || [
                { value: 30, color: '#00D4AA' },
                { value: 70, color: '#FFB800' },
                { value: 100, color: '#FF6B6B' }
            ]
        };

        this.charts.set(canvasId, gauge);
        this.renderGauge(gauge);
        return gauge;
    }

    /**
     * Render gauge chart
     */
    renderGauge(gauge) {
        const { ctx, canvas, value, min, max, title, unit, thresholds } = gauge;
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2 + 20;
        const radius = Math.min(width, height) / 2 - 30;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw title
        if (title) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, centerX, 20);
        }

        // Draw gauge arc background
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 2.25);
        ctx.stroke();

        // Draw colored gauge segments
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const totalAngle = endAngle - startAngle;

        thresholds.forEach((threshold, index) => {
            const prevThreshold = index > 0 ? thresholds[index - 1].value : min;
            const segmentStart = startAngle + ((prevThreshold - min) / (max - min)) * totalAngle;
            const segmentEnd = startAngle + ((threshold.value - min) / (max - min)) * totalAngle;

            ctx.strokeStyle = threshold.color + '40';
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, segmentStart, segmentEnd);
            ctx.stroke();
        });

        // Draw value arc
        const valueAngle = startAngle + ((value - min) / (max - min)) * totalAngle;
        const valueColor = this.getGaugeColor(value, min, max, thresholds);

        ctx.strokeStyle = valueColor;
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
        ctx.stroke();

        // Draw value text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toFixed(1), centerX, centerY);

        // Draw unit
        if (unit) {
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#999';
            ctx.fillText(unit, centerX, centerY + 30);
        }

        // Draw min/max labels
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left';
        ctx.fillText(min.toString(), centerX - radius - 10, centerY + 10);
        ctx.textAlign = 'right';
        ctx.fillText(max.toString(), centerX + radius + 10, centerY + 10);
    }

    /**
     * Get color for gauge value based on thresholds
     */
    getGaugeColor(value, min, max, thresholds) {
        const percentage = ((value - min) / (max - min)) * 100;

        for (let threshold of thresholds) {
            if (percentage <= threshold.value) {
                return threshold.color;
            }
        }

        return thresholds[thresholds.length - 1].color;
    }

    /**
     * Update gauge value
     */
    updateGauge(canvasId, newValue) {
        const gauge = this.charts.get(canvasId);
        if (!gauge || gauge.type !== 'gauge') return;

        gauge.value = newValue;
        this.renderGauge(gauge);
    }

    /**
     * Create a bar chart
     */
    createBarChart(canvasId, config = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const chart = {
            canvas,
            ctx,
            type: 'bar',
            data: config.data || [],
            labels: config.labels || [],
            colors: config.colors || ['#00A6FF'],
            title: config.title || '',
            yMax: config.yMax || 100,
            unit: config.unit || ''
        };

        this.charts.set(canvasId, chart);
        this.renderBarChart(chart);
        return chart;
    }

    /**
     * Render bar chart
     */
    renderBarChart(chart) {
        const { ctx, canvas, data, labels, colors, title, yMax, unit } = chart;
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 40, right: 30, bottom: 60, left: 60 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        this.drawGrid(ctx, padding, plotWidth, plotHeight, data.length, 5);

        // Draw axes
        this.drawAxes(ctx, padding, plotWidth, plotHeight, 0, yMax, unit);

        // Draw title
        if (title) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, width / 2, 20);
        }

        // Draw bars
        const barWidth = plotWidth / data.length * 0.7;
        const barSpacing = plotWidth / data.length;

        data.forEach((value, index) => {
            const x = padding.left + barSpacing * index + (barSpacing - barWidth) / 2;
            const barHeight = (value / yMax) * plotHeight;
            const y = padding.top + plotHeight - barHeight;
            const color = colors[index % colors.length];

            // Draw bar
            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value on top
            ctx.fillStyle = '#fff';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(value.toFixed(0), x + barWidth / 2, y - 5);

            // Draw label
            if (labels[index]) {
                ctx.fillStyle = '#999';
                ctx.save();
                ctx.translate(x + barWidth / 2, padding.top + plotHeight + 15);
                ctx.rotate(-Math.PI / 4);
                ctx.textAlign = 'right';
                ctx.fillText(labels[index], 0, 0);
                ctx.restore();
            }
        });
    }

    /**
     * Update bar chart
     */
    updateBarChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (!chart || chart.type !== 'bar') return;

        chart.data = newData;
        this.renderBarChart(chart);
    }

    /**
     * Destroy chart
     */
    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart && this.animationFrames.has(canvasId)) {
            cancelAnimationFrame(this.animationFrames.get(canvasId));
            this.animationFrames.delete(canvasId);
        }
        this.charts.delete(canvasId);
    }
}

// Export for use in main application
window.ChartEngine = ChartEngine;
