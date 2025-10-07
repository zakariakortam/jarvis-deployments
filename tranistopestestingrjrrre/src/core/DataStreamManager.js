/**
 * Real-time Data Streaming and State Management System
 * Manages continuous data flow from TransitSimulator with event-driven architecture
 */

class DataStreamManager {
    constructor(simulator, options = {}) {
        this.simulator = simulator;

        // Configuration
        this.config = {
            pollInterval: options.pollInterval || 1000, // 1 second default
            maxHistoryPoints: options.maxHistoryPoints || 1000,
            maxTripLogs: options.maxTripLogs || 500,
            metricsRetention: options.metricsRetention || 3600000 // 1 hour in ms
        };

        // State management
        this.state = {
            vehicles: new Map(),
            metrics: {
                current: null,
                history: []
            },
            tripLogs: [],
            statistics: {
                ridership: [],
                delays: [],
                onTimePerformance: [],
                averageSpeed: [],
                utilization: []
            },
            timestamps: []
        };

        // Event subscribers (pub/sub pattern)
        this.subscribers = {
            'vehicles:update': new Set(),
            'metrics:update': new Set(),
            'trips:new': new Set(),
            'statistics:update': new Set(),
            'error': new Set()
        };

        // Polling control
        this.isStreaming = false;
        this.pollTimer = null;
        this.lastPollTime = null;

        // Performance tracking
        this.stats = {
            totalPolls: 0,
            failedPolls: 0,
            lastUpdateDuration: 0,
            averageUpdateDuration: 0
        };
    }

    /**
     * Start streaming data from simulator
     */
    async startStreaming() {
        if (this.isStreaming) {
            console.warn('Streaming already active');
            return;
        }

        this.isStreaming = true;
        console.log('Data streaming started');

        // Initial data fetch
        await this.pollData();

        // Set up continuous polling
        this.pollTimer = setInterval(() => {
            this.pollData().catch(error => {
                console.error('Polling error:', error);
                this.emit('error', { type: 'poll', error });
            });
        }, this.config.pollInterval);
    }

    /**
     * Stop streaming data
     */
    stopStreaming() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        this.isStreaming = false;
        console.log('Data streaming stopped');
    }

    /**
     * Poll data from simulator
     * @private
     */
    async pollData() {
        const startTime = performance.now();
        this.stats.totalPolls++;

        try {
            // Fetch all data in parallel
            const [vehicles, metrics, tripLogs] = await Promise.all([
                this.fetchVehicles(),
                this.fetchMetrics(),
                this.fetchTripLogs()
            ]);

            // Update state
            this.updateVehicles(vehicles);
            this.updateMetrics(metrics);
            this.updateTripLogs(tripLogs);

            // Track performance
            const duration = performance.now() - startTime;
            this.stats.lastUpdateDuration = duration;
            this.stats.averageUpdateDuration =
                (this.stats.averageUpdateDuration * (this.stats.totalPolls - 1) + duration) /
                this.stats.totalPolls;

            this.lastPollTime = Date.now();

        } catch (error) {
            this.stats.failedPolls++;
            throw error;
        }
    }

    /**
     * Fetch vehicles from simulator
     * @private
     */
    async fetchVehicles() {
        return new Promise((resolve) => {
            // Simulate async fetch (in real scenario, this might be an API call)
            const vehicles = this.simulator.getVehicles();
            resolve(vehicles);
        });
    }

    /**
     * Fetch metrics from simulator
     * @private
     */
    async fetchMetrics() {
        return new Promise((resolve) => {
            const metrics = this.simulator.getMetrics();
            resolve(metrics);
        });
    }

    /**
     * Fetch trip logs from simulator
     * @private
     */
    async fetchTripLogs() {
        return new Promise((resolve) => {
            const logs = this.simulator.getTripLogs();
            resolve(logs);
        });
    }

    /**
     * Update vehicles state and emit changes
     * @private
     */
    updateVehicles(vehicles) {
        const previousCount = this.state.vehicles.size;

        // Update vehicles map
        this.state.vehicles.clear();
        vehicles.forEach(vehicle => {
            this.state.vehicles.set(vehicle.id, vehicle);
        });

        // Emit update event
        this.emit('vehicles:update', {
            vehicles: Array.from(this.state.vehicles.values()),
            count: vehicles.length,
            changed: vehicles.length !== previousCount
        });
    }

    /**
     * Update metrics state with time-series management
     * @private
     */
    updateMetrics(metrics) {
        const timestamp = Date.now();

        // Store current metrics
        this.state.metrics.current = metrics;

        // Add to history with timestamp
        this.state.metrics.history.push({
            timestamp,
            ...metrics
        });

        // Add to statistics time-series
        this.state.timestamps.push(timestamp);
        this.state.statistics.ridership.push(metrics.totalRidership || 0);
        this.state.statistics.delays.push(metrics.avgDelay || 0);
        this.state.statistics.onTimePerformance.push(metrics.onTimePerformance || 0);
        this.state.statistics.averageSpeed.push(metrics.avgSpeed || 0);
        this.state.statistics.utilization.push(metrics.fleetUtilization || 0);

        // Cleanup old data (rolling window)
        this.cleanupHistoricalData();

        // Emit update event
        this.emit('metrics:update', {
            current: metrics,
            statistics: this.getStatisticsSummary()
        });

        // Emit separate statistics update
        this.emit('statistics:update', {
            timestamps: this.state.timestamps.slice(),
            ridership: this.state.statistics.ridership.slice(),
            delays: this.state.statistics.delays.slice(),
            onTimePerformance: this.state.statistics.onTimePerformance.slice(),
            averageSpeed: this.state.statistics.averageSpeed.slice(),
            utilization: this.state.statistics.utilization.slice()
        });
    }

    /**
     * Update trip logs buffer
     * @private
     */
    updateTripLogs(newLogs) {
        if (!newLogs || newLogs.length === 0) return;

        const previousLength = this.state.tripLogs.length;

        // Add new logs
        newLogs.forEach(log => {
            // Check if log already exists (by trip ID)
            const exists = this.state.tripLogs.some(existing =>
                existing.tripId === log.tripId && existing.timestamp === log.timestamp
            );

            if (!exists) {
                this.state.tripLogs.push({
                    ...log,
                    timestamp: log.timestamp || Date.now()
                });
            }
        });

        // Sort by timestamp (newest first)
        this.state.tripLogs.sort((a, b) => b.timestamp - a.timestamp);

        // Trim to max size
        if (this.state.tripLogs.length > this.config.maxTripLogs) {
            this.state.tripLogs = this.state.tripLogs.slice(0, this.config.maxTripLogs);
        }

        // Emit if new trips were added
        if (this.state.tripLogs.length > previousLength) {
            const newTripsCount = this.state.tripLogs.length - previousLength;
            this.emit('trips:new', {
                trips: this.state.tripLogs.slice(0, newTripsCount),
                totalLogs: this.state.tripLogs.length
            });
        }
    }

    /**
     * Cleanup old historical data (rolling window)
     * @private
     */
    cleanupHistoricalData() {
        const maxPoints = this.config.maxHistoryPoints;
        const retentionTime = this.config.metricsRetention;
        const cutoffTime = Date.now() - retentionTime;

        // Method 1: Limit by count
        if (this.state.timestamps.length > maxPoints) {
            const excess = this.state.timestamps.length - maxPoints;
            this.state.timestamps = this.state.timestamps.slice(excess);
            this.state.statistics.ridership = this.state.statistics.ridership.slice(excess);
            this.state.statistics.delays = this.state.statistics.delays.slice(excess);
            this.state.statistics.onTimePerformance = this.state.statistics.onTimePerformance.slice(excess);
            this.state.statistics.averageSpeed = this.state.statistics.averageSpeed.slice(excess);
            this.state.statistics.utilization = this.state.statistics.utilization.slice(excess);
            this.state.metrics.history = this.state.metrics.history.slice(excess);
        }

        // Method 2: Limit by time (optional, more aggressive cleanup)
        const firstValidIndex = this.state.timestamps.findIndex(ts => ts >= cutoffTime);
        if (firstValidIndex > 0) {
            this.state.timestamps = this.state.timestamps.slice(firstValidIndex);
            this.state.statistics.ridership = this.state.statistics.ridership.slice(firstValidIndex);
            this.state.statistics.delays = this.state.statistics.delays.slice(firstValidIndex);
            this.state.statistics.onTimePerformance = this.state.statistics.onTimePerformance.slice(firstValidIndex);
            this.state.statistics.averageSpeed = this.state.statistics.averageSpeed.slice(firstValidIndex);
            this.state.statistics.utilization = this.state.statistics.utilization.slice(firstValidIndex);
            this.state.metrics.history = this.state.metrics.history.slice(firstValidIndex);
        }
    }

    /**
     * Subscribe to data update events
     * @param {string} event - Event name (vehicles:update, metrics:update, trips:new, statistics:update, error)
     * @param {function} callback - Callback function
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            console.warn(`Unknown event type: ${event}`);
            return () => {};
        }

        this.subscribers[event].add(callback);

        // Return unsubscribe function
        return () => this.unsubscribe(event, callback);
    }

    /**
     * Unsubscribe from data update events
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    unsubscribe(event, callback) {
        if (this.subscribers[event]) {
            this.subscribers[event].delete(callback);
        }
    }

    /**
     * Emit event to all subscribers
     * @private
     */
    emit(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscriber for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get current vehicles
     * @returns {Array} Array of vehicle objects
     */
    getVehicles() {
        return Array.from(this.state.vehicles.values());
    }

    /**
     * Get current metrics
     * @returns {Object} Current metrics object
     */
    getMetrics() {
        return this.state.metrics.current;
    }

    /**
     * Get historical data for a specific metric
     * @param {string} metric - Metric name (ridership, delays, onTimePerformance, averageSpeed, utilization)
     * @param {Object} timeRange - Time range {start, end} in milliseconds
     * @returns {Array} Array of {timestamp, value} objects
     */
    getHistoricalData(metric, timeRange = null) {
        if (!this.state.statistics[metric]) {
            console.warn(`Unknown metric: ${metric}`);
            return [];
        }

        let timestamps = this.state.timestamps;
        let values = this.state.statistics[metric];

        // Filter by time range if provided
        if (timeRange) {
            const { start, end } = timeRange;
            const filtered = timestamps.reduce((acc, timestamp, index) => {
                if ((!start || timestamp >= start) && (!end || timestamp <= end)) {
                    acc.timestamps.push(timestamp);
                    acc.values.push(values[index]);
                }
                return acc;
            }, { timestamps: [], values: [] });

            timestamps = filtered.timestamps;
            values = filtered.values;
        }

        // Return as array of objects
        return timestamps.map((timestamp, index) => ({
            timestamp,
            value: values[index]
        }));
    }

    /**
     * Get all historical statistics
     * @param {Object} timeRange - Optional time range {start, end}
     * @returns {Object} Object with all statistics arrays
     */
    getAllHistoricalData(timeRange = null) {
        return {
            ridership: this.getHistoricalData('ridership', timeRange),
            delays: this.getHistoricalData('delays', timeRange),
            onTimePerformance: this.getHistoricalData('onTimePerformance', timeRange),
            averageSpeed: this.getHistoricalData('averageSpeed', timeRange),
            utilization: this.getHistoricalData('utilization', timeRange)
        };
    }

    /**
     * Get trip logs
     * @param {number} limit - Maximum number of logs to return
     * @returns {Array} Array of trip log objects
     */
    getTripLogs(limit = null) {
        if (limit && limit < this.state.tripLogs.length) {
            return this.state.tripLogs.slice(0, limit);
        }
        return this.state.tripLogs.slice();
    }

    /**
     * Get statistics summary
     * @private
     */
    getStatisticsSummary() {
        const calculate = (arr) => {
            if (arr.length === 0) return { current: 0, avg: 0, min: 0, max: 0 };
            const current = arr[arr.length - 1] || 0;
            const sum = arr.reduce((a, b) => a + b, 0);
            const avg = sum / arr.length;
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            return { current, avg, min, max };
        };

        return {
            ridership: calculate(this.state.statistics.ridership),
            delays: calculate(this.state.statistics.delays),
            onTimePerformance: calculate(this.state.statistics.onTimePerformance),
            averageSpeed: calculate(this.state.statistics.averageSpeed),
            utilization: calculate(this.state.statistics.utilization),
            dataPoints: this.state.timestamps.length,
            timeRange: {
                start: this.state.timestamps[0] || null,
                end: this.state.timestamps[this.state.timestamps.length - 1] || null
            }
        };
    }

    /**
     * Get streaming performance stats
     * @returns {Object} Performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.stats,
            isStreaming: this.isStreaming,
            lastPollTime: this.lastPollTime,
            pollInterval: this.config.pollInterval,
            dataPoints: this.state.timestamps.length,
            vehicleCount: this.state.vehicles.size,
            tripLogCount: this.state.tripLogs.length
        };
    }

    /**
     * Clear all historical data
     */
    clearHistory() {
        this.state.metrics.history = [];
        this.state.statistics = {
            ridership: [],
            delays: [],
            onTimePerformance: [],
            averageSpeed: [],
            utilization: []
        };
        this.state.timestamps = [];
        this.state.tripLogs = [];
        console.log('Historical data cleared');
    }

    /**
     * Reset all state and stop streaming
     */
    reset() {
        this.stopStreaming();
        this.state.vehicles.clear();
        this.state.metrics.current = null;
        this.clearHistory();
        this.stats = {
            totalPolls: 0,
            failedPolls: 0,
            lastUpdateDuration: 0,
            averageUpdateDuration: 0
        };
        console.log('Data stream manager reset');
    }

    /**
     * Get current state snapshot
     * @returns {Object} Complete state snapshot
     */
    getStateSnapshot() {
        return {
            vehicles: this.getVehicles(),
            metrics: this.getMetrics(),
            tripLogs: this.getTripLogs(50), // Last 50 trips
            statistics: this.getStatisticsSummary(),
            performance: this.getPerformanceStats(),
            timestamp: Date.now()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataStreamManager;
}
