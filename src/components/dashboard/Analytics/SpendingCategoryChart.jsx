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
import { CATEGORY_COLORS } from "../../../constants/categoryColors";
import { CATEGORY_LABELS } from "../../../constants/categoryLabels";
import { CATEGORY_ICONS } from "../../../constants/categoryIcons";
function SpendingCategoryChart({
  transactions = [],
}) {

  // ================= USER =================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );


  // ================= FILTER USER EXPENSES =================

const expenseTransactions =
transactions.filter(
tx =>
tx.senderEmail === user?.email &&
tx.status === "SUCCESS"
);

  // ================= CATEGORY TOTALS =================

  const categories = {};

  expenseTransactions.forEach((tx) => {

    const category =
      tx.category || "OTHER";

    categories[category] =
      (categories[category] || 0) +
      Number(tx.amount);

  });

  // ================= CHART DATA =================

 const chartData = Object.entries(categories)
  .map(([name, value]) => ({
    name,
    value,
  }))
  .sort((a, b) => b.value - a.value);


console.log(expenseTransactions);
  // ================= COLORS =================


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
         {chartData.length} Categories
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
              No expense transactions yet.
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
    innerRadius={62}
    outerRadius={110}
    paddingAngle={4}
    cornerRadius={8}
    animationDuration={1800}

    activeShape={{
outerRadius:118
}}
>

                {chartData.map(
                  (entry, index) => (

                  <Cell
  key={index}
  fill={
    CATEGORY_COLORS[entry.name] ||
    CATEGORY_COLORS.OTHER
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
cursor={false}
formatter={(value, name) => [
  `₹${Number(value).toLocaleString("en-IN")}`,
  CATEGORY_LABELS[name] || name
]}
contentStyle={{
background:"#101c35",
border:"1px solid rgba(255,255,255,.08)",
borderRadius:"16px",
boxShadow:"0 15px 35px rgba(0,0,0,.35)"
}}
labelStyle={{
color:"#fff",
fontWeight:700
}}
itemStyle={{
color:"#60a5fa"
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

  {(() => {
    const Icon =
      CATEGORY_ICONS[item.name];

    return Icon ? (
      <Icon
        size={18}
        style={{
          color:
            CATEGORY_COLORS[item.name]
        }}
      />
    ) : null;
  })()}

  <div>

                      <div className="category-name">
  {CATEGORY_LABELS[item.name] || item.name}
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
           {`Updated ${new Date().toLocaleString("en-IN")}`}
        </div>

      </div>

    </div>

  );

}

export default SpendingCategoryChart;