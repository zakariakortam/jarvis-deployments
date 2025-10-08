// Test Suite for Data Simulator

class SimulatorTests {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
    }

    assert(condition, testName) {
        if (condition) {
            this.passed++;
            console.log(`✓ PASS: ${testName}`);
            this.tests.push({ name: testName, status: 'pass' });
        } else {
            this.failed++;
            console.error(`✗ FAIL: ${testName}`);
            this.tests.push({ name: testName, status: 'fail' });
        }
    }

    assertEqual(actual, expected, testName) {
        this.assert(actual === expected, `${testName} (expected: ${expected}, got: ${actual})`);
    }

    runAllTests() {
        console.log('=================================');
        console.log('Running Simulator Tests');
        console.log('=================================\n');

        this.testProductGeneration();
        this.testShipmentGeneration();
        this.testSupplierData();
        this.testStatusCalculation();
        this.testKPICalculation();
        this.testDataIntegrity();
        this.testUpdateCycles();

        console.log('\n=================================');
        console.log('Test Results');
        console.log('=================================');
        console.log(`Total Tests: ${this.passed + this.failed}`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

        return this.failed === 0;
    }

    testProductGeneration() {
        console.log('\n--- Product Generation Tests ---');

        const products = simulator.getProducts();

        this.assertEqual(products.length, 300, 'Should generate 300 products');

        const hasValidIds = products.every(p => /^PRD\d{5}$/.test(p.productId));
        this.assert(hasValidIds, 'All products should have valid IDs');

        const hasValidCategories = products.every(p =>
            ['Electronics', 'Furniture', 'Clothing', 'Food', 'Tools'].includes(p.category)
        );
        this.assert(hasValidCategories, 'All products should have valid categories');

        const hasValidStock = products.every(p =>
            p.stockLevel >= 0 && p.stockLevel <= p.maxStock
        );
        this.assert(hasValidStock, 'All products should have valid stock levels');

        const hasValidReorderPoint = products.every(p =>
            p.reorderPoint >= 20 && p.reorderPoint <= 70
        );
        this.assert(hasValidReorderPoint, 'All products should have valid reorder points');

        const hasValidPrices = products.every(p =>
            parseFloat(p.unitPrice) >= 10 && parseFloat(p.unitPrice) <= 510
        );
        this.assert(hasValidPrices, 'All products should have valid prices');

        const hasSuppliers = products.every(p => p.supplier && p.supplierId);
        this.assert(hasSuppliers, 'All products should have suppliers');

        const hasStatus = products.every(p =>
            ['In Stock', 'Low Stock', 'Out of Stock'].includes(p.status)
        );
        this.assert(hasStatus, 'All products should have valid status');
    }

    testShipmentGeneration() {
        console.log('\n--- Shipment Generation Tests ---');

        const shipments = simulator.getShipments();

        this.assert(shipments.length >= 150, 'Should have at least 150 shipments');

        const hasValidOrderIds = shipments.every(s => /^ORD\d{6}$/.test(s.orderId));
        this.assert(hasValidOrderIds, 'All shipments should have valid order IDs');

        const hasValidProductIds = shipments.every(s => /^PRD\d{5}$/.test(s.productId));
        this.assert(hasValidProductIds, 'All shipments should reference valid products');

        const hasValidQuantity = shipments.every(s =>
            s.quantity >= 10 && s.quantity <= 110
        );
        this.assert(hasValidQuantity, 'All shipments should have valid quantities');

        const hasValidStatus = shipments.every(s =>
            ['Pending', 'Processing', 'In Transit', 'Delivered'].includes(s.status)
        );
        this.assert(hasValidStatus, 'All shipments should have valid status');

        const hasValidDates = shipments.every(s =>
            s.orderDate instanceof Date && s.estimatedDelivery instanceof Date
        );
        this.assert(hasValidDates, 'All shipments should have valid dates');

        const hasValidFulfillmentTime = shipments.every(s =>
            parseFloat(s.fulfillmentTime) >= 12 && parseFloat(s.fulfillmentTime) <= 132
        );
        this.assert(hasValidFulfillmentTime, 'All shipments should have valid fulfillment times');
    }

    testSupplierData() {
        console.log('\n--- Supplier Data Tests ---');

        const suppliers = simulator.getSuppliers();

        this.assertEqual(suppliers.length, 5, 'Should have 5 suppliers');

        const hasValidIds = suppliers.every(s => /^SUP\d{3}$/.test(s.id));
        this.assert(hasValidIds, 'All suppliers should have valid IDs');

        const hasValidPerformance = suppliers.every(s =>
            s.performance >= 85 && s.performance <= 95
        );
        this.assert(hasValidPerformance, 'All suppliers should have valid performance scores');

        const hasValidDeliveryTime = suppliers.every(s =>
            s.avgDeliveryTime >= 48 && s.avgDeliveryTime <= 96
        );
        this.assert(hasValidDeliveryTime, 'All suppliers should have valid avg delivery times');
    }

    testStatusCalculation() {
        console.log('\n--- Status Calculation Tests ---');

        const status1 = simulator.calculateStatus(0, 50);
        this.assertEqual(status1, 'Out of Stock', 'Zero stock should be Out of Stock');

        const status2 = simulator.calculateStatus(30, 50);
        this.assertEqual(status2, 'Low Stock', 'Stock at reorder point should be Low Stock');

        const status3 = simulator.calculateStatus(100, 50);
        this.assertEqual(status3, 'In Stock', 'Stock above reorder point should be In Stock');
    }

    testKPICalculation() {
        console.log('\n--- KPI Calculation Tests ---');

        const kpis = simulator.getKPIs();

        this.assert(kpis.totalValue > 0, 'Total value should be positive');
        this.assert(kpis.reorderAlerts >= 0, 'Reorder alerts should be non-negative');
        this.assert(kpis.avgFulfillment >= 0, 'Avg fulfillment should be non-negative');
        this.assert(kpis.fillRate >= 0 && kpis.fillRate <= 100, 'Fill rate should be 0-100%');

        const products = simulator.getProducts();
        const inStockCount = products.filter(p => p.status === 'In Stock').length;
        const expectedFillRate = (inStockCount / products.length) * 100;
        const fillRateDiff = Math.abs(kpis.fillRate - expectedFillRate);
        this.assert(fillRateDiff < 0.1, 'Fill rate calculation should be accurate');
    }

    testDataIntegrity() {
        console.log('\n--- Data Integrity Tests ---');

        const products = simulator.getProducts();
        const shipments = simulator.getShipments();

        // Check for duplicate product IDs
        const productIds = products.map(p => p.productId);
        const uniqueProductIds = new Set(productIds);
        this.assertEqual(productIds.length, uniqueProductIds.size, 'Product IDs should be unique');

        // Check that shipments reference valid products
        const validReferences = shipments.every(s =>
            products.some(p => p.productId === s.productId)
        );
        this.assert(validReferences, 'All shipments should reference valid products');

        // Check that shipment suppliers match product suppliers
        const matchingSuppliers = shipments.every(s => {
            const product = products.find(p => p.productId === s.productId);
            return product && product.supplier === s.supplier;
        });
        this.assert(matchingSuppliers, 'Shipment suppliers should match product suppliers');
    }

    testUpdateCycles() {
        console.log('\n--- Update Cycle Tests ---');

        const initialProducts = JSON.parse(JSON.stringify(simulator.getProducts()));
        const initialShipments = JSON.parse(JSON.stringify(simulator.getShipments()));

        // Simulate stock changes
        simulator.simulateStockChanges();
        const updatedProducts = simulator.getProducts();

        let changedProducts = 0;
        updatedProducts.forEach((p, i) => {
            if (p.stockLevel !== initialProducts[i].stockLevel) {
                changedProducts++;
            }
        });

        this.assert(changedProducts >= 10 && changedProducts <= 20,
            'Stock changes should update 10-20 products');

        // Simulate shipment updates
        simulator.simulateShipmentUpdates();
        const updatedShipments = simulator.getShipments();

        this.assert(updatedShipments.length >= initialShipments.length,
            'Shipment count should not decrease');

        // Simulate new orders
        const beforeCount = simulator.getShipments().length;
        simulator.simulateNewOrders();
        const afterCount = simulator.getShipments().length;

        this.assert(afterCount >= beforeCount + 2 && afterCount <= beforeCount + 5,
            'Should add 2-5 new orders');
    }
}

// Run tests when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Waiting 2 seconds for simulator to initialize...');
        setTimeout(() => {
            const tests = new SimulatorTests();
            const success = tests.runAllTests();

            if (success) {
                console.log('\n✓ All tests passed!');
            } else {
                console.error('\n✗ Some tests failed!');
            }
        }, 2000);
    });
} else {
    // Node.js environment - export for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SimulatorTests;
    }
}
