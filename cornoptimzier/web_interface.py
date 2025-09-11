"""
Web-based User Interface for Corn Processing Acid Set Point Optimizer
Flask-based dashboard with real-time monitoring and control capabilities
"""

from flask import Flask, render_template, jsonify, request, send_file
import plotly.graph_objs as go
import plotly.utils
import pandas as pd
import json
from datetime import datetime, timedelta
import threading
import time
import os
from main import CornProcessOptimizer

app = Flask(__name__)
app.secret_key = 'corn_optimizer_2024'

# Global optimizer instance
optimizer = CornProcessOptimizer()
current_data = {'real_time': [], 'alarms': []}
optimization_running = False

class ProcessMonitor:
    """Real-time process monitoring"""
    
    def __init__(self):
        self.data_buffer = []
        self.running = False
        
    def start_monitoring(self):
        """Start real-time data collection"""
        self.running = True
        thread = threading.Thread(target=self._collect_data)
        thread.daemon = True
        thread.start()
        
    def _collect_data(self):
        """Simulate real-time data collection"""
        while self.running:
            if optimizer.current_setpoints:
                # Simulate sensor readings with noise
                import numpy as np
                
                base_acid = optimizer.current_setpoints['acid_concentration']
                base_temp = optimizer.current_setpoints['temperature']
                base_flow = optimizer.current_setpoints['flow_rate']
                
                # Add realistic sensor noise
                acid_reading = base_acid + np.random.normal(0, 0.02)
                temp_reading = base_temp + np.random.normal(0, 1.0)
                flow_reading = base_flow + np.random.normal(0, 5.0)
                pH_reading = -np.log10(acid_reading)
                
                # Calculate derived values
                variables = [acid_reading, temp_reading, 
                           optimizer.current_setpoints['residence_time'], flow_reading]
                yield_val = optimizer.yield_function(variables)
                quality_val = optimizer.quality_function(variables)
                cost_val = optimizer.cost_function(variables)
                
                data_point = {
                    'timestamp': datetime.now().isoformat(),
                    'acid_concentration': round(acid_reading, 3),
                    'temperature': round(temp_reading, 1),
                    'flow_rate': round(flow_reading, 1),
                    'pH': round(pH_reading, 2),
                    'yield': round(yield_val, 3),
                    'quality': round(quality_val, 1),
                    'cost': round(cost_val, 2)
                }
                
                self.data_buffer.append(data_point)
                current_data['real_time'] = self.data_buffer[-100:]  # Keep last 100 points
                
                # Check for alarms
                self._check_alarms(data_point)
                
            time.sleep(2)  # Update every 2 seconds
    
    def _check_alarms(self, data_point):
        """Check for alarm conditions"""
        alarms = []
        
        if data_point['acid_concentration'] > 2.0:
            alarms.append({
                'severity': 'HIGH',
                'message': f"Acid concentration high: {data_point['acid_concentration']:.2f} M",
                'timestamp': data_point['timestamp']
            })
            
        if data_point['temperature'] > 92:
            alarms.append({
                'severity': 'HIGH', 
                'message': f"Temperature high: {data_point['temperature']:.1f} °C",
                'timestamp': data_point['timestamp']
            })
            
        if data_point['pH'] < 1.8:
            alarms.append({
                'severity': 'MEDIUM',
                'message': f"pH low: {data_point['pH']:.2f}",
                'timestamp': data_point['timestamp']
            })
            
        if data_point['yield'] < 0.85:
            alarms.append({
                'severity': 'MEDIUM',
                'message': f"Yield low: {data_point['yield']:.1%}",
                'timestamp': data_point['timestamp']
            })
        
        current_data['alarms'].extend(alarms)
        # Keep only recent alarms
        current_data['alarms'] = current_data['alarms'][-50:]

monitor = ProcessMonitor()

@app.route('/')
def dashboard():
    """Main dashboard page"""
    return render_template('dashboard.html')

@app.route('/api/optimize')
def api_optimize():
    """Perform optimization"""
    global optimization_running
    
    try:
        optimization_running = True
        optimal_setpoints = optimizer.optimize_setpoints()
        optimization_running = False
        
        if optimal_setpoints:
            return jsonify({
                'success': True,
                'setpoints': optimal_setpoints,
                'message': 'Optimization completed successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Optimization failed'
            })
            
    except Exception as e:
        optimization_running = False
        return jsonify({
            'success': False,
            'message': f'Error during optimization: {str(e)}'
        })

@app.route('/api/current_data')
def api_current_data():
    """Get current process data"""
    return jsonify(current_data)

@app.route('/api/setpoints')
def api_setpoints():
    """Get current setpoints"""
    if optimizer.current_setpoints:
        return jsonify({
            'success': True,
            'setpoints': optimizer.current_setpoints
        })
    else:
        return jsonify({
            'success': False,
            'message': 'No setpoints available. Run optimization first.'
        })

@app.route('/api/update_setpoint', methods=['POST'])
def api_update_setpoint():
    """Manually update a setpoint"""
    try:
        data = request.json
        parameter = data.get('parameter')
        value = float(data.get('value'))
        
        if not optimizer.current_setpoints:
            return jsonify({
                'success': False,
                'message': 'No baseline setpoints available'
            })
        
        # Validate parameter and value
        valid_params = {
            'acid_concentration': (0.1, 2.5),
            'temperature': (60, 95),
            'residence_time': (15, 120),
            'flow_rate': (50, 500)
        }
        
        if parameter not in valid_params:
            return jsonify({
                'success': False,
                'message': f'Invalid parameter: {parameter}'
            })
        
        min_val, max_val = valid_params[parameter]
        if not (min_val <= value <= max_val):
            return jsonify({
                'success': False,
                'message': f'{parameter} must be between {min_val} and {max_val}'
            })
        
        # Update setpoint
        optimizer.current_setpoints[parameter] = value
        if parameter == 'acid_concentration':
            optimizer.current_setpoints['pH_setpoint'] = -np.log10(value)
        
        # Recalculate performance
        variables = [
            optimizer.current_setpoints['acid_concentration'],
            optimizer.current_setpoints['temperature'],
            optimizer.current_setpoints['residence_time'],
            optimizer.current_setpoints['flow_rate']
        ]
        
        optimizer.current_setpoints['performance'] = {
            'yield': optimizer.yield_function(variables),
            'quality': optimizer.quality_function(variables),
            'cost': optimizer.cost_function(variables),
            'safety': optimizer.safety_function(variables)
        }
        
        return jsonify({
            'success': True,
            'message': f'{parameter} updated to {value}',
            'updated_setpoints': optimizer.current_setpoints
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating setpoint: {str(e)}'
        })

@app.route('/api/safety_status')
def api_safety_status():
    """Get current safety status"""
    if optimizer.current_setpoints:
        variables = [
            optimizer.current_setpoints['acid_concentration'],
            optimizer.current_setpoints['temperature'],
            optimizer.current_setpoints['residence_time'],
            optimizer.current_setpoints['flow_rate']
        ]
        
        safety_status = optimizer.safety_check(variables)
        return jsonify({
            'success': True,
            'safety_status': safety_status
        })
    else:
        return jsonify({
            'success': False,
            'message': 'No setpoints available'
        })

@app.route('/api/trend_chart')
def api_trend_chart():
    """Generate trend chart data"""
    if not current_data['real_time']:
        return jsonify({'success': False, 'message': 'No data available'})
    
    df = pd.DataFrame(current_data['real_time'])
    
    fig = go.Figure()
    
    # Add traces for key parameters
    fig.add_trace(go.Scatter(
        x=df['timestamp'],
        y=df['yield'],
        mode='lines+markers',
        name='Yield',
        line=dict(color='green'),
        yaxis='y1'
    ))
    
    fig.add_trace(go.Scatter(
        x=df['timestamp'],
        y=df['quality'],
        mode='lines+markers',
        name='Quality Score',
        line=dict(color='blue'),
        yaxis='y2'
    ))
    
    fig.add_trace(go.Scatter(
        x=df['timestamp'],
        y=df['temperature'],
        mode='lines+markers',
        name='Temperature (°C)',
        line=dict(color='red'),
        yaxis='y3'
    ))
    
    fig.update_layout(
        title='Process Trends',
        xaxis=dict(title='Time'),
        yaxis=dict(title='Yield', side='left', position=0),
        yaxis2=dict(title='Quality Score', side='right', overlaying='y', position=1),
        yaxis3=dict(title='Temperature (°C)', side='right', overlaying='y', position=0.9),
        legend=dict(x=0, y=1),
        height=400
    )
    
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    
    return jsonify({
        'success': True,
        'chart': graphJSON
    })

@app.route('/api/performance_chart')
def api_performance_chart():
    """Generate performance radar chart"""
    if not optimizer.current_setpoints:
        return jsonify({'success': False, 'message': 'No setpoints available'})
    
    performance = optimizer.current_setpoints['performance']
    
    categories = ['Yield', 'Quality', 'Safety', 'Cost Efficiency']
    values = [
        performance['yield'] * 100,
        performance['quality'],
        performance['safety'],
        (100 - min(performance['cost'] / 50 * 100, 100))  # Invert cost for radar
    ]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatterpolar(
        r=values,
        theta=categories,
        fill='toself',
        name='Current Performance',
        line_color='blue'
    ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 100]
            )),
        showlegend=True,
        title="Performance Overview",
        height=400
    )
    
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    
    return jsonify({
        'success': True,
        'chart': graphJSON
    })

@app.route('/start_monitoring')
def start_monitoring():
    """Start real-time monitoring"""
    monitor.start_monitoring()
    return jsonify({'success': True, 'message': 'Monitoring started'})

if __name__ == '__main__':
    # Start monitoring
    monitor.start_monitoring()
    
    # Create templates directory if it doesn't exist
    import os
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    print("Starting Corn Process Optimizer Web Interface...")
    print("Access the dashboard at: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)