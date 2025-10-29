import { useState } from 'react';
import { motion } from 'framer-motion';
import './FormulaSheetPage.css';

const FormulaSheetPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const formulas = [
    // Basic Circuit Laws
    {
      category: 'basic',
      name: "Ohm's Law",
      formula: 'V = I × R',
      variables: 'V: Voltage (V), I: Current (A), R: Resistance (Ω)',
      description: 'Fundamental relationship between voltage, current, and resistance'
    },
    {
      category: 'basic',
      name: 'Power',
      formula: 'P = V × I = I²R = V²/R',
      variables: 'P: Power (W), V: Voltage (V), I: Current (A), R: Resistance (Ω)',
      description: 'Power dissipation in resistive circuits'
    },
    {
      category: 'basic',
      name: 'Kirchhoffs Voltage Law (KVL)',
      formula: 'ΣV = 0',
      variables: 'Sum of voltages around any closed loop equals zero',
      description: 'Energy conservation in electrical circuits'
    },
    {
      category: 'basic',
      name: 'Kirchhoffs Current Law (KCL)',
      formula: 'ΣI_in = ΣI_out',
      variables: 'Sum of currents entering = Sum of currents leaving',
      description: 'Charge conservation at circuit nodes'
    },

    // Series and Parallel
    {
      category: 'topology',
      name: 'Series Resistance',
      formula: 'R_total = R₁ + R₂ + R₃ + ... + Rₙ',
      variables: 'R_total: Total resistance, R₁,R₂,... : Individual resistances',
      description: 'Resistances add directly in series'
    },
    {
      category: 'topology',
      name: 'Parallel Resistance',
      formula: '1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ... + 1/Rₙ',
      variables: 'For two resistors: R_total = (R₁×R₂)/(R₁+R₂)',
      description: 'Reciprocals of resistances add in parallel'
    },
    {
      category: 'topology',
      name: 'Voltage Divider',
      formula: 'V_out = V_in × (R₂/(R₁+R₂))',
      variables: 'V_out: Output voltage, V_in: Input voltage',
      description: 'Voltage distribution in series resistors'
    },
    {
      category: 'topology',
      name: 'Current Divider',
      formula: 'I₁ = I_total × (R₂/(R₁+R₂))',
      variables: 'I₁: Current through R₁, I_total: Total current',
      description: 'Current distribution in parallel resistors'
    },

    // Thevenin and Norton
    {
      category: 'topology',
      name: 'Thevenin Voltage',
      formula: 'V_th = V_open_circuit',
      variables: 'V_th: Thevenin voltage at open terminals',
      description: 'Open circuit voltage across terminals'
    },
    {
      category: 'topology',
      name: 'Thevenin Resistance',
      formula: 'R_th = V_th / I_sc',
      variables: 'R_th: Thevenin resistance, I_sc: Short circuit current',
      description: 'Equivalent resistance with sources off'
    },
    {
      category: 'topology',
      name: 'Norton Current',
      formula: 'I_N = I_short_circuit',
      variables: 'I_N: Norton current through shorted terminals',
      description: 'Short circuit current through terminals'
    },

    // Capacitors
    {
      category: 'components',
      name: 'Capacitor i-v Relationship',
      formula: 'i = C(dv/dt)',
      variables: 'i: Current (A), C: Capacitance (F), dv/dt: Rate of voltage change',
      description: 'Current through a capacitor'
    },
    {
      category: 'components',
      name: 'Capacitor Energy',
      formula: 'E = ½CV²',
      variables: 'E: Energy (J), C: Capacitance (F), V: Voltage (V)',
      description: 'Energy stored in a capacitor'
    },
    {
      category: 'components',
      name: 'Series Capacitance',
      formula: '1/C_total = 1/C₁ + 1/C₂ + ... + 1/Cₙ',
      variables: 'Reciprocals add in series (opposite of resistors)',
      description: 'Capacitors in series'
    },
    {
      category: 'components',
      name: 'Parallel Capacitance',
      formula: 'C_total = C₁ + C₂ + ... + Cₙ',
      variables: 'Capacitances add directly in parallel',
      description: 'Capacitors in parallel'
    },

    // Inductors
    {
      category: 'components',
      name: 'Inductor i-v Relationship',
      formula: 'v = L(di/dt)',
      variables: 'v: Voltage (V), L: Inductance (H), di/dt: Rate of current change',
      description: 'Voltage across an inductor'
    },
    {
      category: 'components',
      name: 'Inductor Energy',
      formula: 'E = ½LI²',
      variables: 'E: Energy (J), L: Inductance (H), I: Current (A)',
      description: 'Energy stored in an inductor'
    },
    {
      category: 'components',
      name: 'Series Inductance',
      formula: 'L_total = L₁ + L₂ + ... + Lₙ',
      variables: 'Inductances add directly in series',
      description: 'Inductors in series'
    },

    // AC Analysis
    {
      category: 'ac',
      name: 'RMS Voltage',
      formula: 'V_rms = V_peak / √2 ≈ 0.707 V_peak',
      variables: 'V_rms: RMS (effective) voltage, V_peak: Peak voltage',
      description: 'Root mean square (effective) voltage'
    },
    {
      category: 'ac',
      name: 'Capacitive Reactance',
      formula: 'X_C = 1/(2πfC) = 1/(ωC)',
      variables: 'X_C: Capacitive reactance (Ω), f: Frequency (Hz), C: Capacitance (F)',
      description: 'AC opposition by capacitor (decreases with frequency)'
    },
    {
      category: 'ac',
      name: 'Inductive Reactance',
      formula: 'X_L = 2πfL = ωL',
      variables: 'X_L: Inductive reactance (Ω), f: Frequency (Hz), L: Inductance (H)',
      description: 'AC opposition by inductor (increases with frequency)'
    },
    {
      category: 'ac',
      name: 'Impedance',
      formula: 'Z = R + jX = |Z|∠θ',
      variables: 'Z: Impedance, R: Resistance, X: Reactance, θ: Phase angle',
      description: 'Total AC opposition (complex number)'
    },
    {
      category: 'ac',
      name: 'Series RLC Impedance',
      formula: '|Z| = √(R² + (X_L - X_C)²)',
      variables: '|Z|: Magnitude of impedance',
      description: 'Impedance magnitude in series RLC circuit'
    },
    {
      category: 'ac',
      name: 'Resonant Frequency',
      formula: 'f₀ = 1/(2π√(LC))',
      variables: 'f₀: Resonant frequency (Hz), L: Inductance (H), C: Capacitance (F)',
      description: 'Frequency at which X_L = X_C'
    },
    {
      category: 'ac',
      name: 'Quality Factor',
      formula: 'Q = ω₀L/R = 1/(ω₀RC)',
      variables: 'Q: Quality factor (dimensionless), ω₀: Resonant angular frequency',
      description: 'Measure of circuit selectivity/damping'
    },
    {
      category: 'ac',
      name: 'Power Factor',
      formula: 'PF = cos(θ) = P/S',
      variables: 'PF: Power factor, θ: Phase angle, P: Real power, S: Apparent power',
      description: 'Ratio of real to apparent power'
    },
    {
      category: 'ac',
      name: 'Average Power',
      formula: 'P = V_rms × I_rms × cos(θ)',
      variables: 'P: Average (real) power (W), θ: Phase angle',
      description: 'Real power dissipated in AC circuits'
    },

    // Transient Analysis
    {
      category: 'transient',
      name: 'RC Time Constant',
      formula: 'τ = RC',
      variables: 'τ: Time constant (s), R: Resistance (Ω), C: Capacitance (F)',
      description: 'Time to reach 63.2% of final value'
    },
    {
      category: 'transient',
      name: 'RL Time Constant',
      formula: 'τ = L/R',
      variables: 'τ: Time constant (s), L: Inductance (H), R: Resistance (Ω)',
      description: 'Time to reach 63.2% of final value'
    },
    {
      category: 'transient',
      name: 'RC Charging',
      formula: 'v_C(t) = V_f(1 - e^(-t/τ))',
      variables: 'v_C: Capacitor voltage, V_f: Final voltage, t: Time',
      description: 'Capacitor voltage during charging'
    },
    {
      category: 'transient',
      name: 'RC Discharging',
      formula: 'v_C(t) = V_i × e^(-t/τ)',
      variables: 'v_C: Capacitor voltage, V_i: Initial voltage, t: Time',
      description: 'Capacitor voltage during discharging'
    },
    {
      category: 'transient',
      name: 'RL Current Rise',
      formula: 'i_L(t) = I_f(1 - e^(-t/τ))',
      variables: 'i_L: Inductor current, I_f: Final current, t: Time',
      description: 'Inductor current during energizing'
    },
    {
      category: 'transient',
      name: 'Damping Ratio',
      formula: 'ζ = R/(2√(L/C))',
      variables: 'ζ: Damping ratio, R: Resistance, L: Inductance, C: Capacitance',
      description: 'Determines response type in RLC circuits'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Formulas' },
    { id: 'basic', name: 'Basic Laws' },
    { id: 'topology', name: 'Circuit Topology' },
    { id: 'components', name: 'Components' },
    { id: 'ac', name: 'AC Analysis' },
    { id: 'transient', name: 'Transient Analysis' }
  ];

  const filteredFormulas = formulas.filter(f => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="formula-sheet-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="page-header">
          <h1>Formula Sheet</h1>
          <p>Quick reference for all ECE 100 formulas</p>
        </header>

        <div className="controls-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search formulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="formulas-grid">
          {filteredFormulas.map((formula, idx) => (
            <motion.div
              key={idx}
              className="formula-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3>{formula.name}</h3>
              <div className="formula-box">
                <code>{formula.formula}</code>
              </div>
              <p className="variables">{formula.variables}</p>
              <p className="description">{formula.description}</p>
            </motion.div>
          ))}
        </div>

        {filteredFormulas.length === 0 && (
          <div className="no-results">
            <p>No formulas found matching your search.</p>
          </div>
        )}

        <div className="print-info">
          <button className="print-btn" onClick={() => window.print()}>
            🖨️ Print Formula Sheet
          </button>
          <p>Tip: Use Ctrl+P or Cmd+P to print this reference sheet for quick access during study!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default FormulaSheetPage;
