const { v4: uuidv4 } = require('uuid');

class CrewSimulator {
  constructor() {
    this.crew = this.initializeCrew();
    this.departments = this.initializeDepartments();
  }

  initializeCrew() {
    const crew = [];
    const positions = this.getPositions();
    const shipAssignments = [
      'Aurora Prime', 'Vanguard X9', 'Nova Sentinel', 'Celestial Harbor',
      'Starlight Courier', "Orion's Eye", 'Hyperion Arc', 'Specter Shadow',
      'Astra Delta Laboratory', 'Polaris Gateway'
    ];

    // Generate 200 crew members
    for (let i = 0; i < 200; i++) {
      const position = positions[Math.floor(Math.random() * positions.length)];
      const ship = shipAssignments[Math.floor(Math.random() * shipAssignments.length)];

      crew.push({
        id: uuidv4(),
        name: this.generateName(),
        rank: this.generateRank(position.department),
        position: position.title,
        department: position.department,
        shipAssignment: ship,
        status: this.generateStatus(),
        portrait: this.generatePortrait(i),
        stats: {
          health: 70 + Math.random() * 30,
          fatigue: Math.random() * 50,
          stress: Math.random() * 40,
          morale: 60 + Math.random() * 40
        },
        skills: this.generateSkills(position.department),
        training: this.generateTraining(position.department),
        background: this.generateBackground(),
        serviceRecord: this.generateServiceRecord(),
        currentDuty: this.generateDutyAssignment(),
        schedule: this.generateSchedule(),
        certifications: this.generateCertifications(position.department),
        commendations: Math.floor(Math.random() * 10),
        incidents: Math.floor(Math.random() * 3),
        yearsOfService: 1 + Math.floor(Math.random() * 25),
        homeworld: this.generateHomeworld(),
        specializations: this.generateSpecializations(position.department)
      });
    }

    return crew;
  }

  initializeDepartments() {
    return {
      command: {
        name: 'Command',
        head: 'Fleet Admiral',
        personnel: 0,
        efficiency: 85 + Math.random() * 15,
        status: 'operational'
      },
      engineering: {
        name: 'Engineering',
        head: 'Chief Engineer',
        personnel: 0,
        efficiency: 80 + Math.random() * 20,
        status: 'operational'
      },
      science: {
        name: 'Science',
        head: 'Chief Science Officer',
        personnel: 0,
        efficiency: 85 + Math.random() * 15,
        status: 'operational'
      },
      medical: {
        name: 'Medical',
        head: 'Chief Medical Officer',
        personnel: 0,
        efficiency: 90 + Math.random() * 10,
        status: 'operational'
      },
      security: {
        name: 'Security',
        head: 'Chief of Security',
        personnel: 0,
        efficiency: 85 + Math.random() * 15,
        status: 'operational'
      },
      operations: {
        name: 'Operations',
        head: 'Operations Chief',
        personnel: 0,
        efficiency: 80 + Math.random() * 20,
        status: 'operational'
      },
      navigation: {
        name: 'Navigation',
        head: 'Chief Navigator',
        personnel: 0,
        efficiency: 90 + Math.random() * 10,
        status: 'operational'
      },
      communications: {
        name: 'Communications',
        head: 'Communications Officer',
        personnel: 0,
        efficiency: 85 + Math.random() * 15,
        status: 'operational'
      }
    };
  }

  getPositions() {
    return [
      { title: 'Commanding Officer', department: 'command' },
      { title: 'Executive Officer', department: 'command' },
      { title: 'Tactical Officer', department: 'command' },
      { title: 'Chief Engineer', department: 'engineering' },
      { title: 'Propulsion Specialist', department: 'engineering' },
      { title: 'Systems Technician', department: 'engineering' },
      { title: 'Reactor Operator', department: 'engineering' },
      { title: 'Maintenance Crew', department: 'engineering' },
      { title: 'Science Officer', department: 'science' },
      { title: 'Astrophysicist', department: 'science' },
      { title: 'Xenobiologist', department: 'science' },
      { title: 'Research Analyst', department: 'science' },
      { title: 'Chief Medical Officer', department: 'medical' },
      { title: 'Ship Surgeon', department: 'medical' },
      { title: 'Medical Technician', department: 'medical' },
      { title: 'Counselor', department: 'medical' },
      { title: 'Security Chief', department: 'security' },
      { title: 'Security Officer', department: 'security' },
      { title: 'Armory Officer', department: 'security' },
      { title: 'Operations Officer', department: 'operations' },
      { title: 'Cargo Specialist', department: 'operations' },
      { title: 'Logistics Coordinator', department: 'operations' },
      { title: 'Chief Navigator', department: 'navigation' },
      { title: 'Helmsman', department: 'navigation' },
      { title: 'Astrogator', department: 'navigation' },
      { title: 'Communications Officer', department: 'communications' },
      { title: 'Signal Analyst', department: 'communications' },
      { title: 'Encryption Specialist', department: 'communications' }
    ];
  }

  generateName() {
    const firstNames = [
      'James', 'Sarah', 'Michael', 'Elena', 'David', 'Anna', 'Robert', 'Lisa',
      'William', 'Maria', 'Chen', 'Yuki', 'Ahmed', 'Priya', 'Ivan', 'Fatima',
      'Klaus', 'Mei', 'Carlos', 'Aisha', 'Dmitri', 'Leila', 'Hans', 'Kenji',
      'Marcus', 'Zara', 'Viktor', 'Nadia', 'Raj', 'Ingrid', 'Omar', 'Katarina'
    ];
    const lastNames = [
      'Chen', 'Rodriguez', 'Kim', 'Patel', 'Johnson', 'Williams', 'Brown', 'Garcia',
      'Miller', 'Davis', 'Nakamura', 'Singh', 'Kowalski', 'Schmidt', 'Petrov',
      'Andersen', 'Yamamoto', 'Santos', 'Mueller', 'Hassan', 'Johannsen', 'Park',
      'Novak', 'Tanaka', 'Fernandez', 'Volkov', 'O\'Brien', 'Larsson', 'Zhao'
    ];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  generateRank(department) {
    const commandRanks = ['Fleet Admiral', 'Admiral', 'Vice Admiral', 'Rear Admiral', 'Captain', 'Commander', 'Lieutenant Commander', 'Lieutenant', 'Ensign'];
    const techRanks = ['Chief', 'Senior', 'Specialist', 'Technician', 'Junior Technician'];
    const medicalRanks = ['Chief Surgeon', 'Senior Physician', 'Physician', 'Medical Officer', 'Medic'];

    if (department === 'command' || department === 'security' || department === 'navigation') {
      return commandRanks[Math.floor(Math.random() * commandRanks.length)];
    } else if (department === 'medical') {
      return medicalRanks[Math.floor(Math.random() * medicalRanks.length)];
    } else {
      return techRanks[Math.floor(Math.random() * techRanks.length)];
    }
  }

  generateStatus() {
    const statuses = ['on_duty', 'on_duty', 'on_duty', 'off_duty', 'off_duty', 'resting', 'training', 'medical_leave', 'shore_leave'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  generatePortrait(index) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe', '#fd79a8'];
    const bgColor = colors[index % colors.length];
    return {
      initials: '',
      backgroundColor: bgColor,
      textColor: '#ffffff'
    };
  }

  generateSkills(department) {
    const baseSkills = {
      command: ['Leadership', 'Tactics', 'Diplomacy', 'Decision Making', 'Crisis Management'],
      engineering: ['Mechanical Systems', 'Electrical Systems', 'Reactor Operations', 'Diagnostics', 'Repair'],
      science: ['Research', 'Analysis', 'Data Interpretation', 'Laboratory Operations', 'Field Work'],
      medical: ['Surgery', 'Diagnosis', 'Emergency Medicine', 'Pharmacology', 'Counseling'],
      security: ['Combat', 'Investigation', 'Threat Assessment', 'Weapons', 'Protection'],
      operations: ['Logistics', 'Coordination', 'Resource Management', 'Planning', 'Administration'],
      navigation: ['Piloting', 'Astrogation', 'Orbital Mechanics', 'Sensor Operation', 'EVA'],
      communications: ['Signal Processing', 'Encryption', 'Languages', 'Protocol', 'Electronic Warfare']
    };

    const skills = {};
    const deptSkills = baseSkills[department] || baseSkills.operations;

    deptSkills.forEach(skill => {
      skills[skill] = 40 + Math.floor(Math.random() * 60);
    });

    // Add some cross-skills
    skills['Physical Fitness'] = 50 + Math.floor(Math.random() * 50);
    skills['Teamwork'] = 60 + Math.floor(Math.random() * 40);

    return skills;
  }

  generateTraining(department) {
    const training = [];
    const courses = {
      command: ['Officer Candidate School', 'Command Academy', 'Tactical Training', 'Bridge Officer Certification'],
      engineering: ['Engineering Corps Academy', 'Reactor Safety Certification', 'Advanced Systems Training'],
      science: ['Science Division Training', 'Research Methodology', 'Field Science Certification'],
      medical: ['Medical Academy', 'Surgical Training', 'Emergency Response Certification'],
      security: ['Security Training Academy', 'Combat Certification', 'Investigation Training'],
      operations: ['Operations Training', 'Logistics Certification', 'Resource Management'],
      navigation: ['Flight Academy', 'Advanced Navigation', 'Astrogation Certification'],
      communications: ['Communications Academy', 'Encryption Certification', 'Protocol Training']
    };

    const deptCourses = courses[department] || courses.operations;
    const count = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      training.push({
        name: deptCourses[Math.floor(Math.random() * deptCourses.length)],
        completedDate: Date.now() - Math.random() * 315360000000,
        score: 70 + Math.floor(Math.random() * 30)
      });
    }

    return training;
  }

  generateBackground() {
    const origins = ['Earth', 'Mars Colony', 'Lunar Base', 'Titan Station', 'Europa', 'Belt Colonies', 'Proxima Colony'];
    const educations = ['Fleet Academy', 'Colonial Institute', 'Technical School', 'University', 'Military Academy'];
    const motivations = ['Service', 'Adventure', 'Career', 'Family Tradition', 'Scientific Discovery', 'Protection'];

    return {
      origin: origins[Math.floor(Math.random() * origins.length)],
      education: educations[Math.floor(Math.random() * educations.length)],
      motivation: motivations[Math.floor(Math.random() * motivations.length)],
      familyStatus: Math.random() > 0.5 ? 'Single' : 'Family',
      languages: ['Standard', Math.random() > 0.5 ? 'Mandarin' : 'Spanish']
    };
  }

  generateServiceRecord() {
    const records = [];
    const count = 2 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      records.push({
        date: Date.now() - (i + 1) * 31536000000 - Math.random() * 31536000000,
        type: Math.random() > 0.3 ? 'assignment' : 'commendation',
        description: this.randomServiceEntry(),
        ship: this.randomShipName()
      });
    }

    return records.sort((a, b) => b.date - a.date);
  }

  randomServiceEntry() {
    const entries = [
      'Assigned to vessel',
      'Promoted to current rank',
      'Commendation for exceptional service',
      'Completed advanced training',
      'Participated in major operation',
      'Transferred from previous assignment',
      'Awarded service medal'
    ];
    return entries[Math.floor(Math.random() * entries.length)];
  }

  randomShipName() {
    const ships = [
      'Aurora Prime', 'Vanguard X9', 'Nova Sentinel', 'Celestial Harbor',
      'Starlight Courier', "Orion's Eye", 'Hyperion Arc', 'Specter Shadow',
      'Astra Delta Laboratory', 'Polaris Gateway'
    ];
    return ships[Math.floor(Math.random() * ships.length)];
  }

  generateDutyAssignment() {
    const assignments = [
      'Bridge Watch', 'Engineering Shift', 'Security Patrol', 'Lab Work',
      'Medical Bay', 'Cargo Operations', 'Communications Watch', 'Standby'
    ];
    return {
      current: assignments[Math.floor(Math.random() * assignments.length)],
      startTime: Date.now() - Math.random() * 28800000,
      duration: 8,
      location: this.randomLocation()
    };
  }

  randomLocation() {
    const locations = ['Bridge', 'Engineering', 'Medical Bay', 'Science Lab', 'Cargo Bay', 'Quarters', 'Mess Hall', 'Armory'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  generateSchedule() {
    const shifts = [];
    for (let day = 0; day < 7; day++) {
      const shiftStart = 6 + Math.floor(Math.random() * 3) * 8;
      shifts.push({
        day,
        startHour: shiftStart,
        endHour: (shiftStart + 8) % 24,
        assignment: this.randomLocation()
      });
    }
    return shifts;
  }

  generateCertifications(department) {
    const certs = {
      command: ['Bridge Officer', 'Tactical Systems', 'Fleet Operations'],
      engineering: ['Reactor Safety', 'Life Support Systems', 'Propulsion Systems'],
      science: ['Laboratory Safety', 'Hazmat Handling', 'Research Protocols'],
      medical: ['Medical License', 'Emergency Response', 'Surgical Certification'],
      security: ['Weapons Qualification', 'Combat Certification', 'Security Protocols'],
      operations: ['Cargo Handling', 'Logistics Systems', 'Safety Protocols'],
      navigation: ['Flight Certification', 'Navigation Systems', 'EVA Qualified'],
      communications: ['Signal Intelligence', 'Encryption Systems', 'Protocol Certified']
    };

    const deptCerts = certs[department] || certs.operations;
    const active = [];

    deptCerts.forEach(cert => {
      if (Math.random() > 0.3) {
        active.push({
          name: cert,
          issued: Date.now() - Math.random() * 63072000000,
          expires: Date.now() + Math.random() * 63072000000,
          level: Math.floor(Math.random() * 3) + 1
        });
      }
    });

    return active;
  }

  generateHomeworld() {
    const worlds = [
      { name: 'Earth', system: 'Sol', population: '12B' },
      { name: 'Mars', system: 'Sol', population: '2B' },
      { name: 'Luna', system: 'Sol', population: '500M' },
      { name: 'Titan Colony', system: 'Sol', population: '100M' },
      { name: 'Proxima b', system: 'Proxima Centauri', population: '50M' },
      { name: 'Kepler Prime', system: 'Kepler-442', population: '200M' },
      { name: 'New Eden', system: 'Tau Ceti', population: '300M' }
    ];
    return worlds[Math.floor(Math.random() * worlds.length)];
  }

  generateSpecializations(department) {
    const specs = [];
    const count = Math.floor(Math.random() * 3) + 1;

    const specializations = {
      command: ['Fleet Tactics', 'Diplomatic Relations', 'Crisis Command', 'Strategic Planning'],
      engineering: ['Warp Systems', 'Shield Technology', 'Weapons Systems', 'Power Distribution'],
      science: ['Astrophysics', 'Xenobiology', 'Quantum Mechanics', 'Planetary Science'],
      medical: ['Trauma Surgery', 'Xenomedicine', 'Psychiatry', 'Cybernetics'],
      security: ['Investigation', 'Close Protection', 'Counterintelligence', 'Tactical Operations'],
      operations: ['Supply Chain', 'Personnel Management', 'Facility Operations', 'Crisis Logistics'],
      navigation: ['Deep Space Navigation', 'Atmospheric Flight', 'Combat Maneuvers', 'Docking Operations'],
      communications: ['Cryptography', 'Signal Intelligence', 'First Contact Protocols', 'Electronic Warfare']
    };

    const deptSpecs = specializations[department] || specializations.operations;

    for (let i = 0; i < count; i++) {
      const spec = deptSpecs[Math.floor(Math.random() * deptSpecs.length)];
      if (!specs.includes(spec)) {
        specs.push(spec);
      }
    }

    return specs;
  }

  update() {
    this.crew.forEach(member => {
      // Update stats
      member.stats.fatigue += (Math.random() - 0.3) * 2;
      member.stats.fatigue = Math.max(0, Math.min(100, member.stats.fatigue));

      member.stats.stress += (Math.random() - 0.4) * 1.5;
      member.stats.stress = Math.max(0, Math.min(100, member.stats.stress));

      member.stats.morale += (Math.random() - 0.5) * 1;
      member.stats.morale = Math.max(30, Math.min(100, member.stats.morale));

      member.stats.health += (Math.random() - 0.5) * 0.5;
      member.stats.health = Math.max(50, Math.min(100, member.stats.health));

      // Occasionally change status
      if (Math.random() > 0.98) {
        member.status = this.generateStatus();
      }
    });

    // Update department stats
    Object.keys(this.departments).forEach(dept => {
      const deptCrew = this.crew.filter(c => c.department === dept);
      this.departments[dept].personnel = deptCrew.length;
      this.departments[dept].efficiency = deptCrew.reduce((sum, c) => sum + c.stats.morale, 0) / deptCrew.length;
    });

    return {
      crew: this.crew,
      departments: this.departments,
      summary: this.getSummary()
    };
  }

  getSummary() {
    const onDuty = this.crew.filter(c => c.status === 'on_duty').length;
    const avgMorale = this.crew.reduce((sum, c) => sum + c.stats.morale, 0) / this.crew.length;
    const avgHealth = this.crew.reduce((sum, c) => sum + c.stats.health, 0) / this.crew.length;

    return {
      totalCrew: this.crew.length,
      onDuty,
      offDuty: this.crew.length - onDuty,
      averageMorale: avgMorale,
      averageHealth: avgHealth,
      medicalLeave: this.crew.filter(c => c.status === 'medical_leave').length,
      training: this.crew.filter(c => c.status === 'training').length
    };
  }

  getCrewMember(id) {
    return this.crew.find(c => c.id === id);
  }

  getCrewByDepartment(department) {
    return this.crew.filter(c => c.department === department);
  }

  getCrewByShip(ship) {
    return this.crew.filter(c => c.shipAssignment === ship);
  }

  reassignCrew(crewId, newShip, newPosition) {
    const member = this.crew.find(c => c.id === crewId);
    if (member) {
      member.shipAssignment = newShip;
      if (newPosition) {
        member.position = newPosition;
      }
      member.serviceRecord.unshift({
        date: Date.now(),
        type: 'assignment',
        description: `Reassigned to ${newShip}`,
        ship: newShip
      });
      return true;
    }
    return false;
  }
}

module.exports = CrewSimulator;
