import { getAllCoins, getCoinHistory, updateAllPrices } from '../models/cryptocurrency.js';

// GET /api/coins - Get all cryptocurrency data
export const getCoins = (req, res) => {
  try {
    // Update prices before sending to simulate live data
    updateAllPrices();

    const coins = getAllCoins();

    res.json({
      success: true,
      data: coins,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching coins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cryptocurrency data',
      message: error.message
    });
  }
};

// GET /api/coins/:id/history - Get 24h price history for a specific coin
export const getCoinHistoryById = (req, res) => {
  try {
    const { id } = req.params;
    const historyData = getCoinHistory(id);

    if (!historyData) {
      return res.status(404).json({
        success: false,
        error: 'Cryptocurrency not found',
        message: `No data available for coin: ${id}`
      });
    }

    res.json({
      success: true,
      data: historyData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching coin history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history',
      message: error.message
    });
  }
};

// GET /api/coins/:id - Get specific coin data
export const getCoinById = (req, res) => {
  try {
    const { id } = req.params;
    updateAllPrices();

    const coins = getAllCoins();
    const coin = coins.find(c => c.id === id);

    if (!coin) {
      return res.status(404).json({
        success: false,
        error: 'Cryptocurrency not found',
        message: `No data available for coin: ${id}`
      });
    }

    res.json({
      success: true,
      data: coin,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching coin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cryptocurrency data',
      message: error.message
    });
  }
};
