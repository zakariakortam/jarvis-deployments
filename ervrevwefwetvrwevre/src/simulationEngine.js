/**
 * Real-Time HR Data Simulation Engine
 *
 * A sophisticated event-driven simulation engine that continuously updates employee metrics
 * to simulate a live HR system with realistic patterns and behaviors.
 *
 * Features:
 * - Continuous metric updates with realistic fluctuations
 * - Event-driven architecture with observable pattern
 * - Time-based patterns (business hours, day-of-week effects)
 * - Gradual trends with correlation maintenance
 * - Multiple event types (status changes, attendance, training, reviews)
 * - Configurable update intervals and simulation speed
 */

class SimulationEngine {
    constructor(dataGenerator, employees) {
        if (!dataGenerator || !employees) {
            throw new Error('SimulationEngine requires dataGenerator and employees array');
        }

        this.dataGenerator = dataGenerator;
        this.employees = employees;

        // Event listeners organized by event type
        this.listeners = {
            update: [],           // General updates
            employee: [],         // Employee-specific updates
            department: [],       // Department-wide changes
            kpi: [],              // KPI changes
            event: [],            // Specific events (hire, termination, etc.)
            batch: []             // Batch updates
        };

        // Simulation state
        this.isRunning = false;
        this.updateInterval = null;
        this.baseUpdateFrequency = 3000; // 3 seconds default
        this.currentUpdateFrequency = 3000;
        this.simulationSpeed = 1.0; // 1.0 = real-time, 2.0 = 2x speed, etc.

        // Event simulation probabilities (per update cycle)
        this.eventProbabilities = {
            statusChange: 0.001,      // 0.1% chance per cycle
            attendance: 0.05,         // 5% chance per cycle
            training: 0.02,           // 2% chance per cycle
            review: 0.005,            // 0.5% chance per cycle
            projectAssignment: 0.03   // 3% chance per cycle
        };

        // Tracking state for realistic patterns
        this.employeeState = new Map();
        this.initializeEmployeeState();

        // Performance tracking
        this.stats = {
            totalUpdates: 0,
            totalEvents: 0,
            startTime: null,
            lastUpdateTime: null,
            eventsGenerated: {
                metricUpdates: 0,
                statusChanges: 0,
                attendanceEvents: 0,
                trainingEvents: 0,
                reviews: 0,
                projectAssignments: 0
            }
        };

        // Snapshot cache
        this.lastSnapshot = null;
        this.snapshotDirty = true;
    }

    /**
     * Initialize state tracking for each employee
     */
    initializeEmployeeState() {
        this.employees.forEach(emp => {
            this.employeeState.set(emp.id, {
                productivityTrend: 0,      // -1, 0, or 1 (declining, stable, improving)
                engagementTrend: 0,
                attendanceTrend: 0,
                lastProductivity: emp.productivity,
                lastEngagement: emp.engagement,
                lastAttendance: emp.attendance,
                consecutiveLateArrivals: 0,
                recentTrainingCompleted: [],
                currentProjects: [],
                lastReviewDate: this.getRandomPastDate(180), // Last review within 6 months
                daysEmployed: this.calculateDaysEmployed(emp.hireDate)
            });
        });
    }

    /**
     * Start the simulation engine
     */
    start() {
        if (this.isRunning) {
            console.warn('SimulationEngine is already running');
            return;
        }

        this.isRunning = true;
        this.stats.startTime = Date.now();

        console.log(`SimulationEngine started at ${new Date().toISOString()}`);
        console.log(`Update frequency: ${this.currentUpdateFrequency}ms, Speed: ${this.simulationSpeed}x`);

        this.updateInterval = setInterval(() => {
            this.performUpdateCycle();
        }, this.currentUpdateFrequency);

        this.emit('engine:started', {
            timestamp: new Date().toISOString(),
            employeeCount: this.employees.length,
            updateFrequency: this.currentUpdateFrequency
        });
    }

    /**
     * Stop the simulation engine
     */
    stop() {
        if (!this.isRunning) {
            console.warn('SimulationEngine is not running');
            return;
        }

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.isRunning = false;

        const duration = Date.now() - this.stats.startTime;
        console.log(`SimulationEngine stopped after ${Math.round(duration / 1000)}s`);
        console.log(`Total updates: ${this.stats.totalUpdates}, Total events: ${this.stats.totalEvents}`);

        this.emit('engine:stopped', {
            timestamp: new Date().toISOString(),
            stats: { ...this.stats, runDuration: duration }
        });
    }

    /**
     * Set the update interval in milliseconds
     */
    setUpdateInterval(milliseconds) {
        if (milliseconds < 500 || milliseconds > 60000) {
            throw new Error('Update interval must be between 500ms and 60000ms');
        }

        this.currentUpdateFrequency = Math.round(milliseconds / this.simulationSpeed);
        this.baseUpdateFrequency = milliseconds;

        if (this.isRunning) {
            this.stop();
            this.start();
        }

        console.log(`Update interval set to ${milliseconds}ms (effective: ${this.currentUpdateFrequency}ms)`);
    }

    /**
     * Set simulation speed multiplier
     */
    setSimulationSpeed(speed) {
        if (speed < 0.1 || speed > 10) {
            throw new Error('Simulation speed must be between 0.1x and 10x');
        }

        this.simulationSpeed = speed;
        this.currentUpdateFrequency = Math.round(this.baseUpdateFrequency / speed);

        if (this.isRunning) {
            this.stop();
            this.start();
        }

        console.log(`Simulation speed set to ${speed}x`);
    }

    /**
     * Main update cycle - called at each interval
     */
    performUpdateCycle() {
        this.stats.totalUpdates++;
        this.stats.lastUpdateTime = Date.now();

        const updates = [];
        const events = [];

        // Determine how many employees to update this cycle
        const updateCount = this.calculateUpdateCount();
        const employeesToUpdate = this.selectEmployeesForUpdate(updateCount);

        // Apply time-of-day and day-of-week effects
        const timeFactors = this.calculateTimeFactors();

        employeesToUpdate.forEach(employee => {
            const state = this.employeeState.get(employee.id);

            // Generate metric updates
            const metricUpdates = this.generateRealisticMetricUpdates(employee, state, timeFactors);

            if (Object.keys(metricUpdates).length > 0) {
                Object.assign(employee, metricUpdates);
                employee.lastUpdated = new Date().toISOString();

                updates.push({
                    employeeId: employee.id,
                    fullName: employee.fullName,
                    department: employee.department,
                    updates: metricUpdates
                });

                this.stats.eventsGenerated.metricUpdates++;
            }

            // Generate random events
            const generatedEvents = this.generateEvents(employee, state, timeFactors);
            events.push(...generatedEvents);
        });

        // Mark snapshot as dirty
        this.snapshotDirty = true;

        // Emit update events
        if (updates.length > 0) {
            this.emit('update', {
                timestamp: new Date().toISOString(),
                updates,
                count: updates.length
            });
        }

        // Emit individual events
        events.forEach(event => {
            this.emit('event', event);
            this.stats.totalEvents++;
        });

        // Periodically emit KPI updates
        if (this.stats.totalUpdates % 10 === 0) {
            this.emitKPIUpdate();
        }
    }

    /**
     * Calculate how many employees to update in this cycle
     */
    calculateUpdateCount() {
        const total = this.employees.length;
        const timeFactors = this.calculateTimeFactors();

        // Base: update 1-3% of employees per cycle
        let percentage = 0.01 + Math.random() * 0.02;

        // Increase during business hours
        if (timeFactors.isBusinessHours) {
            percentage *= 1.5;
        }

        // Increase on weekdays
        if (timeFactors.isWeekday) {
            percentage *= 1.2;
        }

        return Math.max(1, Math.floor(total * percentage));
    }

    /**
     * Select random employees for update with weighted probability
     */
    selectEmployeesForUpdate(count) {
        const selected = [];
        const available = [...this.employees];

        for (let i = 0; i < count && available.length > 0; i++) {
            // Weighted selection: employees with recent changes are less likely to be selected
            const index = Math.floor(Math.random() * available.length);
            selected.push(available.splice(index, 1)[0]);
        }

        return selected;
    }

    /**
     * Calculate time-based factors for realistic patterns
     */
    calculateTimeFactors() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();

        return {
            isBusinessHours: hour >= 9 && hour < 17,
            isWeekday: day >= 1 && day <= 5,
            hour,
            day,
            timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
            activityMultiplier: hour >= 9 && hour < 17 ? 1.5 : 0.5
        };
    }

    /**
     * Generate realistic metric updates with gradual trends and correlation
     */
    generateRealisticMetricUpdates(employee, state, timeFactors) {
        const updates = {};

        // Probability of updating each metric (higher during business hours)
        const updateProb = timeFactors.activityMultiplier * 0.4;

        // Productivity updates
        if (Math.random() < updateProb) {
            const change = this.calculateGradualChange(
                employee.productivity,
                state.productivityTrend,
                2, // max change per update
                10 // trend change threshold
            );

            if (change !== 0) {
                updates.productivity = Math.max(0, Math.min(100, Math.round(employee.productivity + change)));

                // Update trend
                if (change > 0.5) state.productivityTrend = 1;
                else if (change < -0.5) state.productivityTrend = -1;
                else state.productivityTrend = 0;

                state.lastProductivity = updates.productivity;
            }
        }

        // Engagement updates (correlated with productivity)
        if (Math.random() < updateProb * 0.8) {
            const productivityInfluence = state.productivityTrend * 0.5;
            const change = this.calculateGradualChange(
                employee.engagement,
                state.engagementTrend + productivityInfluence,
                3, // max change per update
                15 // trend change threshold
            );

            if (change !== 0) {
                updates.engagement = Math.max(0, Math.min(100, Math.round(employee.engagement + change)));

                if (change > 0.5) state.engagementTrend = 1;
                else if (change < -0.5) state.engagementTrend = -1;
                else state.engagementTrend = 0;

                state.lastEngagement = updates.engagement;
            }
        }

        // Attendance updates (less frequent)
        if (Math.random() < updateProb * 0.3) {
            const change = this.calculateGradualChange(
                employee.attendance,
                state.attendanceTrend,
                1, // max change per update
                5 // trend change threshold
            );

            if (change !== 0) {
                updates.attendance = Math.max(0, Math.min(100, Math.round((employee.attendance + change) * 10) / 10));
                state.lastAttendance = updates.attendance;
            }
        }

        // Training hours increase gradually
        if (Math.random() < 0.05) {
            const increase = Math.random() * 0.5;
            updates.trainingHours = Math.round((employee.trainingHours + increase) * 10) / 10;
        }

        return updates;
    }

    /**
     * Calculate gradual changes with trend persistence
     */
    calculateGradualChange(currentValue, trend, maxChange, boundaryThreshold) {
        // Base change influenced by trend
        let change = (Math.random() - 0.4) * maxChange + (trend * maxChange * 0.3);

        // Reduce change near boundaries (regression to mean)
        if (currentValue < boundaryThreshold) {
            change = Math.abs(change); // Force upward
        } else if (currentValue > 100 - boundaryThreshold) {
            change = -Math.abs(change); // Force downward
        }

        // Apply noise
        change += (Math.random() - 0.5) * (maxChange * 0.2);

        return change;
    }

    /**
     * Generate various HR events
     */
    generateEvents(employee, state, timeFactors) {
        const events = [];

        // Only generate events during business hours for realism
        if (!timeFactors.isBusinessHours || !timeFactors.isWeekday) {
            return events;
        }

        // Attendance events
        if (Math.random() < this.eventProbabilities.attendance) {
            const attendanceEvent = this.generateAttendanceEvent(employee, state);
            if (attendanceEvent) {
                events.push(attendanceEvent);
                this.stats.eventsGenerated.attendanceEvents++;
            }
        }

        // Training events
        if (Math.random() < this.eventProbabilities.training) {
            const trainingEvent = this.generateTrainingEvent(employee, state);
            if (trainingEvent) {
                events.push(trainingEvent);
                this.stats.eventsGenerated.trainingEvents++;
            }
        }

        // Performance review events
        if (Math.random() < this.eventProbabilities.review) {
            const reviewEvent = this.generateReviewEvent(employee, state);
            if (reviewEvent) {
                events.push(reviewEvent);
                this.stats.eventsGenerated.reviews++;
            }
        }

        // Project assignment events
        if (Math.random() < this.eventProbabilities.projectAssignment) {
            const projectEvent = this.generateProjectEvent(employee, state);
            if (projectEvent) {
                events.push(projectEvent);
                this.stats.eventsGenerated.projectAssignments++;
            }
        }

        // Status change events (rare)
        if (Math.random() < this.eventProbabilities.statusChange) {
            const statusEvent = this.generateStatusChangeEvent(employee, state);
            if (statusEvent) {
                events.push(statusEvent);
                this.stats.eventsGenerated.statusChanges++;
            }
        }

        return events;
    }

    /**
     * Generate attendance event
     */
    generateAttendanceEvent(employee, state) {
        const eventTypes = ['on_time', 'late_arrival', 'early_departure', 'absence'];
        const weights = [0.7, 0.15, 0.1, 0.05]; // Most are on time

        const eventType = this.weightedRandom(eventTypes, weights);

        if (eventType === 'late_arrival') {
            state.consecutiveLateArrivals++;
            employee.attendance = Math.max(0, employee.attendance - 0.5);
        } else if (eventType === 'absence') {
            employee.attendance = Math.max(0, employee.attendance - 2);
        } else {
            state.consecutiveLateArrivals = 0;
        }

        return {
            type: 'attendance',
            subType: eventType,
            employeeId: employee.id,
            fullName: employee.fullName,
            department: employee.department,
            timestamp: new Date().toISOString(),
            details: {
                consecutiveLate: state.consecutiveLateArrivals,
                currentAttendanceRate: employee.attendance
            }
        };
    }

    /**
     * Generate training event
     */
    generateTrainingEvent(employee, state) {
        const eventTypes = ['enrolled', 'completed', 'in_progress'];
        const weights = [0.4, 0.4, 0.2];

        const eventType = this.weightedRandom(eventTypes, weights);

        const courses = this.dataGenerator.trainingCourses;
        const course = courses[Math.floor(Math.random() * courses.length)];

        if (eventType === 'completed') {
            employee.trainingHours += Math.random() * 4 + 2; // 2-6 hours
            state.recentTrainingCompleted.push(course);

            // Boost productivity slightly
            employee.productivity = Math.min(100, employee.productivity + Math.random() * 3);

            if (!employee.completedTrainings.includes(course)) {
                employee.completedTrainings.push(course);
            }
        }

        return {
            type: 'training',
            subType: eventType,
            employeeId: employee.id,
            fullName: employee.fullName,
            department: employee.department,
            timestamp: new Date().toISOString(),
            details: {
                course,
                totalTrainingHours: Math.round(employee.trainingHours * 10) / 10
            }
        };
    }

    /**
     * Generate performance review event
     */
    generateReviewEvent(employee, state) {
        const daysSinceLastReview = (Date.now() - state.lastReviewDate) / (1000 * 60 * 60 * 24);

        // Only review if it's been at least 60 days
        if (daysSinceLastReview < 60) {
            return null;
        }

        // Calculate new rating based on current metrics
        const avgPerformance = (employee.productivity + employee.engagement + employee.attendance) / 3;

        let newRating;
        if (avgPerformance >= 90) newRating = 5;
        else if (avgPerformance >= 75) newRating = 4;
        else if (avgPerformance >= 60) newRating = 3;
        else if (avgPerformance >= 45) newRating = 2;
        else newRating = 1;

        const oldRating = employee.performanceRating;
        employee.performanceRating = newRating;
        state.lastReviewDate = Date.now();

        return {
            type: 'review',
            subType: 'performance_review',
            employeeId: employee.id,
            fullName: employee.fullName,
            department: employee.department,
            timestamp: new Date().toISOString(),
            details: {
                oldRating,
                newRating,
                ratingChange: newRating - oldRating,
                avgPerformance: Math.round(avgPerformance)
            }
        };
    }

    /**
     * Generate project assignment event
     */
    generateProjectEvent(employee, state) {
        const projects = [
            'Q1 Product Launch', 'Customer Dashboard Redesign', 'API Integration',
            'Mobile App Development', 'Data Migration', 'Security Audit',
            'Marketing Campaign', 'Sales Training Program', 'Process Optimization'
        ];

        const project = projects[Math.floor(Math.random() * projects.length)];

        state.currentProjects.push({
            name: project,
            assignedDate: Date.now()
        });

        // Keep only recent projects
        if (state.currentProjects.length > 5) {
            state.currentProjects.shift();
        }

        return {
            type: 'project',
            subType: 'assignment',
            employeeId: employee.id,
            fullName: employee.fullName,
            department: employee.department,
            timestamp: new Date().toISOString(),
            details: {
                project,
                activeProjects: state.currentProjects.length
            }
        };
    }

    /**
     * Generate status change event (hire/termination)
     */
    generateStatusChangeEvent(employee, state) {
        // Determine if this is a hire or termination based on various factors
        const isTermination = employee.productivity < 40 || employee.engagement < 35 || Math.random() < 0.3;

        if (isTermination) {
            // Remove employee
            const index = this.employees.findIndex(e => e.id === employee.id);
            if (index !== -1) {
                this.employees.splice(index, 1);
                this.employeeState.delete(employee.id);

                return {
                    type: 'status_change',
                    subType: 'termination',
                    employeeId: employee.id,
                    fullName: employee.fullName,
                    department: employee.department,
                    timestamp: new Date().toISOString(),
                    details: {
                        reason: employee.productivity < 40 ? 'performance' : 'voluntary',
                        tenure: employee.tenure
                    }
                };
            }
        } else {
            // Add new employee
            const newEmployee = this.dataGenerator.generateEmployee(this.employees.length);
            this.employees.push(newEmployee);

            this.employeeState.set(newEmployee.id, {
                productivityTrend: 0,
                engagementTrend: 0,
                attendanceTrend: 0,
                lastProductivity: newEmployee.productivity,
                lastEngagement: newEmployee.engagement,
                lastAttendance: newEmployee.attendance,
                consecutiveLateArrivals: 0,
                recentTrainingCompleted: [],
                currentProjects: [],
                lastReviewDate: Date.now(),
                daysEmployed: 0
            });

            return {
                type: 'status_change',
                subType: 'new_hire',
                employeeId: newEmployee.id,
                fullName: newEmployee.fullName,
                department: newEmployee.department,
                timestamp: new Date().toISOString(),
                details: {
                    position: newEmployee.position,
                    location: newEmployee.location
                }
            };
        }

        return null;
    }

    /**
     * Emit KPI update event
     */
    emitKPIUpdate() {
        const kpis = this.dataGenerator.calculateKPIs(this.employees);

        this.emit('kpi', {
            timestamp: new Date().toISOString(),
            kpis,
            employeeCount: this.employees.length
        });
    }

    /**
     * Get current snapshot of all data
     */
    getSnapshot() {
        if (!this.snapshotDirty && this.lastSnapshot) {
            return this.lastSnapshot;
        }

        const snapshot = {
            timestamp: new Date().toISOString(),
            isRunning: this.isRunning,
            stats: { ...this.stats },
            employees: this.employees.map(e => ({ ...e })),
            kpis: this.dataGenerator.calculateKPIs(this.employees),
            departmentBreakdown: this.dataGenerator.getDepartmentBreakdown(this.employees),
            performanceDistribution: this.dataGenerator.getPerformanceDistribution(this.employees),
            locationBreakdown: this.dataGenerator.getLocationBreakdown(this.employees)
        };

        this.lastSnapshot = snapshot;
        this.snapshotDirty = false;

        return snapshot;
    }

    /**
     * Subscribe to updates with callback
     */
    subscribeToUpdates(callback, eventType = 'update') {
        if (!this.listeners[eventType]) {
            throw new Error(`Unknown event type: ${eventType}. Valid types: ${Object.keys(this.listeners).join(', ')}`);
        }

        this.listeners[eventType].push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.listeners[eventType].indexOf(callback);
            if (index !== -1) {
                this.listeners[eventType].splice(index, 1);
            }
        };
    }

    /**
     * Subscribe to employee-specific updates
     */
    subscribeToEmployee(employeeId, callback) {
        const wrappedCallback = (data) => {
            if (data.employeeId === employeeId ||
                (data.updates && data.updates.some(u => u.employeeId === employeeId))) {
                callback(data);
            }
        };

        return this.subscribeToUpdates(wrappedCallback, 'update');
    }

    /**
     * Subscribe to department-specific updates
     */
    subscribeToDepartment(departmentName, callback) {
        const wrappedCallback = (data) => {
            if (data.department === departmentName ||
                (data.updates && data.updates.some(u => u.department === departmentName))) {
                callback(data);
            }
        };

        return this.subscribeToUpdates(wrappedCallback, 'update');
    }

    /**
     * Manually trigger a specific event
     */
    triggerEvent(eventType, data) {
        const validEventTypes = ['hire', 'termination', 'batch_update', 'department_change', 'promotion'];

        if (!validEventTypes.includes(eventType)) {
            throw new Error(`Invalid event type: ${eventType}. Valid types: ${validEventTypes.join(', ')}`);
        }

        console.log(`Manually triggered event: ${eventType}`);

        switch (eventType) {
            case 'hire':
                return this.manuallyAddEmployee(data);
            case 'termination':
                return this.manuallyRemoveEmployee(data.employeeId);
            case 'batch_update':
                return this.performBatchUpdate(data.percentage || 0.3);
            case 'department_change':
                return this.changeDepartment(data.employeeId, data.newDepartment);
            case 'promotion':
                return this.promoteEmployee(data.employeeId, data.newPosition);
            default:
                throw new Error(`Event type ${eventType} not implemented`);
        }
    }

    /**
     * Manually add a new employee
     */
    manuallyAddEmployee(data) {
        const newEmployee = data || this.dataGenerator.generateEmployee(this.employees.length);
        this.employees.push(newEmployee);

        this.employeeState.set(newEmployee.id, {
            productivityTrend: 0,
            engagementTrend: 0,
            attendanceTrend: 0,
            lastProductivity: newEmployee.productivity,
            lastEngagement: newEmployee.engagement,
            lastAttendance: newEmployee.attendance,
            consecutiveLateArrivals: 0,
            recentTrainingCompleted: [],
            currentProjects: [],
            lastReviewDate: Date.now(),
            daysEmployed: 0
        });

        this.snapshotDirty = true;

        this.emit('event', {
            type: 'status_change',
            subType: 'new_hire',
            employeeId: newEmployee.id,
            fullName: newEmployee.fullName,
            department: newEmployee.department,
            timestamp: new Date().toISOString(),
            manual: true
        });

        return newEmployee;
    }

    /**
     * Manually remove an employee
     */
    manuallyRemoveEmployee(employeeId) {
        const index = this.employees.findIndex(e => e.id === employeeId);
        if (index === -1) {
            throw new Error(`Employee ${employeeId} not found`);
        }

        const removed = this.employees.splice(index, 1)[0];
        this.employeeState.delete(employeeId);
        this.snapshotDirty = true;

        this.emit('event', {
            type: 'status_change',
            subType: 'termination',
            employeeId: removed.id,
            fullName: removed.fullName,
            department: removed.department,
            timestamp: new Date().toISOString(),
            manual: true
        });

        return removed;
    }

    /**
     * Perform batch update on a percentage of employees
     */
    performBatchUpdate(percentage = 0.3) {
        const count = Math.floor(this.employees.length * percentage);
        const updates = [];

        for (let i = 0; i < count; i++) {
            const employee = this.employees[Math.floor(Math.random() * this.employees.length)];
            const state = this.employeeState.get(employee.id);

            const metricUpdates = {
                productivity: Math.max(0, Math.min(100, employee.productivity + (Math.random() - 0.5) * 15)),
                attendance: Math.max(0, Math.min(100, Math.round((employee.attendance + (Math.random() - 0.5) * 5) * 10) / 10)),
                engagement: Math.max(0, Math.min(100, employee.engagement + (Math.random() - 0.5) * 20)),
                trainingHours: Math.round((employee.trainingHours + Math.random() * 3) * 10) / 10
            };

            Object.assign(employee, metricUpdates);
            employee.lastUpdated = new Date().toISOString();

            updates.push({
                employeeId: employee.id,
                fullName: employee.fullName,
                updates: metricUpdates
            });
        }

        this.snapshotDirty = true;

        this.emit('batch', {
            timestamp: new Date().toISOString(),
            type: 'batch_update',
            updates,
            count: updates.length
        });

        return updates;
    }

    /**
     * Change employee department
     */
    changeDepartment(employeeId, newDepartment) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) {
            throw new Error(`Employee ${employeeId} not found`);
        }

        const oldDepartment = employee.department;
        employee.department = newDepartment;
        this.snapshotDirty = true;

        this.emit('event', {
            type: 'department_change',
            employeeId: employee.id,
            fullName: employee.fullName,
            timestamp: new Date().toISOString(),
            details: { oldDepartment, newDepartment }
        });

        return employee;
    }

    /**
     * Promote employee
     */
    promoteEmployee(employeeId, newPosition) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) {
            throw new Error(`Employee ${employeeId} not found`);
        }

        const oldPosition = employee.position;
        employee.position = newPosition;
        employee.salary = Math.round(employee.salary * 1.15); // 15% raise
        this.snapshotDirty = true;

        this.emit('event', {
            type: 'promotion',
            employeeId: employee.id,
            fullName: employee.fullName,
            department: employee.department,
            timestamp: new Date().toISOString(),
            details: { oldPosition, newPosition, newSalary: employee.salary }
        });

        return employee;
    }

    /**
     * Internal emit function
     */
    emit(eventType, data) {
        const listeners = this.listeners[eventType] || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${eventType} listener:`, error);
            }
        });
    }

    /**
     * Helper: Weighted random selection
     */
    weightedRandom(items, weights) {
        const total = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * total;

        for (let i = 0; i < items.length; i++) {
            if (random < weights[i]) {
                return items[i];
            }
            random -= weights[i];
        }

        return items[items.length - 1];
    }

    /**
     * Helper: Calculate days employed
     */
    calculateDaysEmployed(hireDate) {
        const hire = new Date(hireDate);
        const now = new Date();
        return Math.floor((now - hire) / (1000 * 60 * 60 * 24));
    }

    /**
     * Helper: Get random past date
     */
    getRandomPastDate(maxDaysAgo) {
        const now = Date.now();
        const daysAgo = Math.floor(Math.random() * maxDaysAgo);
        return now - (daysAgo * 24 * 60 * 60 * 1000);
    }

    /**
     * Get current engine statistics
     */
    getStatistics() {
        return {
            isRunning: this.isRunning,
            updateFrequency: this.currentUpdateFrequency,
            simulationSpeed: this.simulationSpeed,
            totalEmployees: this.employees.length,
            totalUpdates: this.stats.totalUpdates,
            totalEvents: this.stats.totalEvents,
            listenerCount: Object.entries(this.listeners).reduce((sum, [type, arr]) => sum + arr.length, 0),
            eventsGenerated: { ...this.stats.eventsGenerated },
            uptime: this.stats.startTime ? Date.now() - this.stats.startTime : 0
        };
    }

    /**
     * Reset all statistics
     */
    resetStatistics() {
        this.stats = {
            totalUpdates: 0,
            totalEvents: 0,
            startTime: this.isRunning ? Date.now() : null,
            lastUpdateTime: null,
            eventsGenerated: {
                metricUpdates: 0,
                statusChanges: 0,
                attendanceEvents: 0,
                trainingEvents: 0,
                reviews: 0,
                projectAssignments: 0
            }
        };
    }

    /**
     * Cleanup and destroy the engine
     */
    destroy() {
        this.stop();
        this.listeners = {
            update: [],
            employee: [],
            department: [],
            kpi: [],
            event: [],
            batch: []
        };
        this.employeeState.clear();
        console.log('SimulationEngine destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulationEngine;
}
