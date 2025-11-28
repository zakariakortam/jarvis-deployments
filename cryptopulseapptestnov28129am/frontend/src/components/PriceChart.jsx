import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

const PriceChart = ({ coin, historyData }) => {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-96">
        <p className="text-gray-400">Loading chart data...</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (value) => {
    if (value < 1) {
      return `$${value.toFixed(4)}`;
    } else if (value < 100) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const chartData = historyData.map(point => ({
    time: point.timestamp,
    price: point.price,
    formattedTime: formatTime(point.timestamp),
  }));

  const isPositive = historyData[historyData.length - 1].price >= historyData[0].price;
  const gradientColor = isPositive ? '#00ff88' : '#ff006e';
  const strokeColor = coin?.color || gradientColor;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border border-cyber-cyan">
          <p className="text-cyber-cyan font-semibold mb-1">{payload[0].payload.formattedTime}</p>
          <p className="text-white text-lg font-bold">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 border-2 border-cyber-cyan glow-border"
    >
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          {coin && (
            <div
              className="text-3xl w-10 h-10 flex items-center justify-center rounded-full"
              style={{
                backgroundColor: `${coin.color}20`,
                color: coin.color,
                boxShadow: `0 0 15px ${coin.color}40`,
              }}
            >
              {coin.icon}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold neon-text text-cyber-cyan">
              {coin?.name || 'Price Chart'}
            </h2>
            <p className="text-gray-400">24 Hour Price History</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${coin?.id || 'default'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="formattedTime"
            stroke="#00f5ff"
            tick={{ fill: '#00f5ff', fontSize: 12 }}
            tickLine={{ stroke: '#00f5ff' }}
          />
          <YAxis
            tickFormatter={formatPrice}
            stroke="#00f5ff"
            tick={{ fill: '#00f5ff', fontSize: 12 }}
            tickLine={{ stroke: '#00f5ff' }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={3}
            fill={`url(#gradient-${coin?.id || 'default'})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Current Price</p>
          <p className="text-cyber-cyan font-bold text-lg">
            {formatPrice(chartData[chartData.length - 1].price)}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">24h High</p>
          <p className="text-cyber-green font-bold text-lg">
            {formatPrice(Math.max(...chartData.map(d => d.price)))}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">24h Low</p>
          <p className="text-cyber-pink font-bold text-lg">
            {formatPrice(Math.min(...chartData.map(d => d.price)))}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PriceChart;
