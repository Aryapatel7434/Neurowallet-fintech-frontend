import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

function SpendingCategoryChart({
  transactions = [],
}) {
  const expenseTransactions = transactions.filter(
    (t) => t.type === "DEBIT"
  );

  const categories = {};

  expenseTransactions.forEach((tx) => {
    const category = tx.category || "Other";

    categories[category] =
      (categories[category] || 0) +
      (tx.amount || 0);
  });

  const chartData = Object.keys(categories).map(
    (key) => ({
      name: key,
      value: categories[key],
    })
  );

  const COLORS = [
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Spending Categories</h3>

        <span className="analytics-badge expense">
          LIVE
        </span>
      </div>

      <div className="chart-container">
        {chartData.length === 0 ? (
          <div className="chart-empty">
            <h3>No Expense Data</h3>

            <p>
              Spending categories will appear
              after transactions are created.
            </p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={60}
              >
                {chartData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default SpendingCategoryChart;