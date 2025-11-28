import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Calendar, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import dataSimulator from '../../services/dataSimulator';
import { format } from 'date-fns';

export const LeasingTimeline = ({ buildingId }) => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (buildingId) {
      const timeline = dataSimulator.generateLeasingTimeline(buildingId);
      setEvents(timeline);
    }
  }, [buildingId]);

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.type === filter);

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    if (type === 'New Lease' || type === 'Expansion') return <TrendingUp className="w-4 h-4" />;
    if (type === 'Termination') return <TrendingDown className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <Card
      title="Leasing Timeline"
      action={
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
        >
          <option value="all">All Events</option>
          <option value="New Lease">New Lease</option>
          <option value="Renewal">Renewal</option>
          <option value="Termination">Termination</option>
          <option value="Expansion">Expansion</option>
          <option value="Under Negotiation">Under Negotiation</option>
        </select>
      }
    >
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {filteredEvents.slice(0, 15).map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            <div className="p-2 bg-primary/10 rounded-lg mt-1">
              {getTypeIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{event.tenant}</p>
                  <p className="text-sm text-muted-foreground">{event.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(event.date), 'MMM dd, yyyy')}
                </span>
                <span>{event.area.toLocaleString()} sq ft</span>
                <span>Floor {event.floor}</span>
                <span className="font-medium text-foreground">
                  ${(event.value / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
