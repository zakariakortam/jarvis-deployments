import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const VendorDashboard = ({ vendorSales }) => {
  if (!vendorSales || vendorSales.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Loading vendor sales data...</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const totalRevenue = vendorSales.reduce((sum, v) => sum + v.totalSales, 0);
  const totalTransactions = vendorSales.reduce((sum, v) => sum + v.transactions, 0);

  const pieData = vendorSales.map(v => ({
    name: v.name,
    value: v.totalSales
  }));

  const getCategoryIcon = (category) => {
    const icons = {
      food: Package,
      beverage: ShoppingCart,
      merchandise: Package,
      other: Package
    };
    const Icon = icons[category] || Package;
    return Icon;
  };

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Vendors</p>
              <p className="text-2xl font-bold">
                {vendorSales.filter(v => v.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Transaction</p>
              <p className="text-2xl font-bold">
                ${(totalRevenue / totalTransactions).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Performance List */}
        <div className="glass-effect p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Vendor Performance</h3>
          <div className="space-y-3">
            {vendorSales
              .sort((a, b) => b.totalSales - a.totalSales)
              .map((vendor, index) => {
                const Icon = getCategoryIcon(vendor.category);
                return (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${COLORS[index % COLORS.length]}20`
                          }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: COLORS[index % COLORS.length] }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                              {vendor.name}
                            </h4>
                            {vendor.status === 'active' ? (
                              <span className="w-2 h-2 bg-success rounded-full" />
                            ) : (
                              <span className="w-2 h-2 bg-muted rounded-full" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {vendor.category} • {vendor.location}
                          </p>
                        </div>
                      </div>
                      {vendor.performance === 'above' ? (
                        <TrendingUp className="w-5 h-5 text-success" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Sales</p>
                        <p className="font-semibold">${vendor.totalSales}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Orders</p>
                        <p className="font-semibold">{vendor.transactions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Avg</p>
                        <p className="font-semibold">${vendor.averageTransaction}</p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Top Item: <span className="text-foreground font-medium">{vendor.topItem}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current Hour: <span className="text-foreground font-medium">${vendor.currentHourSales}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="glass-effect p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
            <div className="space-y-3">
              {['food', 'beverage', 'merchandise', 'other'].map(category => {
                const categoryVendors = vendorSales.filter(
                  v => v.category === category
                );
                const categoryRevenue = categoryVendors.reduce(
                  (sum, v) => sum + v.totalSales,
                  0
                );
                const percentage = (categoryRevenue / totalRevenue) * 100;

                if (categoryVendors.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${categoryRevenue.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
