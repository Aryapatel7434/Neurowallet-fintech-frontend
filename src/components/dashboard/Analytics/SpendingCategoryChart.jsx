import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Label,
} from "recharts";

import {
  FaChartPie,
  FaLayerGroup,
} from "react-icons/fa6";

function SpendingCategoryChart({
  transactions = [],
}) {

  // ================= USER =================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  console.log("USER:", user);

  console.log("ALL TRANSACTIONS:");
  console.log(transactions);

  // ================= FILTER USER EXPENSES =================

 console.log("USER EMAIL:", user?.email);

transactions.forEach((tx) => {
    console.log(
        tx.senderEmail,
        "===",
        user?.email,
        "=",
        tx.senderEmail === user?.email
    );
});

const expenseTransactions = transactions.filter(
    tx => tx.senderEmail === user?.email
);
  console.log("EXPENSE TRANSACTIONS:");
  console.log(expenseTransactions);

  // ================= CATEGORY TOTALS =================

  const categories = {};

  expenseTransactions.forEach((tx) => {

    const category =
      tx.category || "OTHER";

    categories[category] =
      (categories[category] || 0) +
      Number(tx.amount);

  });

  console.log("CATEGORY OBJECT:");
  console.log(categories);

  // ================= CHART DATA =================

 const chartData = Object.entries(categories)
  .map(([name, value]) => ({
    name,
    value,
  }))
  .sort((a, b) => b.value - a.value);

  console.log("CHART DATA:");
  console.log(chartData);

  // ================= COLORS =================

  const COLORS = [
    "#3B82F6",
    "#8B5CF6",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
    "#14B8A6",
  ];

  // ================= TOTAL =================

  const totalExpense =
    expenseTransactions.reduce(
      (sum, tx) =>
        sum + Number(tx.amount),
      0
    );

  return (

    <div className="chart-card">

      {/* Header */}

      <div className="chart-card-header">

        <div className="chart-card-title">

          <div className="chart-card-icon spending-icon">
            <FaChartPie />
          </div>

          <div>

            <h3>
              Spending Categories
            </h3>

            <p>
              Expense distribution
            </p>

          </div>

        </div>

        <div className="growth-badge spending-badge">
          Distribution
        </div>

      </div>

      {/* Value */}

      <div className="analytics-main-value">
        ₹{totalExpense.toLocaleString()}
      </div>

      <p className="analytics-main-subtitle">
        Across {chartData.length} Categories
      </p>

      {/* Chart */}

      <div className="premium-chart premium-chart-glow">

        {chartData.length === 0 ? (

          <div className="chart-empty">

            <FaChartPie size={42} />

            <p>
              No spending data available
            </p>

          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <PieChart>

            <Pie
    data={chartData}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    innerRadius={70}
    outerRadius={105}
    paddingAngle={4}
    cornerRadius={8}
    animationDuration={1000}
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
<Label
  position="center"
  content={() => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      <tspan
        x="50%"
        dy="-6"
        fill="#ffffff"
        fontSize="22"
        fontWeight="700"
      >
        ₹{totalExpense.toLocaleString()}
      </tspan>

      <tspan
        x="50%"
        dy="24"
        fill="#94a3b8"
        fontSize="13"
      >
        Spent
      </tspan>
    </text>
  )}
/>

   </Pie>

             <Tooltip
    formatter={(value, name) => [
        `₹${Number(value).toLocaleString("en-IN")}`,
        name,
    ]}
    separator=" : "
    cursor={{ fill: "rgba(255,255,255,0.05)" }}
    contentStyle={{
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: "12px",
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,.35)"
    }}
/>

            </PieChart>

          </ResponsiveContainer>

        )}

      </div>

      {/* Category List */}

      {chartData.length > 0 && (

        <div className="category-list">

          {chartData.map(
            (item, index) => {

              const percent =
                (
                  (item.value /
                    totalExpense) *
                  100
                ).toFixed(1);

              return (

                <div
                  className="category-item"
                  key={item.name}
                >

                  <div className="category-left">

                    <span
                      className="category-dot"
                      style={{
                        background:
                          COLORS[
                            index %
                              COLORS.length
                          ],
                      }}
                    />

                    <div>

                      <div className="category-name">
                        {item.name}
                      </div>

                      <div className="category-percent">
                        {percent}%
                      </div>

                    </div>

                  </div>

                  <strong>
                    ₹{item.value.toLocaleString()}
                  </strong>

                </div>

              );

            }
          )}

        </div>

      )}

      {/* Footer */}

      <div className="analytics-footer">

        <div className="analytics-footer-left">

          <FaLayerGroup />

          {chartData.length} Categories

        </div>

        <div className="analytics-updated">
          Updated just now
        </div>

      </div>

    </div>

  );

}

export default SpendingCategoryChart;