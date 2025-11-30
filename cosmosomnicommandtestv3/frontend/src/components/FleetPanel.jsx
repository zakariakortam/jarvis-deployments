import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import HoloPanel from './HoloPanel';

function ShipTile({ ship, isSelected, onClick }) {
  const statusColors = {
    operational: 'border-holo-green/50 bg-holo-green/5',
    caution: 'border-holo-orange/50 bg-holo-orange/5',
    alert: 'border-holo-red/50 bg-holo-red/5',
    maintenance: 'border-holo-purple/50 bg-holo-purple/5'
  };

  const statusIndicators = {
    operational: 'status-online',
    caution: 'status-warning',
    alert: 'status-critical',
    maintenance: 'status-offline'
  };

  const avgShields = ((ship.shields?.fore || 0) + (ship.shields?.aft || 0) +
    (ship.shields?.port || 0) + (ship.shields?.starboard || 0)) / 4;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-300
        ${statusColors[ship.status] || statusColors.operational}
        ${isSelected ? 'ring-2 ring-holo-blue shadow-holo' : ''}
        hover:shadow-holo
      `}
    >
      {/* Ship header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display text-sm font-semibold text-holo-cyan">{ship.name}</h4>
          <p className="text-[10px] text-holo-blue/60 font-mono">{ship.class} - {ship.registry}</p>
        </div>
        <div className={`status-indicator ${statusIndicators[ship.status]}`} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-[10px] text-holo-blue/60 uppercase">Hull</div>
          <div className="h-1.5 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-holo-green to-holo-cyan transition-all duration-500"
              style={{ width: `${ship.hull?.integrity || 0}%` }}
            />
          </div>
          <div className="text-[10px] text-holo-cyan font-mono">{(ship.hull?.integrity || 0).toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-[10px] text-holo-blue/60 uppercase">Fuel</div>
          <div className="h-1.5 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-holo-orange to-holo-yellow transition-all duration-500"
              style={{ width: `${ship.fuel?.current || 0}%` }}
            />
          </div>
          <div className="text-[10px] text-holo-cyan font-mono">{(ship.fuel?.current || 0).toFixed(1)}%</div>
        </div>
      </div>

      {/* Shield indicator */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-holo-blue/60">Shields</span>
        <span className="text-holo-cyan font-mono">{avgShields.toFixed(0)}%</span>
      </div>

      {/* Mission */}
      <div className="mt-2 pt-2 border-t border-panel-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-holo-purple">{ship.mission?.current || 'Standby'}</span>
          <span className="text-[10px] text-holo-cyan font-mono">
            {(ship.mission?.progress || 0).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-holo-blue/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-holo-blue/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-holo-blue/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-holo-blue/50" />
    </motion.div>
  );
}

function ShipDetailPanel({ ship, onClose }) {
  if (!ship) return null;

  const avgShields = ((ship.shields?.fore || 0) + (ship.shields?.aft || 0) +
    (ship.shields?.port || 0) + (ship.shields?.starboard || 0)) / 4;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 h-full overflow-auto"
    >
      <HoloPanel
        title={ship.name}
        subtitle={`${ship.class} - ${ship.registry}`}
        status={ship.status}
        headerActions={
          <button onClick={onClose} className="text-holo-cyan/60 hover:text-holo-cyan">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      >
        <div className="p-4 space-y-4">
          {/* Position */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Position</h5>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-xs text-holo-blue/60">X</div>
                <div className="text-sm text-holo-cyan font-mono">{(ship.position?.x || 0).toFixed(0)}</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-xs text-holo-blue/60">Y</div>
                <div className="text-sm text-holo-cyan font-mono">{(ship.position?.y || 0).toFixed(0)}</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-xs text-holo-blue/60">Z</div>
                <div className="text-sm text-holo-cyan font-mono">{(ship.position?.z || 0).toFixed(0)}</div>
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-holo-purple">
              Sector: {ship.position?.sector || 'Unknown'}
            </div>
          </div>

          {/* Velocity */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Velocity</h5>
            <div className="flex items-center justify-between">
              <span className="text-holo-cyan font-mono text-lg">
                {((ship.velocity?.current || 0) / 299792 * 100).toFixed(2)}% c
              </span>
              <div className="text-right">
                <div className="text-xs text-holo-blue/60">Heading: {(ship.velocity?.heading || 0).toFixed(1)}°</div>
                <div className="text-xs text-holo-blue/60">Pitch: {(ship.velocity?.pitch || 0).toFixed(1)}°</div>
              </div>
            </div>
          </div>

          {/* Hull & Armor */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Hull Status</h5>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-holo-blue/60">Integrity</span>
                  <span className="text-holo-cyan font-mono">{(ship.hull?.integrity || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-holo-green to-holo-cyan"
                    style={{ width: `${ship.hull?.integrity || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-holo-blue/60">Armor</span>
                  <span className="text-holo-cyan font-mono">{(ship.hull?.armor || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-holo-purple to-holo-pink"
                    style={{ width: `${ship.hull?.armor || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shields */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Shield Array</h5>
            <div className="grid grid-cols-2 gap-2">
              {['fore', 'aft', 'port', 'starboard'].map(sector => (
                <div key={sector} className="bg-space-dark/50 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-holo-blue/60 capitalize">{sector}</span>
                    <span className="text-xs text-holo-cyan font-mono">
                      {(ship.shields?.[sector] || 0).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 bg-space-dark rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-holo-blue"
                      style={{ width: `${ship.shields?.[sector] || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reactor */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Reactor</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-holo-blue/60">Output</div>
                <div className="text-holo-cyan font-mono">{(ship.reactor?.output || 0).toFixed(1)}%</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-holo-blue/60">Temperature</div>
                <div className="text-holo-orange font-mono">{(ship.reactor?.temperature || 0).toFixed(0)}K</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-holo-blue/60">Efficiency</div>
                <div className="text-holo-green font-mono">{(ship.reactor?.efficiency || 0).toFixed(1)}%</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-holo-blue/60">Stability</div>
                <div className="text-holo-cyan font-mono">{(ship.reactor?.stability || 0).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Life Support */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Life Support</h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-holo-blue/60">O2</div>
                <div className="text-holo-cyan font-mono">{(ship.lifeSupport?.oxygen || 0).toFixed(1)}%</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-holo-blue/60">Temp</div>
                <div className="text-holo-cyan font-mono">{(ship.lifeSupport?.temperature || 0).toFixed(1)}°C</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-holo-blue/60">Pressure</div>
                <div className="text-holo-cyan font-mono">{(ship.lifeSupport?.pressure || 0).toFixed(0)} kPa</div>
              </div>
            </div>
          </div>

          {/* Crew */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Crew Status</h5>
            <div className="flex items-center justify-between text-sm">
              <span className="text-holo-cyan">Total: {ship.crew?.total || 0}</span>
              <span className="text-holo-green">Morale: {(ship.crew?.morale || 0).toFixed(0)}%</span>
            </div>
          </div>

          {/* Mission */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Current Mission</h5>
            <div className="bg-space-dark/50 rounded p-3">
              <div className="text-holo-purple font-medium">{ship.mission?.current || 'None'}</div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-holo-blue/60">Progress</span>
                  <span className="text-holo-cyan font-mono">{(ship.mission?.progress || 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-holo-purple to-holo-pink"
                    style={{ width: `${ship.mission?.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </HoloPanel>
    </motion.div>
  );
}

export default function FleetPanel() {
  const { ships, fleetSummary, selectedShip, setSelectedShip } = useStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredShips = ships
    .filter(ship => {
      if (filter === 'all') return true;
      return ship.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'hull': return (b.hull?.integrity || 0) - (a.hull?.integrity || 0);
        case 'fuel': return (b.fuel?.current || 0) - (a.fuel?.current || 0);
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  const selectedShipData = ships.find(s => s.id === selectedShip);

  return (
    <div className="h-full flex">
      {/* Main fleet grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fleet summary */}
        <div className="p-4 border-b border-panel-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-holo-blue uppercase tracking-wider">
                Fleet Operations
              </h2>
              <p className="text-sm text-holo-cyan/60">
                {ships.length} vessels under command
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="holo-input text-xs py-1 px-2"
              >
                <option value="all">All Ships</option>
                <option value="operational">Operational</option>
                <option value="caution">Caution</option>
                <option value="alert">Alert</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="holo-input text-xs py-1 px-2"
              >
                <option value="name">Sort: Name</option>
                <option value="hull">Sort: Hull</option>
                <option value="fuel">Sort: Fuel</option>
                <option value="status">Sort: Status</option>
              </select>
            </div>
          </div>

          {/* Quick stats */}
          {fleetSummary && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-cyan">
                  {fleetSummary.totalShips}
                </div>
                <div className="text-xs text-holo-blue/60">Total Ships</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-cyan">
                  {fleetSummary.totalCrew?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-holo-blue/60">Total Crew</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-green">
                  {fleetSummary.averageHull?.toFixed(0) || 0}%
                </div>
                <div className="text-xs text-holo-blue/60">Avg Hull</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-orange">
                  {fleetSummary.averageFuel?.toFixed(0) || 0}%
                </div>
                <div className="text-xs text-holo-blue/60">Avg Fuel</div>
              </div>
            </div>
          )}
        </div>

        {/* Ship grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredShips.map(ship => (
                <ShipTile
                  key={ship.id}
                  ship={ship}
                  isSelected={selectedShip === ship.id}
                  onClick={() => setSelectedShip(selectedShip === ship.id ? null : ship.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedShipData && (
          <ShipDetailPanel
            ship={selectedShipData}
            onClose={() => setSelectedShip(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
