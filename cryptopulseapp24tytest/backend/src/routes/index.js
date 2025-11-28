import express from 'express';
import coinsRouter from './coins.js';

const router = express.Router();

// Health check for API routes
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount coin routes
router.use('/coins', coinsRouter);

export default router;
