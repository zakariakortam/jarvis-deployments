import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Sparkline = ({ data, color, isPositive }) => {
  if (!data || data.length === 0) {
    return <div className="w-full h-full bg-white bg-opacity-5 rounded animate-pulse" />;
  }

  const chartData = data.map((point, index) => ({
    index,
    value: point.price,
  }));

  const strokeColor = isPositive ? '#00ff88' : '#ff006e';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color || strokeColor}
          strokeWidth={2}
          dot={false}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
