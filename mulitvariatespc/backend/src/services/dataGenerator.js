class DataGenerator {
  constructor() {
    this.means = [100, 50, 75, 25, 150]
    this.stdDevs = [5, 3, 4, 2, 10]
  }

  // Generate Phase I data (in-control process)
  generatePhaseIData(n = 30, p = 5) {
    const data = []
    for (let i = 0; i < n; i++) {
      const observation = []
      for (let j = 0; j < p; j++) {
        observation.push(this.normalRandom(this.means[j], this.stdDevs[j]))
      }
      data.push(observation)
    }
    return data
  }

  // Generate a single observation
  generateObservation(p = 5, shift = 0, shiftVariable = null) {
    const observation = []
    for (let i = 0; i < p; i++) {
      const mean = this.means[i] + (shiftVariable === i ? shift : 0)
      observation.push(this.normalRandom(mean, this.stdDevs[i]))
    }
    return observation
  }

  // Generate observation with random shift (simulating process change)
  generateObservationWithRandomShift(p = 5, shiftProbability = 0.1) {
    if (Math.random() < shiftProbability) {
      const shiftVariable = Math.floor(Math.random() * p)
      const shift = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 1) * this.stdDevs[shiftVariable]
      return this.generateObservation(p, shift, shiftVariable)
    }
    return this.generateObservation(p)
  }

  // Box-Muller transform for generating normal random numbers
  normalRandom(mean = 0, stdDev = 1) {
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + z0 * stdDev
  }

  // Generate multivariate normal data with correlation
  generateMultivariateNormalData(n, means, covMatrix) {
    // Simplified: Uses independent normal variables
    // In production, implement Cholesky decomposition for correlated variables
    const data = []
    for (let i = 0; i < n; i++) {
      const observation = []
      for (let j = 0; j < means.length; j++) {
        const stdDev = Math.sqrt(covMatrix[j][j])
        observation.push(this.normalRandom(means[j], stdDev))
      }
      data.push(observation)
    }
    return data
  }

  // Set custom means and standard deviations
  setParameters(means, stdDevs) {
    this.means = means
    this.stdDevs = stdDevs
  }
}

export default DataGenerator
