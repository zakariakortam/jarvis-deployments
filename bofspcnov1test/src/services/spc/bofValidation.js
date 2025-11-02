/**
 * BOF (Basic Oxygen Furnace) Parameter Validation
 * Validates BOF-specific process parameters
 */

export const BOF_PARAMETERS = {
  temperature: {
    name: 'Temperature',
    unit: '°C',
    min: 1600,
    max: 1700,
    target: 1650,
    usl: 1680,
    lsl: 1620,
    description: 'BOF operating temperature'
  },
  carbon: {
    name: 'Carbon Content',
    unit: '%',
    min: 0.04,
    max: 0.08,
    target: 0.06,
    usl: 0.075,
    lsl: 0.045,
    description: 'Carbon content in steel'
  },
  oxygen: {
    name: 'Oxygen Flow',
    unit: 'Nm³/min',
    min: 800,
    max: 1000,
    target: 900,
    usl: 980,
    lsl: 820,
    description: 'Oxygen flow rate'
  },
  lanceHeight: {
    name: 'Lance Height',
    unit: 'm',
    min: 1.5,
    max: 3.0,
    target: 2.25,
    usl: 2.8,
    lsl: 1.7,
    description: 'Oxygen lance height'
  },
  tapToTapTime: {
    name: 'Tap-to-Tap Time',
    unit: 'min',
    min: 35,
    max: 45,
    target: 40,
    usl: 44,
    lsl: 36,
    description: 'Time between taps'
  }
}

export function validateBOFParameter(paramName, value) {
  const param = BOF_PARAMETERS[paramName]

  if (!param) {
    throw new Error(`Unknown parameter: ${paramName}`)
  }

  const errors = []

  if (typeof value !== 'number' || isNaN(value)) {
    errors.push('Value must be a valid number')
  } else {
    if (value < param.min || value > param.max) {
      errors.push(`Value must be between ${param.min} and ${param.max} ${param.unit}`)
    }

    if (value > param.usl) {
      errors.push(`Value exceeds upper specification limit (${param.usl} ${param.unit})`)
    }

    if (value < param.lsl) {
      errors.push(`Value is below lower specification limit (${param.lsl} ${param.unit})`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    withinSpec: value >= param.lsl && value <= param.usl,
    parameter: param
  }
}

export default {
  BOF_PARAMETERS,
  validateBOFParameter
}
