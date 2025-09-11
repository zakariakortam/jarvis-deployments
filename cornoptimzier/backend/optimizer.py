"""
Corn Wet Milling Steeping Optimization Engine
Multi-objective optimization for acid set point control
"""

import numpy as np
from scipy.optimize import minimize, differential_evolution
from typing import Dict, List, Tuple, Optional
from dataclasses import asdict
import logging
from datetime import datetime, timedelta

from models import (
    ProcessParameters, ProcessConstraints, ProcessState,
    OptimizationObjectives, ProcessModel, CostModel,
    DEFAULT_CONSTRAINTS, DEFAULT_OBJECTIVES, DEFAULT_PROCESS_MODEL
)


class OptimizationEngine:
    """Main optimization engine for corn wet milling steeping process"""
    
    def __init__(self, 
                 process_model: ProcessModel = DEFAULT_PROCESS_MODEL,
                 constraints: ProcessConstraints = DEFAULT_CONSTRAINTS,
                 objectives: OptimizationObjectives = DEFAULT_OBJECTIVES):
        
        self.process_model = process_model
        self.constraints = constraints
        self.objectives = objectives
        self.cost_model = CostModel()
        
        # Optimization history
        self.optimization_history: List[Dict] = []
        
        # Logger
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)
    
    def objective_function(self, decision_vars: np.ndarray, 
                          current_state: ProcessState,
                          batch_size: float = 10000.0) -> float:
        """
        Multi-objective function to minimize (negative profit + penalties)
        
        Decision Variables:
        [0] pH setpoint
        [1] temperature 
        [2] lactic acid concentration
        [3] SO2 concentration
        [4] steeping time
        """
        
        # Extract decision variables
        ph_setpoint, temperature, acid_conc, so2_conc, steeping_time = decision_vars
        
        # Create process parameters
        params = ProcessParameters(
            ph_setpoint=ph_setpoint,
            temperature=temperature,
            lactic_acid_concentration=acid_conc,
            so2_concentration=so2_conc,
            steeping_time=steeping_time
        )
        
        # Predict performance
        prediction = self.process_model.predict_yield(params, steeping_time)
        starch_yield = prediction['predicted_starch_yield']
        
        # Calculate costs
        costs = self.cost_model.calculate_batch_cost(params, self.objectives, batch_size)
        total_cost = costs['total_cost']
        
        # Calculate revenue
        revenue_data = self.cost_model.calculate_revenue(
            starch_yield, batch_size, self.objectives.starch_price
        )
        revenue = revenue_data['revenue']
        
        # Calculate profit
        profit = revenue - total_cost
        
        # Add constraint penalties
        penalty = self._calculate_constraint_penalties(decision_vars)
        
        # Multi-objective combination (minimize negative profit + penalties)
        objective_value = (
            -profit * self.objectives.yield_weight +
            total_cost * self.objectives.cost_weight +
            penalty * self.objectives.safety_weight * 1000
        )
        
        return objective_value
    
    def _calculate_constraint_penalties(self, decision_vars: np.ndarray) -> float:
        """Calculate penalty for constraint violations"""
        
        ph_setpoint, temperature, acid_conc, so2_conc, steeping_time = decision_vars
        penalty = 0.0
        
        # pH constraints
        if ph_setpoint < self.constraints.ph_min:
            penalty += (self.constraints.ph_min - ph_setpoint) ** 2
        elif ph_setpoint > self.constraints.ph_max:
            penalty += (ph_setpoint - self.constraints.ph_max) ** 2
        
        # Temperature constraints
        if temperature < self.constraints.temp_min:
            penalty += (self.constraints.temp_min - temperature) ** 2
        elif temperature > self.constraints.temp_max:
            penalty += (temperature - self.constraints.temp_max) ** 2
        
        # Acid concentration constraints
        if acid_conc < self.constraints.acid_min:
            penalty += (self.constraints.acid_min - acid_conc) ** 2
        elif acid_conc > self.constraints.acid_max:
            penalty += (acid_conc - self.constraints.acid_max) ** 2
        
        # SO2 constraints
        if so2_conc < self.constraints.so2_min:
            penalty += (self.constraints.so2_min - so2_conc) ** 2
        elif so2_conc > self.constraints.so2_max:
            penalty += (so2_conc - self.constraints.so2_max) ** 2
        
        # Time constraints
        if steeping_time < self.constraints.time_min:
            penalty += (self.constraints.time_min - steeping_time) ** 2
        elif steeping_time > self.constraints.time_max:
            penalty += (steeping_time - self.constraints.time_max) ** 2
        
        return penalty
    
    def optimize_batch(self, current_state: ProcessState, 
                      batch_size: float = 10000.0) -> Dict:
        """
        Optimize acid set point for current batch
        
        Returns optimized parameters and performance predictions
        """
        
        self.logger.info(f"Starting optimization for batch {current_state.batch_id}")
        
        # Define bounds for decision variables
        bounds = [
            (self.constraints.ph_min, self.constraints.ph_max),           # pH
            (self.constraints.temp_min, self.constraints.temp_max),       # Temperature
            (self.constraints.acid_min, self.constraints.acid_max),       # Acid conc
            (self.constraints.so2_min, self.constraints.so2_max),         # SO2 conc
            (self.constraints.time_min, self.constraints.time_max)        # Time
        ]
        
        # Initial guess (current setpoints or defaults)
        x0 = np.array([
            current_state.current_ph if current_state.current_ph > 0 else 4.5,
            current_state.current_temperature if current_state.current_temperature > 0 else 52.5,
            current_state.current_acid_concentration if current_state.current_acid_concentration > 0 else 1.0,
            current_state.current_so2_level if current_state.current_so2_level > 0 else 1200,
            36.0  # Default steeping time
        ])
        
        # Global optimization using Differential Evolution
        try:
            result_global = differential_evolution(
                self.objective_function,
                bounds,
                args=(current_state, batch_size),
                seed=42,
                maxiter=100,
                popsize=15,
                tol=1e-6
            )
            
            optimal_vars = result_global.x
            optimal_objective = result_global.fun
            success = result_global.success
            
        except Exception as e:
            self.logger.error(f"Global optimization failed: {e}")
            # Fallback to local optimization
            result_local = minimize(
                self.objective_function,
                x0,
                args=(current_state, batch_size),
                method='L-BFGS-B',
                bounds=bounds
            )
            
            optimal_vars = result_local.x
            optimal_objective = result_local.fun
            success = result_local.success
        
        # Create optimized parameters
        optimal_params = ProcessParameters(
            ph_setpoint=optimal_vars[0],
            temperature=optimal_vars[1],
            lactic_acid_concentration=optimal_vars[2],
            so2_concentration=optimal_vars[3],
            steeping_time=optimal_vars[4]
        )
        
        # Calculate performance predictions
        prediction = self.process_model.predict_yield(optimal_params, optimal_vars[4])
        costs = self.cost_model.calculate_batch_cost(optimal_params, self.objectives, batch_size)
        revenue_data = self.cost_model.calculate_revenue(
            prediction['predicted_starch_yield'], batch_size, self.objectives.starch_price
        )
        
        # Compile results
        optimization_result = {
            'timestamp': datetime.now(),
            'batch_id': current_state.batch_id,
            'success': success,
            'optimal_parameters': asdict(optimal_params),
            'objective_value': optimal_objective,
            'performance': {
                'predicted_starch_yield': prediction['predicted_starch_yield'],
                'predicted_protein_extraction': prediction['predicted_protein_extraction'],
                'extraction_efficiency': prediction['extraction_efficiency'],
                'starch_remaining': prediction['starch_remaining']
            },
            'economics': {
                'total_cost': costs['total_cost'],
                'acid_cost': costs['acid_cost'],
                'energy_cost': costs['energy_cost'],
                'so2_cost': costs['so2_cost'],
                'revenue': revenue_data['revenue'],
                'profit': revenue_data['revenue'] - costs['total_cost'],
                'roi': (revenue_data['revenue'] - costs['total_cost']) / costs['total_cost'] * 100
            },
            'optimization_details': {
                'constraint_penalty': self._calculate_constraint_penalties(optimal_vars),
                'iterations': getattr(result_global if 'result_global' in locals() else result_local, 'nit', 0),
                'function_evaluations': getattr(result_global if 'result_global' in locals() else result_local, 'nfev', 0)
            }
        }
        
        # Store in history
        self.optimization_history.append(optimization_result)
        
        self.logger.info(f"Optimization completed. Predicted yield: {prediction['predicted_starch_yield']:.2f}%, "
                        f"Profit: ${optimization_result['economics']['profit']:.2f}")
        
        return optimization_result


class ModelPredictiveController:
    """Model Predictive Controller for real-time optimization"""
    
    def __init__(self, optimizer: OptimizationEngine,
                 prediction_horizon: int = 10,  # 30-minute steps
                 control_horizon: int = 5):
        
        self.optimizer = optimizer
        self.prediction_horizon = prediction_horizon
        self.control_horizon = control_horizon
        
        # Control history for adaptive tuning
        self.control_history: List[Dict] = []
        
        # Kalman filter parameters for state estimation
        self.kalman_gain = 0.3
        self.process_noise = 0.1
        self.measurement_noise = 0.05
        
        self.logger = logging.getLogger(__name__)
    
    def predict_trajectory(self, current_state: ProcessState, 
                          control_sequence: np.ndarray) -> List[ProcessState]:
        """Predict state trajectory over prediction horizon"""
        
        states = [current_state]
        
        for i in range(self.prediction_horizon):
            # Extract control inputs for this time step
            if i < len(control_sequence):
                controls = control_sequence[i]
            else:
                # Hold last control values
                controls = control_sequence[-1]
            
            # Create process parameters from controls
            params = ProcessParameters(
                ph_setpoint=controls[0],
                temperature=controls[1],
                lactic_acid_concentration=controls[2],
                so2_concentration=controls[3],
                steeping_time=current_state.elapsed_time + (i + 1) * 0.5  # 30-min steps
            )
            
            # Predict next state (simplified state propagation)
            next_state = self._propagate_state(states[-1], params, 0.5)
            states.append(next_state)
        
        return states[1:]  # Return predicted states (excluding current)
    
    def _propagate_state(self, current_state: ProcessState, 
                        params: ProcessParameters, dt: float) -> ProcessState:
        """Propagate state forward by dt hours"""
        
        # Get reaction rates
        rates = self.optimizer.process_model.calculate_reaction_rates(current_state, params)
        
        # Update extractions (simplified first-order kinetics)
        starch_rate = rates['starch_extraction_rate']
        protein_rate = rates['protein_extraction_rate']
        
        new_starch_extracted = current_state.starch_extracted + starch_rate * dt * 100
        new_protein_extracted = current_state.protein_extracted + protein_rate * dt * 50
        
        # Update state
        new_state = ProcessState(
            timestamp=current_state.timestamp + timedelta(hours=dt),
            batch_id=current_state.batch_id,
            current_ph=params.ph_setpoint,  # Assume perfect control
            current_temperature=params.temperature,
            current_acid_concentration=params.lactic_acid_concentration,
            current_so2_level=params.so2_concentration,
            tank_level=max(0, current_state.tank_level - dt * 2),  # Simplified drainage
            acid_tank_level=current_state.acid_tank_level,
            elapsed_time=current_state.elapsed_time + dt,
            starch_extracted=new_starch_extracted,
            protein_extracted=new_protein_extracted,
            starch_yield=(new_starch_extracted / 7000) * 100,  # Assuming 7000 kg initial starch
            starch_purity=95.0
        )
        
        return new_state
    
    def compute_mpc_control(self, current_state: ProcessState) -> Dict:
        """Compute MPC control action"""
        
        self.logger.info(f"Computing MPC control for batch {current_state.batch_id}")
        
        # Use optimizer to get optimal trajectory
        optimization_result = self.optimizer.optimize_batch(current_state)
        
        if optimization_result['success']:
            # Extract control actions
            optimal_params = optimization_result['optimal_parameters']
            
            control_action = {
                'ph_setpoint': optimal_params['ph_setpoint'],
                'temperature': optimal_params['temperature'],
                'acid_concentration': optimal_params['lactic_acid_concentration'],
                'so2_concentration': optimal_params['so2_concentration'],
                'acid_feed_rate': self._calculate_acid_feed_rate(
                    current_state, optimal_params['lactic_acid_concentration']
                )
            }
            
            # Store control history
            control_record = {
                'timestamp': datetime.now(),
                'batch_id': current_state.batch_id,
                'control_action': control_action,
                'predicted_performance': optimization_result['performance'],
                'cost_prediction': optimization_result['economics']
            }
            
            self.control_history.append(control_record)
            
            return {
                'success': True,
                'control_action': control_action,
                'prediction': optimization_result['performance'],
                'economics': optimization_result['economics']
            }
        
        else:
            self.logger.error("MPC optimization failed, using fallback control")
            return {
                'success': False,
                'control_action': {
                    'ph_setpoint': current_state.current_ph,
                    'temperature': current_state.current_temperature,
                    'acid_concentration': current_state.current_acid_concentration,
                    'so2_concentration': current_state.current_so2_level,
                    'acid_feed_rate': 0.0
                }
            }
    
    def _calculate_acid_feed_rate(self, current_state: ProcessState, 
                                 target_concentration: float) -> float:
        """Calculate required acid feed rate to achieve target concentration"""
        
        # Simplified calculation based on tank volume and target concentration
        tank_volume = 50000  # L (assumed)
        current_conc = current_state.current_acid_concentration
        
        if target_concentration > current_conc:
            # Need to increase concentration
            conc_diff = target_concentration - current_conc
            feed_rate = conc_diff * tank_volume / 100  # L/min
            return min(feed_rate, 10.0)  # Max 10 L/min
        
        return 0.0  # No acid addition needed


# Factory functions for easy instantiation
def create_optimizer(custom_constraints: Optional[ProcessConstraints] = None,
                    custom_objectives: Optional[OptimizationObjectives] = None) -> OptimizationEngine:
    """Factory function to create optimizer with custom parameters"""
    
    constraints = custom_constraints if custom_constraints else DEFAULT_CONSTRAINTS
    objectives = custom_objectives if custom_objectives else DEFAULT_OBJECTIVES
    
    return OptimizationEngine(
        process_model=DEFAULT_PROCESS_MODEL,
        constraints=constraints,
        objectives=objectives
    )


def create_mpc_controller(optimizer: OptimizationEngine) -> ModelPredictiveController:
    """Factory function to create MPC controller"""
    
    return ModelPredictiveController(optimizer)