# Nuclear Reactor Simulator

An interactive, real-time nuclear reactor simulation with realistic physics. Manage reactor control rods, coolant systems, and power generation while preventing meltdowns.

## Features

- **Realistic Physics Engine**: Accurate simulation of neutron flux, heat generation, pressure, and power output
- **Interactive Controls**: Adjust control rods and coolant flow in real-time
- **Visual Reactor Core**: Color-coded reactor visualization with particle effects showing neutron activity
- **Real-time Monitoring**: Live graphs tracking temperature and power output over time
- **Emergency Systems**: SCRAM capability for emergency shutdowns
- **Achievement System**: Unlock achievements as you operate the reactor
- **Tutorial**: Guided walkthrough of all reactor systems and controls
- **Event Log**: Track all reactor events and system notifications

## Gameplay

Your goal is to generate power by operating the nuclear reactor safely:

1. Start the reactor and set coolant flow
2. Gradually withdraw control rods to increase reactivity
3. Monitor temperature and pressure closely
4. Adjust controls to maintain stable operation
5. Generate power while keeping core temperature below 2000°C
6. Avoid meltdown at all costs

## Controls

- **Start/Stop Reactor**: Begin or end reactor operation
- **Control Rods**: Slide to adjust neutron absorption (higher % = more inserted = slower reaction)
- **Coolant Flow**: Adjust cooling rate to manage core temperature
- **Emergency SCRAM**: Immediate shutdown by inserting all control rods

## Safety Limits

- Maximum safe temperature: 2000°C
- Meltdown temperature: 2500°C
- Maximum safe pressure: 100 bar
- Recommended operating temperature: 800-1200°C

## Physics Model

The simulation models:
- Neutron flux and chain reactions
- Heat generation from fission
- Decay heat (continues after shutdown)
- Coolant heat transfer
- Steam pressure generation
- Turbine power conversion
- Thermal efficiency calculations

## Technology Stack

- React 18 with Hooks
- Framer Motion for animations
- Zustand for state management
- Recharts for data visualization
- TailwindCSS for styling
- Vite for build tooling
