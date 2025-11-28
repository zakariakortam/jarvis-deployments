import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Users, Building, Briefcase, TrendingUp } from 'lucide-react';

export default function UrbanPlanning({ data }) {
  const { planning, zoneGrowth } = data;

  const currentYear = planning[0];
  const futureYear = planning[planning.length - 1];

  const populationGrowth = ((futureYear.population - currentYear.population) / currentYear.population * 100).toFixed(1);
  const housingGrowth = ((futureYear.housing - currentYear.housing) / currentYear.housing * 100).toFixed(1);
  const employmentGrowth = ((futureYear.employment - currentYear.employment) / currentYear.employment * 100).toFixed(1);
  const gdpGrowth = ((futureYear.gdp - currentYear.gdp) / currentYear.gdp * 100).toFixed(1);

  const zoneMetrics = zoneGrowth.map(z => ({
    zone: z.zone,
    population: Math.round(z.currentPopulation / 1000),
    growth: z.growthRate.toFixed(1),
    commercial: Math.round(z.commercialDevelopment),
    residential: Math.round(z.residentialDevelopment),
    transit: Math.round(z.transitAccess),
    greenSpace: Math.round(z.greenSpace)
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Population Growth</p>
              <p className="text-3xl font-bold text-foreground">+{populationGrowth}%</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">10-year projection</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Housing Growth</p>
              <p className="text-3xl font-bold text-foreground">+{housingGrowth}%</p>
            </div>
            <Building className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-success mt-2">New units planned</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Employment Growth</p>
              <p className="text-3xl font-bold text-foreground">+{employmentGrowth}%</p>
            </div>
            <Briefcase className="h-8 w-8 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Job creation</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">GDP Growth</p>
              <p className="text-3xl font-bold text-foreground">+{gdpGrowth}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
          <p className="text-xs text-success mt-2">Economic expansion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Population Projection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={planning}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend />
              <Line type="monotone" dataKey="population" stroke="#3b82f6" strokeWidth={2} name="Population" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Housing & Employment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={planning}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend />
              <Area type="monotone" dataKey="housing" stroke="#10b981" fill="#10b981" fillOpacity={0.5} name="Housing Units" />
              <Area type="monotone" dataKey="employment" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} name="Employment" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Infrastructure & Sustainability</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={planning}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="infrastructure" stroke="#8b5cf6" strokeWidth={2} name="Infrastructure Score" />
              <Line type="monotone" dataKey="sustainability" stroke="#10b981" strokeWidth={2} name="Sustainability Score" />
              <Line type="monotone" dataKey="transportation" stroke="#3b82f6" strokeWidth={2} name="Transportation Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">GDP & Economic Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={planning}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => `$${value}M`}
              />
              <Legend />
              <Bar dataKey="gdp" fill="#10b981" name="GDP (Million $)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Zone Development Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {zoneGrowth.map((zone, idx) => (
            <div key={idx} className="p-4 bg-secondary rounded-lg">
              <h4 className="font-semibold text-foreground mb-3">{zone.zone}</h4>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-muted-foreground">Population</p>
                  <p className="font-medium text-sm text-foreground">{zone.currentPopulation.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-xs text-muted-foreground">Growth Rate</p>
                  <p className={`font-medium text-sm ${zone.growthRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {zone.growthRate > 0 ? '+' : ''}{zone.growthRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Commercial Dev</span>
                    <span className="text-xs font-medium text-foreground">{Math.round(zone.commercialDevelopment)}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-primary rounded-full h-1.5" style={{ width: `${zone.commercialDevelopment}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Residential Dev</span>
                    <span className="text-xs font-medium text-foreground">{Math.round(zone.residentialDevelopment)}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-success rounded-full h-1.5" style={{ width: `${zone.residentialDevelopment}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Transit Access</span>
                    <span className="text-xs font-medium text-foreground">{Math.round(zone.transitAccess)}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-warning rounded-full h-1.5" style={{ width: `${zone.transitAccess}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Green Space</span>
                    <span className="text-xs font-medium text-foreground">{Math.round(zone.greenSpace)}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-success rounded-full h-1.5" style={{ width: `${zone.greenSpace}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-muted-foreground">Job Density</p>
                  <p className="font-medium text-foreground">{zone.jobDensity}/km²</p>
                </div>
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <p className="text-muted-foreground">Affordability</p>
                  <p className="font-medium text-foreground">{Math.round(zone.housingAffordability)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Zone Population Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="population" fill="#3b82f6" name="Population (Thousands)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Development Balance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="commercial" fill="#8b5cf6" name="Commercial %" />
              <Bar dataKey="residential" fill="#10b981" name="Residential %" />
              <Bar dataKey="greenSpace" fill="#22c55e" name="Green Space %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
