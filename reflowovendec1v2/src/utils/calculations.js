import { mean, standardDeviation, min, max, quantile, linearRegression } from 'simple-statistics';

export function calculateStats(values) {
  if (!values || values.length === 0) {
    return { mean: 0, std: 0, min: 0, max: 0, q1: 0, median: 0, q3: 0 };
  }

  const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (numericValues.length === 0) {
    return { mean: 0, std: 0, min: 0, max: 0, q1: 0, median: 0, q3: 0 };
  }

  const sorted = [...numericValues].sort((a, b) => a - b);

  return {
    mean: mean(numericValues),
    std: numericValues.length > 1 ? standardDeviation(numericValues) : 0,
    min: min(numericValues),
    max: max(numericValues),
    q1: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75),
    count: numericValues.length,
  };
}

export function calculateMovingAverage(values, windowSize = 5) {
  if (!values || values.length < windowSize) return values;

  const result = [];
  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      result.push(values[i]);
    } else {
      const window = values.slice(i - windowSize + 1, i + 1);
      result.push(mean(window));
    }
  }
  return result;
}

export function calculateRateOfChange(values, sampleIntervalSeconds = 10) {
  if (!values || values.length < 2) return [];

  const rates = [0];
  for (let i = 1; i < values.length; i++) {
    const rate = (values[i] - values[i - 1]) / (sampleIntervalSeconds / 60); // per minute
    rates.push(rate);
  }
  return rates;
}

export function detectAnomalies(values, threshold = 2) {
  const stats = calculateStats(values);
  const anomalies = [];

  values.forEach((value, index) => {
    const zScore = Math.abs((value - stats.mean) / stats.std);
    if (zScore > threshold) {
      anomalies.push({
        index,
        value,
        zScore,
        deviation: value - stats.mean,
      });
    }
  });

  return anomalies;
}

export function calculateTrend(values) {
  if (!values || values.length < 2) return { slope: 0, intercept: 0, trend: 'stable' };

  const points = values.map((y, x) => [x, y]);
  const regression = linearRegression(points);

  let trend = 'stable';
  if (regression.m > 0.1) trend = 'increasing';
  else if (regression.m < -0.1) trend = 'decreasing';

  return {
    slope: regression.m,
    intercept: regression.b,
    trend,
  };
}

export function calculateZoneBalance(zoneTemps) {
  if (!zoneTemps || Object.keys(zoneTemps).length === 0) return 0;

  const temps = Object.values(zoneTemps);
  const avgTemp = mean(temps);
  const deviations = temps.map(t => Math.abs(t - avgTemp));
  const avgDeviation = mean(deviations);

  // Balance score: 100 = perfect balance, 0 = highly unbalanced
  return Math.max(0, 100 - (avgDeviation * 2));
}

export function calculateThermalProfile(data) {
  const profile = {
    preheatSlope: 0,
    soakTime: 0,
    peakTemp: 0,
    timeAboveLiquidus: 0,
    coolingRate: 0,
  };

  if (!data || data.length === 0) return profile;

  // Find peak temperature
  const temps = data.map(d => d.avgTemp || 0);
  profile.peakTemp = max(temps);

  // Calculate preheat slope (first 25% of data)
  const preheatData = temps.slice(0, Math.floor(temps.length * 0.25));
  if (preheatData.length > 1) {
    profile.preheatSlope = (preheatData[preheatData.length - 1] - preheatData[0]) / preheatData.length;
  }

  // Calculate cooling rate (last 25% of data)
  const coolingData = temps.slice(Math.floor(temps.length * 0.75));
  if (coolingData.length > 1) {
    profile.coolingRate = (coolingData[0] - coolingData[coolingData.length - 1]) / coolingData.length;
  }

  // Time above liquidus (217°C for lead-free)
  const liquidusTemp = 217;
  profile.timeAboveLiquidus = temps.filter(t => t > liquidusTemp).length * 10; // seconds

  return profile;
}

export function calculateEfficiency(powerData, productionData) {
  if (!powerData || !productionData) return { efficiency: 0, energyPerBoard: 0 };

  const totalEnergy = powerData.cumulativeEnergy || 0;
  const boardsProduced = productionData.boardsProduced || 1;

  return {
    efficiency: (boardsProduced / (totalEnergy || 1)) * 100,
    energyPerBoard: totalEnergy / boardsProduced,
  };
}

export function getTemperatureGradient(temp) {
  if (temp < 100) return { color: '#3b82f6', label: 'Cold' };
  if (temp < 150) return { color: '#06b6d4', label: 'Preheat' };
  if (temp < 200) return { color: '#eab308', label: 'Soak' };
  if (temp < 240) return { color: '#f59e0b', label: 'Reflow' };
  if (temp < 260) return { color: '#ef4444', label: 'Peak' };
  return { color: '#dc2626', label: 'Critical' };
}

export function formatNumber(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) return '—';
  return value.toFixed(decimals);
}

export function formatTemperature(value) {
  return `${formatNumber(value, 1)}°C`;
}

export function formatPower(value) {
  return `${formatNumber(value, 2)} kW`;
}

export function formatEnergy(value) {
  return `${formatNumber(value, 3)} kWh`;
}

export function formatPercentage(value) {
  return `${formatNumber(value * 100, 1)}%`;
}

export function downsample(data, targetLength) {
  if (!data || data.length <= targetLength) return data;

  const factor = Math.ceil(data.length / targetLength);
  const result = [];

  for (let i = 0; i < data.length; i += factor) {
    const chunk = data.slice(i, Math.min(i + factor, data.length));
    const avgPoint = {};

    // Average numeric values
    Object.keys(chunk[0]).forEach(key => {
      const values = chunk.map(d => d[key]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        avgPoint[key] = mean(values);
      } else {
        avgPoint[key] = chunk[0][key]; // Keep first value for non-numeric
      }
    });

    result.push(avgPoint);
  }

  return result;
}
