import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import HoloPanel from './HoloPanel';

function CrewCard({ member, isSelected, onClick }) {
  const statusColors = {
    on_duty: 'border-holo-green/50 bg-holo-green/5',
    off_duty: 'border-holo-blue/30 bg-holo-blue/5',
    resting: 'border-holo-cyan/30 bg-holo-cyan/5',
    training: 'border-holo-purple/50 bg-holo-purple/5',
    medical_leave: 'border-holo-red/50 bg-holo-red/5',
    shore_leave: 'border-holo-orange/50 bg-holo-orange/5'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-300
        ${statusColors[member.status] || statusColors.off_duty}
        ${isSelected ? 'ring-2 ring-holo-blue shadow-holo' : ''}
        hover:shadow-holo
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: member.portrait?.backgroundColor || '#4a5568' }}
        >
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-holo-cyan truncate">{member.name}</h4>
          <p className="text-xs text-holo-blue/60">{member.rank}</p>
          <p className="text-xs text-holo-purple truncate">{member.position}</p>
        </div>

        {/* Status indicator */}
        <div className={`
          w-2 h-2 rounded-full
          ${member.status === 'on_duty' ? 'bg-holo-green' :
            member.status === 'medical_leave' ? 'bg-holo-red' :
              'bg-holo-cyan/50'}
        `} />
      </div>

      {/* Stats bar */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] text-holo-blue/60">Health</div>
          <div className="h-1 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-holo-green"
              style={{ width: `${member.stats?.health || 0}%` }}
            />
          </div>
        </div>
        <div>
          <div className="text-[10px] text-holo-blue/60">Morale</div>
          <div className="h-1 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-holo-cyan"
              style={{ width: `${member.stats?.morale || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-holo-blue/40">{member.shipAssignment}</div>
    </motion.div>
  );
}

function CrewDetailPanel({ member, onClose }) {
  if (!member) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 h-full overflow-auto"
    >
      <HoloPanel
        title={member.name}
        subtitle={`${member.rank} - ${member.position}`}
        headerActions={
          <button onClick={onClose} className="text-holo-cyan/60 hover:text-holo-cyan">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      >
        <div className="p-4 space-y-4">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: member.portrait?.backgroundColor || '#4a5568' }}
            >
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-holo-purple">{member.department}</div>
              <div className="text-sm text-holo-cyan/60">{member.shipAssignment}</div>
              <div className={`
                mt-1 px-2 py-0.5 rounded text-xs inline-block
                ${member.status === 'on_duty' ? 'bg-holo-green/20 text-holo-green' :
                  member.status === 'medical_leave' ? 'bg-holo-red/20 text-holo-red' :
                    'bg-holo-blue/20 text-holo-blue'}
              `}>
                {member.status?.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h5 className="text-xs text-holo-blue uppercase mb-2">Vital Statistics</h5>
            <div className="space-y-2">
              {[
                { label: 'Health', value: member.stats?.health, color: 'bg-holo-green' },
                { label: 'Fatigue', value: member.stats?.fatigue, color: 'bg-holo-orange' },
                { label: 'Stress', value: member.stats?.stress, color: 'bg-holo-red' },
                { label: 'Morale', value: member.stats?.morale, color: 'bg-holo-cyan' }
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-holo-blue/60">{stat.label}</span>
                    <span className="text-holo-cyan font-mono">{(stat.value || 0).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-space-dark rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color}`} style={{ width: `${stat.value || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {member.skills && Object.keys(member.skills).length > 0 && (
            <div>
              <h5 className="text-xs text-holo-blue uppercase mb-2">Skills</h5>
              <div className="space-y-1">
                {Object.entries(member.skills).slice(0, 6).map(([skill, value]) => (
                  <div key={skill} className="flex items-center justify-between text-xs">
                    <span className="text-holo-cyan/80">{skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-space-dark rounded-full overflow-hidden">
                        <div className="h-full bg-holo-purple" style={{ width: `${value}%` }} />
                      </div>
                      <span className="text-holo-cyan font-mono w-8 text-right">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current duty */}
          {member.currentDuty && (
            <div>
              <h5 className="text-xs text-holo-blue uppercase mb-2">Current Assignment</h5>
              <div className="bg-space-dark/50 rounded p-3">
                <div className="text-holo-cyan font-medium">{member.currentDuty.current}</div>
                <div className="text-xs text-holo-blue/60 mt-1">
                  Location: {member.currentDuty.location}
                </div>
                <div className="text-xs text-holo-blue/60">
                  Duration: {member.currentDuty.duration}h shift
                </div>
              </div>
            </div>
          )}

          {/* Background */}
          {member.background && (
            <div>
              <h5 className="text-xs text-holo-blue uppercase mb-2">Background</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-holo-blue/60">Origin</div>
                  <div className="text-holo-cyan">{member.background.origin}</div>
                </div>
                <div className="bg-space-dark/50 rounded p-2">
                  <div className="text-holo-blue/60">Education</div>
                  <div className="text-holo-cyan">{member.background.education}</div>
                </div>
              </div>
            </div>
          )}

          {/* Service record */}
          {member.serviceRecord && member.serviceRecord.length > 0 && (
            <div>
              <h5 className="text-xs text-holo-blue uppercase mb-2">Service Record</h5>
              <div className="space-y-2 max-h-40 overflow-auto">
                {member.serviceRecord.slice(0, 5).map((record, i) => (
                  <div key={i} className="bg-space-dark/50 rounded p-2 text-xs">
                    <div className="text-holo-blue/40 font-mono">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                    <div className="text-holo-cyan">{record.description}</div>
                    <div className="text-holo-purple/60">{record.ship}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {member.certifications && member.certifications.length > 0 && (
            <div>
              <h5 className="text-xs text-holo-blue uppercase mb-2">Certifications</h5>
              <div className="flex flex-wrap gap-1">
                {member.certifications.map((cert, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-holo-green/10 text-holo-green text-xs rounded"
                  >
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specializations */}
          {member.specializations && member.specializations.length > 0 && (
            <div>
              <h5 className="text-xs text-holo-blue uppercase mb-2">Specializations</h5>
              <div className="flex flex-wrap gap-1">
                {member.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-holo-purple/10 text-holo-purple text-xs rounded"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-holo-green font-bold">{member.commendations || 0}</div>
              <div className="text-holo-blue/60">Commendations</div>
            </div>
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-holo-cyan font-bold">{member.yearsOfService || 0}</div>
              <div className="text-holo-blue/60">Years</div>
            </div>
            <div className="bg-space-dark/50 rounded p-2">
              <div className="text-holo-orange font-bold">{member.incidents || 0}</div>
              <div className="text-holo-blue/60">Incidents</div>
            </div>
          </div>
        </div>
      </HoloPanel>
    </motion.div>
  );
}

export default function CrewPanel() {
  const { crew, departments, crewSummary, selectedCrewMember, setSelectedCrewMember } = useStore();
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCrew = useMemo(() => {
    return crew
      .filter(member => {
        if (departmentFilter !== 'all' && member.department !== departmentFilter) return false;
        if (statusFilter !== 'all' && member.status !== statusFilter) return false;
        if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [crew, departmentFilter, statusFilter, searchQuery]);

  const selectedMemberData = crew.find(c => c.id === selectedCrewMember);

  const departmentList = Object.keys(departments);
  const statusList = ['on_duty', 'off_duty', 'resting', 'training', 'medical_leave', 'shore_leave'];

  return (
    <div className="h-full flex">
      {/* Main crew list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-panel-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-holo-blue uppercase tracking-wider">
                Personnel Management
              </h2>
              <p className="text-sm text-holo-cyan/60">
                {crew.length} personnel records
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="holo-input flex-1"
            />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="holo-input"
            >
              <option value="all">All Departments</option>
              {departmentList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="holo-input"
            >
              <option value="all">All Status</option>
              {statusList.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Summary stats */}
          {crewSummary && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-cyan">
                  {crewSummary.totalCrew}
                </div>
                <div className="text-xs text-holo-blue/60">Total</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-green">
                  {crewSummary.onDuty}
                </div>
                <div className="text-xs text-holo-blue/60">On Duty</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-cyan">
                  {crewSummary.averageMorale?.toFixed(0) || 0}%
                </div>
                <div className="text-xs text-holo-blue/60">Avg Morale</div>
              </div>
              <div className="bg-space-dark/50 rounded p-2 text-center">
                <div className="text-2xl font-display font-bold text-holo-red">
                  {crewSummary.medicalLeave || 0}
                </div>
                <div className="text-xs text-holo-blue/60">Medical</div>
              </div>
            </div>
          )}
        </div>

        {/* Crew grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence>
              {filteredCrew.slice(0, 50).map(member => (
                <CrewCard
                  key={member.id}
                  member={member}
                  isSelected={selectedCrewMember === member.id}
                  onClick={() => setSelectedCrewMember(
                    selectedCrewMember === member.id ? null : member.id
                  )}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredCrew.length > 50 && (
            <div className="text-center py-4 text-holo-cyan/60 text-sm">
              Showing 50 of {filteredCrew.length} personnel
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedMemberData && (
          <CrewDetailPanel
            member={selectedMemberData}
            onClose={() => setSelectedCrewMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
