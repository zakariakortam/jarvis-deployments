import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Flame, Droplets, DollarSign } from 'lucide-react';

export default function UtilityConsumption({ data }) {
  const { utilities } = data;

  const totalPower = utilities.reduce((sum, u) => sum + u.power.current, 0).toFixed(1);
  const totalGas = utilities.reduce((sum, u) => sum + u.gas.consumption, 0);
  const totalWater = utilities.reduce((sum, u) => sum + u.water.consumption, 0);
  const totalCost = utilities.reduce((sum, u) => sum + u.power.cost + u.gas.cost + u.water.cost, 0);

  const powerData = utilities.map(u => ({
    zone: u.zone,
    current: u.power.current.toFixed(1),
    load: Math.round(u.power.load),
    renewable: Math.round(u.power.renewable),
    cost: Math.round(u.power.cost)
  }));

  const gasData = utilities.map(u => ({
    zone: u.zone,
    consumption: Math.round(u.gas.consumption),
    pressure: Math.round(u.gas.pressure),
    cost: Math.round(u.gas.cost)
  }));

  const waterData = utilities.map(u => ({
    zone: u.zone,
    consumption: Math.round(u.water.consumption),
    pressure: Math.round(u.water.pressure),
    quality: Math.round(u.water.quality)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Power</p>
              <p className="text-3xl font-bold text-foreground">{totalPower} MW</p>
            </div>
            <Zap className="h-8 w-8 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Real-time consumption</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Gas</p>
              <p className="text-3xl font-bold text-foreground">{Math.round(totalGas/1000)}K m³</p>
            </div>
            <Flame className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Cubic meters</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Water</p>
              <p className="text-3xl font-bold text-foreground">{Math.round(totalWater/1000)}K L</p>
            </div>
            <Droplets className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Liters consumed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-3xl font-bold text-foreground">${Math.round(totalCost).toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Current period</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Power Consumption & Load</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="current" fill="#f59e0b" name="Current (MW)" />
              <Bar dataKey="load" fill="#ef4444" name="Load %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Renewable Energy Integration</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="renewable" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Renewable %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Gas Consumption & Pressure</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={2} name="Consumption (m³)" />
              <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#8b5cf6" strokeWidth={2} name="Pressure (PSI)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Water Consumption & Quality</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="quality" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="Quality %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Utility Details by Zone</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {utilities.map((utility, idx) => (
            <div key={idx} className="p-4 bg-secondary rounded-lg">
              <h4 className="font-semibold text-foreground mb-3">{utility.zone}</h4>

              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="font-medium text-sm text-foreground">Power</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-medium text-foreground">{utility.power.current.toFixed(1)} MW</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Load</p>
                      <p className="font-medium text-foreground">{Math.round(utility.power.load)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Renewable</p>
                      <p className="font-medium text-success">{Math.round(utility.power.renewable)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium text-foreground">${Math.round(utility.power.cost)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-sm text-foreground">Gas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Consumption</p>
                      <p className="font-medium text-foreground">{Math.round(utility.gas.consumption)} m³</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pressure</p>
                      <p className="font-medium text-foreground">{Math.round(utility.gas.pressure)} PSI</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Leaks</p>
                      <p className={`font-medium ${utility.gas.leaks > 0 ? 'text-destructive' : 'text-success'}`}>
                        {utility.gas.leaks}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium text-foreground">${Math.round(utility.gas.cost)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm text-foreground">Water</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Consumption</p>
                      <p className="font-medium text-foreground">{Math.round(utility.water.consumption)} L</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pressure</p>
                      <p className="font-medium text-foreground">{Math.round(utility.water.pressure)} PSI</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quality</p>
                      <p className="font-medium text-success">{Math.round(utility.water.quality)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium text-foreground">${Math.round(utility.water.cost)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
