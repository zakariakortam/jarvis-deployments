import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import useStore from '../store/useStore';
import HoloPanel from './HoloPanel';

function TimelineEvent({ event, isSelected, onClick }) {
  const now = Date.now();
  const isPast = event.scheduledTime < now;
  const isCurrent = event.status === 'in_progress';

  const priorityColors = {
    critical: 'border-holo-red bg-holo-red/10',
    high: 'border-holo-orange bg-holo-orange/10',
    medium: 'border-holo-blue bg-holo-blue/10',
    low: 'border-holo-cyan/50 bg-holo-cyan/5'
  };

  const categoryIcons = {
    navigation: '⬡',
    operations: '◈',
    engineering: '⚙',
    comms: '📡',
    intelligence: '👁',
    logistics: '📦',
    security: '🛡',
    research: '🔬',
    alert: '⚠'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-300
        ${priorityColors[event.priority] || priorityColors.medium}
        ${isSelected ? 'ring-2 ring-holo-blue shadow-holo' : ''}
        ${isPast && !isCurrent ? 'opacity-60' : ''}
        hover:shadow-holo
      `}
    >
      {/* Status indicator line */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1 rounded-l-lg
        ${isCurrent ? 'bg-holo-green animate-pulse' : isPast ? 'bg-holo-cyan/30' : 'bg-holo-blue/50'}
      `} />

      {/* Content */}
      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryIcons[event.category] || '●'}</span>
            <div>
              <h4 className="font-medium text-sm text-holo-cyan">{event.title}</h4>
              <p className="text-xs text-holo-blue/60">{event.type?.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          <div className={`
            px-2 py-0.5 rounded text-[10px] uppercase font-medium
            ${event.status === 'completed' ? 'bg-holo-green/20 text-holo-green' :
              event.status === 'in_progress' ? 'bg-holo-orange/20 text-holo-orange' :
                'bg-holo-blue/20 text-holo-blue'}
          `}>
            {event.status?.replace('_', ' ')}
          </div>
        </div>

        <p className="text-xs text-holo-cyan/70 mb-2 line-clamp-2">{event.description}</p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-holo-purple">{event.assignedShip}</span>
          <span className="text-holo-blue/60 font-mono">
            {isCurrent ? 'IN PROGRESS' :
              isPast ? format(new Date(event.scheduledTime), 'HH:mm') :
                formatDistanceToNow(new Date(event.scheduledTime), { addSuffix: true })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function EventDetailPanel({ event, onClose }) {
  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 h-full overflow-auto"
    >
      <HoloPanel
        title={event.title}
        subtitle={event.type?.replace('_', ' ').toUpperCase()}
        headerActions={
          <button onClick={onClose} className="text-holo-cyan/60 hover:text-holo-cyan">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      >
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-holo-blue/60 uppercase">Status</span>
            <span className={`
              px-3 py-1 rounded text-xs uppercase font-medium
              ${event.status === 'completed' ? 'bg-holo-green/20 text-holo-green' :
                event.status === 'in_progress' ? 'bg-holo-orange/20 text-holo-orange' :
                  'bg-holo-blue/20 text-holo-blue'}
            `}>
              {event.status?.replace('_', ' ')}
            </span>
          </div>

          {/* Description */}
          <div>
            <div className="text-xs text-holo-blue/60 uppercase mb-1">Description</div>
            <p className="text-sm text-holo-cyan">{event.description}</p>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-xs text-holo-blue/60">Scheduled</div>
              <div className="text-sm text-holo-cyan font-mono">
                {format(new Date(event.scheduledTime), 'HH:mm')}
              </div>
              <div className="text-xs text-holo-blue/40">
                {format(new Date(event.scheduledTime), 'MMM dd')}
              </div>
            </div>
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-xs text-holo-blue/60">Duration</div>
              <div className="text-sm text-holo-cyan font-mono">
                {event.duration} min
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <div className="text-xs text-holo-blue/60 uppercase mb-1">Assigned Ship</div>
            <div className="text-holo-purple font-medium">{event.assignedShip}</div>
            <div className="text-xs text-holo-cyan/60">Personnel: {event.personnel}</div>
          </div>

          {/* Priority & Risk */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-xs text-holo-blue/60">Priority</div>
              <div className={`text-sm font-medium uppercase
                ${event.priority === 'critical' ? 'text-holo-red' :
                  event.priority === 'high' ? 'text-holo-orange' :
                    'text-holo-cyan'}
              `}>
                {event.priority}
              </div>
            </div>
            {event.riskLevel && (
              <div className="bg-space-dark/50 rounded p-2">
                <div className="text-xs text-holo-blue/60">Risk Level</div>
                <div className="text-sm text-holo-orange font-mono">{event.riskLevel}/10</div>
              </div>
            )}
          </div>

          {/* Requirements */}
          {event.requirements && event.requirements.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Requirements</div>
              <ul className="space-y-1">
                {event.requirements.map((req, i) => (
                  <li key={i} className="text-xs text-holo-cyan flex items-start gap-2">
                    <span className="text-holo-green">✓</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contingencies */}
          {event.contingencies && event.contingencies.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Contingencies</div>
              <div className="space-y-2">
                {event.contingencies.map((cont, i) => (
                  <div key={i} className="bg-space-dark/50 rounded p-2 text-xs">
                    <div className="text-holo-orange">{cont.trigger}</div>
                    <div className="text-holo-cyan/70">→ {cont.response}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outcome (for completed events) */}
          {event.outcome && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Outcome</div>
              <div className={`
                p-2 rounded border
                ${event.outcome.status === 'success' ? 'border-holo-green/30 bg-holo-green/10' :
                  event.outcome.status === 'partial' ? 'border-holo-orange/30 bg-holo-orange/10' :
                    'border-holo-red/30 bg-holo-red/10'}
              `}>
                <div className={`text-sm font-medium uppercase mb-1
                  ${event.outcome.status === 'success' ? 'text-holo-green' :
                    event.outcome.status === 'partial' ? 'text-holo-orange' :
                      'text-holo-red'}
                `}>
                  {event.outcome.status}
                </div>
                <div className="text-xs text-holo-cyan/70">{event.outcome.notes}</div>
              </div>
            </div>
          )}

          {/* Logs */}
          {event.logs && event.logs.length > 0 && (
            <div>
              <div className="text-xs text-holo-blue/60 uppercase mb-2">Event Log</div>
              <div className="space-y-1 max-h-40 overflow-auto">
                {event.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-holo-blue/40 font-mono shrink-0">
                      {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className="text-holo-cyan">{log.entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoloPanel>
    </motion.div>
  );
}

export default function MissionTimeline() {
  const { timeline, currentEvents, upcomingEvents, selectedEvent, setSelectedEvent } = useStore();
  const [view, setView] = useState('upcoming');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredEvents = useMemo(() => {
    let events = [];
    switch (view) {
      case 'current':
        events = currentEvents;
        break;
      case 'upcoming':
        events = upcomingEvents;
        break;
      case 'all':
        events = timeline;
        break;
      default:
        events = upcomingEvents;
    }

    if (categoryFilter !== 'all') {
      events = events.filter(e => e.category === categoryFilter);
    }

    return events;
  }, [view, categoryFilter, timeline, currentEvents, upcomingEvents]);

  const selectedEventData = timeline.find(e => e.id === selectedEvent);

  const categories = useMemo(() => {
    const cats = new Set(timeline.map(e => e.category));
    return Array.from(cats);
  }, [timeline]);

  return (
    <div className="h-full flex">
      {/* Main timeline */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panel-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-holo-blue uppercase tracking-wider">
                Mission Timeline
              </h2>
              <p className="text-sm text-holo-cyan/60">
                {currentEvents.length} active, {upcomingEvents.length} scheduled
              </p>
            </div>

            {/* View controls */}
            <div className="flex items-center gap-2">
              <div className="flex rounded overflow-hidden border border-panel-border">
                {['current', 'upcoming', 'all'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 text-xs uppercase transition-colors
                      ${view === v ? 'bg-holo-blue/20 text-holo-blue' : 'text-holo-cyan/60 hover:text-holo-cyan'}
                    `}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="holo-input text-xs py-1"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current time indicator */}
          <div className="bg-space-dark/50 rounded p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-holo-green animate-pulse" />
              <span className="text-sm text-holo-cyan">Current Stardate</span>
            </div>
            <span className="font-mono text-holo-cyan">
              {format(new Date(), 'yyyy.DDD.HHmmss')}
            </span>
          </div>
        </div>

        {/* Timeline events */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-holo-cyan/50">
                  No events to display
                </div>
              ) : (
                filteredEvents.map(event => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent === event.id}
                    onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Event detail panel */}
      <AnimatePresence>
        {selectedEventData && (
          <EventDetailPanel
            event={selectedEventData}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
