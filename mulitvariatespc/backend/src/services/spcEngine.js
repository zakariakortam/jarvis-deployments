import * as math from 'mathjs'

class SPCEngine {
  constructor(database) {
    this.db = database
    this.phaseIData = null
    this.means = null
    this.covMatrix = null
    this.controlLimits = {
      hotellingT2: { ucl: null, cl: null },
      mewma: { ucl: null, cl: null },
      mcusum: { ucl: null, cl: null }
    }
    this.config = {
      samplingInterval: 5000,
      chartType: 'hotellingT2',
      alpha: 0.05,
      lambda: 0.2, // For MEWMA
      k: 0.5 // For MCUSUM
    }
    this.previousMEWMA = null
    this.previousCUSUM = null
    this.initialized = false
  }

  isInitialized() {
    return this.initialized
  }

  initializePhaseI(data) {
    this.phaseIData = data
    const n = data.length
    const p = data[0].length

    // Calculate mean vector
    this.means = this.calculateMean(data)

    // Calculate covariance matrix
    this.covMatrix = this.calculateCovariance(data, this.means)

    // Calculate control limits for Hotelling T²
    this.controlLimits.hotellingT2.ucl = this.calculateHotellingUCL(n, p)
    this.controlLimits.hotellingT2.cl = p

    // MEWMA UCL (approximation)
    this.controlLimits.mewma.ucl = p * (this.config.lambda / (2 - this.config.lambda))
    this.controlLimits.mewma.cl = 0

    // MCUSUM UCL (approximation)
    this.controlLimits.mcusum.ucl = 5 * Math.sqrt(p)
    this.controlLimits.mcusum.cl = 0

    this.initialized = true
    console.log('Phase I initialization complete')
  }

  processObservation(observation) {
    if (!this.initialized) {
      throw new Error('SPC Engine not initialized. Run Phase I first.')
    }

    const result = {
      observation,
      chartType: this.config.chartType,
      statistic: 0,
      status: 'normal',
      contributions: []
    }

    switch (this.config.chartType) {
      case 'hotellingT2':
        result.statistic = this.calculateHotellingT2(observation)
        result.status = this.evaluateStatus(
          result.statistic,
          this.controlLimits.hotellingT2.ucl
        )
        break

      case 'mewma':
        const mewmaResult = this.calculateMEWMA(observation)
        result.statistic = mewmaResult.statistic
        this.previousMEWMA = mewmaResult.mewma
        result.status = this.evaluateStatus(
          result.statistic,
          this.controlLimits.mewma.ucl
        )
        break

      case 'mcusum':
        const mcusumResult = this.calculateMCUSUM(observation)
        result.statistic = mcusumResult.statistic
        this.previousCUSUM = mcusumResult.cusum
        result.status = this.evaluateStatus(
          result.statistic,
          this.controlLimits.mcusum.ucl
        )
        break
    }

    // Calculate contributions
    result.contributions = this.calculateContributions(observation)

    return result
  }

  calculateMean(data) {
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

  calculateCovariance(data, means) {
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

  calculateHotellingT2(observation) {
    try {
      const diff = math.subtract(observation, this.means)
      const covInv = math.inv(this.covMatrix)
      const t2 = math.multiply(math.multiply(diff, covInv), math.transpose(diff))
      return typeof t2 === 'number' ? t2 : t2.get([0, 0])
    } catch (error) {
      console.error('Error calculating Hotelling T²:', error)
      return 0
    }
  }

  calculateHotellingUCL(n, p, alpha = 0.05) {
    // Approximation using chi-square distribution
    const chiSquare = this.getChiSquareCritical(p, alpha)
    return ((p * (n + 1) * (n - 1)) / (n * (n - p))) * chiSquare / p
  }

  getChiSquareCritical(df, alpha) {
    // Approximation
    const z = this.getZScore(1 - alpha)
    return df * Math.pow(1 - (2 / (9 * df)) + z * Math.sqrt(2 / (9 * df)), 3)
  }

  getZScore(p) {
    // Normal distribution inverse (approximation)
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

    const q = p - 0.5
    const r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  }

  calculateMEWMA(observation) {
    const lambda = this.config.lambda
    const diff = math.subtract(observation, this.means)

    const mewma = this.previousMEWMA
      ? math.add(math.multiply(lambda, diff), math.multiply(1 - lambda, this.previousMEWMA))
      : math.multiply(lambda, diff)

    const scaledCov = math.multiply(this.covMatrix, lambda / (2 - lambda))
    const covInv = math.inv(scaledCov)
    const statistic = math.multiply(math.multiply(mewma, covInv), math.transpose(mewma))

    return {
      mewma: Array.isArray(mewma) ? mewma : [mewma],
      statistic: typeof statistic === 'number' ? statistic : statistic.get([0, 0])
    }
  }

  calculateMCUSUM(observation) {
    const k = this.config.k
    const diff = math.subtract(observation, this.means)
    const covInv = math.inv(this.covMatrix)

    const mahalanobis = Math.sqrt(
      math.multiply(math.multiply(diff, covInv), math.transpose(diff))
    )

    const cusum = this.previousCUSUM || new Array(observation.length).fill(0)
    const newCUSUM = math.add(cusum, math.multiply(Math.max(0, mahalanobis - k), diff))

    const statistic = Math.sqrt(
      math.multiply(math.multiply(newCUSUM, covInv), math.transpose(newCUSUM))
    )

    return {
      cusum: Array.isArray(newCUSUM) ? newCUSUM : [newCUSUM],
      statistic: typeof statistic === 'number' ? statistic : statistic.get([0, 0])
    }
  }

  calculateContributions(observation) {
    try {
      const diff = math.subtract(observation, this.means)
      const covInv = math.inv(this.covMatrix)
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
          name: `Variable ${i + 1}`,
          contribution,
          percentage: 0
        })
      }

      contributions.forEach(item => {
        item.percentage = (item.contribution / totalContribution) * 100
      })

      return contributions.sort((a, b) => b.contribution - a.contribution)
    } catch (error) {
      console.error('Error calculating contributions:', error)
      return []
    }
  }

  evaluateStatus(statistic, ucl) {
    if (statistic > ucl) {
      return 'critical'
    } else if (statistic > ucl * 0.8) {
      return 'warning'
    }
    return 'normal'
  }

  updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig }
    console.log('Configuration updated:', this.config)
  }

  getConfiguration() {
    return this.config
  }

  reset() {
    this.phaseIData = null
    this.means = null
    this.covMatrix = null
    this.previousMEWMA = null
    this.previousCUSUM = null
    this.initialized = false
    console.log('SPC Engine reset')
  }
}

export default SPCEngine
