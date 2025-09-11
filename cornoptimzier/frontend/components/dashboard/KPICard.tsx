import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface KPICardProps {
  kpi: KPI;
}

export default function KPICard({ kpi }: KPICardProps) {
  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (kpi.status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
        <div className={getStatusColor()}>
          {getTrendIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {kpi.value.toFixed(1)} {kpi.unit}
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
          <span className={kpi.changePercent > 0 ? 'text-green-600' : 'text-red-600'}>
            {kpi.changePercent > 0 ? '+' : ''}{kpi.changePercent.toFixed(1)}%
          </span>
          <Badge 
            variant={kpi.status === 'good' ? 'default' : kpi.status === 'warning' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {kpi.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}