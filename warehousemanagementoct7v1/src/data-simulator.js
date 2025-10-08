// Data Simulation Engine for Warehouse Management System

class DataSimulator {
    constructor() {
        this.products = [];
        this.shipments = [];
        this.orderHistory = [];
        this.stockMovements = [];
        this.suppliers = [
            { id: 'SUP001', name: 'Global Electronics Ltd', performance: 95, avgDeliveryTime: 48 },
            { id: 'SUP002', name: 'FastShip Industries', performance: 88, avgDeliveryTime: 72 },
            { id: 'SUP003', name: 'Premium Goods Co', performance: 92, avgDeliveryTime: 60 },
            { id: 'SUP004', name: 'Quick Supply Partners', performance: 85, avgDeliveryTime: 96 },
            { id: 'SUP005', name: 'Reliable Wholesale Inc', performance: 90, avgDeliveryTime: 54 }
        ];
        this.categories = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Tools'];
        this.productNames = {
            Electronics: ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Webcam', 'Speaker', 'Router'],
            Furniture: ['Desk', 'Chair', 'Bookshelf', 'Cabinet', 'Table', 'Lamp', 'Sofa', 'Bed'],
            Clothing: ['Shirt', 'Pants', 'Jacket', 'Shoes', 'Hat', 'Gloves', 'Socks', 'Scarf'],
            Food: ['Cereal', 'Pasta', 'Rice', 'Canned Soup', 'Coffee', 'Tea', 'Snacks', 'Juice'],
            Tools: ['Hammer', 'Screwdriver', 'Drill', 'Saw', 'Wrench', 'Pliers', 'Tape Measure', 'Level']
        };

        this.initializeData();
        this.startSimulation();
    }

    initializeData() {
        // Generate 300 mock products
        for (let i = 1; i <= 300; i++) {
            const category = this.categories[Math.floor(Math.random() * this.categories.length)];
            const nameOptions = this.productNames[category];
            const baseName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
            const supplier = this.suppliers[Math.floor(Math.random() * this.suppliers.length)];

            const reorderPoint = Math.floor(Math.random() * 50) + 20;
            const stockLevel = Math.floor(Math.random() * 200) + 10;

            const product = {
                productId: `PRD${String(i).padStart(5, '0')}`,
                name: `${baseName} ${category.slice(0, 3).toUpperCase()}-${i}`,
                category: category,
                stockLevel: stockLevel,
                reorderPoint: reorderPoint,
                maxStock: reorderPoint * 4,
                unitPrice: (Math.random() * 500 + 10).toFixed(2),
                supplier: supplier.name,
                supplierId: supplier.id,
                lastUpdated: new Date(Date.now() - Math.random() * 3600000),
                status: this.calculateStatus(stockLevel, reorderPoint)
            };

            this.products.push(product);
        }

        // Generate 150 active shipments
        for (let i = 1; i <= 150; i++) {
            const product = this.products[Math.floor(Math.random() * this.products.length)];
            const supplier = this.suppliers.find(s => s.id === product.supplierId);
            const orderDate = new Date(Date.now() - Math.random() * 7 * 24 * 3600000);
            const fulfillmentHours = Math.random() * 120 + 12;
            const estimatedDelivery = new Date(orderDate.getTime() + fulfillmentHours * 3600000);

            const statuses = ['Pending', 'Processing', 'In Transit', 'Delivered'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const shipment = {
                orderId: `ORD${String(i).padStart(6, '0')}`,
                productId: product.productId,
                quantity: Math.floor(Math.random() * 100) + 10,
                status: status,
                supplier: supplier.name,
                supplierId: supplier.id,
                orderDate: orderDate,
                estimatedDelivery: estimatedDelivery,
                fulfillmentTime: fulfillmentHours.toFixed(1),
                actualDelivery: status === 'Delivered' ? new Date(orderDate.getTime() + fulfillmentHours * 3600000) : null
            };

            this.shipments.push(shipment);
        }

        // Initialize order history for last 24 hours
        for (let i = 0; i < 24; i++) {
            this.orderHistory.push({
                hour: i,
                received: Math.floor(Math.random() * 50) + 20,
                processed: Math.floor(Math.random() * 45) + 15,
                shipped: Math.floor(Math.random() * 40) + 10
            });
        }

        // Initialize stock movement trends for last 30 days
        for (let i = 0; i < 30; i++) {
            this.stockMovements.push({
                day: i,
                inbound: Math.floor(Math.random() * 500) + 200,
                outbound: Math.floor(Math.random() * 600) + 150,
                adjustments: Math.floor(Math.random() * 50) - 25
            });
        }
    }

    calculateStatus(stockLevel, reorderPoint) {
        if (stockLevel === 0) return 'Out of Stock';
        if (stockLevel <= reorderPoint) return 'Low Stock';
        return 'In Stock';
    }

    startSimulation() {
        // Update stock levels every 2 seconds
        setInterval(() => {
            this.simulateStockChanges();
        }, 2000);

        // Update shipment statuses every 3 seconds
        setInterval(() => {
            this.simulateShipmentUpdates();
        }, 3000);

        // Add new orders every 5 seconds
        setInterval(() => {
            this.simulateNewOrders();
        }, 5000);

        // Update historical data every 10 seconds
        setInterval(() => {
            this.updateHistoricalData();
        }, 10000);
    }

    simulateStockChanges() {
        // Randomly update 10-20 products
        const numUpdates = Math.floor(Math.random() * 10) + 10;

        for (let i = 0; i < numUpdates; i++) {
            const product = this.products[Math.floor(Math.random() * this.products.length)];
            const change = Math.floor(Math.random() * 20) - 10; // -10 to +10

            product.stockLevel = Math.max(0, Math.min(product.maxStock, product.stockLevel + change));
            product.status = this.calculateStatus(product.stockLevel, product.reorderPoint);
            product.lastUpdated = new Date();
        }
    }

    simulateShipmentUpdates() {
        // Update 5-10 random shipments
        const numUpdates = Math.floor(Math.random() * 5) + 5;

        for (let i = 0; i < numUpdates; i++) {
            const shipment = this.shipments[Math.floor(Math.random() * this.shipments.length)];

            // Progress shipment status
            if (shipment.status === 'Pending' && Math.random() > 0.7) {
                shipment.status = 'Processing';
            } else if (shipment.status === 'Processing' && Math.random() > 0.6) {
                shipment.status = 'In Transit';
            } else if (shipment.status === 'In Transit' && Math.random() > 0.8) {
                shipment.status = 'Delivered';
                shipment.actualDelivery = new Date();

                // Update product stock when delivered
                const product = this.products.find(p => p.productId === shipment.productId);
                if (product) {
                    product.stockLevel = Math.min(product.maxStock, product.stockLevel + shipment.quantity);
                    product.status = this.calculateStatus(product.stockLevel, product.reorderPoint);
                    product.lastUpdated = new Date();
                }
            }
        }
    }

    simulateNewOrders() {
        // Add 2-5 new shipments
        const numNew = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < numNew; i++) {
            const product = this.products[Math.floor(Math.random() * this.products.length)];
            const supplier = this.suppliers.find(s => s.id === product.supplierId);
            const orderDate = new Date();
            const fulfillmentHours = Math.random() * 120 + 12;
            const estimatedDelivery = new Date(orderDate.getTime() + fulfillmentHours * 3600000);

            const newOrderId = `ORD${String(this.shipments.length + 1).padStart(6, '0')}`;

            const shipment = {
                orderId: newOrderId,
                productId: product.productId,
                quantity: Math.floor(Math.random() * 100) + 10,
                status: 'Pending',
                supplier: supplier.name,
                supplierId: supplier.id,
                orderDate: orderDate,
                estimatedDelivery: estimatedDelivery,
                fulfillmentTime: fulfillmentHours.toFixed(1),
                actualDelivery: null
            };

            this.shipments.push(shipment);

            // Keep only last 200 shipments
            if (this.shipments.length > 200) {
                this.shipments = this.shipments.slice(-200);
            }
        }
    }

    updateHistoricalData() {
        // Shift order history
        this.orderHistory.shift();
        this.orderHistory.push({
            hour: 23,
            received: Math.floor(Math.random() * 50) + 20,
            processed: Math.floor(Math.random() * 45) + 15,
            shipped: Math.floor(Math.random() * 40) + 10
        });

        // Update stock movements
        this.stockMovements.shift();
        this.stockMovements.push({
            day: 29,
            inbound: Math.floor(Math.random() * 500) + 200,
            outbound: Math.floor(Math.random() * 600) + 150,
            adjustments: Math.floor(Math.random() * 50) - 25
        });
    }

    getProducts() {
        return this.products;
    }

    getShipments() {
        return this.shipments;
    }

    getOrderHistory() {
        return this.orderHistory;
    }

    getStockMovements() {
        return this.stockMovements;
    }

    getSuppliers() {
        return this.suppliers;
    }

    getKPIs() {
        const totalValue = this.products.reduce((sum, p) => sum + (p.stockLevel * p.unitPrice), 0);
        const reorderAlerts = this.products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

        const deliveredShipments = this.shipments.filter(s => s.status === 'Delivered' && s.actualDelivery);
        const avgFulfillment = deliveredShipments.length > 0
            ? deliveredShipments.reduce((sum, s) => sum + parseFloat(s.fulfillmentTime), 0) / deliveredShipments.length
            : 0;

        const inStockProducts = this.products.filter(p => p.status === 'In Stock').length;
        const fillRate = (inStockProducts / this.products.length) * 100;

        return {
            totalValue,
            reorderAlerts,
            avgFulfillment,
            fillRate
        };
    }
}

// Initialize global simulator
const simulator = new DataSimulator();
