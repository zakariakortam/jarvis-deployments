import { useState } from 'react';
import { motion } from 'framer-motion';
import './PracticeProblemsPage.css';

const PracticeProblemsPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showSolution, setShowSolution] = useState({});

  const problems = [
    {
      id: 1,
      difficulty: 'easy',
      category: 'Series Circuits',
      problem: 'Three resistors R1=100Ω, R2=220Ω, and R3=330Ω are connected in series with a 12V battery. Calculate:\na) Total resistance\nb) Total current\nc) Voltage across each resistor',
      solution: {
        steps: [
          'a) Rtotal = R1 + R2 + R3 = 100 + 220 + 330 = 650Ω',
          'b) I = V/R = 12V / 650Ω = 18.46mA',
          'c) V1 = I×R1 = 18.46mA × 100Ω = 1.85V',
          '   V2 = I×R2 = 18.46mA × 220Ω = 4.06V',
          '   V3 = I×R3 = 18.46mA × 330Ω = 6.09V'
        ],
        answer: 'Rtotal=650Ω, I=18.46mA, V1=1.85V, V2=4.06V, V3=6.09V'
      }
    },
    {
      id: 2,
      difficulty: 'easy',
      category: 'Parallel Circuits',
      problem: 'Two resistors R1=1kΩ and R2=2kΩ are connected in parallel with a 10V source. Find:\na) Equivalent resistance\nb) Current through each resistor\nc) Total current',
      solution: {
        steps: [
          'a) 1/Req = 1/R1 + 1/R2 = 1/1000 + 1/2000 = 3/2000',
          '   Req = 2000/3 = 666.67Ω',
          'b) I1 = V/R1 = 10V / 1000Ω = 10mA',
          '   I2 = V/R2 = 10V / 2000Ω = 5mA',
          'c) Itotal = I1 + I2 = 10mA + 5mA = 15mA'
        ],
        answer: 'Req=666.67Ω, I1=10mA, I2=5mA, Itotal=15mA'
      }
    },
    {
      id: 3,
      difficulty: 'medium',
      category: 'Voltage Divider',
      problem: 'Design a voltage divider to get 3.3V output from a 5V source. The load draws 10mA. Choose appropriate resistor values.',
      solution: {
        steps: [
          'Using voltage divider: Vout = Vin × (R2/(R1+R2))',
          '3.3 = 5 × (R2/(R1+R2))',
          'R2/(R1+R2) = 0.66',
          'R2 = 0.66(R1+R2)',
          'R2 = 0.66R1 + 0.66R2',
          '0.34R2 = 0.66R1',
          'R2/R1 = 1.94',
          'For 10mA load, choose R2 = 330Ω (standard value)',
          'Then R1 = R2/1.94 = 170Ω (use 180Ω standard value)'
        ],
        answer: 'R1 = 180Ω, R2 = 330Ω (using standard resistor values)'
      }
    },
    {
      id: 4,
      difficulty: 'medium',
      category: 'RC Circuits',
      problem: 'An RC circuit has R=10kΩ and C=100μF. A 12V step input is applied at t=0. Find:\na) Time constant\nb) Voltage across capacitor at t=1s\nc) Time to reach 95% of final voltage',
      solution: {
        steps: [
          'a) τ = RC = 10kΩ × 100μF = 1 second',
          'b) vc(t) = Vf(1 - e^(-t/τ))',
          '   vc(1) = 12(1 - e^(-1/1)) = 12(1 - 0.368) = 7.58V',
          'c) 0.95 = 1 - e^(-t/τ)',
          '   e^(-t/τ) = 0.05',
          '   -t/τ = ln(0.05) = -2.996',
          '   t = 2.996τ = 2.996 seconds'
        ],
        answer: 'τ=1s, vc(1s)=7.58V, t(95%)=3s'
      }
    },
    {
      id: 5,
      difficulty: 'hard',
      category: 'Thevenin Equivalent',
      problem: 'Find the Thevenin equivalent circuit as seen from terminals A-B:\n- 12V source in series with 1kΩ\n- 6V source in series with 2kΩ\n- Both branches connected in parallel between A-B',
      solution: {
        steps: [
          'Step 1: Find Vth (open circuit voltage)',
          'Using mesh analysis or superposition:',
          'Vth = (12V×2kΩ + 6V×1kΩ)/(1kΩ + 2kΩ)',
          'Vth = (24k + 6k)/3k = 30/3 = 10V',
          'Step 2: Find Rth (turn off sources)',
          'Short voltage sources: Rth = 1kΩ || 2kΩ',
          'Rth = (1k × 2k)/(1k + 2k) = 2k/3 = 666.67Ω',
          'Thevenin equivalent: 10V source + 666.67Ω'
        ],
        answer: 'Vth = 10V, Rth = 666.67Ω'
      }
    },
    {
      id: 6,
      difficulty: 'hard',
      category: 'AC Analysis',
      problem: 'An RLC series circuit has R=50Ω, L=10mH, C=100μF. Find:\na) Resonant frequency\nb) Quality factor Q\nc) Bandwidth',
      solution: {
        steps: [
          'a) f0 = 1/(2π√LC)',
          '   f0 = 1/(2π√(10mH × 100μF))',
          '   f0 = 1/(2π√(10^-6)) = 1/(2π × 10^-3)',
          '   f0 = 159.15 Hz',
          'b) Q = ω0L/R = 2πf0L/R',
          '   Q = (2π × 159.15 × 0.01)/50',
          '   Q = 0.2 (low Q, heavily damped)',
          'c) BW = f0/Q = 159.15/0.2 = 795.75 Hz'
        ],
        answer: 'f0=159.15Hz, Q=0.2, BW=795.75Hz'
      }
    }
  ];

  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredProblems = selectedDifficulty === 'all'
    ? problems
    : problems.filter(p => p.difficulty === selectedDifficulty);

  const toggleSolution = (id) => {
    setShowSolution(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="practice-problems-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="page-header">
          <h1>Practice Problems</h1>
          <p>Solve problems to reinforce your understanding</p>
        </header>

        <div className="difficulty-filter">
          {difficulties.map((diff) => (
            <button
              key={diff}
              className={`filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(diff)}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>

        <div className="problems-grid">
          {filteredProblems.map((problem, idx) => (
            <motion.div
              key={problem.id}
              className="problem-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="problem-header">
                <span className={`difficulty-badge ${problem.difficulty}`}>
                  {problem.difficulty}
                </span>
                <span className="category-badge">{problem.category}</span>
              </div>

              <div className="problem-content">
                <h3>Problem {problem.id}</h3>
                <p className="problem-text">{problem.problem}</p>
              </div>

              <button
                className="solution-toggle"
                onClick={() => toggleSolution(problem.id)}
              >
                {showSolution[problem.id] ? 'Hide Solution' : 'Show Solution'}
              </button>

              {showSolution[problem.id] && (
                <motion.div
                  className="solution-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <h4>Solution:</h4>
                  {problem.solution.steps.map((step, sIdx) => (
                    <p key={sIdx} className="solution-step">{step}</p>
                  ))}
                  <div className="final-answer">
                    <strong>Answer: </strong>{problem.solution.answer}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PracticeProblemsPage;
