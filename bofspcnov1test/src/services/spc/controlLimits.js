/**
 * SPC Control Limits Calculation Module
 * Implements statistical process control calculations for X-bar, R, I, and MR charts
 */

// Control Chart Constants (Based on subgroup size)
const CONTROL_CHART_CONSTANTS = {
  // A2 constants for X-bar chart (X-bar ± A2 * R)
  A2: {
    2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483,
    7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308, 11: 0.285,
    12: 0.266, 13: 0.249, 14: 0.235, 15: 0.223, 16: 0.212,
    17: 0.203, 18: 0.194, 19: 0.187, 20: 0.180, 21: 0.173,
    22: 0.167, 23: 0.162, 24: 0.157, 25: 0.153
  },
  // D3 constants for R chart lower control limit (D3 * R-bar)
  D3: {
    2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076,
    8: 0.136, 9: 0.184, 10: 0.223, 11: 0.256, 12: 0.283,
    13: 0.307, 14: 0.328, 15: 0.347, 16: 0.363, 17: 0.378,
    18: 0.391, 19: 0.403, 20: 0.415, 21: 0.425, 22: 0.434,
    23: 0.443, 24: 0.451, 25: 0.459
  },
  // D4 constants for R chart upper control limit (D4 * R-bar)
  D4: {
    2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004,
    7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777, 11: 1.744,
    12: 1.716, 13: 1.692, 14: 1.671, 15: 1.652, 16: 1.636,
    17: 1.621, 18: 1.608, 19: 1.596, 20: 1.585, 21: 1.575,
    22: 1.566, 23: 1.557, 24: 1.548, 25: 1.541
  },
  // E2 constants for Individuals chart (I ± E2 * MR-bar)
  E2: {
    2: 2.660, 3: 1.772, 4: 1.457, 5: 1.290, 6: 1.184,
    7: 1.109, 8: 1.054, 9: 1.010, 10: 0.975
  },
  // D3 for Moving Range chart
  D3_MR: {
    2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.205
  },
  // D4 for Moving Range chart
  D4_MR: {
    2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924
  }
}

/**
 * Calculate X-bar and R chart control limits
 * @param {Array<Array<number>>} subgroups - Array of subgroups, each containing measurement values
 * @returns {Object} Control limits for X-bar and R charts
 */
export function calculateXBarRLimits(subgroups) {
  if (!subgroups || subgroups.length === 0) {
    throw new Error('Subgroups array cannot be empty')
  }

  const subgroupSize = subgroups[0].length
  if (subgroupSize < 2 || subgroupSize > 25) {
    throw new Error('Subgroup size must be between 2 and 25')
  }

  // Validate all subgroups have same size
  if (!subgroups.every(sg => sg.length === subgroupSize)) {
    throw new Error('All subgroups must have the same size')
  }

  // Calculate X-bar for each subgroup
  const xBars = subgroups.map(subgroup => {
    const sum = subgroup.reduce((acc, val) => acc + val, 0)
    return sum / subgroup.length
  })

  // Calculate Range for each subgroup
  const ranges = subgroups.map(subgroup => {
    const max = Math.max(...subgroup)
    const min = Math.min(...subgroup)
    return max - min
  })

  // Calculate average X-bar (center line)
  const xBarBar = xBars.reduce((acc, val) => acc + val, 0) / xBars.length

  // Calculate average Range (center line)
  const rBar = ranges.reduce((acc, val) => acc + val, 0) / ranges.length

  // Get control chart constants
  const A2 = CONTROL_CHART_CONSTANTS.A2[subgroupSize]
  const D3 = CONTROL_CHART_CONSTANTS.D3[subgroupSize]
  const D4 = CONTROL_CHART_CONSTANTS.D4[subgroupSize]

  // Calculate X-bar control limits
  const xBarUCL = xBarBar + (A2 * rBar)
  const xBarLCL = xBarBar - (A2 * rBar)

  // Calculate R control limits
  const rUCL = D4 * rBar
  const rLCL = D3 * rBar

  return {
    xBar: {
      values: xBars,
      centerLine: xBarBar,
      ucl: xBarUCL,
      lcl: xBarLCL
    },
    range: {
      values: ranges,
      centerLine: rBar,
      ucl: rUCL,
      lcl: rLCL
    },
    subgroupSize,
    constants: { A2, D3, D4 }
  }
}

/**
 * Calculate Individuals and Moving Range chart control limits
 * @param {Array<number>} values - Array of individual measurements
 * @param {number} movingRangeSpan - Span for moving range calculation (default: 2)
 * @returns {Object} Control limits for I and MR charts
 */
export function calculateIndividualsMRLimits(values, movingRangeSpan = 2) {
  if (!values || values.length < 2) {
    throw new Error('Need at least 2 values for Individuals chart')
  }

  if (movingRangeSpan < 2 || movingRangeSpan > 10) {
    throw new Error('Moving range span must be between 2 and 10')
  }

  // Calculate Moving Ranges
  const movingRanges = []
  for (let i = movingRangeSpan - 1; i < values.length; i++) {
    const span = values.slice(i - movingRangeSpan + 1, i + 1)
    const max = Math.max(...span)
    const min = Math.min(...span)
    movingRanges.push(max - min)
  }

  // Calculate average of individuals (center line)
  const xBar = values.reduce((acc, val) => acc + val, 0) / values.length

  // Calculate average moving range (center line)
  const mrBar = movingRanges.reduce((acc, val) => acc + val, 0) / movingRanges.length

  // Get E2 constant for the moving range span
  const E2 = CONTROL_CHART_CONSTANTS.E2[movingRangeSpan]
  const D3_MR = CONTROL_CHART_CONSTANTS.D3_MR[movingRangeSpan] || 0
  const D4_MR = CONTROL_CHART_CONSTANTS.D4_MR[movingRangeSpan]

  // Calculate Individuals control limits
  const iUCL = xBar + (E2 * mrBar)
  const iLCL = xBar - (E2 * mrBar)

  // Calculate Moving Range control limits
  const mrUCL = D4_MR * mrBar
  const mrLCL = D3_MR * mrBar

  return {
    individuals: {
      values,
      centerLine: xBar,
      ucl: iUCL,
      lcl: iLCL
    },
    movingRange: {
      values: movingRanges,
      centerLine: mrBar,
      ucl: mrUCL,
      lcl: mrLCL
    },
    movingRangeSpan,
    constants: { E2, D3_MR, D4_MR }
  }
}

/**
 * Calculate standard deviation from subgroups using pooled method
 * @param {Array<Array<number>>} subgroups - Array of subgroups
 * @returns {number} Pooled standard deviation
 */
export function calculatePooledStdDev(subgroups) {
  if (!subgroups || subgroups.length === 0) {
    throw new Error('Subgroups array cannot be empty')
  }

  const subgroupSize = subgroups[0].length
  let sumOfVariances = 0

  subgroups.forEach(subgroup => {
    const mean = subgroup.reduce((acc, val) => acc + val, 0) / subgroup.length
    const variance = subgroup.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (subgroup.length - 1)
    sumOfVariances += variance
  })

  const pooledVariance = sumOfVariances / subgroups.length
  return Math.sqrt(pooledVariance)
}

/**
 * Calculate control limits using sigma method (3-sigma by default)
 * @param {Array<number>} values - Array of measurements
 * @param {number} sigma - Number of standard deviations (default: 3)
 * @returns {Object} Control limits
 */
export function calculateSigmaLimits(values, sigma = 3) {
  if (!values || values.length < 2) {
    throw new Error('Need at least 2 values')
  }

  const mean = values.reduce((acc, val) => acc + val, 0) / values.length
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1)
  const stdDev = Math.sqrt(variance)

  return {
    centerLine: mean,
    ucl: mean + (sigma * stdDev),
    lcl: mean - (sigma * stdDev),
    stdDev,
    sigma
  }
}

export default {
  calculateXBarRLimits,
  calculateIndividualsMRLimits,
  calculatePooledStdDev,
  calculateSigmaLimits,
  CONTROL_CHART_CONSTANTS
}
