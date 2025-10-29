import { useState } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const CircuitVisualizer = ({ circuitType }) => {
  const [showDetails, setShowDetails] = useState(false)

  const circuits = {
    rlc_lowpass: {
      name: 'RLC Low-Pass Filter',
      svg: (
        <svg viewBox="0 0 400 200" className="w-full h-64">
          {/* Input */}
          <text x="10" y="105" className="circuit-label">
            V_in
          </text>
          <line x1="40" y1="100" x2="80" y2="100" className="circuit-element" />

          {/* Resistor */}
          <rect x="80" y="85" width="40" height="30" className="circuit-element" />
          <text x="90" y="80" className="circuit-label text-xs">
            R
          </text>

          {/* Connection */}
          <line x1="120" y1="100" x2="160" y2="100" className="circuit-element" />

          {/* Inductor */}
          <path
            d="M 160 100 Q 170 80, 180 100 Q 190 120, 200 100"
            className="circuit-element"
          />
          <text x="165" y="80" className="circuit-label text-xs">
            L
          </text>

          {/* Connection to capacitor */}
          <line x1="200" y1="100" x2="240" y2="100" className="circuit-element" />
          <circle cx="240" cy="100" r="3" className="circuit-node" />

          {/* Capacitor */}
          <line x1="240" y1="100" x2="240" y2="130" className="circuit-element" />
          <line x1="235" y1="130" x2="245" y2="130" className="circuit-element" />
          <line x1="235" y1="135" x2="245" y2="135" className="circuit-element" />
          <line x1="240" y1="135" x2="240" y2="160" className="circuit-element" />
          <text x="250" y="125" className="circuit-label text-xs">
            C
          </text>

          {/* Output */}
          <line x1="240" y1="100" x2="280" y2="100" className="circuit-element" />
          <text x="290" y="105" className="circuit-label">
            V_out
          </text>

          {/* Ground */}
          <line x1="40" y1="160" x2="280" y2="160" className="circuit-element" />
          <line x1="240" y1="160" x2="240" y2="160" className="circuit-element" />
          <line x1="230" y1="165" x2="250" y2="165" className="circuit-element" />
          <line x1="235" y1="170" x2="245" y2="170" className="circuit-element" />
          <line x1="240" y1="175" x2="240" y2="175" className="circuit-element" />

          {/* Return path */}
          <line x1="40" y1="100" x2="40" y2="160" className="circuit-element" />
        </svg>
      ),
      description:
        'A passive filter consisting of a resistor, inductor, and capacitor that attenuates high frequencies.',
      transferFunction: 'H(s) = \\frac{1}{LCs^2 + RCs + 1}',
      keyPoints: [
        'Output taken across capacitor',
        'Second-order system with natural frequency ω₀ = 1/√(LC)',
        'Damping factor ζ = R/(2√(L/C))',
        'Roll-off rate: -40 dB/decade after cutoff',
      ],
    },
    rlc_highpass: {
      name: 'RLC High-Pass Filter',
      svg: (
        <svg viewBox="0 0 400 200" className="w-full h-64">
          {/* Input */}
          <text x="10" y="105" className="circuit-label">
            V_in
          </text>
          <line x1="40" y1="100" x2="80" y2="100" className="circuit-element" />

          {/* Capacitor */}
          <line x1="80" y1="100" x2="85" y2="100" className="circuit-element" />
          <line x1="85" y1="95" x2="85" y2="105" className="circuit-element" />
          <line x1="90" y1="95" x2="90" y2="105" className="circuit-element" />
          <line x1="90" y1="100" x2="95" y2="100" className="circuit-element" />
          <text x="80" y="90" className="circuit-label text-xs">
            C
          </text>

          {/* Connection */}
          <line x1="95" y1="100" x2="120" y2="100" className="circuit-element" />

          {/* Inductor */}
          <path
            d="M 120 100 Q 130 80, 140 100 Q 150 120, 160 100"
            className="circuit-element"
          />
          <text x="125" y="80" className="circuit-label text-xs">
            L
          </text>

          {/* Connection to output/resistor */}
          <line x1="160" y1="100" x2="200" y2="100" className="circuit-element" />
          <circle cx="200" cy="100" r="3" className="circuit-node" />

          {/* Resistor to ground */}
          <line x1="200" y1="100" x2="200" y2="120" className="circuit-element" />
          <rect x="190" y="120" width="20" height="30" className="circuit-element" />
          <text x="210" y="140" className="circuit-label text-xs">
            R
          </text>
          <line x1="200" y1="150" x2="200" y2="160" className="circuit-element" />

          {/* Output */}
          <line x1="200" y1="100" x2="240" y2="100" className="circuit-element" />
          <text x="250" y="105" className="circuit-label">
            V_out
          </text>

          {/* Ground */}
          <line x1="40" y1="160" x2="240" y2="160" className="circuit-element" />
          <line x1="200" y1="160" x2="200" y2="160" className="circuit-element" />
          <line x1="190" y1="165" x2="210" y2="165" className="circuit-element" />
          <line x1="195" y1="170" x2="205" y2="170" className="circuit-element" />
          <line x1="200" y1="175" x2="200" y2="175" className="circuit-element" />

          {/* Return path */}
          <line x1="40" y1="100" x2="40" y2="160" className="circuit-element" />
        </svg>
      ),
      description:
        'A passive filter that attenuates low frequencies and passes high frequencies.',
      transferFunction: 'H(s) = \\frac{s^2}{s^2 + \\frac{R}{L}s + \\frac{1}{LC}}',
      keyPoints: [
        'Output taken across resistor',
        'Blocks DC signals completely',
        'Roll-off rate: +40 dB/decade below cutoff',
        'Phase shift: approaches 0° at high frequencies',
      ],
    },
    sallen_key_lowpass: {
      name: 'Sallen-Key Low-Pass Filter',
      svg: (
        <svg viewBox="0 0 500 250" className="w-full h-64">
          {/* Input */}
          <text x="10" y="85" className="circuit-label">
            V_in
          </text>
          <line x1="40" y1="80" x2="70" y2="80" className="circuit-element" />

          {/* R1 */}
          <rect x="70" y="67" width="35" height="26" className="circuit-element" />
          <text x="75" y="62" className="circuit-label text-xs">
            R₁
          </text>

          {/* Connection */}
          <line x1="105" y1="80" x2="140" y2="80" className="circuit-element" />
          <circle cx="140" cy="80" r="3" className="circuit-node" />

          {/* R2 */}
          <line x1="140" y1="80" x2="175" y2="80" className="circuit-element" />
          <rect x="175" y="67" width="35" height="26" className="circuit-element" />
          <text x="180" y="62" className="circuit-label text-xs">
            R₂
          </text>
          <line x1="210" y1="80" x2="240" y2="80" className="circuit-element" />
          <circle cx="240" cy="80" r="3" className="circuit-node" />

          {/* C1 to ground */}
          <line x1="140" y1="80" x2="140" y2="110" className="circuit-element" />
          <line x1="135" y1="110" x2="145" y2="110" className="circuit-element" />
          <line x1="135" y1="115" x2="145" y2="115" className="circuit-element" />
          <line x1="140" y1="115" x2="140" y2="140" className="circuit-element" />
          <text x="150" y="125" className="circuit-label text-xs">
            C₁
          </text>

          {/* C2 */}
          <line x1="240" y1="80" x2="240" y2="100" className="circuit-element" />
          <line x1="235" y1="100" x2="245" y2="100" className="circuit-element" />
          <line x1="235" y1="105" x2="245" y2="105" className="circuit-element" />
          <line x1="240" y1="105" x2="240" y2="140" className="circuit-element" />
          <text x="250" y="95" className="circuit-label text-xs">
            C₂
          </text>

          {/* Op-amp */}
          <path
            d="M 280 60 L 280 140 L 350 100 Z"
            className="circuit-element"
            fill="none"
          />
          <text x="290" y="95" className="circuit-label text-xs">
            +
          </text>
          <text x="290" y="115" className="circuit-label text-xs">
            −
          </text>

          {/* Op-amp inputs */}
          <line x1="240" y1="80" x2="280" y2="80" className="circuit-element" />
          <line x1="280" y1="80" x2="280" y2="90" className="circuit-element" />
          <line x1="240" y1="140" x2="280" y2="140" className="circuit-element" />
          <line x1="280" y1="140" x2="280" y2="110" className="circuit-element" />

          {/* Feedback */}
          <line x1="350" y1="100" x2="380" y2="100" className="circuit-element" />
          <circle cx="380" cy="100" r="3" className="circuit-node" />
          <line x1="380" y1="100" x2="380" y2="140" className="circuit-element" />
          <line x1="380" y1="140" x2="240" y2="140" className="circuit-element" />

          {/* Output */}
          <line x1="380" y1="100" x2="420" y2="100" className="circuit-element" />
          <text x="430" y="105" className="circuit-label">
            V_out
          </text>

          {/* Ground */}
          <line x1="40" y1="180" x2="420" y2="180" className="circuit-element" />
          <line x1="140" y1="140" x2="140" y2="180" className="circuit-element" />
          <line x1="130" y1="185" x2="150" y2="185" className="circuit-element" />
          <line x1="135" y1="190" x2="145" y2="190" className="circuit-element" />

          {/* Input ground */}
          <line x1="40" y1="80" x2="40" y2="180" className="circuit-element" />
        </svg>
      ),
      description:
        'An active second-order low-pass filter using an op-amp in voltage follower configuration.',
      transferFunction: 'H(s) = \\frac{1}{R_1R_2C_1C_2s^2 + (R_1C_1 + R_2C_1)s + 1}',
      keyPoints: [
        'Unity gain configuration (K = 1)',
        'High input impedance, low output impedance',
        'Better frequency response than passive filters',
        'Cutoff frequency: ω₀ = 1/√(R₁R₂C₁C₂)',
      ],
    },
    voltage_follower: {
      name: 'Voltage Follower (Unity Gain Buffer)',
      svg: (
        <svg viewBox="0 0 400 200" className="w-full h-64">
          {/* Input */}
          <text x="10" y="85" className="circuit-label">
            V_in
          </text>
          <line x1="50" y1="80" x2="120" y2="80" className="circuit-element" />

          {/* Op-amp */}
          <path
            d="M 120 50 L 120 130 L 220 90 Z"
            className="circuit-element"
            fill="none"
          />
          <text x="140" y="85" className="circuit-label text-xs">
            +
          </text>
          <text x="140" y="105" className="circuit-label text-xs">
            −
          </text>

          {/* Input connection */}
          <line x1="120" y1="80" x2="120" y2="75" className="circuit-element" />

          {/* Feedback */}
          <line x1="220" y1="90" x2="260" y2="90" className="circuit-element" />
          <circle cx="260" cy="90" r="3" className="circuit-node" />
          <line x1="260" y1="90" x2="260" y2="130" className="circuit-element" />
          <line x1="260" y1="130" x2="120" y2="130" className="circuit-element" />
          <line x1="120" y1="130" x2="120" y2="105" className="circuit-element" />

          {/* Output */}
          <line x1="260" y1="90" x2="300" y2="90" className="circuit-element" />
          <text x="310" y="95" className="circuit-label">
            V_out
          </text>

          {/* Ground reference */}
          <line x1="50" y1="150" x2="300" y2="150" className="circuit-element" />
          <line x1="50" y1="80" x2="50" y2="150" className="circuit-element" />
          <line x1="45" y1="155" x2="55" y2="155" className="circuit-element" />
          <line x1="47" y1="160" x2="53" y2="160" className="circuit-element" />
          <line x1="50" y1="165" x2="50" y2="165" className="circuit-element" />
        </svg>
      ),
      description:
        'A unity gain amplifier that provides impedance transformation with 100% negative feedback.',
      transferFunction: 'H(s) = \\frac{A(s)}{1 + A(s)} \\approx 1 \\text{ where } A(s) = \\frac{G\'}{s}',
      keyPoints: [
        'Ideal gain: Vout = Vin (unity gain)',
        'Very high input impedance (∼10¹² Ω)',
        'Very low output impedance (∼few Ω)',
        'Used for impedance buffering and isolation',
      ],
    },
  }

  const circuit = circuits[circuitType]

  if (!circuit) {
    return <div>Circuit type not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{circuit.name}</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle details"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-4">{circuit.svg}</div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">{circuit.description}</p>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Transfer Function:
          </h4>
          <div className="overflow-x-auto">
            <BlockMath math={circuit.transferFunction} />
          </div>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white">Key Points:</h4>
            <ul className="space-y-2">
              {circuit.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CircuitVisualizer
