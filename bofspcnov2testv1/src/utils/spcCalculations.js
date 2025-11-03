/**
 * Statistical Process Control Calculations
 * Implements industry-standard SPC formulas for process monitoring
 */

// Calculate mean (average)
export const calculateMean = (values) => {
  if (!values || values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

// Calculate standard deviation
export const calculateStdDev = (values) => {
  if (!values || values.length < 2) return 0
  const mean = calculateMean(values)
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

// Calculate range
export const calculateRange = (values) => {
  if (!values || values.length === 0) return 0
  return Math.max(...values) - Math.min(...values)
}

// X-bar Chart Calculations
export const calculateXBarChart = (data, subgroupSize = 5) => {
  if (!data || data.length === 0) return null

  const subgroups = []
  for (let i = 0; i < data.length; i += subgroupSize) {
    subgroups.push(data.slice(i, i + subgroupSize))
  }

  const xBarValues = subgroups.map((subgroup) => calculateMean(subgroup))
  const xBarBar = calculateMean(xBarValues)
  const ranges = subgroups.map((subgroup) => calculateRange(subgroup))
  const rBar = calculateMean(ranges)

  // Control chart constants for subgroup size
  const A2_constants = {
    2: 1.880,
    3: 1.023,
    4: 0.729,
    5: 0.577,
    6: 0.483,
    7: 0.419,
    8: 0.373,
    9: 0.337,
    10: 0.308,
  }

  const A2 = A2_constants[subgroupSize] || 0.577

  return {
    centerLine: xBarBar,
    ucl: xBarBar + A2 * rBar,
    lcl: xBarBar - A2 * rBar,
    values: xBarValues,
    subgroups,
  }
}

// R Chart Calculations (Range Chart)
export const calculateRChart = (data, subgroupSize = 5) => {
  if (!data || data.length === 0) return null

  const subgroups = []
  for (let i = 0; i < data.length; i += subgroupSize) {
    subgroups.push(data.slice(i, i + subgroupSize))
  }

  const ranges = subgroups.map((subgroup) => calculateRange(subgroup))
  const rBar = calculateMean(ranges)

  // Control chart constants
  const D3_constants = {
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0.076,
    8: 0.136,
    9: 0.184,
    10: 0.223,
  }

  const D4_constants = {
    2: 3.267,
    3: 2.574,
    4: 2.282,
    5: 2.114,
    6: 2.004,
    7: 1.924,
    8: 1.864,
    9: 1.816,
    10: 1.777,
  }

  const D3 = D3_constants[subgroupSize] || 0
  const D4 = D4_constants[subgroupSize] || 2.114

  return {
    centerLine: rBar,
    ucl: D4 * rBar,
    lcl: D3 * rBar,
    values: ranges,
  }
}

// P Chart Calculations (Proportion Defective)
export const calculatePChart = (defects, samples) => {
  if (!defects || !samples || defects.length !== samples.length) return null

  const proportions = defects.map((d, i) => d / samples[i])
  const pBar = calculateMean(proportions)
  const avgSampleSize = calculateMean(samples)

  const ucl = pBar + 3 * Math.sqrt((pBar * (1 - pBar)) / avgSampleSize)
  const lcl = Math.max(0, pBar - 3 * Math.sqrt((pBar * (1 - pBar)) / avgSampleSize))

  return {
    centerLine: pBar,
    ucl,
    lcl,
    values: proportions,
  }
}

// C Chart Calculations (Count of Defects)
export const calculateCChart = (counts) => {
  if (!counts || counts.length === 0) return null

  const cBar = calculateMean(counts)
  const ucl = cBar + 3 * Math.sqrt(cBar)
  const lcl = Math.max(0, cBar - 3 * Math.sqrt(cBar))

  return {
    centerLine: cBar,
    ucl,
    lcl,
    values: counts,
  }
}

// Process Capability Calculations
export const calculateProcessCapability = (data, lsl, usl, target = null) => {
  if (!data || data.length === 0 || lsl === undefined || usl === undefined) {
    return null
  }

  const mean = calculateMean(data)
  const stdDev = calculateStdDev(data)

  if (stdDev === 0) return null

  // Cp - Process Capability
  const cp = (usl - lsl) / (6 * stdDev)

  // Cpk - Process Capability Index
  const cpu = (usl - mean) / (3 * stdDev)
  const cpl = (mean - lsl) / (3 * stdDev)
  const cpk = Math.min(cpu, cpl)

  // Cpm - Taguchi Capability Index
  let cpm = null
  if (target !== null) {
    const variance = Math.pow(stdDev, 2)
    const targetVariance = variance + Math.pow(mean - target, 2)
    cpm = (usl - lsl) / (6 * Math.sqrt(targetVariance))
  }

  // Pp and Ppk (Performance indices - using actual std dev)
  const pp = (usl - lsl) / (6 * stdDev)
  const ppu = (usl - mean) / (3 * stdDev)
  const ppl = (mean - lsl) / (3 * stdDev)
  const ppk = Math.min(ppu, ppl)

  // Calculate percentage within specifications
  const withinSpec = data.filter((val) => val >= lsl && val <= usl).length
  const percentWithinSpec = (withinSpec / data.length) * 100

  return {
    cp: parseFloat(cp.toFixed(3)),
    cpk: parseFloat(cpk.toFixed(3)),
    cpm: cpm !== null ? parseFloat(cpm.toFixed(3)) : null,
    pp: parseFloat(pp.toFixed(3)),
    ppk: parseFloat(ppk.toFixed(3)),
    mean: parseFloat(mean.toFixed(3)),
    stdDev: parseFloat(stdDev.toFixed(3)),
    lsl,
    usl,
    target,
    percentWithinSpec: parseFloat(percentWithinSpec.toFixed(2)),
  }
}

// Detect out-of-control conditions
export const detectOutOfControl = (values, centerLine, ucl, lcl) => {
  const violations = []

  values.forEach((value, index) => {
    // Rule 1: Point beyond control limits
    if (value > ucl || value < lcl) {
      violations.push({
        index,
        value,
        rule: 'Beyond control limits',
        severity: 'high',
      })
    }

    // Rule 2: 8 consecutive points on one side of center line
    if (index >= 7) {
      const last8 = values.slice(index - 7, index + 1)
      if (last8.every((v) => v > centerLine) || last8.every((v) => v < centerLine)) {
        violations.push({
          index,
          value,
          rule: '8 consecutive points on one side',
          severity: 'medium',
        })
      }
    }

    // Rule 3: 6 consecutive points increasing or decreasing
    if (index >= 5) {
      const last6 = values.slice(index - 5, index + 1)
      let increasing = true
      let decreasing = true
      for (let i = 1; i < last6.length; i++) {
        if (last6[i] <= last6[i - 1]) increasing = false
        if (last6[i] >= last6[i - 1]) decreasing = false
      }
      if (increasing || decreasing) {
        violations.push({
          index,
          value,
          rule: '6 consecutive points trending',
          severity: 'medium',
        })
      }
    }

    // Rule 4: 2 out of 3 consecutive points beyond 2 sigma
    if (index >= 2) {
      const sigma = (ucl - centerLine) / 3
      const twoSigmaUpper = centerLine + 2 * sigma
      const twoSigmaLower = centerLine - 2 * sigma
      const last3 = values.slice(index - 2, index + 1)
      const beyondTwoSigma = last3.filter(
        (v) => v > twoSigmaUpper || v < twoSigmaLower
      ).length
      if (beyondTwoSigma >= 2) {
        violations.push({
          index,
          value,
          rule: '2 out of 3 beyond 2 sigma',
          severity: 'medium',
        })
      }
    }
  })

  return violations
}

// Calculate control limits with custom sigma multiplier
export const calculateControlLimits = (data, sigmaMultiplier = 3) => {
  const mean = calculateMean(data)
  const stdDev = calculateStdDev(data)

  return {
    centerLine: mean,
    ucl: mean + sigmaMultiplier * stdDev,
    lcl: mean - sigmaMultiplier * stdDev,
    stdDev,
  }
}

// Moving range calculation
export const calculateMovingRange = (data) => {
  if (!data || data.length < 2) return []

  const movingRanges = []
  for (let i = 1; i < data.length; i++) {
    movingRanges.push(Math.abs(data[i] - data[i - 1]))
  }

  return movingRanges
}

// EWMA (Exponentially Weighted Moving Average)
export const calculateEWMA = (data, lambda = 0.2) => {
  if (!data || data.length === 0) return []

  const ewma = [data[0]]
  for (let i = 1; i < data.length; i++) {
    ewma.push(lambda * data[i] + (1 - lambda) * ewma[i - 1])
  }

  return ewma
}

// CUSUM (Cumulative Sum)
export const calculateCUSUM = (data, target, k = 0.5) => {
  if (!data || data.length === 0) return { upper: [], lower: [] }

  const stdDev = calculateStdDev(data)
  const kValue = k * stdDev

  const upper = [0]
  const lower = [0]

  for (let i = 1; i < data.length; i++) {
    upper.push(Math.max(0, data[i] - target - kValue + upper[i - 1]))
    lower.push(Math.max(0, target - data[i] - kValue + lower[i - 1]))
  }

  return { upper, lower }
}
