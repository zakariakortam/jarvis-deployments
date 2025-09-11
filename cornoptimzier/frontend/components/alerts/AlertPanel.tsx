import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  plant_id: string;
  unit_id?: string;
  parameter?: string;
  value?: number;
  threshold?: number;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  resolved_by?: string;
}

interface AlertPanelProps {
  alerts: Alert[];
}

export default function AlertPanel({ alerts }: AlertPanelProps) {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBadgeVariant = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Active Alerts
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
        <CardDescription>
          Current system alerts and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No active alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={getAlertColor(alert.type)}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {alert.plant_id} {alert.unit_id && `• ${alert.unit_id}`}
                      </p>
                    </div>
                    <Badge variant={getBadgeVariant(alert.type)} className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {alert.message}
                </p>
                
                {alert.parameter && alert.value && (
                  <div className="text-xs text-muted-foreground">
                    {alert.parameter}: {alert.value.toFixed(2)}
                    {alert.threshold && ` (threshold: ${alert.threshold.toFixed(2)})`}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </span>
                  
                  {alert.status === 'active' && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                      >
                        Acknowledge
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}