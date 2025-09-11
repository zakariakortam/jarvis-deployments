"""
Corn Dry Thinning Acid Set Point Optimizer
Real-time optimization system for corn processing acid chemistry
"""

import numpy as np
import pandas as pd
from scipy.optimize import minimize, differential_evolution
from scipy.integrate import odeint
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple, Optional
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CornProcessOptimizer:
    """
    Multi-objective optimization system for corn processing acid set points
    """
    
    def __init__(self):
        self.process_params = {
            'k0': 2.5e6,  # Pre-exponential factor
            'Ea': 85000,  # Activation energy (J/mol)
            'R': 8.314,   # Gas constant
            'n': 0.75,    # Acid concentration order
        }
        
        # Optimization weights
        self.weights = {
            'yield': 0.35,
            'quality': 0.25,
            'cost': 0.25,
            'safety': 0.15
        }
        
        # Operating constraints
        self.constraints = {
            'acid_conc': (0.1, 2.5),    # M
            'temperature': (60, 95),     # °C
            'residence_time': (15, 120), # min
            'flow_rate': (50, 500),      # L/min
            'pH': (1.5, 4.0)
        }
        
        # Safety limits
        self.safety_limits = {
            'acid_conc_max': 2.0,  # M (normal operation)
            'temp_max': 92,        # °C
            'pH_min': 1.8,         # pH
            'pressure_max': 4.0    # bar
        }
        
        self.current_setpoints = {}
        self.process_data = []
        
    def hydrolysis_kinetics(self, starch_conc: float, t: float, 
                           acid_conc: float, temperature: float) -> float:
        """
        Calculate hydrolysis reaction rate
        """
        T_kelvin = temperature + 273.15
        k = self.process_params['k0'] * np.exp(-self.process_params['Ea'] / 
                                              (self.process_params['R'] * T_kelvin))
        rate = k * (acid_conc ** self.process_params['n']) * starch_conc
        return -rate
    
    def calculate_conversion(self, acid_conc: float, temperature: float, 
                           residence_time: float) -> float:
        """
        Calculate starch conversion based on process conditions
        """
        T_kelvin = temperature + 273.15
        k = self.process_params['k0'] * np.exp(-self.process_params['Ea'] / 
                                              (self.process_params['R'] * T_kelvin))
        
        # Conversion calculation
        conversion = 1 - np.exp(-k * (acid_conc ** self.process_params['n']) * 
                               residence_time * 60)  # Convert min to seconds
        return min(conversion, 0.98)  # Cap at 98% for realism
    
    def yield_function(self, variables: List[float]) -> float:
        """
        Calculate process yield
        """
        acid_conc, temperature, residence_time, flow_rate = variables
        conversion = self.calculate_conversion(acid_conc, temperature, residence_time)
        
        # Selectivity decreases with excessive conditions
        selectivity = 0.95 - 0.1 * max(0, (acid_conc - 1.5) / 1.0) - \
                     0.05 * max(0, (temperature - 80) / 15)
        
        yield_val = conversion * selectivity
        return yield_val
    
    def quality_function(self, variables: List[float]) -> float:
        """
        Calculate product quality score (0-100)
        """
        acid_conc, temperature, residence_time, flow_rate = variables
        
        # Quality degrades with excessive acid or temperature
        degradation = 0.1 * max(0, (acid_conc - 1.8) / 0.7) + \
                     0.15 * max(0, (temperature - 85) / 10) + \
                     0.05 * max(0, (residence_time - 90) / 30)
        
        quality = 100 - (degradation * 100)
        return max(quality, 70)  # Minimum quality threshold
    
    def cost_function(self, variables: List[float]) -> float:
        """
        Calculate operating cost ($/ton)
        """
        acid_conc, temperature, residence_time, flow_rate = variables
        
        # Cost components
        acid_cost = acid_conc * 12.5  # $/M per ton
        energy_cost = (temperature - 25) * 0.8  # Heating cost
        time_cost = residence_time * 0.15  # Time opportunity cost
        
        total_cost = acid_cost + energy_cost + time_cost
        return total_cost
    
    def safety_function(self, variables: List[float]) -> float:
        """
        Calculate safety margin (higher is safer)
        """
        acid_conc, temperature, residence_time, flow_rate = variables
        
        # Safety margins from limits
        acid_margin = (self.safety_limits['acid_conc_max'] - acid_conc) / \
                     self.safety_limits['acid_conc_max']
        temp_margin = (self.safety_limits['temp_max'] - temperature) / \
                     self.safety_limits['temp_max']
        
        # Convert pH from acid concentration (approximate)
        pH_approx = -np.log10(acid_conc)
        pH_margin = (pH_approx - self.safety_limits['pH_min']) / 2.5
        
        safety_score = 100 * min(acid_margin, temp_margin, pH_margin)
        return max(safety_score, 0)
    
    def objective_function(self, variables: List[float]) -> float:
        """
        Multi-objective optimization function
        """
        yield_val = self.yield_function(variables)
        quality_val = self.quality_function(variables)
        cost_val = self.cost_function(variables)
        safety_val = self.safety_function(variables)
        
        # Normalize and combine objectives
        objective = (
            -self.weights['yield'] * yield_val +
            -self.weights['quality'] * (quality_val / 100) +
            self.weights['cost'] * (cost_val / 50) +  # Normalize cost
            -self.weights['safety'] * (safety_val / 100)
        )
        
        return objective
    
    def constraint_functions(self, variables: List[float]) -> List[float]:
        """
        Define constraint violations
        """
        acid_conc, temperature, residence_time, flow_rate = variables
        
        constraints = [
            # Operational constraints
            acid_conc - self.constraints['acid_conc'][0],
            self.constraints['acid_conc'][1] - acid_conc,
            temperature - self.constraints['temperature'][0],
            self.constraints['temperature'][1] - temperature,
            residence_time - self.constraints['residence_time'][0],
            self.constraints['residence_time'][1] - residence_time,
            flow_rate - self.constraints['flow_rate'][0],
            self.constraints['flow_rate'][1] - flow_rate,
            
            # Safety constraints
            self.safety_limits['acid_conc_max'] - acid_conc,
            self.safety_limits['temp_max'] - temperature,
            -np.log10(acid_conc) - self.safety_limits['pH_min'],
        ]
        
        return constraints
    
    def optimize_setpoints(self) -> Dict:
        """
        Perform multi-objective optimization
        """
        logger.info("Starting optimization...")
        
        # Initial guess
        x0 = [1.2, 75, 60, 200]  # acid_conc, temp, residence_time, flow_rate
        
        # Bounds for variables
        bounds = [
            self.constraints['acid_conc'],
            self.constraints['temperature'],
            self.constraints['residence_time'],
            self.constraints['flow_rate']
        ]
        
        # Constraint definitions for scipy
        cons = {'type': 'ineq', 'fun': lambda x: self.constraint_functions(x)}
        
        # Optimization using differential evolution (global optimizer)
        result = differential_evolution(
            self.objective_function,
            bounds,
            maxiter=100,
            popsize=15,
            atol=1e-6,
            seed=42
        )
        
        if result.success:
            optimal_vars = result.x
            acid_conc, temperature, residence_time, flow_rate = optimal_vars
            
            # Calculate performance metrics
            yield_val = self.yield_function(optimal_vars)
            quality_val = self.quality_function(optimal_vars)
            cost_val = self.cost_function(optimal_vars)
            safety_val = self.safety_function(optimal_vars)
            
            optimal_setpoints = {
                'acid_concentration': acid_conc,
                'temperature': temperature,
                'residence_time': residence_time,
                'flow_rate': flow_rate,
                'pH_setpoint': -np.log10(acid_conc),
                'performance': {
                    'yield': yield_val,
                    'quality': quality_val,
                    'cost': cost_val,
                    'safety': safety_val,
                    'objective_value': result.fun
                },
                'timestamp': datetime.now().isoformat()
            }
            
            self.current_setpoints = optimal_setpoints
            logger.info(f"Optimization successful. Yield: {yield_val:.3f}, Quality: {quality_val:.1f}")
            
        else:
            logger.error("Optimization failed!")
            optimal_setpoints = {}
            
        return optimal_setpoints
    
    def simulate_process(self, duration_hours: float = 8, 
                        disturbances: Optional[Dict] = None) -> pd.DataFrame:
        """
        Simulate process operation with disturbances
        """
        logger.info(f"Simulating process for {duration_hours} hours...")
        
        if not self.current_setpoints:
            self.optimize_setpoints()
        
        time_points = np.linspace(0, duration_hours * 60, int(duration_hours * 60))
        results = []
        
        for t in time_points:
            # Add disturbances if provided
            acid_conc = self.current_setpoints['acid_concentration']
            temperature = self.current_setpoints['temperature']
            residence_time = self.current_setpoints['residence_time']
            flow_rate = self.current_setpoints['flow_rate']
            
            if disturbances:
                # Add random disturbances
                acid_conc += np.random.normal(0, 0.05)
                temperature += np.random.normal(0, 2.0)
                flow_rate += np.random.normal(0, 10.0)
            
            # Calculate current performance
            variables = [acid_conc, temperature, residence_time, flow_rate]
            yield_val = self.yield_function(variables)
            quality_val = self.quality_function(variables)
            cost_val = self.cost_function(variables)
            
            results.append({
                'time': t,
                'acid_concentration': acid_conc,
                'temperature': temperature,
                'residence_time': residence_time,
                'flow_rate': flow_rate,
                'pH': -np.log10(acid_conc),
                'yield': yield_val,
                'quality': quality_val,
                'cost': cost_val
            })
        
        return pd.DataFrame(results)
    
    def safety_check(self, variables: List[float]) -> Dict[str, bool]:
        """
        Check if current conditions are within safety limits
        """
        acid_conc, temperature, residence_time, flow_rate = variables
        pH = -np.log10(acid_conc)
        
        safety_status = {
            'acid_concentration_safe': acid_conc <= self.safety_limits['acid_conc_max'],
            'temperature_safe': temperature <= self.safety_limits['temp_max'],
            'pH_safe': pH >= self.safety_limits['pH_min'],
            'overall_safe': True
        }
        
        safety_status['overall_safe'] = all([
            safety_status['acid_concentration_safe'],
            safety_status['temperature_safe'],
            safety_status['pH_safe']
        ])
        
        return safety_status
    
    def generate_report(self) -> Dict:
        """
        Generate optimization report
        """
        if not self.current_setpoints:
            return {"error": "No optimization results available"}
        
        report = {
            "optimization_summary": {
                "timestamp": self.current_setpoints['timestamp'],
                "optimal_setpoints": {
                    "acid_concentration": f"{self.current_setpoints['acid_concentration']:.2f} M",
                    "pH_setpoint": f"{self.current_setpoints['pH_setpoint']:.2f}",
                    "temperature": f"{self.current_setpoints['temperature']:.1f} °C",
                    "residence_time": f"{self.current_setpoints['residence_time']:.1f} min",
                    "flow_rate": f"{self.current_setpoints['flow_rate']:.0f} L/min"
                },
                "performance_metrics": {
                    "yield": f"{self.current_setpoints['performance']['yield']:.1%}",
                    "quality_score": f"{self.current_setpoints['performance']['quality']:.1f}/100",
                    "operating_cost": f"${self.current_setpoints['performance']['cost']:.2f}/ton",
                    "safety_margin": f"{self.current_setpoints['performance']['safety']:.1f}/100"
                }
            },
            "safety_assessment": self.safety_check([
                self.current_setpoints['acid_concentration'],
                self.current_setpoints['temperature'],
                self.current_setpoints['residence_time'],
                self.current_setpoints['flow_rate']
            ])
        }
        
        return report

def main():
    """
    Main execution function
    """
    print("=== Corn Processing Acid Set Point Optimizer ===")
    print("Initializing optimization system...")
    
    # Create optimizer instance
    optimizer = CornProcessOptimizer()
    
    # Perform optimization
    print("\nPerforming multi-objective optimization...")
    optimal_setpoints = optimizer.optimize_setpoints()
    
    if optimal_setpoints:
        # Generate and display report
        report = optimizer.generate_report()
        print("\n=== OPTIMIZATION RESULTS ===")
        print(f"Timestamp: {report['optimization_summary']['timestamp']}")
        print("\nOptimal Setpoints:")
        for param, value in report['optimization_summary']['optimal_setpoints'].items():
            print(f"  {param.replace('_', ' ').title()}: {value}")
        
        print("\nPerformance Metrics:")
        for metric, value in report['optimization_summary']['performance_metrics'].items():
            print(f"  {metric.replace('_', ' ').title()}: {value}")
        
        print("\nSafety Status:")
        safety = report['safety_assessment']
        for check, status in safety.items():
            if check != 'overall_safe':
                print(f"  {check.replace('_', ' ').title()}: {'' if status else ''}")
        
        # Simulate process
        print("\nSimulating 8-hour process operation...")
        simulation_data = optimizer.simulate_process(duration_hours=8, 
                                                   disturbances={'enable': True})
        
        print(f"Simulation completed. Average yield: {simulation_data['yield'].mean():.1%}")
        print(f"Average quality score: {simulation_data['quality'].mean():.1f}")
        print(f"Average operating cost: ${simulation_data['cost'].mean():.2f}/ton")
        
        # Save results
        with open('/projects/corn-optimizer/optimization_results.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        simulation_data.to_csv('/projects/corn-optimizer/simulation_data.csv', index=False)
        
        print("\nResults saved to:")
        print("- optimization_results.json")
        print("- simulation_data.csv")
        
    else:
        print("Optimization failed. Please check constraints and parameters.")

if __name__ == "__main__":
    main()