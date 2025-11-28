import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Sparkline from './Sparkline';

const CryptoCard = ({ coin, history, onCardClick }) => {
  const [priceAnimation, setPriceAnimation] = useState('');
  const [prevPrice, setPrevPrice] = useState(coin.price);

  useEffect(() => {
    if (coin.price > prevPrice) {
      setPriceAnimation('animate-price-up');
      setTimeout(() => setPriceAnimation(''), 500);
    } else if (coin.price < prevPrice) {
      setPriceAnimation('animate-price-down');
      setTimeout(() => setPriceAnimation(''), 500);
    }
    setPrevPrice(coin.price);
  }, [coin.price]);

  const isPositive = coin.change24h >= 0;
  const borderColor = isPositive ? 'border-cyber-green' : 'border-cyber-pink';
  const textColor = isPositive ? 'text-cyber-green' : 'text-cyber-pink';

  const formatPrice = (price) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 100) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatMarketCap = (value) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => onCardClick && onCardClick(coin)}
      className={`glass-card p-6 cursor-pointer transition-all duration-300 ${borderColor} glow-border hover:shadow-2xl relative overflow-hidden group`}
    >
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/10 via-transparent to-cyber-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header with icon and symbol */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="text-4xl w-12 h-12 flex items-center justify-center rounded-full"
              style={{
                backgroundColor: `${coin.color}20`,
                color: coin.color,
                boxShadow: `0 0 20px ${coin.color}40`,
              }}
            >
              {coin.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold">{coin.symbol}</h3>
              <p className="text-sm text-gray-400">{coin.name}</p>
            </div>
          </div>
          <div className={`${textColor} font-bold text-lg flex items-center gap-1`}>
            {isPositive ? '▲' : '▼'}
            {Math.abs(coin.change24h).toFixed(2)}%
          </div>
        </div>

        {/* Price */}
        <div className={`text-3xl font-bold mb-4 ${priceAnimation}`}>
          {formatPrice(coin.price)}
        </div>

        {/* Sparkline */}
        {history && history.length > 0 && (
          <div className="mb-4 h-16">
            <Sparkline data={history} color={coin.color} isPositive={isPositive} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="glass-card p-3 rounded-lg">
            <p className="text-gray-400 mb-1">Market Cap</p>
            <p className="font-semibold text-cyber-cyan">{formatMarketCap(coin.marketCap)}</p>
          </div>
          <div className="glass-card p-3 rounded-lg">
            <p className="text-gray-400 mb-1">24h Volume</p>
            <p className="font-semibold text-cyber-magenta">{formatMarketCap(coin.volume24h)}</p>
          </div>
        </div>

        {/* Glow effect on bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${coin.color}, transparent)`,
            boxShadow: `0 0 20px ${coin.color}`,
          }}
        />
      </div>
    </motion.div>
  );
};

export default CryptoCard;
