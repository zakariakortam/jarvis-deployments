"""
Corn Wet Milling Steeping Optimization - Data Models
Process parameters and constraints for acid set point optimization
"""

from dataclasses import dataclass
from typing import Dict, List, Optional
import numpy as np
from datetime import datetime


@dataclass
class ProcessParameters:
    """Core process parameters for corn wet milling steeping"""
    
    # Control Variables (Decision Variables)
    ph_setpoint: float = 4.5  # pH range: 4.0-5.0
    temperature: float = 52.5  # °C, range: 50-55
    lactic_acid_concentration: float = 1.0  # %, range: 0.2-1.67
    so2_concentration: float = 1200  # ppm, range: 600-2000
    steeping_time: float = 36.0  # hours, range: 24-48
    
    # Process Rates
    acid_feed_rate: float = 0.0  # L/min
    corn_feed_rate: float = 1000.0  # kg/hr
    
    # Quality Metrics
    moisture_content: float = 15.0  # %
    protein_content: float = 10.0  # %
    starch_content: float = 70.0  # %


@dataclass
class ProcessConstraints:
    """Safety and operational constraints"""
    
    # pH Constraints
    ph_min: float = 4.0
    ph_max: float = 5.0
    
    # Temperature Constraints
    temp_min: float = 50.0  # °C
    temp_max: float = 55.0  # °C
    
    # Acid Concentration Constraints
    acid_min: float = 0.2  # %
    acid_max: float = 1.67  # %
    
    # SO2 Safety Limits
    so2_min: float = 600  # ppm
    so2_max: float = 2000  # ppm
    
    # Time Constraints
    time_min: float = 24.0  # hours
    time_max: float = 48.0  # hours
    
    # Flow Rate Constraints
    acid_flow_min: float = 0.0  # L/min
    acid_flow_max: float = 50.0  # L/min
    corn_flow_min: float = 500.0  # kg/hr
    corn_flow_max: float = 2000.0  # kg/hr


@dataclass
class ProcessState:
    """Current state of the steeping process"""
    
    timestamp: datetime
    batch_id: str
    
    # Current Measurements
    current_ph: float
    current_temperature: float
    current_acid_concentration: float
    current_so2_level: float
    
    # Tank Levels
    tank_level: float  # %
    acid_tank_level: float  # %
    
    # Process Progress
    elapsed_time: float  # hours
    starch_extracted: float  # kg
    protein_extracted: float  # kg
    
    # Quality Indicators
    starch_yield: float  # %
    starch_purity: float  # %


@dataclass
class OptimizationObjectives:
    """Multi-objective optimization targets"""
    
    # Primary Objectives
    target_starch_yield: float = 68.0  # % (maximize)
    max_acid_cost: float = 1000.0  # $/batch (minimize)
    max_energy_cost: float = 500.0  # $/batch (minimize)
    
    # Weights for multi-objective optimization
    yield_weight: float = 0.5
    cost_weight: float = 0.3
    safety_weight: float = 0.2
    
    # Economic Parameters
    starch_price: float = 0.45  # $/kg
    acid_price: float = 0.15  # $/L
    energy_price: float = 0.08  # $/kWh
    corn_price: float = 0.20  # $/kg


@dataclass
class KineticParameters:
    """Kinetic model parameters for process simulation"""
    
    # First-order kinetic constants
    k_starch_base: float = 0.15  # 1/hr at reference conditions
    k_protein_base: float = 0.12  # 1/hr at reference conditions
    
    # Arrhenius parameters
    ea_starch: float = 45000  # J/mol activation energy
    ea_protein: float = 38000  # J/mol activation energy
    
    # pH effect parameters
    ph_optimal: float = 4.2
    ph_sensitivity: float = 0.5
    
    # Temperature effects
    temp_reference: float = 52.5  # °C
    
    # Mass transfer coefficients
    kla_starch: float = 0.08  # 1/hr
    kla_protein: float = 0.06  # 1/hr


class ProcessModel:
    """Mathematical model for corn wet milling steeping process"""
    
    def __init__(self, kinetic_params: KineticParameters):
        self.kinetic_params = kinetic_params
        self.R = 8.314  # Gas constant J/(mol·K)
    
    def calculate_reaction_rates(self, state: ProcessState, params: ProcessParameters) -> Dict[str, float]:
        """Calculate reaction rates based on current conditions"""
        
        # Temperature effect (Arrhenius)
        temp_kelvin = params.temperature + 273.15
        temp_ref_kelvin = self.kinetic_params.temp_reference + 273.15
        
        temp_factor_starch = np.exp(
            -self.kinetic_params.ea_starch / self.R * 
            (1/temp_kelvin - 1/temp_ref_kelvin)
        )
        
        temp_factor_protein = np.exp(
            -self.kinetic_params.ea_protein / self.R * 
            (1/temp_kelvin - 1/temp_ref_kelvin)
        )
        
        # pH effect (Gaussian)
        ph_factor = np.exp(
            -0.5 * ((state.current_ph - self.kinetic_params.ph_optimal) / 
                   self.kinetic_params.ph_sensitivity) ** 2
        )
        
        # Combined reaction rates
        k_starch = (self.kinetic_params.k_starch_base * 
                   temp_factor_starch * ph_factor)
        k_protein = (self.kinetic_params.k_protein_base * 
                    temp_factor_protein * ph_factor)
        
        return {
            'starch_extraction_rate': k_starch,
            'protein_extraction_rate': k_protein,
            'ph_factor': ph_factor,
            'temp_factor_starch': temp_factor_starch,
            'temp_factor_protein': temp_factor_protein
        }
    
    def predict_yield(self, params: ProcessParameters, time_horizon: float) -> Dict[str, float]:
        """Predict starch yield over time horizon"""
        
        # Simplified prediction model
        rates = self.calculate_reaction_rates(
            ProcessState(
                timestamp=datetime.now(),
                batch_id="prediction",
                current_ph=params.ph_setpoint,
                current_temperature=params.temperature,
                current_acid_concentration=params.lactic_acid_concentration,
                current_so2_level=params.so2_concentration,
                tank_level=80.0,
                acid_tank_level=60.0,
                elapsed_time=0.0,
                starch_extracted=0.0,
                protein_extracted=0.0,
                starch_yield=0.0,
                starch_purity=95.0
            ),
            params
        )
        
        # First-order extraction kinetics
        starch_remaining = np.exp(-rates['starch_extraction_rate'] * time_horizon)
        starch_yield = (1 - starch_remaining) * 70.0  # Assuming 70% initial starch
        
        protein_remaining = np.exp(-rates['protein_extraction_rate'] * time_horizon)
        protein_extraction = (1 - protein_remaining) * 10.0  # Assuming 10% initial protein
        
        return {
            'predicted_starch_yield': starch_yield,
            'predicted_protein_extraction': protein_extraction,
            'starch_remaining': starch_remaining * 70.0,
            'extraction_efficiency': rates['ph_factor'] * 100
        }


class CostModel:
    """Economic model for process optimization"""
    
    @staticmethod
    def calculate_batch_cost(params: ProcessParameters, objectives: OptimizationObjectives, 
                           batch_size: float = 10000.0) -> Dict[str, float]:
        """Calculate total batch cost breakdown"""
        
        # Acid costs
        acid_volume = (params.lactic_acid_concentration / 100.0 * 
                      batch_size * 0.001)  # Convert to m3
        acid_cost = acid_volume * objectives.acid_price * 1000  # Convert to L
        
        # Energy costs (heating and mixing)
        heating_energy = batch_size * 0.5 * (params.temperature - 20) / 100  # kWh estimate
        mixing_energy = params.steeping_time * 50  # kWh for mixing
        total_energy = heating_energy + mixing_energy
        energy_cost = total_energy * objectives.energy_price
        
        # SO2 costs (simplified)
        so2_cost = params.so2_concentration * batch_size / 1e6 * 200  # $/batch
        
        # Total operating cost
        total_cost = acid_cost + energy_cost + so2_cost
        
        return {
            'acid_cost': acid_cost,
            'energy_cost': energy_cost,
            'so2_cost': so2_cost,
            'total_cost': total_cost,
            'cost_per_kg_corn': total_cost / batch_size
        }
    
    @staticmethod
    def calculate_revenue(starch_yield: float, batch_size: float, 
                         starch_price: float) -> Dict[str, float]:
        """Calculate revenue from starch production"""
        
        starch_produced = batch_size * starch_yield / 100.0
        revenue = starch_produced * starch_price
        
        return {
            'starch_produced': starch_produced,
            'revenue': revenue,
            'revenue_per_kg_corn': revenue / batch_size
        }


# Default instances for the application
DEFAULT_CONSTRAINTS = ProcessConstraints()
DEFAULT_OBJECTIVES = OptimizationObjectives()
DEFAULT_KINETIC_PARAMS = KineticParameters()
DEFAULT_PROCESS_MODEL = ProcessModel(DEFAULT_KINETIC_PARAMS)