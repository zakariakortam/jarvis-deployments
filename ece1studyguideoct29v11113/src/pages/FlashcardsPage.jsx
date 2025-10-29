import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import './FlashcardsPage.css';

const FlashcardsPage = () => {
  const { flashcardProgress, updateFlashcardProgress } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState('review'); // review, learn, master

  const flashcards = [
    // Circuit Topology
    {
      id: 1,
      category: 'topology',
      difficulty: 'easy',
      question: 'What is the formula for total resistance in a series circuit?',
      answer: 'Rtotal = R1 + R2 + R3 + ... + Rn',
      hint: 'In series, resistances add directly',
      relatedTopics: ['Series Circuits', 'Ohms Law']
    },
    {
      id: 2,
      category: 'topology',
      difficulty: 'easy',
      question: 'What is the formula for total resistance in a parallel circuit?',
      answer: '1/Rtotal = 1/R1 + 1/R2 + 1/R3 + ... + 1/Rn',
      hint: 'In parallel, the reciprocals add',
      relatedTopics: ['Parallel Circuits', 'Equivalent Resistance']
    },
    {
      id: 3,
      category: 'topology',
      difficulty: 'medium',
      question: 'State Kirchhoffs Voltage Law (KVL)',
      answer: 'The sum of all voltages around any closed loop in a circuit equals zero: ΣV = 0',
      hint: 'Think about energy conservation',
      relatedTopics: ['KVL', 'Mesh Analysis']
    },
    {
      id: 4,
      category: 'topology',
      difficulty: 'medium',
      question: 'State Kirchhoffs Current Law (KCL)',
      answer: 'The sum of currents entering a node equals the sum of currents leaving: ΣIin = ΣIout',
      hint: 'Conservation of charge at a node',
      relatedTopics: ['KCL', 'Nodal Analysis']
    },
    {
      id: 5,
      category: 'topology',
      difficulty: 'hard',
      question: 'What is the Thevenin equivalent circuit?',
      answer: 'Any linear circuit with two terminals can be replaced by a voltage source (Vth) in series with a resistance (Rth)',
      hint: 'Simplification technique for complex circuits',
      relatedTopics: ['Thevenin Theorem', 'Circuit Simplification']
    },

    // AC Analysis
    {
      id: 6,
      category: 'ac',
      difficulty: 'easy',
      question: 'What is the relationship between peak voltage (Vm) and RMS voltage (Vrms)?',
      answer: 'Vrms = Vm / √2 ≈ 0.707 × Vm',
      hint: 'RMS is the effective DC equivalent',
      relatedTopics: ['AC Voltage', 'RMS Values']
    },
    {
      id: 7,
      category: 'ac',
      difficulty: 'medium',
      question: 'What is the formula for capacitive reactance?',
      answer: 'XC = 1 / (2πfC) where f is frequency and C is capacitance',
      hint: 'Reactance decreases with frequency',
      relatedTopics: ['Capacitive Reactance', 'AC Circuits']
    },
    {
      id: 8,
      category: 'ac',
      difficulty: 'medium',
      question: 'What is the formula for inductive reactance?',
      answer: 'XL = 2πfL where f is frequency and L is inductance',
      hint: 'Reactance increases with frequency',
      relatedTopics: ['Inductive Reactance', 'AC Circuits']
    },
    {
      id: 9,
      category: 'ac',
      difficulty: 'hard',
      question: 'What is the resonant frequency of an RLC circuit?',
      answer: 'f₀ = 1 / (2π√LC) where XL = XC',
      hint: 'At resonance, inductive and capacitive reactances cancel',
      relatedTopics: ['Resonance', 'RLC Circuits']
    },
    {
      id: 10,
      category: 'ac',
      difficulty: 'hard',
      question: 'Define power factor and its formula',
      answer: 'Power factor = cos(θ) = P/S = Real Power / Apparent Power, where θ is the phase angle',
      hint: 'Measures how effectively power is being used',
      relatedTopics: ['Power Factor', 'AC Power']
    },

    // Transient Analysis
    {
      id: 11,
      category: 'transient',
      difficulty: 'easy',
      question: 'What is the time constant for an RC circuit?',
      answer: 'τ = RC (in seconds)',
      hint: 'Product of resistance and capacitance',
      relatedTopics: ['Time Constant', 'RC Circuits']
    },
    {
      id: 12,
      category: 'transient',
      difficulty: 'easy',
      question: 'What is the time constant for an RL circuit?',
      answer: 'τ = L/R (in seconds)',
      hint: 'Inductance divided by resistance',
      relatedTopics: ['Time Constant', 'RL Circuits']
    },
    {
      id: 13,
      category: 'transient',
      difficulty: 'medium',
      question: 'What percentage of the final value is reached after 1 time constant?',
      answer: '63.2% of the final value',
      hint: '1 - 1/e ≈ 0.632',
      relatedTopics: ['Exponential Response', 'Time Constants']
    },
    {
      id: 14,
      category: 'transient',
      difficulty: 'medium',
      question: 'How does a capacitor behave at t=0⁺ and t=∞?',
      answer: 'At t=0⁺: acts as a short circuit (v=0). At t=∞: acts as an open circuit (steady state)',
      hint: 'Think about initial and final conditions',
      relatedTopics: ['Initial Conditions', 'Capacitor Behavior']
    },
    {
      id: 15,
      category: 'transient',
      difficulty: 'hard',
      question: 'What are the three types of damping in RLC circuits?',
      answer: 'Underdamped (ζ<1, oscillatory), Critically damped (ζ=1, fastest without overshoot), Overdamped (ζ>1, slow)',
      hint: 'Depends on damping ratio ζ',
      relatedTopics: ['Damping', 'Second-Order Circuits']
    },

    // Components
    {
      id: 16,
      category: 'components',
      difficulty: 'easy',
      question: 'What is Ohms Law?',
      answer: 'V = IR (Voltage = Current × Resistance)',
      hint: 'Most fundamental relationship in circuits',
      relatedTopics: ['Ohms Law', 'Basic Circuits']
    },
    {
      id: 17,
      category: 'components',
      difficulty: 'medium',
      question: 'What is the i-v relationship for a capacitor?',
      answer: 'i = C(dv/dt) - current is proportional to rate of voltage change',
      hint: 'Capacitors resist voltage changes',
      relatedTopics: ['Capacitors', 'Component Relationships']
    },
    {
      id: 18,
      category: 'components',
      difficulty: 'medium',
      question: 'What is the i-v relationship for an inductor?',
      answer: 'v = L(di/dt) - voltage is proportional to rate of current change',
      hint: 'Inductors resist current changes',
      relatedTopics: ['Inductors', 'Component Relationships']
    },
    {
      id: 19,
      category: 'components',
      difficulty: 'hard',
      question: 'What is the energy stored in a capacitor?',
      answer: 'E = ½CV² (in joules)',
      hint: 'Energy depends on capacitance and voltage squared',
      relatedTopics: ['Energy Storage', 'Capacitors']
    },
    {
      id: 20,
      category: 'components',
      difficulty: 'hard',
      question: 'What is the energy stored in an inductor?',
      answer: 'E = ½LI² (in joules)',
      hint: 'Energy depends on inductance and current squared',
      relatedTopics: ['Energy Storage', 'Inductors']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Cards', count: flashcards.length },
    { id: 'topology', name: 'Circuit Topology', count: flashcards.filter(c => c.category === 'topology').length },
    { id: 'ac', name: 'AC Analysis', count: flashcards.filter(c => c.category === 'ac').length },
    { id: 'transient', name: 'Transient Analysis', count: flashcards.filter(c => c.category === 'transient').length },
    { id: 'components', name: 'Components', count: flashcards.filter(c => c.category === 'components').length }
  ];

  const filteredCards = selectedCategory === 'all'
    ? flashcards
    : flashcards.filter(card => card.category === selectedCategory);

  const currentCard = filteredCards[currentCardIndex];
  const progress = (currentCardIndex + 1) / filteredCards.length * 100;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(filteredCards.length - 1);
    }
  };

  const handleConfidence = (level) => {
    updateFlashcardProgress(currentCard.id, level);
    setTimeout(handleNext, 300);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="flashcards-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="page-header">
          <h1>Flashcards</h1>
          <p>Master ECE 100 concepts with spaced repetition</p>
        </header>

        <div className="study-controls">
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
              >
                {cat.name}
                <span className="count">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="mode-selector">
            <button
              className={`mode-btn ${studyMode === 'review' ? 'active' : ''}`}
              onClick={() => setStudyMode('review')}
            >
              Review All
            </button>
            <button
              className={`mode-btn ${studyMode === 'learn' ? 'active' : ''}`}
              onClick={() => setStudyMode('learn')}
            >
              Learn New
            </button>
            <button
              className={`mode-btn ${studyMode === 'master' ? 'active' : ''}`}
              onClick={() => setStudyMode('master')}
            >
              Master Mode
            </button>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span className="progress-text">
            {currentCardIndex + 1} / {filteredCards.length}
          </span>
        </div>

        <div className="flashcard-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flashcard-wrapper"
            >
              <div
                className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <div className="card-header">
                      <span
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(currentCard?.difficulty) }}
                      >
                        {currentCard?.difficulty}
                      </span>
                      <span className="card-number">Card {currentCardIndex + 1}</span>
                    </div>

                    <div className="card-content">
                      <h2>Question</h2>
                      <p className="question-text">{currentCard?.question}</p>
                    </div>

                    <div className="card-footer">
                      <p className="hint">💡 Hint: {currentCard?.hint}</p>
                      <p className="tap-instruction">Tap to reveal answer</p>
                    </div>
                  </div>

                  <div className="flashcard-back">
                    <div className="card-header">
                      <span
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(currentCard?.difficulty) }}
                      >
                        {currentCard?.difficulty}
                      </span>
                      <span className="card-number">Card {currentCardIndex + 1}</span>
                    </div>

                    <div className="card-content">
                      <h2>Answer</h2>
                      <p className="answer-text">{currentCard?.answer}</p>
                    </div>

                    <div className="card-footer">
                      <div className="related-topics">
                        <strong>Related:</strong>
                        {currentCard?.relatedTopics.map((topic, idx) => (
                          <span key={idx} className="topic-tag">{topic}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="navigation-controls">
            <button className="nav-btn prev-btn" onClick={handlePrevious}>
              ← Previous
            </button>

            {isFlipped && (
              <div className="confidence-buttons">
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="confidence-btn hard"
                  onClick={() => handleConfidence('hard')}
                >
                  😰 Hard
                </motion.button>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="confidence-btn medium"
                  onClick={() => handleConfidence('medium')}
                >
                  🤔 Medium
                </motion.button>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="confidence-btn easy"
                  onClick={() => handleConfidence('easy')}
                >
                  😊 Easy
                </motion.button>
              </div>
            )}

            <button className="nav-btn next-btn" onClick={handleNext}>
              Next →
            </button>
          </div>
        </div>

        <div className="keyboard-shortcuts">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcuts-grid">
            <div className="shortcut">
              <kbd>Space</kbd>
              <span>Flip card</span>
            </div>
            <div className="shortcut">
              <kbd>←</kbd>
              <span>Previous</span>
            </div>
            <div className="shortcut">
              <kbd>→</kbd>
              <span>Next</span>
            </div>
            <div className="shortcut">
              <kbd>1</kbd>
              <span>Hard</span>
            </div>
            <div className="shortcut">
              <kbd>2</kbd>
              <span>Medium</span>
            </div>
            <div className="shortcut">
              <kbd>3</kbd>
              <span>Easy</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlashcardsPage;
