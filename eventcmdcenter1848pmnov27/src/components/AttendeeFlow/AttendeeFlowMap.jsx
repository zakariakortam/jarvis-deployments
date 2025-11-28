import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AttendeeFlowMap = ({ flowData }) => {
  if (!flowData || flowData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Loading attendee flow data...</p>
      </div>
    );
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f97316';
    if (percentage >= 50) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-6">
      {/* Zone Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {flowData.map((zone, index) => (
          <motion.div
            key={zone.zone}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-effect p-4 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  {zone.zone}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>
                    {zone.current} / {zone.capacity}
                  </span>
                </div>
              </div>
              {zone.trend === 'increasing' ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-primary" />
              )}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${zone.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="absolute h-full rounded-full"
                style={{ backgroundColor: getStatusColor(zone.percentage) }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Entry Rate</p>
                <p className="font-semibold text-foreground">
                  {zone.entryRate}/min
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Wait Time</p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {zone.waitTime}m
                </p>
              </div>
            </div>

            {zone.percentage >= 80 && (
              <div className="mt-2 px-2 py-1 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
                Near capacity
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Flow Chart */}
      <div className="glass-effect p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Zone Occupancy Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={flowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="zone"
              tick={{ fill: 'hsl(var(--foreground))' }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="current" radius={[8, 8, 0, 0]}>
              {flowData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Traffic Flow Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entry Rate</p>
              <p className="text-2xl font-bold">
                {flowData.reduce((sum, z) => sum + z.entryRate, 0)}/min
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Exit Rate</p>
              <p className="text-2xl font-bold">
                {flowData.reduce((sum, z) => sum + z.exitRate, 0)}/min
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait Time</p>
              <p className="text-2xl font-bold">
                {Math.floor(
                  flowData.reduce((sum, z) => sum + z.waitTime, 0) /
                    flowData.length
                )}
                m
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeFlowMap;
