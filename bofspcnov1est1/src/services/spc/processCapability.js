/**
 * Process Capability Analysis Module
 * Calculates Cp, Cpk, Pp, Ppk, Cpm, Six Sigma level, and DPMO
 */

/**
 * Calculate process capability indices
 * @param {Array<number>} values - Process measurements
 * @param {number} usl - Upper Specification Limit
 * @param {number} lsl - Lower Specification Limit
 * @param {number} target - Target value (optional, defaults to midpoint)
 * @param {number} pooledStdDev - Pooled standard deviation (optional, for short-term capability)
 * @returns {Object} Process capability metrics
 */
export function calculateProcessCapability(values, usl, lsl, target = null, pooledStdDev = null) {
  if (!values || values.length < 30) {
    throw new Error('Need at least 30 values for reliable capability analysis')
  }

  if (usl <= lsl) {
    throw new Error('USL must be greater than LSL')
  }

  // Calculate process statistics
  const n = values.length
  const mean = values.reduce((acc, val) => acc + val, 0) / n

  // Long-term standard deviation (overall process variation)
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)

  // Use pooled standard deviation if provided (short-term capability)
  const shortTermStdDev = pooledStdDev || stdDev

  // Target defaults to midpoint of specifications
  const processTarget = target !== null ? target : (usl + lsl) / 2

  // Calculate Cp (Potential Capability Index)
  // Cp = (USL - LSL) / (6 * σ_within)
  const cp = (usl - lsl) / (6 * shortTermStdDev)

  // Calculate Cpk (Actual Capability Index)
  // Cpk = min((USL - μ) / 3σ, (μ - LSL) / 3σ)
  const cpu = (usl - mean) / (3 * shortTermStdDev)
  const cpl = (mean - lsl) / (3 * shortTermStdDev)
  const cpk = Math.min(cpu, cpl)

  // Calculate Pp (Overall Performance Index)
  // Pp = (USL - LSL) / (6 * σ_overall)
  const pp = (usl - lsl) / (6 * stdDev)

  // Calculate Ppk (Overall Performance Index adjusted for centering)
  // Ppk = min((USL - μ) / 3σ_overall, (μ - LSL) / 3σ_overall)
  const ppu = (usl - mean) / (3 * stdDev)
  const ppl = (mean - lsl) / (3 * stdDev)
  const ppk = Math.min(ppu, ppl)

  // Calculate Cpm (Taguchi Capability Index)
  // Accounts for deviation from target
  const targetDeviation = Math.pow(mean - processTarget, 2)
  const cpmVariance = variance + targetDeviation
  const cpmStdDev = Math.sqrt(cpmVariance)
  const cpm = (usl - lsl) / (6 * cpmStdDev)

  // Calculate Six Sigma Level
  // Z_bench = 3 * Cpk (assumes 1.5 sigma shift)
  const zBench = 3 * cpk
  const sigmaLevel = zBench + 1.5 // Add back the 1.5 sigma shift

  // Calculate Defects Per Million Opportunities (DPMO)
  const dpmo = calculateDPMO(values, usl, lsl)

  // Calculate Yield
  const defects = values.filter(val => val < lsl || val > usl).length
  const yieldPercentage = ((n - defects) / n) * 100

  // Process centering
  const centering = (mean - processTarget) / ((usl - lsl) / 2)

  return {
    cp,
    cpk,
    pp,
    ppk,
    cpm,
    cpu,
    cpl,
    ppu,
    ppl,
    sigmaLevel,
    dpmo,
    yield: yieldPercentage,
    mean,
    stdDev,
    shortTermStdDev,
    target: processTarget,
    centering,
    interpretation: interpretCapabilityIndices({ cp, cpk, pp, ppk, sigmaLevel })
  }
}

/**
 * Calculate Defects Per Million Opportunities
 * @param {Array<number>} values - Process measurements
 * @param {number} usl - Upper Specification Limit
 * @param {number} lsl - Lower Specification Limit
 * @returns {number} DPMO value
 */
export function calculateDPMO(values, usl, lsl) {
  const defects = values.filter(val => val < lsl || val > usl).length
  const opportunities = values.length
  return (defects / opportunities) * 1000000
}

/**
 * Calculate Z-score (standard normal distribution)
 * @param {number} x - Value
 * @param {number} mean - Mean
 * @param {number} stdDev - Standard deviation
 * @returns {number} Z-score
 */
export function calculateZScore(x, mean, stdDev) {
  return (x - mean) / stdDev
}

/**
 * Interpret capability indices
 * @param {Object} indices - Capability indices
 * @returns {Object} Interpretation
 */
export function interpretCapabilityIndices({ cp, cpk, pp, ppk, sigmaLevel }) {
  let cpInterpretation = ''
  let cpkInterpretation = ''
  let overallAssessment = ''
  let recommendation = ''

  // Interpret Cp
  if (cp >= 2.0) {
    cpInterpretation = 'Excellent - Process has excellent potential capability'
  } else if (cp >= 1.33) {
    cpInterpretation = 'Good - Process has good potential capability'
  } else if (cp >= 1.0) {
    cpInterpretation = 'Marginal - Process meets minimum requirements'
  } else {
    cpInterpretation = 'Poor - Process cannot meet specifications'
  }

  // Interpret Cpk
  if (cpk >= 2.0) {
    cpkInterpretation = 'Excellent - Process is well-centered and capable'
  } else if (cpk >= 1.33) {
    cpkInterpretation = 'Good - Process is capable'
  } else if (cpk >= 1.0) {
    cpkInterpretation = 'Marginal - Process barely meets specifications'
  } else {
    cpkInterpretation = 'Poor - Process produces defects'
  }

  // Overall assessment
  if (cpk >= 1.33 && Math.abs(cp - cpk) < 0.2) {
    overallAssessment = 'Process is capable and well-centered'
    recommendation = 'Continue monitoring. Consider process improvement for Six Sigma level.'
  } else if (cpk >= 1.0 && Math.abs(cp - cpk) > 0.3) {
    overallAssessment = 'Process has capability but is off-center'
    recommendation = 'Focus on centering the process mean to target value.'
  } else if (cp >= 1.33 && cpk < 1.0) {
    overallAssessment = 'Process has potential but needs centering'
    recommendation = 'Adjust process mean to improve Cpk. Reduce process variation.'
  } else {
    overallAssessment = 'Process needs improvement'
    recommendation = 'Reduce process variation and center the process. Consider process redesign.'
  }

  return {
    cp: cpInterpretation,
    cpk: cpkInterpretation,
    overall: overallAssessment,
    recommendation,
    sigmaQuality: getSigmaQualityLevel(sigmaLevel)
  }
}

/**
 * Get Six Sigma quality level interpretation
 * @param {number} sigmaLevel - Sigma level
 * @returns {string} Quality interpretation
 */
export function getSigmaQualityLevel(sigmaLevel) {
  if (sigmaLevel >= 6.0) {
    return '6σ - World Class (3.4 DPMO)'
  } else if (sigmaLevel >= 5.0) {
    return '5σ - Excellent (233 DPMO)'
  } else if (sigmaLevel >= 4.0) {
    return '4σ - Good (6,210 DPMO)'
  } else if (sigmaLevel >= 3.0) {
    return '3σ - Average (66,807 DPMO)'
  } else if (sigmaLevel >= 2.0) {
    return '2σ - Below Average (308,537 DPMO)'
  } else {
    return '1σ - Poor (>690,000 DPMO)'
  }
}

/**
 * Calculate confidence intervals for Cpk
 * @param {number} cpk - Cpk value
 * @param {number} n - Sample size
 * @param {number} confidence - Confidence level (0.90, 0.95, 0.99)
 * @returns {Object} Confidence interval
 */
export function calculateCpkConfidenceInterval(cpk, n, confidence = 0.95) {
  // Z-values for confidence levels
  const zValues = {
    0.90: 1.645,
    0.95: 1.960,
    0.99: 2.576
  }

  const z = zValues[confidence]
  if (!z) {
    throw new Error('Confidence level must be 0.90, 0.95, or 0.99')
  }

  // Standard error of Cpk
  const seCpk = cpk * Math.sqrt((1 / (9 * n * Math.pow(cpk, 2))) + (1 / (2 * (n - 1))))

  return {
    lower: cpk - (z * seCpk),
    upper: cpk + (z * seCpk),
    confidence
  }
}

/**
 * Calculate Machine Capability (Cm, Cmk)
 * Used for short-term studies
 * @param {Array<number>} values - Measurements from machine capability study
 * @param {number} usl - Upper Specification Limit
 * @param {number} lsl - Lower Specification Limit
 * @returns {Object} Machine capability indices
 */
export function calculateMachineCapability(values, usl, lsl) {
  if (!values || values.length < 50) {
    throw new Error('Need at least 50 consecutive values for machine capability study')
  }

  const mean = values.reduce((acc, val) => acc + val, 0) / values.length
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1)
  const stdDev = Math.sqrt(variance)

  const cm = (usl - lsl) / (6 * stdDev)
  const cmu = (usl - mean) / (3 * stdDev)
  const cml = (mean - lsl) / (3 * stdDev)
  const cmk = Math.min(cmu, cml)

  return {
    cm,
    cmk,
    cmu,
    cml,
    mean,
    stdDev
  }
}

export default {
  calculateProcessCapability,
  calculateDPMO,
  calculateZScore,
  interpretCapabilityIndices,
  getSigmaQualityLevel,
  calculateCpkConfidenceInterval,
  calculateMachineCapability
}
