// User Interface and Main Calculation Functions

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Update fuel composition total in real-time
    const fuelInputs = ['ch4', 'c2h6', 'c3h8', 'n2_fuel'];
    fuelInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updateFuelTotal);
    });
});

function updateFuelTotal() {
    const ch4 = parseFloat(document.getElementById('ch4').value) || 0;
    const c2h6 = parseFloat(document.getElementById('c2h6').value) || 0;
    const c3h8 = parseFloat(document.getElementById('c3h8').value) || 0;
    const n2_fuel = parseFloat(document.getElementById('n2_fuel').value) || 0;
    
    const total = ch4 + c2h6 + c3h8 + n2_fuel;
    document.getElementById('fuel-total').textContent = total.toFixed(1);
    
    // Color code based on total
    const totalDisplay = document.querySelector('.total-display');
    if (Math.abs(total - 100) < 0.1) {
        totalDisplay.style.color = '#2e7d2e';
    } else {
        totalDisplay.style.color = '#d63031';
    }
}

// Main calculation functions for each tab
function calculateCombustion() {
    try {
        // Get input values
        const fuelComposition = {
            ch4: parseFloat(document.getElementById('ch4').value) || 0,
            c2h6: parseFloat(document.getElementById('c2h6').value) || 0,
            c3h8: parseFloat(document.getElementById('c3h8').value) || 0,
            n2_fuel: parseFloat(document.getElementById('n2_fuel').value) || 0
        };

        const airTemp = parseFloat(document.getElementById('air-temp').value) || 25;
        const fuelTemp = parseFloat(document.getElementById('fuel-temp').value) || 25;
        const pressure = parseFloat(document.getElementById('pressure').value) || 1.013;
        const excessAir = parseFloat(document.getElementById('excess-air').value) || 10;
        const fuelFlow = parseFloat(document.getElementById('fuel-flow').value) || 1000;
        const heatLoss = parseFloat(document.getElementById('heat-loss').value) || 5;
        const efficiency = parseFloat(document.getElementById('efficiency').value) || 85;

        // Validate fuel composition
        const totalComposition = fuelComposition.ch4 + fuelComposition.c2h6 + fuelComposition.c3h8 + fuelComposition.n2_fuel;
        if (Math.abs(totalComposition - 100) > 0.1) {
            alert('Fuel composition must total 100%');
            return;
        }

        // Calculate stoichiometry
        const stoich = combustionCalc.calculateStoichiometry(fuelComposition, excessAir, fuelFlow);
        
        // Calculate product composition
        const products = combustionCalc.calculateProducts(fuelComposition, excessAir);
        
        // Calculate flame temperatures
        const adiabaticTemp = combustionCalc.calculateAdiabaticFlameTemperature(fuelComposition, excessAir, fuelTemp);
        const actualTemp = combustionCalc.calculateActualFlameTemperature(adiabaticTemp, heatLoss, efficiency);
        const flueTemp = actualTemp * 0.7; // Approximate flue gas temperature

        // Calculate energy balance
        const heatInput = (fuelFlow * stoich.lhv) / 3600; // kW
        const heatOutput = heatInput * efficiency / 100; // kW
        const heatProducts = heatOutput * (1 - heatLoss / 100); // kW
        const heatLosses = heatInput - heatOutput; // kW

        // Update results
        document.getElementById('air-ratio').textContent = stoich.stoichAirRatio.toFixed(2);
        document.getElementById('air-flow').textContent = stoich.airFlow.toFixed(0);
        document.getElementById('fa-ratio').textContent = stoich.fuelAirRatio.toFixed(4);
        document.getElementById('lhv').textContent = stoich.lhv.toFixed(0);
        document.getElementById('hhv').textContent = stoich.hhv.toFixed(0);

        document.getElementById('adiabatic-temp').textContent = adiabaticTemp.toFixed(0);
        document.getElementById('actual-temp').textContent = actualTemp.toFixed(0);
        document.getElementById('flue-temp').textContent = flueTemp.toFixed(0);

        document.getElementById('co2-dry').textContent = products.co2_dry.toFixed(2);
        document.getElementById('h2o').textContent = products.h2o.toFixed(2);
        document.getElementById('o2').textContent = products.o2_dry.toFixed(2);
        document.getElementById('n2').textContent = products.n2_dry.toFixed(2);

        document.getElementById('heat-input').textContent = heatInput.toFixed(0);
        document.getElementById('heat-output').textContent = heatOutput.toFixed(0);
        document.getElementById('heat-products').textContent = heatProducts.toFixed(0);
        document.getElementById('heat-losses').textContent = heatLosses.toFixed(0);

    } catch (error) {
        console.error('Calculation error:', error);
        alert('Error in combustion calculations. Please check your inputs.');
    }
}

function calculateProperties() {
    try {
        const gasType = document.getElementById('gas-type').value;
        const temperature = parseFloat(document.getElementById('prop-temp').value) || 25;
        const pressure = parseFloat(document.getElementById('prop-pressure').value) || 1.013;

        const props = combustionCalc.calculateGasProperties(gasType, temperature, pressure);

        document.getElementById('density').textContent = props.density.toFixed(3);
        document.getElementById('mol-weight').textContent = props.molecularWeight.toFixed(2);
        document.getElementById('viscosity').textContent = props.viscosity.toFixed(1);
        document.getElementById('conductivity').textContent = props.conductivity.toFixed(4);
        document.getElementById('cp').textContent = props.cp.toFixed(3);
        document.getElementById('cv').textContent = props.cv.toFixed(3);
        document.getElementById('gamma').textContent = props.gamma.toFixed(3);
        document.getElementById('enthalpy').textContent = props.enthalpy.toFixed(1);

    } catch (error) {
        console.error('Properties calculation error:', error);
        alert('Error in properties calculations. Please check your inputs.');
    }
}

function calculateHeatTransfer() {
    try {
        const geometry = {
            length: parseFloat(document.getElementById('length').value) || 5,
            width: parseFloat(document.getElementById('width').value) || 3,
            height: parseFloat(document.getElementById('height').value) || 2,
            wallThickness: parseFloat(document.getElementById('wall-thickness').value) || 200
        };

        const materials = {
            wallMaterial: document.getElementById('wall-material').value,
            emissivity: parseFloat(document.getElementById('emissivity').value) || 0.8
        };

        const temperatures = {
            innerTemp: parseFloat(document.getElementById('inner-temp').value) || 1200,
            outerTemp: parseFloat(document.getElementById('outer-temp').value) || 50,
            ambientTemp: 25
        };

        const results = combustionCalc.calculateHeatTransfer(geometry, materials, temperatures);

        document.getElementById('conduction').textContent = results.conduction.toFixed(1);
        document.getElementById('convection').textContent = results.convection.toFixed(1);
        document.getElementById('radiation').textContent = results.radiation.toFixed(1);
        document.getElementById('total-loss').textContent = results.totalLoss.toFixed(1);
        document.getElementById('u-overall').textContent = results.overallU.toFixed(2);
        document.getElementById('h-conv').textContent = results.convectiveH.toFixed(1);
        document.getElementById('h-rad').textContent = results.radiativeH.toFixed(1);

    } catch (error) {
        console.error('Heat transfer calculation error:', error);
        alert('Error in heat transfer calculations. Please check your inputs.');
    }
}

function calculateEmissions() {
    try {
        const peakTemp = parseFloat(document.getElementById('peak-temp').value) || 1800;
        const residenceTime = parseFloat(document.getElementById('residence-time').value) || 0.5;
        const excessAir = parseFloat(document.getElementById('excess-air').value) || 10;
        const mixingQuality = parseFloat(document.getElementById('mixing').value) || 7;

        // Calculate NOx emissions
        const noxResults = combustionCalc.calculateNOxEmissions(peakTemp, residenceTime, excessAir, mixingQuality);
        
        // Calculate CO emissions
        const coEmission = combustionCalc.calculateCOEmissions(peakTemp, excessAir, mixingQuality);
        
        // Calculate CO2 emissions (simplified)
        const fuelFlow = parseFloat(document.getElementById('fuel-flow').value) || 1000;
        const co2Emission = fuelFlow * 2.0; // Approximate CO2 emission rate kg/h

        document.getElementById('thermal-nox').textContent = noxResults.thermal.toFixed(1);
        document.getElementById('prompt-nox').textContent = noxResults.prompt.toFixed(1);
        document.getElementById('total-nox').textContent = noxResults.total.toFixed(1);
        document.getElementById('nox-ppm').textContent = noxResults.ppm.toFixed(1);
        document.getElementById('co-emission').textContent = coEmission.toFixed(1);
        document.getElementById('co2-emission').textContent = co2Emission.toFixed(1);
        document.getElementById('hc-emission').textContent = (coEmission * 0.1).toFixed(1);

    } catch (error) {
        console.error('Emissions calculation error:', error);
        alert('Error in emissions calculations. Please check your inputs.');
    }
}

function calculateFlow() {
    try {
        const pipeParams = {
            diameter: parseFloat(document.getElementById('pipe-diameter').value) || 100,
            length: parseFloat(document.getElementById('pipe-length').value) || 10,
            roughness: parseFloat(document.getElementById('roughness').value) || 45,
            velocity: parseFloat(document.getElementById('velocity').value) || 10
        };

        const fittings = {
            elbows: parseInt(document.getElementById('elbows').value) || 0,
            tees: parseInt(document.getElementById('tees').value) || 0,
            valves: parseInt(document.getElementById('valves').value) || 0
        };

        // Use air properties at standard conditions
        const temperature = 25;
        const pressure = 1.013;
        const airProps = combustionCalc.calculateGasProperties('air', temperature, pressure);
        
        const fluidProps = {
            density: airProps.density,
            viscosity: airProps.viscosity
        };

        const results = combustionCalc.calculateFlowAnalysis(pipeParams, fittings, fluidProps);

        document.getElementById('reynolds').textContent = results.reynolds.toFixed(0);
        document.getElementById('friction-factor').textContent = results.frictionFactor.toFixed(4);
        document.getElementById('mass-flow').textContent = results.massFlow.toFixed(2);
        document.getElementById('vol-flow').textContent = results.volumeFlow.toFixed(3);
        document.getElementById('friction-loss').textContent = results.frictionLoss.toFixed(0);
        document.getElementById('minor-losses').textContent = results.minorLosses.toFixed(0);
        document.getElementById('total-pressure-drop').textContent = results.totalPressureDrop.toFixed(0);
        document.getElementById('required-pressure').textContent = results.requiredPressure.toFixed(3);

    } catch (error) {
        console.error('Flow calculation error:', error);
        alert('Error in flow calculations. Please check your inputs.');
    }
}

function exportResults() {
    try {
        const results = {
            timestamp: new Date().toISOString(),
            combustionAnalysis: extractResultsFromSection('combustion'),
            gasProperties: extractResultsFromSection('properties'),
            heatTransfer: extractResultsFromSection('heat-transfer'),
            emissions: extractResultsFromSection('emissions'),
            flowAnalysis: extractResultsFromSection('flow')
        };

        const jsonData = JSON.stringify(results, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `combustion-analysis-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Results exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting results.');
    }
}

function extractResultsFromSection(sectionId) {
    const section = document.getElementById(sectionId);
    const results = {};
    
    if (section) {
        const spans = section.querySelectorAll('span[id]');
        spans.forEach(span => {
            const key = span.id;
            const value = span.textContent;
            if (value !== '-') {
                results[key] = value;
            }
        });
    }
    
    return results;
}

// Input validation functions
function validateInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        const min = parseFloat(input.getAttribute('min'));
        const max = parseFloat(input.getAttribute('max'));
        
        if (isNaN(value)) {
            input.style.borderColor = '#d63031';
            isValid = false;
        } else if (min !== null && value < min) {
            input.style.borderColor = '#d63031';
            isValid = false;
        } else if (max !== null && value > max) {
            input.style.borderColor = '#d63031';
            isValid = false;
        } else {
            input.style.borderColor = '#2e7d2e';
        }
    });
    
    return isValid;
}

// Add input validation on blur
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInputs);
        input.addEventListener('input', function() {
            this.style.borderColor = '#ddd';
        });
    });
});