/**
 * Western Electric Rules for Detecting Out-of-Control Conditions
 * Implements all 8 standard Western Electric rules for SPC charts
 */

/**
 * Check all Western Electric rules
 * @param {Array<number>} values - Data points
 * @param {number} centerLine - Center line (mean)
 * @param {number} ucl - Upper Control Limit
 * @param {number} lcl - Lower Control Limit
 * @returns {Object} Violations detected
 */
export function checkAllRules(values, centerLine, ucl, lcl) {
  if (!values || values.length === 0) {
    throw new Error('Values array cannot be empty')
  }

  const sigma = (ucl - centerLine) / 3

  const violations = {
    rule1: checkRule1(values, ucl, lcl),
    rule2: checkRule2(values, centerLine, sigma),
    rule3: checkRule3(values, centerLine, sigma),
    rule4: checkRule4(values, centerLine, sigma),
    rule5: checkRule5(values, centerLine, sigma),
    rule6: checkRule6(values),
    rule7: checkRule7(values, centerLine, sigma),
    rule8: checkRule8(values, centerLine, sigma)
  }

  // Count total violations
  const totalViolations = Object.values(violations).reduce(
    (acc, rule) => acc + rule.violations.length,
    0
  )

  return {
    violations,
    hasViolations: totalViolations > 0,
    totalViolations,
    summary: generateViolationSummary(violations)
  }
}

/**
 * Rule 1: One point more than 3 standard deviations from the center line
 * This indicates a process out of control or a special cause
 * @param {Array<number>} values - Data points
 * @param {number} ucl - Upper Control Limit
 * @param {number} lcl - Lower Control Limit
 * @returns {Object} Rule violations
 */
export function checkRule1(values, ucl, lcl) {
  const violations = []

  values.forEach((value, index) => {
    if (value > ucl || value < lcl) {
      violations.push({
        index,
        value,
        message: `Point exceeds control limits (${value > ucl ? 'UCL' : 'LCL'})`,
        severity: 'critical'
      })
    }
  })

  return {
    rule: 'Rule 1',
    description: 'One point beyond 3σ from center line',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Rule 2: Nine (or more) points in a row on the same side of the center line
 * Indicates a shift in the process average
 * @param {Array<number>} values - Data points
 * @param {number} centerLine - Center line
 * @param {number} sigma - Standard deviation
 * @returns {Object} Rule violations
 */
export function checkRule2(values, centerLine, sigma) {
  const violations = []
  const requiredCount = 9

  for (let i = requiredCount - 1; i < values.length; i++) {
    const sequence = values.slice(i - requiredCount + 1, i + 1)
    const allAbove = sequence.every(val => val > centerLine)
    const allBelow = sequence.every(val => val < centerLine)

    if (allAbove || allBelow) {
      violations.push({
        index: i,
        startIndex: i - requiredCount + 1,
        value: values[i],
        message: `9 consecutive points ${allAbove ? 'above' : 'below'} center line`,
        severity: 'high'
      })
    }
  }

  return {
    rule: 'Rule 2',
    description: '9 points in a row on same side of center line',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Rule 3: Six (or more) points in a row, all increasing or all decreasing
 * Indicates a trend in the process
 * @param {Array<number>} values - Data points
 * @param {number} centerLine - Center line
 * @param {number} sigma - Standard deviation
 * @returns {Object} Rule violations
 */
export function checkRule3(values, centerLine, sigma) {
  const violations = []
  const requiredCount = 6

  for (let i = requiredCount - 1; i < values.length; i++) {
    const sequence = values.slice(i - requiredCount + 1, i + 1)

    let increasing = true
    let decreasing = true

    for (let j = 1; j < sequence.length; j++) {
      if (sequence[j] <= sequence[j - 1]) increasing = false
      if (sequence[j] >= sequence[j - 1]) decreasing = false
    }

    if (increasing || decreasing) {
      violations.push({
        index: i,
        startIndex: i - requiredCount + 1,
        value: values[i],
        message: `6 consecutive points ${increasing ? 'increasing' : 'decreasing'}`,
        severity: 'high'
      })
    }
  }

  return {
    rule: 'Rule 3',
    description: '6 points in a row steadily increasing or decreasing',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Rule 4: Fourteen (or more) points in a row alternating in direction
 * Indicates excessive variation or oscillation
 * @param {Array<number>} values - Data points
 * @param {number} centerLine - Center line
 * @param {number} sigma - Standard deviation
 * @returns {Object} Rule violations
 */
export function checkRule4(values, centerLine, sigma) {
  const violations = []
  const requiredCount = 14

  for (let i = requiredCount - 1; i < values.length; i++) {
    const sequence = values.slice(i - requiredCount + 1, i + 1)

    let alternating = true
    for (let j = 2; j < sequence.length; j++) {
      const prev = sequence[j - 1] - sequence[j - 2]
      const curr = sequence[j] - sequence[j - 1]

      if ((prev > 0 && curr > 0) || (prev < 0 && curr < 0)) {
        alternating = false
        break
      }
    }

    if (alternating) {
      violations.push({
        index: i,
        startIndex: i - requiredCount + 1,
        value: values[i],
        message: '14 consecutive points alternating up and down',
        severity: 'medium'
      })
    }
  }

  return {
    rule: 'Rule 4',
    description: '14 points alternating up and down',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Rule 5: Two (or three) out of three points more than 2 standard deviations from center line (same side)
 * Indicates a shift toward one side
 * @param {Array<number>} values - Data points
 * @param {number} centerLine - Center line
 * @param {number} sigma - Standard deviation
 * @returns {Object} Rule violations
 */
export function checkRule5(values, centerLine, sigma) {
  const violations = []
  const upper2Sigma = centerLine + (2 * sigma)
  const lower2Sigma = centerLine - (2 * sigma)

  for (let i = 2; i < values.length; i++) {
    const sequence = values.slice(i - 2, i + 1)

    const aboveCount = sequence.filter(val => val > upper2Sigma).length
    const belowCount = sequence.filter(val => val < lower2Sigma).length

    if (aboveCount >= 2 || belowCount >= 2) {
      violations.push({
        index: i,
        startIndex: i - 2,
        value: values[i],
        message: `2 out of 3 points beyond 2σ (${aboveCount >= 2 ? 'above' : 'below'})`,
        severity: 'high'
      })
    }
  }

  return {
    rule: 'Rule 5',
    description: '2 out of 3 points beyond 2σ from center line (same side)',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Rule 6: Four (or five) out of five points more than 1 standard deviation from center line (same side)
 * Indicates process shift
 * @param {Array<number>} values - Data points
 * @returns {Object} Rule violations
 */
export function checkRule6(values, centerLine, sigma) {
  const violations = []
  const upper1Sigma = centerLine + sigma
  const lower1Sigma = centerLine - sigma

  for (let i = 4; i < values.length; i++) {
    const sequence = values.slice(i - 4, i + 1)

    const aboveCount = sequence.filter(val => val > upper1Sigma).length
    const belowCount = sequence.filter(val => val < lower1Sigma).length

    if (aboveCount >= 4 || belowCount >= 4) {
      violations.push({
        index: i,
        startIndex: i - 4,
        value: values[i],
        message: `4 out of 5 points beyond 1σ (${aboveCount >= 4 ? 'above' : 'below'})`,
        severity: 'medium'
      })
    }
  }

  return {
    rule: 'Rule 6',
    description: '4 out of 5 points beyond 1σ from center line (same side)',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Rule 7: Fifteen points in a row all within 1 standard deviation of center line (both sides)
 * Indicates reduced variation (may be data manipulation)
 * @param {Array<number>} values - Data points
 * @param {number} centerLine - Center line
 * @param {number} sigma - Standard deviation
 * @returns {Object} Rule violations
 */
export function checkRule7(values, centerLine, sigma) {
  const violations = []
  const requiredCount = 15
  const upper1Sigma = centerLine + sigma
  const lower1Sigma = centerLine - sigma

  for (let i = requiredCount - 1; i < values.length; i++) {
    const sequence = values.slice(i - requiredCount + 1, i + 1)

    const allWithin = sequence.every(val => val >= lower1Sigma && val <= upper1Sigma)

    if (allWithin) {
      violations.push({
        index: i,
        startIndex: i - requiredCount + 1,
        value: values[i],
        message: '15 consecutive points within 1σ of center line',
        severity: 'low'
      })
    }
  }

  return {
    rule: 'Rule 7',
    description: '15 points in a row within 1σ of center line',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Rule 8: Eight points in a row more than 1 standard deviation from center line (both sides)
 * Indicates increased variation or mixture of populations
 * @param {Array<number>} values - Data points
 * @param {number} centerLine - Center line
 * @param {number} sigma - Standard deviation
 * @returns {Object} Rule violations
 */
export function checkRule8(values, centerLine, sigma) {
  const violations = []
  const requiredCount = 8
  const upper1Sigma = centerLine + sigma
  const lower1Sigma = centerLine - sigma

  for (let i = requiredCount - 1; i < values.length; i++) {
    const sequence = values.slice(i - requiredCount + 1, i + 1)

    const allBeyond = sequence.every(val => val > upper1Sigma || val < lower1Sigma)

    if (allBeyond) {
      violations.push({
        index: i,
        startIndex: i - requiredCount + 1,
        value: values[i],
        message: '8 consecutive points beyond 1σ from center line',
        severity: 'medium'
      })
    }
  }

  return {
    rule: 'Rule 8',
    description: '8 points in a row beyond 1σ from center line (both sides)',
    violations,
    passed: violations.length === 0
  }
}

/**
 * Generate a summary of violations
 * @param {Object} violations - All rule violations
 * @returns {Object} Summary
 */
export function generateViolationSummary(violations) {
  const summary = {
    critical: [],
    high: [],
    medium: [],
    low: []
  }

  Object.entries(violations).forEach(([ruleName, ruleData]) => {
    ruleData.violations.forEach(violation => {
      summary[violation.severity].push({
        rule: ruleData.rule,
        ...violation
      })
    })
  })

  return {
    critical: summary.critical,
    high: summary.high,
    medium: summary.medium,
    low: summary.low,
    totalCritical: summary.critical.length,
    totalHigh: summary.high.length,
    totalMedium: summary.medium.length,
    totalLow: summary.low.length
  }
}

/**
 * Get recommended actions based on violations
 * @param {Object} violations - Violations object
 * @returns {Array<string>} Recommended actions
 */
export function getRecommendedActions(violations) {
  const actions = []

  if (violations.rule1.violations.length > 0) {
    actions.push('IMMEDIATE ACTION REQUIRED: Investigate special causes. Stop production if necessary.')
  }

  if (violations.rule2.violations.length > 0) {
    actions.push('Process mean has shifted. Check for systematic changes in materials, operators, or equipment.')
  }

  if (violations.rule3.violations.length > 0) {
    actions.push('Trend detected. Check for tool wear, temperature drift, or gradual changes in process.')
  }

  if (violations.rule4.violations.length > 0) {
    actions.push('Excessive alternation detected. Check for systematic alternating causes or overcontrol.')
  }

  if (violations.rule5.violations.length > 0 || violations.rule6.violations.length > 0) {
    actions.push('Process shift detected. Investigate recent changes in process parameters.')
  }

  if (violations.rule7.violations.length > 0) {
    actions.push('Unusually low variation. Verify data collection process and measurement system.')
  }

  if (violations.rule8.violations.length > 0) {
    actions.push('High variation detected. Check for multiple process streams or inconsistent inputs.')
  }

  if (actions.length === 0) {
    actions.push('Process is in statistical control. Continue routine monitoring.')
  }

  return actions
}

export default {
  checkAllRules,
  checkRule1,
  checkRule2,
  checkRule3,
  checkRule4,
  checkRule5,
  checkRule6,
  checkRule7,
  checkRule8,
  generateViolationSummary,
  getRecommendedActions
}
