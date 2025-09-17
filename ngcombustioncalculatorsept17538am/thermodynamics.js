// Thermodynamic Properties Database for Natural Gas Combustion Calculator

class ThermodynamicsDatabase {
    constructor() {
        this.gasProperties = {
            methane: {
                formula: 'CH4',
                molecularWeight: 16.043, // kg/kmol
                lhv: 35882, // kJ/Nm³ (Lower Heating Value)
                hhv: 39820, // kJ/Nm³ (Higher Heating Value)
                stoichAirRatio: 9.53, // Nm³ air/Nm³ fuel
                criticalTemp: -82.6, // °C
                criticalPressure: 46.0, // bar
                accentricFactor: 0.011
            },
            ethane: {
                formula: 'C2H6',
                molecularWeight: 30.070,
                lhv: 63766,
                hhv: 69322,
                stoichAirRatio: 16.68,
                criticalTemp: 32.2,
                criticalPressure: 48.7,
                accentricFactor: 0.099
            },
            propane: {
                formula: 'C3H8',
                molecularWeight: 44.097,
                lhv: 91315,
                hhv: 99306,
                stoichAirRatio: 23.83,
                criticalTemp: 96.7,
                criticalPressure: 42.5,
                accentricFactor: 0.152
            },
            air: {
                formula: 'Air',
                molecularWeight: 28.97,
                composition: {N2: 78.084, O2: 20.946, Ar: 0.934, CO2: 0.036},
                criticalTemp: -140.6,
                criticalPressure: 37.7
            },
            co2: {
                formula: 'CO2',
                molecularWeight: 44.01,
                criticalTemp: 31.1,
                criticalPressure: 73.8,
                accentricFactor: 0.225
            },
            h2o: {
                formula: 'H2O',
                molecularWeight: 18.015,
                criticalTemp: 374.0,
                criticalPressure: 220.6,
                accentricFactor: 0.344
            },
            n2: {
                formula: 'N2',
                molecularWeight: 28.014,
                criticalTemp: -146.9,
                criticalPressure: 34.0,
                accentricFactor: 0.037
            },
            o2: {
                formula: 'O2',
                molecularWeight: 31.999,
                criticalTemp: -118.6,
                criticalPressure: 50.4,
                accentricFactor: 0.022
            }
        };

        // NASA Polynomials for heat capacity calculations (Cp/R = a1 + a2*T + a3*T^2 + a4*T^3 + a5*T^4)
        this.nasaCoefficients = {
            methane: {
                low: [5.14987613, -0.0136709788, 4.91800599e-05, -4.84743026e-08, 1.66693956e-11, -1.02466476e+04, -4.64130376],
                high: [7.48514950, -2.78340940e-03, 3.17116555e-06, -1.17892065e-09, 1.37069424e-13, -1.13134686e+04, -2.78618102e+01],
                tempRange: [200, 1000, 3500]
            },
            ethane: {
                low: [4.29142492, -5.50154270e-03, 5.99438288e-05, -7.08466285e-08, 2.68685771e-11, -1.15222055e+04, 2.66682316],
                high: [1.07188150, 2.16852677e-02, -1.00256067e-05, 2.21412001e-09, -1.90002890e-13, -1.39295244e+04, 1.51156107e+01],
                tempRange: [200, 1000, 3500]
            },
            propane: {
                low: [0.93355381, 2.81433479e-02, -1.43456593e-05, 3.81369653e-09, -4.18835708e-13, -1.39574164e+04, 1.91876277e+01],
                high: [7.53414459, 1.88722022e-02, -8.15633983e-06, 1.61878772e-09, -1.20782739e-13, -1.64663015e+04, -1.78439662e+01],
                tempRange: [200, 1000, 3500]
            },
            co2: {
                low: [2.35677352, 8.98459677e-03, -7.12356269e-06, 2.45919022e-09, -1.43699548e-13, -4.83719697e+04, 9.90105222],
                high: [3.85746029, 4.41437026e-03, -2.21481404e-06, 5.23490188e-10, -4.72084164e-14, -4.87591660e+04, 2.27163806],
                tempRange: [200, 1000, 3500]
            },
            h2o: {
                low: [4.19864056, -2.03643410e-03, 6.52040211e-06, -5.48797062e-09, 1.77197817e-12, -3.02937267e+04, -8.49032208e-01],
                high: [3.03399249, 2.17691804e-03, -1.64072518e-07, -9.70419870e-11, 1.68200992e-14, -3.00042971e+04, 4.96677010],
                tempRange: [200, 1000, 3500]
            },
            n2: {
                low: [3.29867700, 1.40824040e-03, -3.96322200e-06, 5.64151500e-09, -2.44485400e-12, -1.02089990e+03, 3.95037200],
                high: [2.92664000, 1.48797680e-03, -5.68476000e-07, 1.00970380e-10, -6.75335100e-15, -9.22797700e+02, 5.98052800],
                tempRange: [200, 1000, 3500]
            },
            o2: {
                low: [3.78245636, -2.99673416e-03, 9.84730201e-06, -9.68129509e-09, 3.24372837e-12, -1.06394356e+03, 3.65767573],
                high: [3.28253784, 1.48308754e-03, -7.57966669e-07, 2.09470555e-10, -2.16717794e-14, -1.08845772e+03, 5.45323129],
                tempRange: [200, 1000, 3500]
            }
        };

        // Material properties for heat transfer calculations
        this.materialProperties = {
            refractory: {
                thermalConductivity: 1.2, // W/m·K
                density: 2200, // kg/m³
                specificHeat: 960, // J/kg·K
                emissivity: 0.85
            },
            steel: {
                thermalConductivity: 45, // W/m·K
                density: 7850, // kg/m³
                specificHeat: 470, // J/kg·K
                emissivity: 0.7
            },
            insulation: {
                thermalConductivity: 0.08, // W/m·K
                density: 200, // kg/m³
                specificHeat: 1000, // J/kg·K
                emissivity: 0.9
            }
        };
    }

    // Calculate heat capacity using NASA polynomials
    calculateCp(species, temperature) {
        const T = temperature + 273.15; // Convert to Kelvin
        const coeffs = this.nasaCoefficients[species];
        
        if (!coeffs) return null;
        
        let a;
        if (T <= coeffs.tempRange[1]) {
            a = coeffs.low;
        } else {
            a = coeffs.high;
        }
        
        const R = 8.314; // J/mol·K
        const CpR = a[0] + a[1]*T + a[2]*T*T + a[3]*T*T*T + a[4]*T*T*T*T;
        const Cp = CpR * R / 1000; // Convert to kJ/mol·K
        
        return Cp;
    }

    // Calculate enthalpy using NASA polynomials
    calculateEnthalpy(species, temperature) {
        const T = temperature + 273.15; // Convert to Kelvin
        const coeffs = this.nasaCoefficients[species];
        
        if (!coeffs) return null;
        
        let a;
        if (T <= coeffs.tempRange[1]) {
            a = coeffs.low;
        } else {
            a = coeffs.high;
        }
        
        const R = 8.314; // J/mol·K
        const HR = a[0] + a[1]*T/2 + a[2]*T*T/3 + a[3]*T*T*T/4 + a[4]*T*T*T*T/5 + a[5]/T;
        const H = HR * R * T / 1000; // Convert to kJ/mol
        
        return H;
    }

    // Calculate gas density using ideal gas law with compressibility correction
    calculateDensity(species, temperature, pressure) {
        const T = temperature + 273.15; // Convert to Kelvin
        const P = pressure * 100000; // Convert bar to Pa
        const MW = this.gasProperties[species]?.molecularWeight || 28.97;
        const R = 8314; // J/kmol·K
        
        // Simple ideal gas calculation
        const density = (P * MW) / (R * T);
        
        return density; // kg/m³
    }

    // Calculate dynamic viscosity using Sutherland's law
    calculateViscosity(species, temperature) {
        const T = temperature + 273.15; // Convert to Kelvin
        
        // Sutherland constants for common gases
        const constants = {
            methane: {mu0: 11.2e-6, T0: 273.15, S: 162},
            air: {mu0: 17.1e-6, T0: 273.15, S: 111},
            co2: {mu0: 13.8e-6, T0: 273.15, S: 222},
            h2o: {mu0: 12.0e-6, T0: 373.15, S: 1064},
            n2: {mu0: 16.6e-6, T0: 273.15, S: 107},
            o2: {mu0: 19.2e-6, T0: 273.15, S: 139}
        };
        
        const c = constants[species] || constants.air;
        const viscosity = c.mu0 * Math.pow(T/c.T0, 1.5) * (c.T0 + c.S) / (T + c.S);
        
        return viscosity * 1e6; // Convert to μPa·s
    }

    // Calculate thermal conductivity
    calculateThermalConductivity(species, temperature) {
        const T = temperature + 273.15; // Convert to Kelvin
        
        // Thermal conductivity correlations for common gases
        const correlations = {
            methane: () => 0.0332 + 1.01e-4 * T - 3.69e-8 * T * T,
            air: () => 0.0241 + 7.57e-5 * T - 1.69e-8 * T * T,
            co2: () => 0.0146 + 9.25e-5 * T - 4.22e-8 * T * T,
            h2o: () => 0.0171 + 5.14e-5 * T + 1.18e-8 * T * T,
            n2: () => 0.0236 + 7.56e-5 * T - 2.29e-8 * T * T,
            o2: () => 0.0244 + 7.72e-5 * T - 3.59e-8 * T * T
        };
        
        const calc = correlations[species] || correlations.air;
        return calc(); // W/m·K
    }

    // Get gas properties
    getGasProperty(species, property) {
        return this.gasProperties[species]?.[property];
    }

    // Get material properties
    getMaterialProperty(material, property) {
        return this.materialProperties[material]?.[property];
    }
}

// Create global instance
const thermoDB = new ThermodynamicsDatabase();