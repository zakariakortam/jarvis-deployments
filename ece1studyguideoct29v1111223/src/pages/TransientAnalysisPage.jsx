import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './TransientAnalysisPage.css';

const TransientAnalysisPage = () => {
  const [circuitType, setCircuitType] = useState('rc');
  const [resistance, setResistance] = useState(1000);
  const [capacitance, setCapacitance] = useState(0.001);
  const [inductance, setInductance] = useState(0.1);
  const [voltage, setVoltage] = useState(12);

  const generateTransientData = () => {
    const data = [];
    let timeConstant, duration;

    if (circuitType === 'rc') {
      timeConstant = resistance * capacitance;
      duration = timeConstant * 5;

      for (let t = 0; t <= duration; t += duration / 100) {
        data.push({
          time: (t * 1000).toFixed(2), // Convert to ms
          voltage: voltage * (1 - Math.exp(-t / timeConstant)),
          current: (voltage / resistance) * Math.exp(-t / timeConstant) * 1000 // Convert to mA
        });
      }
    } else if (circuitType === 'rl') {
      timeConstant = inductance / resistance;
      duration = timeConstant * 5;

      for (let t = 0; t <= duration; t += duration / 100) {
        data.push({
          time: (t * 1000).toFixed(2),
          voltage: voltage * Math.exp(-t / timeConstant),
          current: (voltage / resistance) * (1 - Math.exp(-t / timeConstant)) * 1000
        });
      }
    } else { // RLC circuit
      const dampingRatio = (resistance / 2) * Math.sqrt(capacitance / inductance);
      const naturalFreq = 1 / Math.sqrt(inductance * capacitance);
      timeConstant = 1 / (dampingRatio * naturalFreq);
      duration = timeConstant * 10;

      for (let t = 0; t <= duration; t += duration / 100) {
        const exponential = Math.exp(-dampingRatio * naturalFreq * t);
        const oscillatory = Math.cos(naturalFreq * Math.sqrt(1 - dampingRatio ** 2) * t);
        data.push({
          time: (t * 1000).toFixed(2),
          voltage: voltage * (1 - exponential * oscillatory),
          current: (voltage / resistance) * exponential * oscillatory * 1000
        });
      }
    }

    return data;
  };

  const transientData = generateTransientData();
  const timeConstant = circuitType === 'rc'
    ? resistance * capacitance
    : inductance / resistance;

  const concepts = [
    {
      title: 'Time Constant (τ)',
      description: 'Measure of how quickly the circuit responds to changes',
      formulas: ['RC Circuit: τ = RC', 'RL Circuit: τ = L/R', 'RLC Circuit: τ = 2L/R']
    },
    {
      title: 'First-Order Response',
      description: 'Exponential approach to steady state',
      formulas: ['Charging: v(t) = Vf(1 - e^(-t/τ))', 'Discharging: v(t) = Vi·e^(-t/τ)']
    },
    {
      title: 'Second-Order Response',
      description: 'Can be overdamped, critically damped, or underdamped',
      formulas: ['ζ < 1: Underdamped (oscillatory)', 'ζ = 1: Critically damped', 'ζ > 1: Overdamped']
    },
    {
      title: 'Initial and Final Values',
      description: 'Boundary conditions for solving differential equations',
      formulas: ['v(0⁺): Voltage at t=0⁺', 'v(∞): Steady-state voltage', 'i(0⁺): Current at t=0⁺']
    }
  ];

  const circuitTypes = [
    { id: 'rc', name: 'RC Circuit', description: 'First-order resistor-capacitor' },
    { id: 'rl', name: 'RL Circuit', description: 'First-order resistor-inductor' },
    { id: 'rlc', name: 'RLC Circuit', description: 'Second-order resonant circuit' }
  ];

  return (
    <div className="transient-analysis-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="page-header">
          <h1>Transient Analysis</h1>
          <p>First and second-order circuit responses</p>
        </header>

        <div className="circuit-type-selector">
          {circuitTypes.map((type) => (
            <motion.button
              key={type.id}
              className={`type-btn ${circuitType === type.id ? 'active' : ''}`}
              onClick={() => setCircuitType(type.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="type-name">{type.name}</div>
              <div className="type-desc">{type.description}</div>
            </motion.button>
          ))}
        </div>

        <div className="simulator-section">
          <h2>Interactive Simulator</h2>

          <div className="controls-grid">
            <div className="control-group">
              <label>
                Voltage Source: {voltage} V
                <input
                  type="range"
                  min="5"
                  max="24"
                  step="1"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="slider"
                />
              </label>
            </div>

            <div className="control-group">
              <label>
                Resistance: {resistance} Ω
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="slider"
                />
              </label>
            </div>

            {(circuitType === 'rc' || circuitType === 'rlc') && (
              <div className="control-group">
                <label>
                  Capacitance: {(capacitance * 1000).toFixed(2)} mF
                  <input
                    type="range"
                    min="0.0001"
                    max="0.01"
                    step="0.0001"
                    value={capacitance}
                    onChange={(e) => setCapacitance(Number(e.target.value))}
                    className="slider"
                  />
                </label>
              </div>
            )}

            {(circuitType === 'rl' || circuitType === 'rlc') && (
              <div className="control-group">
                <label>
                  Inductance: {(inductance * 1000).toFixed(2)} mH
                  <input
                    type="range"
                    min="0.01"
                    max="1"
                    step="0.01"
                    value={inductance}
                    onChange={(e) => setInductance(Number(e.target.value))}
                    className="slider"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="chart-section">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={transientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  yAxisId="left"
                  label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Current (mA)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="voltage"
                  stroke="#3b82f6"
                  name="Voltage"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="current"
                  stroke="#ef4444"
                  name="Current"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="analysis-results">
            <h3>Circuit Analysis</h3>
            <div className="results-grid">
              <div className="result-card">
                <span className="result-label">Time Constant (τ):</span>
                <span className="result-value">{(timeConstant * 1000).toFixed(3)} ms</span>
              </div>
              <div className="result-card">
                <span className="result-label">5τ (Settling Time):</span>
                <span className="result-value">{(timeConstant * 5 * 1000).toFixed(3)} ms</span>
              </div>
              <div className="result-card">
                <span className="result-label">Initial Current:</span>
                <span className="result-value">{((voltage / resistance) * 1000).toFixed(2)} mA</span>
              </div>
              <div className="result-card">
                <span className="result-label">Steady-State Voltage:</span>
                <span className="result-value">{voltage} V</span>
              </div>
            </div>
          </div>
        </div>

        <div className="concepts-section">
          <h2>Key Concepts</h2>
          <div className="concepts-grid">
            {concepts.map((concept, idx) => (
              <motion.div
                key={idx}
                className="concept-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3>{concept.title}</h3>
                <p>{concept.description}</p>
                <div className="formulas">
                  {concept.formulas.map((formula, fIdx) => (
                    <code key={fIdx}>{formula}</code>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="reference-section">
          <h2>Important Points</h2>
          <div className="points-grid">
            <div className="point-card">
              <h4>At t = 0⁺</h4>
              <ul>
                <li>Capacitor acts as short circuit (v = 0)</li>
                <li>Inductor acts as open circuit (i = 0)</li>
                <li>Use initial conditions</li>
              </ul>
            </div>

            <div className="point-card">
              <h4>At t = ∞</h4>
              <ul>
                <li>Capacitor acts as open circuit</li>
                <li>Inductor acts as short circuit</li>
                <li>Circuit reaches steady state</li>
              </ul>
            </div>

            <div className="point-card">
              <h4>Time Constants</h4>
              <ul>
                <li>1τ: 63.2% of final value</li>
                <li>2τ: 86.5% of final value</li>
                <li>3τ: 95.0% of final value</li>
                <li>5τ: 99.3% (essentially complete)</li>
              </ul>
            </div>

            <div className="point-card">
              <h4>Solving Steps</h4>
              <ul>
                <li>1. Find initial conditions at t = 0⁺</li>
                <li>2. Find final values at t = ∞</li>
                <li>3. Calculate time constant</li>
                <li>4. Write general solution</li>
                <li>5. Apply boundary conditions</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TransientAnalysisPage;
