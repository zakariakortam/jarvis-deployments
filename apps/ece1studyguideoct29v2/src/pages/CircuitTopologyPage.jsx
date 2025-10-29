import { useState } from 'react';
import { motion } from 'framer-motion';
import CircuitVisualizer from '../components/CircuitVisualizer';
import './CircuitTopologyPage.css';

const CircuitTopologyPage = () => {
  const [selectedTopic, setSelectedTopic] = useState('series-parallel');

  const topics = [
    {
      id: 'series-parallel',
      title: 'Series and Parallel Circuits',
      description: 'Understanding basic circuit configurations',
      concepts: [
        'Series circuits: Same current, voltage divides',
        'Parallel circuits: Same voltage, current divides',
        'Equivalent resistance calculations',
        'Voltage and current division rules'
      ],
      formulas: [
        { name: 'Series Resistance', formula: 'Req = R1 + R2 + R3 + ...' },
        { name: 'Parallel Resistance', formula: '1/Req = 1/R1 + 1/R2 + 1/R3 + ...' },
        { name: 'Voltage Divider', formula: 'Vout = Vin × (R2 / (R1 + R2))' },
        { name: 'Current Divider', formula: 'I1 = Itotal × (R2 / (R1 + R2))' }
      ]
    },
    {
      id: 'mesh-nodal',
      title: 'Mesh and Nodal Analysis',
      description: 'Systematic circuit analysis methods',
      concepts: [
        'Mesh analysis: KVL for loop currents',
        'Nodal analysis: KCL for node voltages',
        'Reference node selection',
        'Super mesh and super node techniques'
      ],
      formulas: [
        { name: 'KVL', formula: 'Σ Voltages around loop = 0' },
        { name: 'KCL', formula: 'Σ Currents at node = 0' },
        { name: 'Mesh Current', formula: 'V = Imesh × R' },
        { name: 'Node Voltage', formula: '(V1 - V2) / R = I' }
      ]
    },
    {
      id: 'thevenin-norton',
      title: 'Thevenin and Norton Theorems',
      description: 'Circuit simplification techniques',
      concepts: [
        'Thevenin equivalent: Voltage source + series resistance',
        'Norton equivalent: Current source + parallel resistance',
        'Source transformation',
        'Load analysis and maximum power transfer'
      ],
      formulas: [
        { name: 'Thevenin Voltage', formula: 'Vth = Open circuit voltage' },
        { name: 'Thevenin Resistance', formula: 'Rth = Vth / Isc' },
        { name: 'Norton Current', formula: 'In = Short circuit current' },
        { name: 'Norton Resistance', formula: 'Rn = Rth' }
      ]
    },
    {
      id: 'superposition',
      title: 'Superposition Theorem',
      description: 'Linear circuit analysis with multiple sources',
      concepts: [
        'Turn off all sources except one',
        'Calculate contribution of each source',
        'Sum all contributions',
        'Only valid for linear circuits'
      ],
      formulas: [
        { name: 'Total Response', formula: 'Vtotal = V1 + V2 + ... + Vn' },
        { name: 'Turn off voltage source', formula: 'Replace with short circuit' },
        { name: 'Turn off current source', formula: 'Replace with open circuit' }
      ]
    }
  ];

  const currentTopic = topics.find(t => t.id === selectedTopic);

  return (
    <div className="circuit-topology-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="page-header">
          <h1>Circuit Topology</h1>
          <p>Interactive circuit analysis and visualization</p>
        </header>

        <div className="topic-selector">
          {topics.map((topic) => (
            <motion.button
              key={topic.id}
              className={`topic-btn ${selectedTopic === topic.id ? 'active' : ''}`}
              onClick={() => setSelectedTopic(topic.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {topic.title}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={selectedTopic}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="topic-content"
        >
          <div className="topic-info">
            <h2>{currentTopic.title}</h2>
            <p className="topic-description">{currentTopic.description}</p>

            <div className="concepts-grid">
              <div className="concepts-section">
                <h3>Key Concepts</h3>
                <ul>
                  {currentTopic.concepts.map((concept, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      {concept}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="formulas-section">
                <h3>Important Formulas</h3>
                <div className="formulas-list">
                  {currentTopic.formulas.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="formula-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <h4>{item.name}</h4>
                      <code>{item.formula}</code>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <CircuitVisualizer topicId={selectedTopic} />

          <div className="practice-section">
            <h3>Practice Problems</h3>
            <div className="problem-cards">
              <div className="problem-card">
                <h4>Problem 1</h4>
                <p>
                  Calculate the equivalent resistance of three resistors in series:
                  R1 = 100Ω, R2 = 220Ω, R3 = 330Ω
                </p>
                <button className="show-solution-btn">Show Solution</button>
              </div>

              <div className="problem-card">
                <h4>Problem 2</h4>
                <p>
                  Find the voltage across R2 in a voltage divider with Vin = 12V,
                  R1 = 1kΩ, R2 = 2kΩ
                </p>
                <button className="show-solution-btn">Show Solution</button>
              </div>

              <div className="problem-card">
                <h4>Problem 3</h4>
                <p>
                  Calculate the current through each resistor in a parallel circuit
                  with Vtotal = 5V, R1 = 100Ω, R2 = 200Ω
                </p>
                <button className="show-solution-btn">Show Solution</button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CircuitTopologyPage;
