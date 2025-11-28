import React from 'react';
import { Moon, Sun, Download, LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '../common/Button';
import { useDashboardStore } from '../../store/dashboardStore';

export const Header = () => {
  const { darkMode, toggleDarkMode, viewMode, setViewMode, selectedBuilding, exportData } = useDashboardStore();

  const handleExport = () => {
    if (selectedBuilding) {
      exportData('building-data', {
        building: selectedBuilding,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Building Portfolio Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time monitoring and analytics
              {selectedBuilding && (
                <span className="ml-2 text-primary font-medium">
                  {selectedBuilding.name}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              icon={darkMode ? Sun : Moon}
            >
              {darkMode ? 'Light' : 'Dark'}
            </Button>

            {selectedBuilding && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                icon={Download}
              >
                Export
              </Button>
            )}

            <div className="flex items-center gap-1 ml-2 p-1 bg-secondary rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
