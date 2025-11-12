import * as math from 'mathjs'

/**
 * Calculate mean vector from data matrix
 * @param {Array<Array<number>>} data - Matrix of observations (rows) x variables (columns)
 * @returns {Array<number>} Mean vector
 */
export function calculateMean(data) {
  if (!data || data.length === 0) return []
  const n = data.length
  const p = data[0].length
  const means = new Array(p).fill(0)

  for (let j = 0; j < p; j++) {
    for (let i = 0; i < n; i++) {
      means[j] += data[i][j]
    }
    means[j] /= n
  }

  return means
}

/**
 * Calculate covariance matrix
 * @param {Array<Array<number>>} data - Matrix of observations
 * @param {Array<number>} means - Mean vector
 * @returns {Array<Array<number>>} Covariance matrix
 */
export function calculateCovariance(data, means) {
  const n = data.length
  const p = data[0].length
  const cov = Array(p).fill(null).map(() => Array(p).fill(0))

  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += (data[k][i] - means[i]) * (data[k][j] - means[j])
      }
      cov[i][j] = sum / (n - 1)
    }
  }

  return cov
}

/**
 * Calculate Hotelling's T² statistic
 * @param {Array<number>} observation - Current observation vector
 * @param {Array<number>} mean - Mean vector from Phase I
 * @param {Array<Array<number>>} covMatrix - Covariance matrix from Phase I
 * @returns {number} T² statistic
 */
export function calculateHotellingT2(observation, mean, covMatrix) {
  try {
    const diff = math.subtract(observation, mean)
    const covInv = math.inv(covMatrix)
    const t2 = math.multiply(math.multiply(diff, covInv), math.transpose(diff))
    return typeof t2 === 'number' ? t2 : t2.get([0, 0])
  } catch (error) {
    console.error('Error calculating Hotelling T²:', error)
    return 0
  }
}

/**
 * Calculate UCL for Hotelling T² chart (Phase II)
 * @param {number} n - Phase I sample size
 * @param {number} p - Number of variables
 * @param {number} alpha - Significance level (default 0.05)
 * @returns {number} Upper control limit
 */
export function calculateHotellingUCL(n, p, alpha = 0.05) {
  // UCL = (p(n+1)(n-1))/(n(n-p)) * F(alpha, p, n-p)
  // Using approximation: F(0.05, p, n-p) ≈ chi2(0.05, p) * (n-p)/(n-1)
  const chiSquare = getChiSquareCritical(p, alpha)
  return ((p * (n + 1) * (n - 1)) / (n * (n - p))) * chiSquare / p
}

/**
 * Get chi-square critical value (approximation)
 * @param {number} df - Degrees of freedom
 * @param {number} alpha - Significance level
 * @returns {number} Critical value
 */
function getChiSquareCritical(df, alpha) {
  // Approximation using Wilson-Hilferty transformation
  const z = getZScore(1 - alpha)
  return df * Math.pow(1 - (2 / (9 * df)) + z * Math.sqrt(2 / (9 * df)), 3)
}

/**
 * Get z-score for given probability
 * @param {number} p - Probability
 * @returns {number} Z-score
 */
function getZScore(p) {
  // Approximation using rational function
  const a = [
    -3.969683028665376e1, 2.209460984245205e2,
    -2.759285104469687e2, 1.383577518672690e2,
    -3.066479806614716e1, 2.506628277459239
  ]
  const b = [
    -5.447609879822406e1, 1.615858368580409e2,
    -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1
  ]
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1,
    -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783
  ]
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1,
    2.445134137142996, 3.754408661907416
  ]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  let q, r, x

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  } else if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }

  return x
}

/**
 * Calculate MEWMA (Multivariate Exponentially Weighted Moving Average) statistic
 * @param {Array<number>} observation - Current observation
 * @param {Array<number>} previousMEWMA - Previous MEWMA vector
 * @param {Array<number>} mean - Mean vector
 * @param {Array<Array<number>>} covMatrix - Covariance matrix
 * @param {number} lambda - Smoothing parameter (0 < lambda <= 1)
 * @returns {Object} { mewma: Array, statistic: number }
 */
export function calculateMEWMA(observation, previousMEWMA, mean, covMatrix, lambda = 0.2) {
  try {
    // MEWMA = lambda * (x - mu) + (1 - lambda) * previous_MEWMA
    const diff = math.subtract(observation, mean)
    const mewma = previousMEWMA
      ? math.add(math.multiply(lambda, diff), math.multiply(1 - lambda, previousMEWMA))
      : math.multiply(lambda, diff)

    // T² = mewma' * (Sigma * lambda / (2 - lambda))^-1 * mewma
    const scaledCov = math.multiply(covMatrix, lambda / (2 - lambda))
    const covInv = math.inv(scaledCov)
    const statistic = math.multiply(math.multiply(mewma, covInv), math.transpose(mewma))

    return {
      mewma: Array.isArray(mewma) ? mewma : [mewma],
      statistic: typeof statistic === 'number' ? statistic : statistic.get([0, 0])
    }
  } catch (error) {
    console.error('Error calculating MEWMA:', error)
    return { mewma: previousMEWMA || new Array(observation.length).fill(0), statistic: 0 }
  }
}

/**
 * Calculate MCUSUM (Multivariate Cumulative Sum) statistic
 * @param {Array<number>} observation - Current observation
 * @param {Array<number>} previousCUSUM - Previous CUSUM vector
 * @param {Array<number>} mean - Mean vector
 * @param {Array<Array<number>>} covMatrix - Covariance matrix
 * @param {number} k - Reference value (typically 0.5)
 * @returns {Object} { cusum: Array, statistic: number }
 */
export function calculateMCUSUM(observation, previousCUSUM, mean, covMatrix, k = 0.5) {
  try {
    const diff = math.subtract(observation, mean)
    const covInv = math.inv(covMatrix)

    // Calculate Mahalanobis distance
    const mahalanobis = Math.sqrt(
      math.multiply(math.multiply(diff, covInv), math.transpose(diff))
    )

    // CUSUM = max(0, previous_CUSUM + mahalanobis - k)
    const cusum = previousCUSUM || new Array(observation.length).fill(0)
    const newCUSUM = math.add(cusum, math.multiply(Math.max(0, mahalanobis - k), diff))

    // Calculate statistic (magnitude of CUSUM vector)
    const statistic = Math.sqrt(
      math.multiply(math.multiply(newCUSUM, covInv), math.transpose(newCUSUM))
    )

    return {
      cusum: Array.isArray(newCUSUM) ? newCUSUM : [newCUSUM],
      statistic: typeof statistic === 'number' ? statistic : statistic.get([0, 0])
    }
  } catch (error) {
    console.error('Error calculating MCUSUM:', error)
    return { cusum: previousCUSUM || new Array(observation.length).fill(0), statistic: 0 }
  }
}

/**
 * Calculate contribution of each variable to T² statistic
 * @param {Array<number>} observation - Current observation
 * @param {Array<number>} mean - Mean vector
 * @param {Array<Array<number>>} covMatrix - Covariance matrix
 * @param {Array<string>} variableNames - Names of variables
 * @returns {Array<Object>} Array of {name, contribution, percentage}
 */
export function calculateContributions(observation, mean, covMatrix, variableNames) {
  try {
    const diff = math.subtract(observation, mean)
    const covInv = math.inv(covMatrix)
    const p = observation.length

    const contributions = []
    let totalContribution = 0

    for (let i = 0; i < p; i++) {
      let contribution = 0
      for (let j = 0; j < p; j++) {
        contribution += diff[i] * covInv[i][j] * diff[j]
      }
      contribution = Math.abs(contribution)
      totalContribution += contribution
      contributions.push({
        name: variableNames[i] || `Variable ${i + 1}`,
        contribution,
        percentage: 0
      })
    }

    // Calculate percentages
    contributions.forEach(item => {
      item.percentage = (item.contribution / totalContribution) * 100
    })

    return contributions.sort((a, b) => b.contribution - a.contribution)
  } catch (error) {
    console.error('Error calculating contributions:', error)
    return []
  }
}

/**
 * Perform PCA (Principal Component Analysis)
 * @param {Array<Array<number>>} data - Data matrix
 * @returns {Object} { eigenvalues, eigenvectors, variance_explained }
 */
export function performPCA(data) {
  try {
    const means = calculateMean(data)
    const covMatrix = calculateCovariance(data, means)

    // Calculate eigenvalues and eigenvectors
    const eig = math.eigs(covMatrix)

    // Sort by eigenvalues in descending order
    const indices = eig.values
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .map(item => item.idx)

    const eigenvalues = indices.map(i => eig.values[i])
    const eigenvectors = indices.map(i => eig.vectors[i])

    // Calculate variance explained
    const totalVariance = eigenvalues.reduce((sum, val) => sum + val, 0)
    const varianceExplained = eigenvalues.map(val => (val / totalVariance) * 100)

    return {
      eigenvalues,
      eigenvectors,
      varianceExplained,
      cumulativeVariance: varianceExplained.reduce((acc, val, idx) => {
        acc[idx] = (acc[idx - 1] || 0) + val
        return acc
      }, [])
    }
  } catch (error) {
    console.error('Error performing PCA:', error)
    return null
  }
}

/**
 * Detect outliers using Mahalanobis distance
 * @param {Array<Array<number>>} data - Data matrix
 * @param {number} threshold - Threshold multiplier (typically 3)
 * @returns {Array<number>} Indices of outliers
 */
export function detectOutliers(data, threshold = 3) {
  const means = calculateMean(data)
  const covMatrix = calculateCovariance(data, means)
  const outliers = []

  try {
    const covInv = math.inv(covMatrix)

    data.forEach((observation, idx) => {
      const diff = math.subtract(observation, means)
      const distance = Math.sqrt(
        math.multiply(math.multiply(diff, covInv), math.transpose(diff))
      )

      if (distance > threshold) {
        outliers.push(idx)
      }
    })
  } catch (error) {
    console.error('Error detecting outliers:', error)
  }

  return outliers
}

/**
 * Calculate process capability index (multivariate)
 * @param {Array<Array<number>>} data - Data matrix
 * @param {Array<number>} specs - Specification limits [lower, upper] for each variable
 * @returns {Object} Capability indices
 */
export function calculateCapability(data, specs) {
  const means = calculateMean(data)
  const covMatrix = calculateCovariance(data, means)

  // Simplified multivariate capability
  const p = data[0].length
  const capabilities = []

  for (let i = 0; i < p; i++) {
    const variance = covMatrix[i][i]
    const std = Math.sqrt(variance)
    const [lower, upper] = specs[i] || [means[i] - 3 * std, means[i] + 3 * std]

    const cp = (upper - lower) / (6 * std)
    const cpk = Math.min(
      (upper - means[i]) / (3 * std),
      (means[i] - lower) / (3 * std)
    )

    capabilities.push({ cp, cpk })
  }

  return capabilities
}
