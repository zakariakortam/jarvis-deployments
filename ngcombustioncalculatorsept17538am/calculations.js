// Advanced Engineering Calculations for Natural Gas Combustion

class CombustionCalculator {
    constructor() {
        this.R = 8.314; // Universal gas constant J/mol·K
        this.stefanBoltzmann = 5.67e-8; // Stefan-Boltzmann constant W/m²·K⁴
    }

    // Calculate fuel composition properties
    calculateFuelProperties(composition) {
        let totalLHV = 0;
        let totalHHV = 0;
        let totalMW = 0;
        let stoichAir = 0;

        const components = ['ch4', 'c2h6', 'c3h8', 'n2_fuel'];
        const species = ['methane', 'ethane', 'propane', 'n2'];

        for (let i = 0; i < components.length; i++) {
            const fraction = composition[components[i]] / 100;
            const props = thermoDB.getGasProperty(species[i], 'lhv');
            
            if (props) {
                totalLHV += fraction * thermoDB.getGasProperty(species[i], 'lhv');
                totalHHV += fraction * thermoDB.getGasProperty(species[i], 'hhv');
                totalMW += fraction * thermoDB.getGasProperty(species[i], 'molecularWeight');
                
                if (species[i] !== 'n2') {
                    stoichAir += fraction * thermoDB.getGasProperty(species[i], 'stoichAirRatio');
                }
            }
        }

        return {
            lhv: totalLHV,
            hhv: totalHHV,
            molecularWeight: totalMW,
            stoichAirRatio: stoichAir
        };
    }

    // Calculate combustion stoichiometry
    calculateStoichiometry(fuelComposition, excessAir, fuelFlow) {
        const fuelProps = this.calculateFuelProperties(fuelComposition);
        const actualAirRatio = fuelProps.stoichAirRatio * (1 + excessAir / 100);
        const airFlow = fuelFlow * actualAirRatio;
        const fuelAirRatio = fuelFlow * fuelProps.molecularWeight / (airFlow * 28.97);

        return {
            stoichAirRatio: fuelProps.stoichAirRatio,
            actualAirRatio: actualAirRatio,
            airFlow: airFlow,
            fuelAirRatio: fuelAirRatio,
            lhv: fuelProps.lhv,
            hhv: fuelProps.hhv
        };
    }

    // Calculate product composition (wet basis)
    calculateProducts(fuelComposition, excessAir) {
        const ch4 = fuelComposition.ch4 / 100;
        const c2h6 = fuelComposition.c2h6 / 100;
        const c3h8 = fuelComposition.c3h8 / 100;
        const n2_fuel = fuelComposition.n2_fuel / 100;

        // Stoichiometric calculations
        const co2_stoich = ch4 + 2 * c2h6 + 3 * c3h8;
        const h2o_stoich = 2 * ch4 + 3 * c2h6 + 4 * c3h8;
        const o2_stoich = 2 * ch4 + 3.5 * c2h6 + 5 * c3h8;
        const n2_air_stoich = o2_stoich * 79.1 / 20.9;

        // Actual air
        const airMultiplier = 1 + excessAir / 100;
        const o2_actual = o2_stoich * airMultiplier;
        const n2_air_actual = n2_air_stoich * airMultiplier;

        // Products
        const co2 = co2_stoich;
        const h2o = h2o_stoich;
        const o2_excess = o2_stoich * (excessAir / 100);
        const n2_total = n2_fuel + n2_air_actual;

        const totalProducts = co2 + h2o + o2_excess + n2_total;

        return {
            co2_wet: (co2 / totalProducts) * 100,
            co2_dry: (co2 / (totalProducts - h2o)) * 100,
            h2o: (h2o / totalProducts) * 100,
            o2_dry: (o2_excess / (totalProducts - h2o)) * 100,
            n2_dry: (n2_total / (totalProducts - h2o)) * 100,
            totalMoles: totalProducts
        };
    }

    // Calculate adiabatic flame temperature using iterative method
    calculateAdiabaticFlameTemperature(fuelComposition, excessAir, initialTemp = 25) {
        const fuelProps = this.calculateFuelProperties(fuelComposition);
        const products = this.calculateProducts(fuelComposition, excessAir);
        
        // Heat of combustion at reference temperature
        const heatInput = fuelProps.lhv; // kJ/Nm³

        // Initial guess for flame temperature
        let flameTemp = 1800; // °C
        let iterations = 0;
        const maxIterations = 50;
        const tolerance = 1.0;

        while (iterations < maxIterations) {
            // Calculate heat capacity of products at current temperature
            const cp_co2 = thermoDB.calculateCp('co2', flameTemp) || 0.045;
            const cp_h2o = thermoDB.calculateCp('h2o', flameTemp) || 0.035;
            const cp_n2 = thermoDB.calculateCp('n2', flameTemp) || 0.030;
            const cp_o2 = thermoDB.calculateCp('o2', flameTemp) || 0.032;

            // Weighted average heat capacity
            const cp_avg = (
                products.co2_wet * cp_co2 / 100 +
                products.h2o * cp_h2o / 100 +
                products.n2_dry * cp_n2 * (1 - products.h2o / 100) / 100 +
                products.o2_dry * cp_o2 * (1 - products.h2o / 100) / 100
            );

            // Energy balance: Heat input = Heat to raise products to flame temperature
            const heatToProducts = products.totalMoles * cp_avg * (flameTemp - initialTemp);
            const newFlameTemp = initialTemp + heatInput / (products.totalMoles * cp_avg);

            if (Math.abs(newFlameTemp - flameTemp) < tolerance) {
                return newFlameTemp;
            }

            flameTemp = newFlameTemp;
            iterations++;
        }

        return flameTemp; // Return best estimate if not converged
    }

    // Calculate actual flame temperature considering heat losses
    calculateActualFlameTemperature(adiabaticTemp, heatLoss, efficiency) {
        const effectiveHeatLoss = heatLoss + (100 - efficiency);
        return adiabaticTemp * (1 - effectiveHeatLoss / 100);
    }

    // Calculate NOx emissions using Zeldovich mechanism
    calculateNOxEmissions(peakTemp, residenceTime, excessAir, mixingQuality) {
        const T = peakTemp + 273.15; // Convert to Kelvin
        
        // Thermal NOx (Zeldovich mechanism)
        const A = 7.6e13; // Pre-exponential factor
        const Ea = 38000; // Activation energy, cal/mol
        const R_cal = 1.987; // Gas constant, cal/mol·K
        
        const k = A * Math.exp(-Ea / (R_cal * T));
        const thermalNOx = k * residenceTime * Math.pow(excessAir / 100 + 1, 0.5);
        
        // Prompt NOx (simplified)
        const promptNOx = 0.1 * thermalNOx * (10 - mixingQuality) / 10;
        
        const totalNOx = thermalNOx + promptNOx;
        
        // Convert to mg/Nm³ (simplified conversion)
        const noxMgNm3 = totalNOx * 2000; // Rough conversion factor
        const noxPpm = noxMgNm3 / 2.05; // Convert to ppm
        
        return {
            thermal: thermalNOx * 2000,
            prompt: promptNOx * 2000,
            total: noxMgNm3,
            ppm: noxPpm
        };
    }

    // Calculate CO emissions (simplified)
    calculateCOEmissions(flameTemp, excessAir, mixingQuality) {
        // Simplified CO formation model
        let coBase = 100; // Base CO emission, mg/Nm³
        
        // Temperature effect (CO increases at low temperatures)
        if (flameTemp < 1200) {
            coBase *= Math.pow(1200 / flameTemp, 2);
        }
        
        // Excess air effect (CO decreases with more air)
        coBase *= Math.exp(-excessAir / 20);
        
        // Mixing quality effect
        coBase *= (11 - mixingQuality) / 10;
        
        return Math.max(coBase, 10); // Minimum 10 mg/Nm³
    }

    // Calculate heat transfer coefficients and rates
    calculateHeatTransfer(geometry, materials, temperatures) {
        const {length, width, height, wallThickness} = geometry;
        const {wallMaterial, emissivity} = materials;
        const {innerTemp, outerTemp, ambientTemp = 25} = temperatures;
        
        const area = 2 * (length * width + length * height + width * height);
        const volume = length * width * height;
        
        // Conductive heat transfer through wall
        const k = thermoDB.getMaterialProperty(wallMaterial, 'thermalConductivity') || 1.2;
        const thickness = wallThickness / 1000; // Convert mm to m
        const deltaT = innerTemp - outerTemp;
        const conduction = (k * area * deltaT) / thickness / 1000; // kW
        
        // Convective heat transfer (simplified)
        const h_conv = 10; // W/m²·K (simplified)
        const convection = h_conv * area * (outerTemp - ambientTemp) / 1000; // kW
        
        // Radiative heat transfer
        const T_outer = outerTemp + 273.15;
        const T_ambient = ambientTemp + 273.15;
        const h_rad = emissivity * this.stefanBoltzmann * (Math.pow(T_outer, 4) - Math.pow(T_ambient, 4)) / (T_outer - T_ambient);
        const radiation = h_rad * area * (outerTemp - ambientTemp) / 1000; // kW
        
        const totalLoss = conduction + convection + radiation;
        const overallU = totalLoss * 1000 / (area * (innerTemp - ambientTemp));
        
        return {
            conduction: conduction,
            convection: convection,
            radiation: radiation,
            totalLoss: totalLoss,
            overallU: overallU,
            convectiveH: h_conv,
            radiativeH: h_rad
        };
    }

    // Calculate flow characteristics and pressure drop
    calculateFlowAnalysis(pipeParams, fittings, fluidProps) {
        const {diameter, length, roughness, velocity} = pipeParams;
        const {elbows, tees, valves} = fittings;
        const {density, viscosity} = fluidProps;
        
        const D = diameter / 1000; // Convert mm to m
        const area = Math.PI * D * D / 4;
        const massFlow = density * velocity * area;
        const volumeFlow = velocity * area;
        
        // Reynolds number
        const reynolds = (density * velocity * D) / (viscosity / 1e6);
        
        // Friction factor (Colebrook-White equation approximation)
        const relative_roughness = roughness / 1e6 / D;
        let f;
        if (reynolds < 2300) {
            f = 64 / reynolds; // Laminar
        } else {
            // Turbulent (Swamee-Jain approximation)
            f = 0.25 / Math.pow(Math.log10(relative_roughness / 3.7 + 5.74 / Math.pow(reynolds, 0.9)), 2);
        }
        
        // Friction pressure drop
        const frictionLoss = f * (length / D) * (density * velocity * velocity / 2);
        
        // Minor losses
        const K_elbow = 0.9;
        const K_tee = 1.8;
        const K_valve = 0.2;
        const K_total = elbows * K_elbow + tees * K_tee + valves * K_valve;
        const minorLosses = K_total * (density * velocity * velocity / 2);
        
        const totalPressureDrop = frictionLoss + minorLosses;
        const requiredPressure = 1.013 + totalPressureDrop / 100000; // Convert Pa to bar
        
        return {
            reynolds: reynolds,
            frictionFactor: f,
            massFlow: massFlow,
            volumeFlow: volumeFlow,
            frictionLoss: frictionLoss,
            minorLosses: minorLosses,
            totalPressureDrop: totalPressureDrop,
            requiredPressure: requiredPressure
        };
    }

    // Calculate gas properties at given conditions
    calculateGasProperties(gasType, temperature, pressure) {
        const density = thermoDB.calculateDensity(gasType, temperature, pressure);
        const viscosity = thermoDB.calculateViscosity(gasType, temperature);
        const conductivity = thermoDB.calculateThermalConductivity(gasType, temperature);
        const cp = thermoDB.calculateCp(gasType, temperature);
        const molecularWeight = thermoDB.getGasProperty(gasType, 'molecularWeight');
        
        // Calculate Cv and gamma
        const R_specific = 8314 / molecularWeight; // J/kg·K
        const cv = cp * 1000 - R_specific / 1000; // kJ/kg·K
        const gamma = cp / cv;
        
        // Calculate enthalpy
        const enthalpy = thermoDB.calculateEnthalpy(gasType, temperature);
        const specificEnthalpy = enthalpy * 1000 / molecularWeight; // kJ/kg
        
        return {
            density: density,
            viscosity: viscosity,
            conductivity: conductivity,
            molecularWeight: molecularWeight,
            cp: cp * 1000 / molecularWeight, // kJ/kg·K
            cv: cv,
            gamma: gamma,
            enthalpy: specificEnthalpy
        };
    }
}

// Create global calculator instance
const combustionCalc = new CombustionCalculator();