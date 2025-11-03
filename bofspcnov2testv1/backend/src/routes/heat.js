import express from 'express'
import { getHeats, getHeatById, addHeat, updateHeat, deleteHeat } from '../data/mockData.js'

const router = express.Router()

// Get all heats
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    const offset = parseInt(req.query.offset) || 0
    const heats = getHeats(limit, offset)
    res.json(heats)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get heat by ID
router.get('/:id', (req, res) => {
  try {
    const heat = getHeatById(req.params.id)
    if (!heat) {
      return res.status(404).json({ error: 'Heat not found' })
    }
    res.json(heat)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new heat
router.post('/', (req, res) => {
  try {
    const newHeat = addHeat(req.body)

    // Emit real-time update
    const io = req.app.get('io')
    io.to('monitoring').emit('new_heat', newHeat)

    res.status(201).json(newHeat)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update heat
router.put('/:id', (req, res) => {
  try {
    const updatedHeat = updateHeat(req.params.id, req.body)
    if (!updatedHeat) {
      return res.status(404).json({ error: 'Heat not found' })
    }
    res.json(updatedHeat)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete heat
router.delete('/:id', (req, res) => {
  try {
    const success = deleteHeat(req.params.id)
    if (!success) {
      return res.status(404).json({ error: 'Heat not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
