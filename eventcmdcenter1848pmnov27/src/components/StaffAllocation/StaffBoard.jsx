import { motion } from 'framer-motion';
import { Users, Clock, MapPin, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const StaffBoard = ({ staffData }) => {
  if (!staffData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Loading staff allocation data...</p>
      </div>
    );
  }

  const getRoleColor = (role) => {
    const colors = {
      Security: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      Usher: 'bg-green-500/20 text-green-500 border-green-500/30',
      Medical: 'bg-red-500/20 text-red-500 border-red-500/30',
      Technical: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      Coordinator: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      Volunteer: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  const getStaffingStatus = (assigned, required) => {
    const percentage = (assigned / required) * 100;
    if (percentage >= 100) return { status: 'adequate', color: 'text-success' };
    if (percentage >= 80) return { status: 'sufficient', color: 'text-primary' };
    return { status: 'understaffed', color: 'text-warning' };
  };

  return (
    <div className="space-y-6">
      {/* Staff Overview */}
      <div className="glass-effect p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Staff Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Staff</p>
                <p className="text-3xl font-bold text-primary">{staffData.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-bold text-success">{staffData.active}</p>
              </div>
              <Activity className="w-8 h-8 text-success" />
            </div>
          </div>

          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">On Break</p>
                <p className="text-3xl font-bold text-warning">{staffData.onBreak}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Utilization</p>
                <p className="text-3xl font-bold text-purple-500">
                  {Math.round((staffData.active / staffData.total) * 100)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff by Role */}
        <div className="glass-effect p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Staff by Role</h3>
          <div className="space-y-3">
            {staffData.byRole.map((role, index) => {
              const staffing = getStaffingStatus(role.assigned, role.required);
              return (
                <motion.div
                  key={role.role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-accent rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                        role.role
                      )}`}
                    >
                      {role.role}
                    </span>
                    <span className={`text-sm font-medium ${staffing.color}`}>
                      {staffing.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                    <div>
                      <p className="text-muted-foreground text-xs">Assigned</p>
                      <p className="font-semibold">{role.assigned}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Active</p>
                      <p className="font-semibold text-success">{role.active}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Required</p>
                      <p className="font-semibold">{role.required}</p>
                    </div>
                  </div>

                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((role.assigned / role.required) * 100, 100)}%`
                      }}
                      className={`absolute h-full rounded-full ${
                        staffing.status === 'adequate'
                          ? 'bg-success'
                          : staffing.status === 'sufficient'
                          ? 'bg-primary'
                          : 'bg-warning'
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Staff by Zone */}
        <div className="glass-effect p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Staff by Zone</h3>
          <div className="space-y-3">
            {staffData.byZone.map((zone, index) => (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-accent rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">{zone.zone}</h4>
                      {zone.status === 'understaffed' && (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Staff: <span className="text-foreground font-medium">{zone.staff.length}</span>
                      </span>
                      <span>
                        Required: <span className="text-foreground font-medium">{zone.required}</span>
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      zone.status === 'adequate'
                        ? 'bg-success/20 text-success border border-success/30'
                        : 'bg-warning/20 text-warning border border-warning/30'
                    }`}
                  >
                    {zone.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {zone.staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-background/50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            member.status === 'active' ? 'bg-success' : 'bg-muted'
                          }`}
                        />
                        <span className="text-sm">{member.name}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift Schedule */}
      <div className="glass-effect p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Shift Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staffData.shifts.map((shift, index) => (
            <motion.div
              key={shift.shift}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-accent rounded-lg"
            >
              <h4 className="font-semibold mb-2">{shift.shift} Shift</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {shift.start} - {shift.end}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Staff Count</span>
                  <span className="font-bold text-primary">{shift.staff}</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="absolute h-full bg-primary rounded-full"
                    style={{
                      width: `${(shift.staff / staffData.total) * 100}%`
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffBoard;
