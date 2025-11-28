import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate, formatNumber } from './formatters';

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportMachineDataToCSV = (machine, historicalData) => {
  const data = [
    {
      'Machine ID': machine.id,
      'Machine Name': machine.name,
      'Type': machine.type,
      'Status': machine.status,
      'Temperature (C)': formatNumber(machine.temperature, 1),
      'Vibration': formatNumber(machine.vibration, 3),
      'Voltage (V)': formatNumber(machine.voltage, 0),
      'Efficiency (%)': formatNumber(machine.efficiency, 1),
      'Throughput': machine.throughput,
      'Scrap Rate (%)': formatNumber(machine.scrapRate, 2),
      'Energy Usage (kW)': formatNumber(machine.energyUsage, 1),
    },
    ...historicalData.map(point => ({
      'Timestamp': formatDate(point.timestamp),
      'Temperature (C)': formatNumber(point.temperature, 1),
      'Vibration': formatNumber(point.vibration, 3),
      'Voltage (V)': formatNumber(point.voltage, 0),
      'Efficiency (%)': formatNumber(point.efficiency, 1),
      'Energy Usage (kW)': formatNumber(point.energyUsage, 1),
    }))
  ];

  exportToCSV(data, `machine-${machine.id}-${Date.now()}.csv`);
};

export const exportAlarmsToPDF = (alarms, machines) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Factory Monitor - Alarm Report', 14, 22);

  doc.setFontSize(11);
  doc.text(`Generated: ${formatDate(Date.now())}`, 14, 30);
  doc.text(`Total Alarms: ${alarms.length}`, 14, 36);

  const tableData = alarms.map(alarm => {
    const machine = machines.find(m => m.id === alarm.machineId);
    return [
      formatDate(alarm.timestamp),
      alarm.machineId,
      machine?.name || 'Unknown',
      alarm.errorCode,
      alarm.severity,
      alarm.message,
      alarm.acknowledged ? 'Yes' : 'No',
    ];
  });

  doc.autoTable({
    head: [['Time', 'Machine ID', 'Machine Name', 'Code', 'Severity', 'Message', 'Ack']],
    body: tableData,
    startY: 42,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  doc.save(`alarms-report-${Date.now()}.pdf`);
};

export const exportMachineReportToPDF = (machine, historicalData, maintenanceHistory) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Machine Report: ${machine.name}`, 14, 22);

  // Machine Info
  doc.setFontSize(11);
  doc.text(`Machine ID: ${machine.id}`, 14, 32);
  doc.text(`Type: ${machine.type}`, 14, 38);
  doc.text(`Location: ${machine.location}`, 14, 44);
  doc.text(`Status: ${machine.status}`, 14, 50);

  // Current Metrics
  doc.setFontSize(14);
  doc.text('Current Metrics', 14, 60);
  doc.setFontSize(10);
  doc.text(`Temperature: ${formatNumber(machine.temperature, 1)}°C`, 14, 68);
  doc.text(`Efficiency: ${formatNumber(machine.efficiency, 1)}%`, 14, 74);
  doc.text(`Throughput: ${machine.throughput} units`, 14, 80);
  doc.text(`Energy Usage: ${formatNumber(machine.energyUsage, 1)} kW`, 14, 86);
  doc.text(`Uptime: ${formatNumber(machine.uptime, 1)}%`, 14, 92);

  // Component Status
  doc.setFontSize(14);
  doc.text('Component Health', 14, 105);

  const componentData = machine.components.map(comp => [
    comp.name,
    `${formatNumber(comp.health, 0)}%`,
    comp.status,
    formatDate(comp.lastReplaced),
  ]);

  doc.autoTable({
    head: [['Component', 'Health', 'Status', 'Last Replaced']],
    body: componentData,
    startY: 110,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Maintenance History
  if (maintenanceHistory.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Maintenance History', 14, 22);

    const maintenanceData = maintenanceHistory.slice(0, 20).map(m => [
      formatDate(m.date),
      m.type,
      m.description,
      m.technician,
      `${m.duration} min`,
    ]);

    doc.autoTable({
      head: [['Date', 'Type', 'Description', 'Technician', 'Duration']],
      body: maintenanceData,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });
  }

  doc.save(`machine-${machine.id}-report-${Date.now()}.pdf`);
};

export const exportKPIsToPDF = (kpis, machines, alarms) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Factory Monitor - KPI Report', 14, 22);

  doc.setFontSize(11);
  doc.text(`Generated: ${formatDate(Date.now())}`, 14, 30);

  // Overall KPIs
  doc.setFontSize(14);
  doc.text('Overall Performance', 14, 42);
  doc.setFontSize(11);

  const kpiY = 50;
  doc.text(`Total Machines: ${kpis.totalMachines}`, 14, kpiY);
  doc.text(`Running: ${kpis.runningMachines}`, 14, kpiY + 6);
  doc.text(`Idle: ${kpis.idleMachines}`, 14, kpiY + 12);
  doc.text(`Average Efficiency: ${kpis.avgEfficiency}%`, 14, kpiY + 18);
  doc.text(`Total Throughput: ${kpis.totalThroughput} units`, 14, kpiY + 24);
  doc.text(`Average Scrap Rate: ${kpis.avgScrapRate}%`, 14, kpiY + 30);
  doc.text(`Total Energy Usage: ${kpis.totalEnergy} kW`, 14, kpiY + 36);
  doc.text(`Average Uptime: ${kpis.avgUptime}%`, 14, kpiY + 42);

  // Machine Details
  doc.setFontSize(14);
  doc.text('Machine Details', 14, 105);

  const machineData = machines.map(m => [
    m.id,
    m.name,
    m.status,
    `${formatNumber(m.efficiency, 1)}%`,
    `${m.throughput}`,
    `${formatNumber(m.energyUsage, 1)} kW`,
  ]);

  doc.autoTable({
    head: [['ID', 'Name', 'Status', 'Efficiency', 'Throughput', 'Energy']],
    body: machineData,
    startY: 110,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Alarms Summary
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Recent Alarms', 14, 22);

  const alarmData = alarms.slice(0, 30).map(a => [
    formatDate(a.timestamp),
    a.machineId,
    a.errorCode,
    a.severity,
    a.acknowledged ? 'Yes' : 'No',
  ]);

  doc.autoTable({
    head: [['Time', 'Machine', 'Code', 'Severity', 'Ack']],
    body: alarmData,
    startY: 28,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  doc.save(`kpi-report-${Date.now()}.pdf`);
};
