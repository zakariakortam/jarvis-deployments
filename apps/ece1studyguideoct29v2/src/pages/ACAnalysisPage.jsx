import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ACAnalysisPage.css';

const ACAnalysisPage = () => {
  const [frequency, setFrequency] = useState(60);
  const [amplitude, setAmplitude] = useState(10);
  const [phase, setPhase] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('lowpass');

  // Generate sine wave data
  const generateWaveData = () => {
    const data = [];
    const omega = 2 * Math.PI * frequency;
    for (let t = 0; t <= 0.05; t += 0.0001) {
      data.push({
        time: t.toFixed(4),
        voltage: amplitude * Math.sin(omega * t + (phase * Math.PI) / 180)
      });
    }
    return data;
  };

  const waveData = generateWaveData();

  const filterTypes = [
    { id: 'lowpass', name: 'Low-Pass Filter', cutoff: '1/(2πRC)' },
    { id: 'highpass', name: 'High-Pass Filter', cutoff: '1/(2πRC)' },
    { id: 'bandpass', name: 'Band-Pass Filter', cutoff: 'f₀ = 1/(2π√LC)' },
    { id: 'bandstop', name: 'Band-Stop Filter', cutoff: 'f₀ = 1/(2π√LC)' }
  ];

  const phasorConcepts = [
    {
      title: 'Phasor Representation',
      description: 'Complex number representation of sinusoidal signals',
      formula: 'V = Vm∠θ = Vm·e^(jθ)'
    },
    {
      title: 'Impedance',
      description: 'AC resistance including reactance',
      formula: 'Z = R + jX = |Z|∠θ'
    },
    {
      title: 'Reactance',
      description: 'Frequency-dependent opposition to current',
      formula: 'XL = ωL, XC = 1/(ωC)'
    },
    {
      title: 'Power Factor',
      description: 'Ratio of real to apparent power',
      formula: 'PF = cos(θ) = P/S'
    }
  ];

  return (
    <div className="ac-analysis-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="page-header">
          <h1>AC Circuit Analysis</h1>
          <p>Phasors, impedance, and frequency response</p>
        </header>

        <div className="content-grid">
          <div className="waveform-section">
            <h2>Sinusoidal Waveform Generator</h2>

            <div className="controls-panel">
              <div className="control-group">
                <label>
                  Frequency: {frequency} Hz
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="slider"
                  />
                </label>
              </div>

              <div className="control-group">
                <label>
                  Amplitude: {amplitude} V
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={amplitude}
                    onChange={(e) => setAmplitude(Number(e.target.value))}
                    className="slider"
                  />
                </label>
              </div>

              <div className="control-group">
                <label>
                  Phase: {phase}°
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={phase}
                    onChange={(e) => setPhase(Number(e.target.value))}
                    className="slider"
                  />
                </label>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={waveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="#3b82f6"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="wave-info">
              <h3>Waveform Properties</h3>
              <div className="properties-grid">
                <div className="property">
                  <span className="label">Peak Voltage:</span>
                  <span className="value">{amplitude} V</span>
                </div>
                <div className="property">
                  <span className="label">RMS Voltage:</span>
                  <span className="value">{(amplitude / Math.sqrt(2)).toFixed(2)} V</span>
                </div>
                <div className="property">
                  <span className="label">Angular Frequency:</span>
                  <span className="value">{(2 * Math.PI * frequency).toFixed(2)} rad/s</span>
                </div>
                <div className="property">
                  <span className="label">Period:</span>
                  <span className="value">{(1 / frequency).toFixed(4)} s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="concepts-section">
            <h2>Key Concepts</h2>
            <div className="concepts-grid">
              {phasorConcepts.map((concept, idx) => (
                <motion.div
                  key={idx}
                  className="concept-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <h3>{concept.title}</h3>
                  <p>{concept.description}</p>
                  <code>{concept.formula}</code>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h2>Filter Analysis</h2>

            <div className="filter-selector">
              {filterTypes.map((filter) => (
                <button
                  key={filter.id}
                  className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            <div className="filter-info">
              <h3>{filterTypes.find(f => f.id === selectedFilter)?.name}</h3>
              <p className="cutoff-formula">
                Cutoff Frequency: {filterTypes.find(f => f.id === selectedFilter)?.cutoff}
              </p>

              <div className="filter-characteristics">
                <h4>Characteristics:</h4>
                <ul>
                  {selectedFilter === 'lowpass' && (
                    <>
                      <li>Passes low frequencies, attenuates high frequencies</li>
                      <li>-20 dB/decade roll-off (first order)</li>
                      <li>Used for noise reduction and anti-aliasing</li>
                      <li>Transfer function: H(jω) = 1 / (1 + jωRC)</li>
                    </>
                  )}
                  {selectedFilter === 'highpass' && (
                    <>
                      <li>Passes high frequencies, attenuates low frequencies</li>
                      <li>+20 dB/decade roll-off (first order)</li>
                      <li>Used for DC blocking and high-frequency emphasis</li>
                      <li>Transfer function: H(jω) = jωRC / (1 + jωRC)</li>
                    </>
                  )}
                  {selectedFilter === 'bandpass' && (
                    <>
                      <li>Passes frequencies within a specific band</li>
                      <li>Attenuates frequencies outside the band</li>
                      <li>Used in radio tuning and audio equalizers</li>
                      <li>Transfer function: H(jω) = jωL / (R + jωL + 1/(jωC))</li>
                    </>
                  )}
                  {selectedFilter === 'bandstop' && (
                    <>
                      <li>Attenuates frequencies within a specific band</li>
                      <li>Passes frequencies outside the band</li>
                      <li>Used for notch filtering and interference rejection</li>
                      <li>Q-factor determines bandwidth of rejection</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="formulas-reference">
            <h2>Important Formulas</h2>
            <div className="formulas-grid">
              <div className="formula-card">
                <h4>Instantaneous Voltage</h4>
                <code>v(t) = Vm·sin(ωt + φ)</code>
              </div>
              <div className="formula-card">
                <h4>RMS Value</h4>
                <code>Vrms = Vm / √2</code>
              </div>
              <div className="formula-card">
                <h4>Capacitive Reactance</h4>
                <code>XC = 1 / (2πfC)</code>
              </div>
              <div className="formula-card">
                <h4>Inductive Reactance</h4>
                <code>XL = 2πfL</code>
              </div>
              <div className="formula-card">
                <h4>Impedance (Series RLC)</h4>
                <code>Z = √(R² + (XL - XC)²)</code>
              </div>
              <div className="formula-card">
                <h4>Resonant Frequency</h4>
                <code>f₀ = 1 / (2π√LC)</code>
              </div>
              <div className="formula-card">
                <h4>Quality Factor</h4>
                <code>Q = ω₀L / R = 1 / (ω₀RC)</code>
              </div>
              <div className="formula-card">
                <h4>Average Power</h4>
                <code>P = Vrms·Irms·cos(θ)</code>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ACAnalysisPage;
