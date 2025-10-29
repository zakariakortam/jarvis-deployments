import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuizPage.css';

const QuizPage = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [answers, setAnswers] = useState([]);

  const quizQuestions = [
    {
      id: 1,
      question: 'What is Ohm\'s Law?',
      options: ['V = IR', 'I = VR', 'R = V/I', 'P = IV'],
      correct: 0,
      explanation: 'Ohm\'s Law states that voltage equals current times resistance: V = IR'
    },
    {
      id: 2,
      question: 'In a series circuit, what remains constant?',
      options: ['Voltage', 'Current', 'Resistance', 'Power'],
      correct: 1,
      explanation: 'In a series circuit, the current is the same through all components'
    },
    {
      id: 3,
      question: 'What is the unit of capacitance?',
      options: ['Henry', 'Farad', 'Ohm', 'Watt'],
      correct: 1,
      explanation: 'Capacitance is measured in Farads (F)'
    },
    {
      id: 4,
      question: 'In an RC circuit, the time constant τ equals:',
      options: ['R + C', 'R × C', 'R / C', 'C / R'],
      correct: 1,
      explanation: 'The time constant τ = RC (resistance times capacitance)'
    },
    {
      id: 5,
      question: 'At resonance in an RLC circuit:',
      options: ['XL = 0', 'XC = 0', 'XL = XC', 'R = 0'],
      correct: 2,
      explanation: 'At resonance, inductive reactance equals capacitive reactance (XL = XC)'
    },
    {
      id: 6,
      question: 'Kirchhoff\'s Current Law states:',
      options: [
        'Sum of voltages in a loop = 0',
        'Sum of currents at a node = 0',
        'Voltage = Current × Resistance',
        'Power = Voltage × Current'
      ],
      correct: 1,
      explanation: 'KCL states that the sum of all currents entering and leaving a node equals zero'
    },
    {
      id: 7,
      question: 'The power factor in AC circuits is:',
      options: ['sin(θ)', 'cos(θ)', 'tan(θ)', 'sec(θ)'],
      correct: 1,
      explanation: 'Power factor = cos(θ), where θ is the phase angle'
    },
    {
      id: 8,
      question: 'A capacitor blocks:',
      options: ['AC current', 'DC current', 'Both AC and DC', 'Neither AC nor DC'],
      correct: 1,
      explanation: 'Capacitors block DC current but allow AC current to pass'
    },
    {
      id: 9,
      question: 'The equivalent resistance of two 100Ω resistors in parallel is:',
      options: ['200Ω', '100Ω', '50Ω', '25Ω'],
      correct: 2,
      explanation: 'For two equal resistors in parallel: Req = R/2 = 100/2 = 50Ω'
    },
    {
      id: 10,
      question: 'RMS voltage relates to peak voltage by:',
      options: ['Vrms = 2Vpeak', 'Vrms = Vpeak/√2', 'Vrms = √2Vpeak', 'Vrms = Vpeak'],
      correct: 1,
      explanation: 'RMS voltage = Peak voltage / √2 ≈ 0.707 × Vpeak'
    }
  ];

  useEffect(() => {
    if (quizStarted && !showResult && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [quizStarted, showResult, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(1800);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correct;

    setAnswers([...answers, {
      questionId: quizQuestions[currentQuestion].id,
      selectedAnswer,
      correct: isCorrect
    }]);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    setShowResult(true);
  };

  const getScorePercentage = () => {
    return Math.round((score / quizQuestions.length) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return { text: 'Excellent!', color: '#10b981' };
    if (percentage >= 75) return { text: 'Good Job!', color: '#3b82f6' };
    if (percentage >= 60) return { text: 'Not Bad!', color: '#f59e0b' };
    return { text: 'Keep Studying!', color: '#ef4444' };
  };

  if (!quizStarted) {
    return (
      <div className="quiz-page">
        <motion.div
          className="quiz-start"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>ECE 100 Quiz</h1>
          <div className="quiz-info">
            <p><strong>Questions:</strong> {quizQuestions.length}</p>
            <p><strong>Time Limit:</strong> 30 minutes</p>
            <p><strong>Passing Score:</strong> 60%</p>
          </div>
          <button className="start-btn" onClick={handleStart}>
            Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (showResult) {
    const scoreMessage = getScoreMessage();
    return (
      <div className="quiz-page">
        <motion.div
          className="quiz-result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ color: scoreMessage.color }}>{scoreMessage.text}</h1>
          <div className="score-circle" style={{ borderColor: scoreMessage.color }}>
            <span className="score-percentage">{getScorePercentage()}%</span>
            <span className="score-fraction">{score}/{quizQuestions.length}</span>
          </div>

          <div className="results-details">
            <h2>Question Review</h2>
            {quizQuestions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer?.correct;

              return (
                <div key={q.id} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <h3>Question {idx + 1}</h3>
                  <p>{q.question}</p>
                  <p className="your-answer">
                    Your answer: {q.options[userAnswer?.selectedAnswer]}
                    {!isCorrect && ` (Correct: ${q.options[q.correct]})`}
                  </p>
                  <p className="explanation">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <button className="restart-btn" onClick={() => setQuizStarted(false)}>
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>Question {currentQuestion + 1} / {quizQuestions.length}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          className="question-card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h2>{question.question}</h2>

          <div className="options-grid">
            {question.options.map((option, idx) => (
              <motion.button
                key={idx}
                className={`option-btn ${selectedAnswer === idx ? 'selected' : ''}`}
                onClick={() => handleAnswer(idx)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
              </motion.button>
            ))}
          </div>

          <button
            className="next-btn"
            onClick={handleNext}
            disabled={selectedAnswer === null}
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
