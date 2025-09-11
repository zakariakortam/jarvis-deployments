const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool;

const connectDatabase = async () => {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    logger.info(' Database connected successfully');
    
    // Create tables if they don't exist
    await initializeTables();
    
  } catch (error) {
    logger.error(' Database connection failed:', error);
    throw error;
  }
};

const initializeTables = async () => {
  const createTablesSQL = `
    -- Plants configuration
    CREATE TABLE IF NOT EXISTS plants (
        plant_id VARCHAR(10) PRIMARY KEY,
        plant_name VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        timezone VARCHAR(50) DEFAULT 'UTC',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Sensors configuration
    CREATE TABLE IF NOT EXISTS sensors (
        sensor_id VARCHAR(100) PRIMARY KEY,
        plant_id VARCHAR(10) REFERENCES plants(plant_id),
        sensor_type VARCHAR(50) NOT NULL,
        unit VARCHAR(20),
        min_value DOUBLE PRECISION,
        max_value DOUBLE PRECISION,
        alarm_low DOUBLE PRECISION,
        alarm_high DOUBLE PRECISION,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Process measurements (TimescaleDB hypertable)
    CREATE TABLE IF NOT EXISTS process_measurements (
        time TIMESTAMPTZ NOT NULL,
        plant_id VARCHAR(10) NOT NULL,
        sensor_id VARCHAR(100) NOT NULL,
        value DOUBLE PRECISION,
        quality VARCHAR(20) DEFAULT 'good',
        unit VARCHAR(20),
        FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
        FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id)
    );

    -- Optimization results
    CREATE TABLE IF NOT EXISTS optimization_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plant_id VARCHAR(10) REFERENCES plants(plant_id),
        optimization_run_id UUID NOT NULL,
        process_unit VARCHAR(100),
        parameter_name VARCHAR(100),
        current_value DOUBLE PRECISION,
        optimized_value DOUBLE PRECISION,
        confidence_score DOUBLE PRECISION,
        execution_status VARCHAR(20) DEFAULT 'pending',
        safety_check_passed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        executed_at TIMESTAMPTZ
    );

    -- Optimization runs tracking
    CREATE TABLE IF NOT EXISTS optimization_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plant_id VARCHAR(10) REFERENCES plants(plant_id),
        algorithm_version VARCHAR(50),
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ,
        status VARCHAR(20) DEFAULT 'running',
        input_data_range JSONB,
        results_summary JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Control commands log
    CREATE TABLE IF NOT EXISTS control_commands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plant_id VARCHAR(10) REFERENCES plants(plant_id),
        command_type VARCHAR(50) NOT NULL,
        target_system VARCHAR(100),
        command_payload JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        sent_at TIMESTAMPTZ,
        acknowledged_at TIMESTAMPTZ,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_measurements_plant_sensor_time 
    ON process_measurements (plant_id, sensor_id, time DESC);
    
    CREATE INDEX IF NOT EXISTS idx_optimization_results_plant_time
    ON optimization_results (plant_id, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_control_commands_status
    ON control_commands (status, created_at DESC);

    -- Insert default plants
    INSERT INTO plants (plant_id, plant_name, location) VALUES 
    ('DET', 'Detroit Plant', 'Detroit, MI'),
    ('HOU', 'Houston Plant', 'Houston, TX'),
    ('SEA', 'Seattle Plant', 'Seattle, WA')
    ON CONFLICT (plant_id) DO NOTHING;

    -- Insert default sensors
    INSERT INTO sensors (sensor_id, plant_id, sensor_type, unit, min_value, max_value, alarm_low, alarm_high) VALUES 
    ('DET_PH_SENSOR_1', 'DET', 'ph', 'pH', 0.0, 14.0, 4.0, 8.0),
    ('DET_TEMP_SENSOR_1', 'DET', 'temperature', 'celsius', 0.0, 100.0, 30.0, 75.0),
    ('DET_FLOW_SENSOR_1', 'DET', 'flow_rate', 'L/min', 0.0, 1000.0, 50.0, 800.0),
    ('HOU_PH_SENSOR_1', 'HOU', 'ph', 'pH', 0.0, 14.0, 4.0, 8.0),
    ('HOU_TEMP_SENSOR_1', 'HOU', 'temperature', 'celsius', 0.0, 100.0, 30.0, 75.0),
    ('SEA_PH_SENSOR_1', 'SEA', 'ph', 'pH', 0.0, 14.0, 4.0, 8.0),
    ('SEA_TEMP_SENSOR_1', 'SEA', 'temperature', 'celsius', 0.0, 100.0, 30.0, 75.0)
    ON CONFLICT (sensor_id) DO NOTHING;
  `;

  try {
    await pool.query(createTablesSQL);
    logger.info(' Database tables initialized successfully');
  } catch (error) {
    logger.error(' Failed to initialize database tables:', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected');
  }
  return pool;
};

module.exports = {
  connectDatabase,
  getPool
};