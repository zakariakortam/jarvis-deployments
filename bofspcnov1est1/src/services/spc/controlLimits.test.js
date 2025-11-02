import { describe, it, expect } from 'vitest'
import {
  calculateXBarRLimits,
  calculateIndividualsMRLimits,
  calculatePooledStdDev,
  calculateSigmaLimits
} from './controlLimits'

describe('Control Limits Calculations', () => {
  describe('calculateXBarRLimits', () => {
    it('should calculate X-bar and R chart control limits correctly', () => {
      const subgroups = [
        [1650, 1655, 1648, 1652, 1651],
        [1649, 1653, 1650, 1654, 1652],
        [1651, 1650, 1649, 1653, 1652],
        [1652, 1651, 1650, 1654, 1653],
        [1650, 1652, 1651, 1653, 1654]
      ]

      const result = calculateXBarRLimits(subgroups)

      expect(result).toHaveProperty('xBar')
      expect(result).toHaveProperty('range')
      expect(result.xBar).toHaveProperty('centerLine')
      expect(result.xBar).toHaveProperty('ucl')
      expect(result.xBar).toHaveProperty('lcl')
      expect(result.range).toHaveProperty('centerLine')
      expect(result.range).toHaveProperty('ucl')
      expect(result.range).toHaveProperty('lcl')

      // X-bar center line should be close to 1651.4
      expect(result.xBar.centerLine).toBeCloseTo(1651.4, 1)

      // UCL should be greater than center line
      expect(result.xBar.ucl).toBeGreaterThan(result.xBar.centerLine)

      // LCL should be less than center line
      expect(result.xBar.lcl).toBeLessThan(result.xBar.centerLine)
    })

    it('should throw error for empty subgroups', () => {
      expect(() => calculateXBarRLimits([])).toThrow()
    })

    it('should throw error for invalid subgroup size', () => {
      expect(() => calculateXBarRLimits([[1]])).toThrow()
      expect(() => calculateXBarRLimits([[...Array(30)].map(() => 1)])).toThrow()
    })
  })

  describe('calculateIndividualsMRLimits', () => {
    it('should calculate Individuals and MR chart control limits correctly', () => {
      const values = [1650, 1652, 1651, 1653, 1650, 1654, 1652, 1651, 1653, 1650]

      const result = calculateIndividualsMRLimits(values)

      expect(result).toHaveProperty('individuals')
      expect(result).toHaveProperty('movingRange')
      expect(result.individuals).toHaveProperty('centerLine')
      expect(result.individuals).toHaveProperty('ucl')
      expect(result.individuals).toHaveProperty('lcl')

      // Center line should be the average
      const expectedMean = values.reduce((a, b) => a + b, 0) / values.length
      expect(result.individuals.centerLine).toBeCloseTo(expectedMean, 2)

      // Moving range should have correct number of values
      expect(result.movingRange.values).toHaveLength(values.length - 1)
    })

    it('should throw error for insufficient values', () => {
      expect(() => calculateIndividualsMRLimits([1])).toThrow()
    })

    it('should throw error for invalid moving range span', () => {
      expect(() => calculateIndividualsMRLimits([1, 2, 3], 1)).toThrow()
      expect(() => calculateIndividualsMRLimits([1, 2, 3], 15)).toThrow()
    })
  })

  describe('calculatePooledStdDev', () => {
    it('should calculate pooled standard deviation correctly', () => {
      const subgroups = [
        [10, 12, 11, 13, 12],
        [11, 13, 12, 14, 13],
        [12, 14, 13, 15, 14]
      ]

      const result = calculatePooledStdDev(subgroups)

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('calculateSigmaLimits', () => {
    it('should calculate sigma-based control limits correctly', () => {
      const values = [100, 102, 98, 101, 99, 103, 97, 102, 100, 101]

      const result = calculateSigmaLimits(values, 3)

      expect(result).toHaveProperty('centerLine')
      expect(result).toHaveProperty('ucl')
      expect(result).toHaveProperty('lcl')
      expect(result).toHaveProperty('stdDev')

      // UCL should be centerLine + 3*sigma
      expect(result.ucl).toBeCloseTo(
        result.centerLine + 3 * result.stdDev,
        2
      )

      // LCL should be centerLine - 3*sigma
      expect(result.lcl).toBeCloseTo(
        result.centerLine - 3 * result.stdDev,
        2
      )
    })

    it('should work with different sigma values', () => {
      const values = [100, 102, 98, 101, 99]

      const result2Sigma = calculateSigmaLimits(values, 2)
      const result3Sigma = calculateSigmaLimits(values, 3)

      // 3-sigma limits should be wider than 2-sigma limits
      expect(result3Sigma.ucl).toBeGreaterThan(result2Sigma.ucl)
      expect(result3Sigma.lcl).toBeLessThan(result2Sigma.lcl)
    })
  })
})
