import express from 'express'
import { getHeats } from '../data/mockData.js'

const router = express.Router()

// Get SPC statistics for a parameter
router.get('/statistics/:parameter', (req, res) => {
  try {
    const { parameter } = req.params
    const heats = getHeats(100)

    const values = heats.map(h => h[parameter]).filter(v => v !== undefined)

    if (values.length === 0) {
      return res.status(404).json({ error: 'No data found for parameter' })
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1)
    const stdDev = Math.sqrt(variance)

    res.json({
      parameter,
      mean,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
