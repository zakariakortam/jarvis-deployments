import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from './components/ParticleBackground';
import CryptoCard from './components/CryptoCard';
import PriceChart from './components/PriceChart';
import useWebSocket from './hooks/useWebSocket';
import api from './services/api';

function App() {
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebSocket URL - handle both preview and production
  const WS_URL = import.meta.env.VITE_WS_URL || (
    import.meta.env.VITE_BACKEND_PORT
      ? `ws://${window.location.hostname}:${import.meta.env.VITE_BACKEND_PORT}/ws`  // Preview: direct to backend
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`  // Production: nginx proxy
  );

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const coinsData = await api.getCoins();
        setCoins(coinsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load cryptocurrency data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket(WS_URL, (message) => {
    if (message.type === 'priceUpdate' && message.data) {
      setCoins(prevCoins => {
        const updatedCoins = [...prevCoins];
        message.data.forEach(update => {
          const index = updatedCoins.findIndex(c => c.id === update.id);
          if (index !== -1) {
            updatedCoins[index] = {
              ...updatedCoins[index],
              price: update.price,
              change24h: update.change || updatedCoins[index].change24h,
            };
          }
        });
        return updatedCoins;
      });
    }
  });

  // Handle card click to show chart
  const handleCardClick = async (coin) => {
    setSelectedCoin(coin);
    try {
      const history = await api.getCoinHistory(coin.id);
      setChartData(history.history);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setChartData(null);
    }
  };

  // Close chart modal
  const handleCloseChart = () => {
    setSelectedCoin(null);
    setChartData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid-bg">
        <ParticleBackground />
        <div className="text-center z-10">
          <div className="w-16 h-16 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyber-cyan text-xl neon-text">Loading Crypto Pulse...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid-bg">
        <ParticleBackground />
        <div className="text-center z-10">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-cyber-pink text-xl neon-text mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyber-cyan text-cyber-dark font-bold rounded-lg hover:shadow-lg hover:shadow-cyber-cyan/50 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid-bg">
      <ParticleBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-cyber-cyan/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold neon-text text-cyber-cyan mb-2">
                CRYPTO PULSE
              </h1>
              <p className="text-gray-400">Real-time cryptocurrency dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-cyber-green' : 'bg-cyber-pink'
                  }`}
                  style={{
                    boxShadow: isConnected
                      ? '0 0 10px #00ff88'
                      : '0 0 10px #ff006e',
                  }}
                />
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Crypto Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {coins.map((coin, index) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CryptoCard
                coin={coin}
                history={[]} // Sparkline will use mini history
                onCardClick={handleCardClick}
              />
            </motion.div>
          ))}
        </div>

        {/* Market Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass-card p-6 border border-cyber-cyan">
            <p className="text-gray-400 mb-2">Total Market Cap</p>
            <p className="text-3xl font-bold text-cyber-cyan neon-text">
              $2.1T
            </p>
          </div>
          <div className="glass-card p-6 border border-cyber-magenta">
            <p className="text-gray-400 mb-2">24h Trading Volume</p>
            <p className="text-3xl font-bold text-cyber-magenta neon-text">
              $87.3B
            </p>
          </div>
          <div className="glass-card p-6 border border-cyber-green">
            <p className="text-gray-400 mb-2">Active Cryptocurrencies</p>
            <p className="text-3xl font-bold text-cyber-green neon-text">
              {coins.length}
            </p>
          </div>
        </motion.div>
      </main>

      {/* Chart Modal */}
      <AnimatePresence>
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseChart}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={handleCloseChart}
                  className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-cyber-pink rounded-full flex items-center justify-center text-2xl font-bold hover:scale-110 transition-transform"
                  style={{ boxShadow: '0 0 20px #ff006e' }}
                >
                  ✕
                </button>
                <PriceChart coin={selectedCoin} historyData={chartData} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyber-cyan/30 backdrop-blur-md mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400">
          <p>Crypto Pulse - Real-time cryptocurrency tracking dashboard</p>
          <p className="text-sm mt-2">Powered by WebSocket technology</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
