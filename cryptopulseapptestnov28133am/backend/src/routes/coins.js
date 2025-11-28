import express from 'express';
import { getCoins, getCoinHistoryById, getCoinById } from '../controllers/coinController.js';

const router = express.Router();

// GET /api/coins - Get all coins with current prices
router.get('/', getCoins);

// GET /api/coins/:id - Get specific coin data
router.get('/:id', getCoinById);

// GET /api/coins/:id/history - Get 24h price history for specific coin
router.get('/:id/history', getCoinHistoryById);

export default router;
