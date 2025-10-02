// Global State Management
const state = {
    currentLanguage: 'en',
    currentStock: 'AAPL',
    currentTimeframe: '1m',
    transactions: [],
    filteredTransactions: [],
    currentPage: 1,
    itemsPerPage: 10,
    sortColumn: 'time',
    sortDirection: 'desc',
    portfolioData: {
        AAPL: { shares: 50, avgPrice: 175.50 },
        GOOGL: { shares: 30, avgPrice: 140.25 },
        MSFT: { shares: 40, avgPrice: 380.75 },
        TSLA: { shares: 25, avgPrice: 245.60 },
        AMZN: { shares: 35, avgPrice: 155.80 }
    },
    stockPrices: {
        AAPL: 178.50,
        GOOGL: 142.80,
        MSFT: 385.20,
        TSLA: 248.90,
        AMZN: 158.45
    },
    candlestickData: [],
    exchangeRates: {
        usdJpy: 149.85,
        eurUsd: 1.0845,
        gbpUsd: 1.2675,
        btcUsd: 43250.00
    },
    marketIndices: {
        SP500: [],
        NASDAQ: [],
        DOW: []
    }
};

// Chart instances
let candlestickChart = null;
let portfolioChart = null;
let indicesChart = null;

// Initialize Application
function init() {
    initializeCharts();
    generateInitialData();
    startRealTimeUpdates();
    setupEventListeners();
    updateLanguage();
}

// Initialize Charts
function initializeCharts() {
    // Candlestick Chart
    const candleCtx = document.getElementById('candlestickChart').getContext('2d');
    candlestickChart = new Chart(candleCtx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'Stock Price',
                data: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return [
                                `Open: $${point.o.toFixed(2)}`,
                                `High: $${point.h.toFixed(2)}`,
                                `Low: $${point.l.toFixed(2)}`,
                                `Close: $${point.c.toFixed(2)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#888' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });

    // Portfolio Pie Chart
    const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
    portfolioChart = new Chart(portfolioCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#00d4ff',
                    '#ff006e',
                    '#8338ec',
                    '#ffbe0b',
                    '#06ffa5'
                ],
                borderWidth: 2,
                borderColor: '#1a1d29'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = ((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Market Indices Line Chart
    const indicesCtx = document.getElementById('indicesChart').getContext('2d');
    indicesChart = new Chart(indicesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'S&P 500',
                    data: [],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'NASDAQ',
                    data: [],
                    borderColor: '#ff006e',
                    backgroundColor: 'rgba(255, 0, 110, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'DOW',
                    data: [],
                    borderColor: '#8338ec',
                    backgroundColor: 'rgba(131, 56, 236, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#fff', font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#888', maxTicksLimit: 8 }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            return value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Generate Initial Data
function generateInitialData() {
    const now = Date.now();

    // Generate candlestick data (last 60 data points)
    for (let i = 60; i > 0; i--) {
        const basePrice = state.stockPrices[state.currentStock];
        const open = basePrice + (Math.random() - 0.5) * 5;
        const close = open + (Math.random() - 0.5) * 3;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;

        state.candlestickData.push({
            x: now - (i * 60000), // 1 minute intervals
            o: open,
            h: high,
            l: low,
            c: close
        });
    }

    // Generate transactions
    const assetsList = Object.keys(state.portfolioData);
    const types = ['BUY', 'SELL'];

    for (let i = 0; i < 150; i++) {
        const asset = assetsList[Math.floor(Math.random() * assetsList.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const quantity = Math.floor(Math.random() * 50) + 1;
        const price = state.stockPrices[asset] + (Math.random() - 0.5) * 10;
        const total = quantity * price;
        const fee = total * 0.001; // 0.1% fee

        state.transactions.push({
            id: `TXN${Date.now()}-${i}`,
            time: now - (i * 300000), // 5 minute intervals
            type: type,
            asset: asset,
            quantity: quantity,
            price: price,
            total: total,
            fee: fee,
            status: 'COMPLETED'
        });
    }

    // Sort transactions by time (newest first)
    state.transactions.sort((a, b) => b.time - a.time);
    state.filteredTransactions = [...state.transactions];

    // Generate market indices data
    const indicesCount = 30;
    for (let i = indicesCount; i > 0; i--) {
        const time = now - (i * 120000); // 2 minute intervals
        state.marketIndices.SP500.push({ x: time, y: 4750 + Math.random() * 50 });
        state.marketIndices.NASDAQ.push({ x: time, y: 15200 + Math.random() * 100 });
        state.marketIndices.DOW.push({ x: time, y: 37500 + Math.random() * 150 });
    }

    // Update charts
    updateCandlestickChart();
    updatePortfolioChart();
    updateIndicesChart();
    updateTransactionsTable();
    updateMetrics();
    updateExchangeRates();
    populateAssetFilter();
}

// Real-time Updates
function startRealTimeUpdates() {
    // Update candlestick every 5 seconds
    setInterval(() => {
        updateCandlestickData();
    }, 5000);

    // Update portfolio every 3 seconds
    setInterval(() => {
        updatePortfolioChart();
        updateMetrics();
    }, 3000);

    // Update exchange rates every 2 seconds
    setInterval(() => {
        updateExchangeRates();
    }, 2000);

    // Update market indices every 10 seconds
    setInterval(() => {
        updateMarketIndices();
    }, 10000);

    // Generate new transaction occasionally
    setInterval(() => {
        if (Math.random() > 0.7) {
            generateNewTransaction();
        }
    }, 8000);
}

// Update Candlestick Data
function updateCandlestickData() {
    const lastCandle = state.candlestickData[state.candlestickData.length - 1];
    const basePrice = state.stockPrices[state.currentStock];

    // Update current price
    state.stockPrices[state.currentStock] = basePrice + (Math.random() - 0.5) * 2;

    const newClose = state.stockPrices[state.currentStock];
    const newHigh = Math.max(lastCandle.h, newClose + Math.random());
    const newLow = Math.min(lastCandle.l, newClose - Math.random());

    // Update last candle
    lastCandle.c = newClose;
    lastCandle.h = newHigh;
    lastCandle.l = newLow;

    // Occasionally add new candle
    if (Date.now() - lastCandle.x > 60000) {
        const newCandle = {
            x: Date.now(),
            o: lastCandle.c,
            h: lastCandle.c + Math.random() * 2,
            l: lastCandle.c - Math.random() * 2,
            c: lastCandle.c + (Math.random() - 0.5) * 3
        };
        state.candlestickData.push(newCandle);

        // Keep only last 60 candles
        if (state.candlestickData.length > 60) {
            state.candlestickData.shift();
        }
    }

    updateCandlestickChart();
}

// Update Charts
function updateCandlestickChart() {
    candlestickChart.data.datasets[0].data = state.candlestickData;
    candlestickChart.update('none');
}

function updatePortfolioChart() {
    const labels = [];
    const values = [];

    Object.entries(state.portfolioData).forEach(([asset, data]) => {
        const currentPrice = state.stockPrices[asset];
        const value = data.shares * currentPrice;
        labels.push(asset);
        values.push(value);
    });

    portfolioChart.data.labels = labels;
    portfolioChart.data.datasets[0].data = values;
    portfolioChart.update('none');

    updatePortfolioLegend(labels, values);
}

function updatePortfolioLegend(labels, values) {
    const total = values.reduce((a, b) => a + b, 0);
    const colors = ['#00d4ff', '#ff006e', '#8338ec', '#ffbe0b', '#06ffa5'];

    const legendHTML = labels.map((label, i) => {
        const percentage = ((values[i] / total) * 100).toFixed(1);
        return `
            <div class="legend-item">
                <span class="legend-color" style="background: ${colors[i]}"></span>
                <span class="legend-label">${label}</span>
                <span class="legend-value">$${values[i].toFixed(2)} (${percentage}%)</span>
            </div>
        `;
    }).join('');

    document.getElementById('portfolioLegend').innerHTML = legendHTML;
}

function updateIndicesChart() {
    indicesChart.data.labels = state.marketIndices.SP500.map(d => new Date(d.x).toLocaleTimeString());
    indicesChart.data.datasets[0].data = state.marketIndices.SP500.map(d => d.y);
    indicesChart.data.datasets[1].data = state.marketIndices.NASDAQ.map(d => d.y);
    indicesChart.data.datasets[2].data = state.marketIndices.DOW.map(d => d.y);
    indicesChart.update('none');
}

// Update Metrics
function updateMetrics() {
    // Portfolio Value
    let totalValue = 0;
    let totalCost = 0;

    Object.entries(state.portfolioData).forEach(([asset, data]) => {
        const currentPrice = state.stockPrices[asset];
        totalValue += data.shares * currentPrice;
        totalCost += data.shares * data.avgPrice;
    });

    const portfolioChange = ((totalValue - totalCost) / totalCost) * 100;

    document.getElementById('portfolioValue').textContent = `$${totalValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    document.getElementById('portfolioChange').textContent = `${portfolioChange >= 0 ? '+' : ''}${portfolioChange.toFixed(2)}%`;
    document.getElementById('portfolioChange').className = `metric-change ${portfolioChange >= 0 ? 'positive' : 'negative'}`;

    // Daily P&L
    const dailyPnL = totalValue - totalCost;
    const dailyPnLPercent = portfolioChange;

    document.getElementById('dailyPnL').textContent = `${dailyPnL >= 0 ? '+' : ''}$${Math.abs(dailyPnL).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    document.getElementById('dailyPnLChange').textContent = `${dailyPnLPercent >= 0 ? '+' : ''}${dailyPnLPercent.toFixed(2)}%`;
    document.getElementById('dailyPnLChange').className = `metric-change ${dailyPnLPercent >= 0 ? 'positive' : 'negative'}`;

    // Trading Volume
    const todayTransactions = state.transactions.filter(t => {
        return Date.now() - t.time < 86400000; // Last 24 hours
    });

    document.getElementById('tradingVolume').textContent = todayTransactions.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Total Fees
    const totalFees = todayTransactions.reduce((sum, t) => sum + t.fee, 0);
    document.getElementById('totalFees').textContent = `$${totalFees.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Update Exchange Rates
function updateExchangeRates() {
    // Simulate real-time rate changes
    Object.keys(state.exchangeRates).forEach(pair => {
        const change = (Math.random() - 0.5) * 0.1;
        const oldRate = state.exchangeRates[pair];
        state.exchangeRates[pair] += change;

        // Update display
        const rateElement = document.getElementById(pair);
        const trendElement = document.getElementById(pair + 'Trend');

        if (rateElement) {
            rateElement.textContent = state.exchangeRates[pair].toFixed(pair === 'btcUsd' ? 2 : 4);

            const percentChange = ((change / oldRate) * 100);
            const trendSymbol = percentChange >= 0 ? '▲' : '▼';
            const trendClass = percentChange >= 0 ? 'positive' : 'negative';

            trendElement.textContent = `${trendSymbol} ${Math.abs(percentChange).toFixed(2)}%`;
            trendElement.className = `ticker-trend ${trendClass}`;
        }
    });
}

// Update Market Indices
function updateMarketIndices() {
    const now = Date.now();

    // Add new data point
    const lastSP = state.marketIndices.SP500[state.marketIndices.SP500.length - 1].y;
    const lastNQ = state.marketIndices.NASDAQ[state.marketIndices.NASDAQ.length - 1].y;
    const lastDOW = state.marketIndices.DOW[state.marketIndices.DOW.length - 1].y;

    state.marketIndices.SP500.push({ x: now, y: lastSP + (Math.random() - 0.5) * 20 });
    state.marketIndices.NASDAQ.push({ x: now, y: lastNQ + (Math.random() - 0.5) * 40 });
    state.marketIndices.DOW.push({ x: now, y: lastDOW + (Math.random() - 0.5) * 60 });

    // Keep only last 30 points
    if (state.marketIndices.SP500.length > 30) {
        state.marketIndices.SP500.shift();
        state.marketIndices.NASDAQ.shift();
        state.marketIndices.DOW.shift();
    }

    updateIndicesChart();
}

// Transactions Table
function updateTransactionsTable() {
    const tbody = document.getElementById('transactionsBody');
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const pageTransactions = state.filteredTransactions.slice(start, end);

    tbody.innerHTML = pageTransactions.map(t => `
        <tr class="transaction-row">
            <td>${new Date(t.time).toLocaleString()}</td>
            <td><span class="badge ${t.type.toLowerCase()}">${t.type}</span></td>
            <td class="asset-cell">${t.asset}</td>
            <td>${t.quantity}</td>
            <td>$${t.price.toFixed(2)}</td>
            <td>$${t.total.toFixed(2)}</td>
            <td>$${t.fee.toFixed(2)}</td>
            <td><span class="status-badge ${t.status.toLowerCase()}">${t.status}</span></td>
        </tr>
    `).join('');

    updatePagination();
}

function generateNewTransaction() {
    const assetsList = Object.keys(state.portfolioData);
    const asset = assetsList[Math.floor(Math.random() * assetsList.length)];
    const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const quantity = Math.floor(Math.random() * 20) + 1;
    const price = state.stockPrices[asset];
    const total = quantity * price;
    const fee = total * 0.001;

    const newTransaction = {
        id: `TXN${Date.now()}`,
        time: Date.now(),
        type: type,
        asset: asset,
        quantity: quantity,
        price: price,
        total: total,
        fee: fee,
        status: 'COMPLETED'
    };

    state.transactions.unshift(newTransaction);

    // Keep only last 200 transactions
    if (state.transactions.length > 200) {
        state.transactions.pop();
    }

    filterTransactions();
}

// Table Functions
function sortTable(column) {
    if (state.sortColumn === column) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortColumn = column;
        state.sortDirection = 'desc';
    }

    state.filteredTransactions.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        if (state.sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    updateTransactionsTable();
}

function filterTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    const assetFilter = document.getElementById('filterAsset').value;

    state.filteredTransactions = state.transactions.filter(t => {
        const matchesSearch = searchTerm === '' ||
            t.asset.toLowerCase().includes(searchTerm) ||
            t.type.toLowerCase().includes(searchTerm) ||
            t.id.toLowerCase().includes(searchTerm);

        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesAsset = assetFilter === 'all' || t.asset === assetFilter;

        return matchesSearch && matchesType && matchesAsset;
    });

    state.currentPage = 1;
    updateTransactionsTable();
}

function populateAssetFilter() {
    const assetFilter = document.getElementById('filterAsset');
    const assets = [...new Set(state.transactions.map(t => t.asset))];

    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset;
        option.textContent = asset;
        assetFilter.appendChild(option);
    });
}

function updatePagination() {
    const totalPages = Math.ceil(state.filteredTransactions.length / state.itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${state.currentPage} of ${totalPages}`;
}

function previousPage() {
    if (state.currentPage > 1) {
        state.currentPage--;
        updateTransactionsTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(state.filteredTransactions.length / state.itemsPerPage);
    if (state.currentPage < totalPages) {
        state.currentPage++;
        updateTransactionsTable();
    }
}

// Chart Control Functions
function changeStock(symbol) {
    state.currentStock = symbol;
    state.candlestickData = [];

    // Generate new candlestick data for selected stock
    const now = Date.now();
    for (let i = 60; i > 0; i--) {
        const basePrice = state.stockPrices[symbol];
        const open = basePrice + (Math.random() - 0.5) * 5;
        const close = open + (Math.random() - 0.5) * 3;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;

        state.candlestickData.push({
            x: now - (i * 60000),
            o: open,
            h: high,
            l: low,
            c: close
        });
    }

    updateCandlestickChart();
}

function changeTimeframe(timeframe) {
    state.currentTimeframe = timeframe;

    // Update button states
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update chart time scale
    const timeUnits = {
        '1m': 'minute',
        '5m': 'minute',
        '15m': 'minute',
        '1h': 'hour'
    };

    candlestickChart.options.scales.x.time.unit = timeUnits[timeframe];
    candlestickChart.update();
}

// Language Toggle
function toggleLanguage() {
    state.currentLanguage = state.currentLanguage === 'en' ? 'jp' : 'en';
    updateLanguage();
}

function updateLanguage() {
    const lang = state.currentLanguage;
    document.getElementById('currentLang').textContent = lang.toUpperCase();

    // Update all elements with language attributes
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Update placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
        el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
    });

    // Update select options
    document.querySelectorAll('option[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterTransactions);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);