/**
 * Data Validation Utilities for BOF Process Parameters
 */

// BOF Process parameter ranges
export const PROCESS_LIMITS = {
  temperature: {
    min: 1500,
    max: 1800,
    unit: '°C',
    target: 1650,
    lsl: 1600,
    usl: 1700,
  },
  carbonContent: {
    min: 0.02,
    max: 0.25,
    unit: '%',
    target: 0.08,
    lsl: 0.04,
    usl: 0.12,
  },
  oxygenLevel: {
    min: 0,
    max: 100,
    unit: '%',
    target: 99.5,
    lsl: 99.0,
    usl: 100,
  },
  slagBasicity: {
    min: 2.0,
    max: 4.5,
    unit: 'CaO/SiO₂',
    target: 3.2,
    lsl: 2.8,
    usl: 3.6,
  },
  phosphorus: {
    min: 0.001,
    max: 0.050,
    unit: '%',
    target: 0.015,
    lsl: 0.005,
    usl: 0.025,
  },
  sulfur: {
    min: 0.001,
    max: 0.040,
    unit: '%',
    target: 0.010,
    lsl: 0.005,
    usl: 0.020,
  },
  manganese: {
    min: 0.10,
    max: 2.00,
    unit: '%',
    target: 0.80,
    lsl: 0.60,
    usl: 1.00,
  },
  blowTime: {
    min: 10,
    max: 25,
    unit: 'min',
    target: 18,
    lsl: 15,
    usl: 21,
  },
  oxygenFlow: {
    min: 300,
    max: 600,
    unit: 'Nm³/min',
    target: 450,
    lsl: 400,
    usl: 500,
  },
  slagWeight: {
    min: 2000,
    max: 8000,
    unit: 'kg',
    target: 5000,
    lsl: 4000,
    usl: 6000,
  },
}

// Validate a single parameter value
export const validateParameter = (parameterName, value) => {
  const limits = PROCESS_LIMITS[parameterName]
  if (!limits) {
    return {
      valid: false,
      error: `Unknown parameter: ${parameterName}`,
    }
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      valid: false,
      error: 'Value must be a valid number',
    }
  }

  if (value < limits.min || value > limits.max) {
    return {
      valid: false,
      error: `Value ${value} is outside acceptable range (${limits.min}-${limits.max} ${limits.unit})`,
      outOfRange: true,
    }
  }

  const withinControlLimits = value >= limits.lsl && value <= limits.usl
  const withinWarningZone =
    value >= limits.lsl - (limits.target - limits.lsl) * 0.1 &&
    value <= limits.usl + (limits.usl - limits.target) * 0.1

  return {
    valid: true,
    withinControlLimits,
    withinWarningZone,
    deviation: Math.abs(value - limits.target),
    percentDeviation: (Math.abs(value - limits.target) / limits.target) * 100,
  }
}

// Validate complete heat data
export const validateHeatData = (heatData) => {
  const errors = []
  const warnings = []

  // Required fields
  const requiredFields = [
    'heatNumber',
    'temperature',
    'carbonContent',
    'oxygenLevel',
  ]

  requiredFields.forEach((field) => {
    if (!heatData[field] && heatData[field] !== 0) {
      errors.push(`Missing required field: ${field}`)
    }
  })

  // Validate all numeric parameters
  Object.keys(PROCESS_LIMITS).forEach((param) => {
    if (heatData[param] !== undefined && heatData[param] !== null) {
      const validation = validateParameter(param, heatData[param])
      if (!validation.valid) {
        if (validation.outOfRange) {
          errors.push(validation.error)
        } else {
          errors.push(`${param}: ${validation.error}`)
        }
      } else if (!validation.withinControlLimits) {
        warnings.push(
          `${param} value ${heatData[param]} is outside control limits`
        )
      }
    }
  })

  // Validate heat number format
  if (heatData.heatNumber && !/^[A-Z0-9-]+$/.test(heatData.heatNumber)) {
    errors.push('Heat number must contain only uppercase letters, numbers, and hyphens')
  }

  // Validate timestamp
  if (heatData.timestamp) {
    const timestamp = new Date(heatData.timestamp)
    if (isNaN(timestamp.getTime())) {
      errors.push('Invalid timestamp format')
    } else if (timestamp > new Date()) {
      errors.push('Timestamp cannot be in the future')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// Validate CSV data
export const validateCSVData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      valid: false,
      error: 'CSV data must be a non-empty array',
    }
  }

  const requiredColumns = ['heatNumber', 'temperature', 'carbonContent', 'oxygenLevel']
  const firstRow = data[0]

  const missingColumns = requiredColumns.filter(
    (col) => !(col in firstRow)
  )

  if (missingColumns.length > 0) {
    return {
      valid: false,
      error: `Missing required columns: ${missingColumns.join(', ')}`,
    }
  }

  const rowErrors = []
  data.forEach((row, index) => {
    const validation = validateHeatData(row)
    if (!validation.valid) {
      rowErrors.push({
        row: index + 1,
        errors: validation.errors,
      })
    }
  })

  return {
    valid: rowErrors.length === 0,
    rowErrors,
    totalRows: data.length,
    validRows: data.length - rowErrors.length,
  }
}

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input

  // Remove potentially harmful characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Check for data anomalies
export const detectAnomalies = (data, parameterName) => {
  if (!data || data.length < 10) return []

  const anomalies = []
  const values = data.map((d) => d[parameterName]).filter((v) => v !== undefined)

  if (values.length < 10) return anomalies

  // Calculate statistical measures
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  )

  // Detect outliers (beyond 3 sigma)
  data.forEach((row, index) => {
    const value = row[parameterName]
    if (value === undefined) return

    const zScore = Math.abs((value - mean) / stdDev)
    if (zScore > 3) {
      anomalies.push({
        index,
        heatNumber: row.heatNumber,
        value,
        zScore: parseFloat(zScore.toFixed(2)),
        type: 'outlier',
        message: `Value ${value} is ${zScore.toFixed(1)} standard deviations from mean`,
      })
    }
  })

  // Detect sudden jumps
  for (let i = 1; i < data.length; i++) {
    const curr = data[i][parameterName]
    const prev = data[i - 1][parameterName]

    if (curr !== undefined && prev !== undefined) {
      const change = Math.abs(curr - prev)
      const percentChange = (change / prev) * 100

      if (percentChange > 20) {
        // 20% change threshold
        anomalies.push({
          index: i,
          heatNumber: data[i].heatNumber,
          value: curr,
          previousValue: prev,
          change,
          percentChange: parseFloat(percentChange.toFixed(2)),
          type: 'sudden_change',
          message: `Sudden ${percentChange.toFixed(1)}% change from previous heat`,
        })
      }
    }
  }

  return anomalies
}

// Validate user permissions
export const validatePermission = (userRole, requiredPermission) => {
  const rolePermissions = {
    operator: ['view_dashboard', 'view_monitoring', 'add_heat_data'],
    process_engineer: [
      'view_dashboard',
      'view_monitoring',
      'add_heat_data',
      'view_charts',
      'view_capability',
      'view_history',
      'generate_reports',
    ],
    quality_engineer: [
      'view_dashboard',
      'view_monitoring',
      'add_heat_data',
      'view_charts',
      'view_capability',
      'view_history',
      'generate_reports',
      'import_data',
      'manage_settings',
      'manage_users',
    ],
  }

  return rolePermissions[userRole]?.includes(requiredPermission) || false
}
