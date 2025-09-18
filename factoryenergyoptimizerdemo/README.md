# OKI Factory Energy Optimization System

## Overview

A comprehensive AI-powered system for optimizing factory energy consumption and reducing electricity costs while maintaining production quality and output. The system integrates with factory PLCs via OPC UA standards and uses multi-agent AI to provide real-time optimization recommendations.

## Features

### Core Capabilities
- **Real-time OPC UA Integration**: Connects to factory PLCs for live sensor data
- **AI Agent-Based Analysis**: Multi-agent system for anomaly detection and optimization
- **Bilingual Support**: Full English/Japanese interface
- **Customizable Dashboards**: User-configurable KPIs and visualizations
- **Cost Analysis**: Real-time electricity cost tracking and optimization
- **Production Alignment**: Power consumption analysis aligned with production metrics

### AI Agent System
- **Anomaly Detection Agent**: Identifies unusual power consumption patterns
- **Cost Optimization Agent**: Recommends cost reduction strategies
- **Efficiency Agent**: Analyzes energy intensity and OEE improvements
- **Predictive Maintenance Agent**: Equipment maintenance recommendations
- **Decision Coordinator**: Coordinates multiple agent inputs for optimal decisions

### Dashboard Components
- **Power Consumption Monitoring**: Real-time voltage, current, and power factor
- **Production Metrics**: Units/hour, OEE, cycle time tracking
- **Cost Analysis**: Hourly and daily cost calculations
- **Environmental Monitoring**: Temperature, humidity, vibration levels
- **Interactive Charts**: Historical data visualization with Chart.js

## System Architecture

```
index.html          - Main dashboard and UI
data-service.js     - OPC UA integration and data processing
ai-agents.js        - Multi-agent AI system
config.js           - Configuration and multilingual support
```

## Technical Specifications

### Data Sources
- **Power Meters**: Voltage (L1, L2, L3), Current, Active/Reactive Power, Power Factor
- **Production Systems**: Line speed, units/hour, cycle time, downtime, quality rate
- **Environmental Sensors**: Temperature, humidity, vibration, noise levels

### OPC UA Integration
- Supports multiple PLC endpoints
- Real-time data subscription
- Automatic reconnection handling
- Simulated connection for demo purposes

### AI Capabilities
- Real-time anomaly detection
- Cost optimization recommendations
- Efficiency improvement suggestions
- Predictive maintenance alerts
- Transparent decision-making process

## Installation

1. Place all files in a web server directory
2. Open `index.html` in a modern web browser
3. The system will automatically start simulating OPC UA connections and data

## Configuration

### System Controls
- **Target Efficiency**: Set efficiency targets (70-100%)
- **Cost Threshold**: Define cost alerts (¥10-50/kWh)
- **Analysis Period**: Choose data analysis timeframe (1h, 8h, 24h, 7d)
- **Language**: Toggle between English and Japanese

### Customization
- Modify thresholds in `ai-agents.js`
- Add new KPIs in `config.js`
- Customize charts in the ConfigurationManager class
- Update translations in the language files

## OPC UA Node Mapping

```javascript
Power Meters:
- ns=2;s=PowerMeter.Voltage.L1/L2/L3
- ns=2;s=PowerMeter.Current.L1/L2/L3
- ns=2;s=PowerMeter.ActivePower
- ns=2;s=PowerMeter.ReactivePower
- ns=2;s=PowerMeter.PowerFactor

Production:
- ns=2;s=Production.LineSpeed
- ns=2;s=Production.UnitsPerHour
- ns=2;s=Production.CycleTime
- ns=2;s=Production.QualityRate

Environment:
- ns=2;s=Environment.Temperature
- ns=2;s=Environment.Humidity
- ns=2;s=Environment.Vibration
```

## Cost Optimization Strategies

The AI system provides recommendations for:
- **Load Scheduling**: Shift operations to off-peak hours
- **Power Factor Correction**: Install capacitor banks
- **Peak Demand Management**: Reduce demand charges
- **Equipment Optimization**: Upgrade inefficient machinery
- **Predictive Maintenance**: Prevent energy waste from failing equipment

## Safety Features

- **Emergency Stop**: Immediate system shutdown capability
- **Connection Monitoring**: Real-time OPC UA status
- **Anomaly Alerts**: Instant notifications for critical issues
- **Data Validation**: Input sanitization and error handling

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

- Chart.js 4.2.1 (CDN)
- Font Awesome 6.0.0 (CDN)

## Future Enhancements

- Integration with existing MES/ERP systems
- Mobile application support
- Advanced ML model deployment
- Historical data analytics
- Integration with energy trading systems
- Carbon footprint tracking

## Support

For technical support and customization:
- Modify agent thresholds in `ai-agents.js`
- Update translations in `config.js`
- Customize UI components in `index.html`
- Add new data sources in `data-service.js`

## License

Proprietary software for OKI factory optimization system.