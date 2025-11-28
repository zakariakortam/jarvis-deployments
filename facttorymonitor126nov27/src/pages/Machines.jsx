import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import useFactoryStore from '../store/useFactoryStore';
import { formatTemperature, formatPercentage } from '../utils/formatters';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Machines = () => {
  const navigate = useNavigate();
  const machines = useFactoryStore(state => state.getFilteredMachines());
  const filters = useFactoryStore(state => state.filters);
  const setFilter = useFactoryStore(state => state.setFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMachines = machines.filter(m =>
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const machineTypes = ['all', 'milling', 'turning', 'stamping', 'grinding', 'welding'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Machines</h1>
        <p className="text-muted-foreground">Manage and monitor all factory machines</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search machines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="text-sm font-medium text-muted-foreground mr-2">Status:</div>
            {['all', 'running', 'idle'].map(status => (
              <Button
                key={status}
                variant={filters.status === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('status', status)}
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="text-sm font-medium text-muted-foreground mr-2">Type:</div>
            {machineTypes.map(type => (
              <Button
                key={type}
                variant={filters.machineType === type ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('machineType', type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((machine) => (
          <Card
            key={machine.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/machines/${machine.id}`)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{machine.id}</h3>
                  <p className="text-sm text-muted-foreground">{machine.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{machine.location}</p>
                </div>
                <Badge
                  variant={machine.status === 'running' ? 'success' : 'secondary'}
                >
                  {machine.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{machine.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-medium">{formatTemperature(machine.temperature)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Efficiency:</span>
                  <span className="font-medium">{formatPercentage(machine.efficiency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Throughput:</span>
                  <span className="font-medium">{machine.throughput} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-medium">{formatPercentage(machine.uptime)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Operating Hours</span>
                  <span className="font-medium">{machine.operatingHours.toFixed(0)} hrs</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No machines found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
