import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import HoloPanel from './HoloPanel';

function SubsystemCard({ name, data, isSelected, onClick }) {
  const healthColor = data.health >= 90 ? 'holo-green' :
    data.health >= 70 ? 'holo-cyan' :
      data.health >= 50 ? 'holo-orange' : 'holo-red';

  const statusColors = {
    online: 'bg-holo-green',
    standby: 'bg-holo-cyan',
    degraded: 'bg-holo-orange',
    offline: 'bg-holo-red',
    maintenance: 'bg-holo-purple'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-300
        border-panel-border bg-panel-bg/50
        ${isSelected ? 'ring-2 ring-holo-blue shadow-holo' : ''}
        hover:shadow-holo hover:border-holo-blue/50
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display text-sm font-semibold text-holo-cyan">{data.name || name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${statusColors[data.status] || 'bg-gray-500'}`} />
            <span className="text-xs text-holo-blue/60 uppercase">{data.status}</span>
          </div>
        </div>
        <div className={`text-2xl font-display font-bold text-${healthColor}`}>
          {data.health?.toFixed(0)}%
        </div>
      </div>

      {/* Health bar */}
      <div className="mb-3">
        <div className="h-2 bg-space-dark rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-${healthColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${data.health || 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.powerDraw !== undefined && (
          <div>
            <span className="text-holo-blue/60">Power</span>
            <span className="text-holo-cyan font-mono ml-2">{data.powerDraw?.toFixed(1)}%</span>
          </div>
        )}
        {data.temperature !== undefined && (
          <div>
            <span className="text-holo-blue/60">Temp</span>
            <span className="text-holo-orange font-mono ml-2">
              {typeof data.temperature === 'number'
                ? data.temperature.toFixed(0)
                : (data.temperature?.average ?? data.temperature?.core ?? 0).toFixed?.(0) ?? '—'}°C
            </span>
          </div>
        )}
      </div>

      {/* Alert indicator */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-holo-red rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">{data.alerts.length}</span>
        </div>
      )}
    </motion.div>
  );
}

function PowerGrid({ powerGrid }) {
  if (!powerGrid) return null;

  return (
    <HoloPanel title="Power Distribution" className="mb-4">
      <div className="p-4">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-space-dark/50 rounded p-3 text-center">
            <div className="text-2xl font-display font-bold text-holo-green">
              {powerGrid.totalGeneration?.toFixed(0)}%
            </div>
            <div className="text-xs text-holo-blue/60">Generation</div>
          </div>
          <div className="bg-space-dark/50 rounded p-3 text-center">
            <div className="text-2xl font-display font-bold text-holo-orange">
              {powerGrid.totalConsumption?.toFixed(1)}
            </div>
            <div className="text-xs text-holo-blue/60">Consumption</div>
          </div>
          <div className="bg-space-dark/50 rounded p-3 text-center">
            <div className="text-2xl font-display font-bold text-holo-cyan">
              {powerGrid.reserves?.toFixed(0)}%
            </div>
            <div className="text-xs text-holo-blue/60">Reserves</div>
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-2">
          {powerGrid.distribution && Object.entries(powerGrid.distribution).map(([system, data]) => (
            <div key={system} className="flex items-center gap-3">
              <span className="text-xs text-holo-cyan w-24 capitalize">{system}</span>
              <div className="flex-1 h-2 bg-space-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-holo-blue to-holo-cyan"
                  style={{ width: `${data.allocated || 0}%` }}
                />
              </div>
              <span className="text-xs text-holo-cyan font-mono w-12 text-right">
                {data.allocated}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </HoloPanel>
  );
}

function SubsystemDetail({ subsystem, name, onClose }) {
  if (!subsystem) return null;

  const renderSubsystemData = () => {
    switch (name) {
      case 'reactor':
        return (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-space-dark/50 rounded p-3">
                <div className="text-xs text-holo-blue/60">Output</div>
                <div className="text-xl font-display font-bold text-holo-green">
                  {subsystem.output?.current?.toFixed(1)}%
                </div>
              </div>
              <div className="bg-space-dark/50 rounded p-3">
                <div className="text-xs text-holo-blue/60">Efficiency</div>
                <div className="text-xl font-display font-bold text-holo-cyan">
                  {subsystem.efficiency?.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-holo-blue uppercase mb-2">Temperature</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-space-dark/50 rounded p-2 text-center">
                  <div className="text-holo-blue/60">Core</div>
                  <div className="text-holo-red font-mono">
                    {(subsystem.temperature?.core / 1000000)?.toFixed(1)}M K
                  </div>
                </div>
                <div className="bg-space-dark/50 rounded p-2 text-center">
                  <div className="text-holo-blue/60">Containment</div>
                  <div className="text-holo-orange font-mono">
                    {subsystem.temperature?.containment?.toFixed(0)} K
                  </div>
                </div>
                <div className="bg-space-dark/50 rounded p-2 text-center">
                  <div className="text-holo-blue/60">Coolant</div>
                  <div className="text-holo-cyan font-mono">
                    {subsystem.temperature?.coolant?.toFixed(0)}°C
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-holo-blue uppercase mb-2">Fuel Status</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-holo-blue/60">Deuterium</span>
                    <span className="text-holo-cyan font-mono">{subsystem.fuel?.deuterium?.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                    <div className="h-full bg-holo-cyan" style={{ width: `${subsystem.fuel?.deuterium || 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-holo-blue/60">Tritium</span>
                    <span className="text-holo-cyan font-mono">{subsystem.fuel?.tritium?.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                    <div className="h-full bg-holo-purple" style={{ width: `${subsystem.fuel?.tritium || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-holo-blue uppercase mb-2">Containment</div>
              <div className="bg-space-dark/50 rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="text-holo-cyan">Field Strength</span>
                  <span className={`font-mono font-bold ${
                    subsystem.containment?.field > 90 ? 'text-holo-green' : 'text-holo-orange'
                  }`}>
                    {subsystem.containment?.field?.toFixed(1)}%
                  </span>
                </div>
                {subsystem.containment?.warnings > 0 && (
                  <div className="mt-2 text-holo-orange text-xs">
                    {subsystem.containment.warnings} warning(s) active
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'shields':
        return (
          <>
            <div className="mb-4">
              <div className="text-xs text-holo-blue uppercase mb-2">Shield Sectors</div>
              <div className="grid grid-cols-2 gap-2">
                {subsystem.sectors && Object.entries(subsystem.sectors).map(([sector, data]) => (
                  <div key={sector} className="bg-space-dark/50 rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-holo-cyan capitalize">{sector}</span>
                      <span className="text-holo-blue font-mono">{data.strength?.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full ${data.strength > 70 ? 'bg-holo-blue' : 'bg-holo-orange'}`}
                        style={{ width: `${data.strength || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-space-dark/50 rounded p-3">
                <div className="text-xs text-holo-blue/60">Frequency</div>
                <div className="text-holo-cyan font-mono">{subsystem.frequency?.toFixed(0)} Hz</div>
              </div>
              <div className="bg-space-dark/50 rounded p-3">
                <div className="text-xs text-holo-blue/60">Recharge Rate</div>
                <div className="text-holo-green font-mono">{subsystem.rechargeRate?.toFixed(1)}/s</div>
              </div>
            </div>
          </>
        );

      case 'lifeSupport':
        return (
          <>
            <div className="mb-4">
              <div className="text-xs text-holo-blue uppercase mb-2">Atmosphere</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-space-dark/50 rounded p-2 text-center">
                  <div className="text-xs text-holo-blue/60">O2</div>
                  <div className="text-lg text-holo-green font-mono">{subsystem.atmosphere?.oxygen?.toFixed(1)}%</div>
                </div>
                <div className="bg-space-dark/50 rounded p-2 text-center">
                  <div className="text-xs text-holo-blue/60">CO2</div>
                  <div className="text-lg text-holo-cyan font-mono">{subsystem.atmosphere?.co2?.toFixed(3)}%</div>
                </div>
                <div className="bg-space-dark/50 rounded p-2 text-center">
                  <div className="text-xs text-holo-blue/60">Pressure</div>
                  <div className="text-lg text-holo-cyan font-mono">{subsystem.atmosphere?.pressure?.toFixed(1)} kPa</div>
                </div>
                <div className="bg-space-dark/50 rounded p-2 text-center">
                  <div className="text-xs text-holo-blue/60">Humidity</div>
                  <div className="text-lg text-holo-cyan font-mono">{subsystem.atmosphere?.humidity?.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-holo-blue uppercase mb-2">Temperature</div>
              <div className="bg-space-dark/50 rounded p-3">
                <div className="text-center text-2xl font-display font-bold text-holo-cyan">
                  {subsystem.temperature?.average?.toFixed(1)}°C
                </div>
                <div className="flex justify-between text-xs mt-2 text-holo-blue/60">
                  <span>Min: {subsystem.temperature?.min?.toFixed(1)}°C</span>
                  <span>Max: {subsystem.temperature?.max?.toFixed(1)}°C</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-holo-blue uppercase mb-2">Systems</div>
              <div className="space-y-2">
                {subsystem.airRecyclers && (
                  <div className="flex items-center justify-between bg-space-dark/50 rounded p-2">
                    <span className="text-holo-cyan">Air Recyclers</span>
                    <span className="text-holo-green font-mono">{subsystem.airRecyclers.efficiency?.toFixed(0)}%</span>
                  </div>
                )}
                {subsystem.waterRecyclers && (
                  <div className="flex items-center justify-between bg-space-dark/50 rounded p-2">
                    <span className="text-holo-cyan">Water Recyclers</span>
                    <span className="text-holo-green font-mono">{subsystem.waterRecyclers.efficiency?.toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="text-center text-holo-cyan/60 py-8">
            Detailed view for {name} not available
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 h-full overflow-auto"
    >
      <HoloPanel
        title={subsystem.name || name}
        subtitle={subsystem.status?.toUpperCase()}
        status={subsystem.status === 'online' ? 'operational' : subsystem.status}
        headerActions={
          <button onClick={onClose} className="text-holo-cyan/60 hover:text-holo-cyan">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      >
        <div className="p-4">
          {/* Health overview */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-holo-blue uppercase">System Health</span>
              <span className="font-display font-bold text-holo-green">{subsystem.health?.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-space-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-holo-green to-holo-cyan"
                style={{ width: `${subsystem.health || 0}%` }}
              />
            </div>
          </div>

          {renderSubsystemData()}

          {/* Alerts */}
          {subsystem.alerts && subsystem.alerts.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-holo-blue uppercase mb-2">Active Alerts</div>
              <div className="space-y-2">
                {subsystem.alerts.map(alert => (
                  <div key={alert.id} className="bg-holo-red/10 border border-holo-red/30 rounded p-2 text-xs">
                    <div className="text-holo-red">{alert.message}</div>
                    <div className="text-holo-red/60 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last maintenance */}
          {subsystem.lastMaintenance && (
            <div className="mt-4 text-xs text-holo-blue/60">
              Last maintenance: {new Date(subsystem.lastMaintenance).toLocaleDateString()}
            </div>
          )}
        </div>
      </HoloPanel>
    </motion.div>
  );
}

export default function EngineeringPanel() {
  const { subsystems, powerGrid, selectedSubsystem, setSelectedSubsystem } = useStore();
  const [view, setView] = useState('grid');

  const subsystemList = Object.entries(subsystems);
  const selectedSubsystemData = selectedSubsystem ? subsystems[selectedSubsystem] : null;

  return (
    <div className="h-full flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panel-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-holo-blue uppercase tracking-wider">
                Engineering Control
              </h2>
              <p className="text-sm text-holo-cyan/60">
                {subsystemList.length} subsystems monitored
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1 rounded text-xs uppercase transition-colors ${
                  view === 'grid' ? 'bg-holo-blue/20 text-holo-blue' : 'text-holo-cyan/60 hover:text-holo-cyan'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1 rounded text-xs uppercase transition-colors ${
                  view === 'list' ? 'bg-holo-blue/20 text-holo-blue' : 'text-holo-cyan/60 hover:text-holo-cyan'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Power Grid */}
          <PowerGrid powerGrid={powerGrid} />

          {/* Subsystems */}
          <HoloPanel title="Subsystems" className="mb-4">
            <div className="p-4">
              <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {subsystemList.map(([key, data]) => (
                  <SubsystemCard
                    key={key}
                    name={key}
                    data={data}
                    isSelected={selectedSubsystem === key}
                    onClick={() => setSelectedSubsystem(selectedSubsystem === key ? null : key)}
                  />
                ))}
              </div>
            </div>
          </HoloPanel>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedSubsystemData && (
          <SubsystemDetail
            subsystem={selectedSubsystemData}
            name={selectedSubsystem}
            onClose={() => setSelectedSubsystem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
