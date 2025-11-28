// Cryptocurrency base data with realistic starting prices
export const CRYPTOCURRENCIES = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    basePrice: 43250.00,
    icon: '₿',
    color: '#F7931A',
    volatility: 0.02 // 2% max fluctuation
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    basePrice: 2280.50,
    icon: 'Ξ',
    color: '#627EEA',
    volatility: 0.025
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    basePrice: 98.75,
    icon: '◎',
    color: '#14F195',
    volatility: 0.035
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    basePrice: 0.0842,
    icon: 'Ð',
    color: '#C2A633',
    volatility: 0.045
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    basePrice: 0.5234,
    icon: '✕',
    color: '#23292F',
    volatility: 0.03
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    basePrice: 0.4567,
    icon: '₳',
    color: '#0033AD',
    volatility: 0.032
  },
  {
    id: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    basePrice: 35.67,
    icon: '▲',
    color: '#E84142',
    volatility: 0.038
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    basePrice: 6.89,
    icon: '●',
    color: '#E6007A',
    volatility: 0.033
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    basePrice: 14.52,
    icon: '⬢',
    color: '#375BD2',
    volatility: 0.036
  },
  {
    id: 'polygon',
    symbol: 'MATIC',
    name: 'Polygon',
    basePrice: 0.8234,
    icon: '⬡',
    color: '#8247E5',
    volatility: 0.04
  }
];

// Store current prices (initialized with base prices)
export const currentPrices = new Map(
  CRYPTOCURRENCIES.map(coin => [coin.id, coin.basePrice])
);

// Store price history for each coin (24 hours of data points)
export const priceHistory = new Map(
  CRYPTOCURRENCIES.map(coin => {
    const history = [];
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Generate 24 hours of historical data (one point per hour)
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - (i * oneHour);
      const randomFactor = 1 + (Math.random() - 0.5) * coin.volatility * 2;
      const price = coin.basePrice * randomFactor;

      history.push({
        timestamp,
        price: parseFloat(price.toFixed(coin.basePrice < 1 ? 4 : 2)),
        volume: Math.floor(Math.random() * 1000000000)
      });
    }

    return [coin.id, history];
  })
);

// Generate random price fluctuation
export function generatePriceFluctuation(coin) {
  const currentPrice = currentPrices.get(coin.id);
  const randomFactor = 1 + (Math.random() - 0.5) * coin.volatility;
  const newPrice = currentPrice * randomFactor;

  // Keep price within reasonable bounds of base price
  const minPrice = coin.basePrice * 0.7;
  const maxPrice = coin.basePrice * 1.3;
  const boundedPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

  return parseFloat(boundedPrice.toFixed(coin.basePrice < 1 ? 4 : 2));
}

// Update all cryptocurrency prices
export function updateAllPrices() {
  const updates = [];

  CRYPTOCURRENCIES.forEach(coin => {
    const oldPrice = currentPrices.get(coin.id);
    const newPrice = generatePriceFluctuation(coin);
    const change = ((newPrice - oldPrice) / oldPrice) * 100;

    currentPrices.set(coin.id, newPrice);

    // Add to price history
    const history = priceHistory.get(coin.id);
    history.push({
      timestamp: Date.now(),
      price: newPrice,
      volume: Math.floor(Math.random() * 1000000000)
    });

    // Keep only last 25 hours of data
    if (history.length > 25) {
      history.shift();
    }

    updates.push({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      price: newPrice,
      change: parseFloat(change.toFixed(2)),
      icon: coin.icon,
      color: coin.color
    });
  });

  return updates;
}

// Get all coin data with current prices
export function getAllCoins() {
  return CRYPTOCURRENCIES.map(coin => {
    const currentPrice = currentPrices.get(coin.id);
    const history = priceHistory.get(coin.id);
    const dayAgoPrice = history[0].price;
    const change24h = ((currentPrice - dayAgoPrice) / dayAgoPrice) * 100;

    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      price: currentPrice,
      change24h: parseFloat(change24h.toFixed(2)),
      icon: coin.icon,
      color: coin.color,
      marketCap: Math.floor(currentPrice * (Math.random() * 900000000 + 100000000)),
      volume24h: Math.floor(Math.random() * 50000000000)
    };
  });
}

// Get price history for a specific coin
export function getCoinHistory(coinId) {
  const coin = CRYPTOCURRENCIES.find(c => c.id === coinId);
  if (!coin) {
    return null;
  }

  const history = priceHistory.get(coinId);
  return {
    id: coinId,
    symbol: coin.symbol,
    name: coin.name,
    history: history.map(point => ({
      timestamp: point.timestamp,
      price: point.price,
      volume: point.volume
    }))
  };
}
