import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { FaChartPie } from "react-icons/fa6";

import { CATEGORY_COLORS } from "../../../constants/categoryColors";
import { CATEGORY_LABELS } from "../../../constants/categoryLabels";

import "./SpendingCategoryChart.css";

const getUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return typeof user?.email === "string"
      ? user.email.trim().toLowerCase()
      : "";
  } catch {
    return "";
  }
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function SpendingCategoryChart({ transactions = [] }) {
  const email = getUserEmail();

  // Only count successful outgoing transactions for the signed-in user.
  const expenses = Array.isArray(transactions)
    ? transactions.filter((tx) => {
        const sender = String(tx?.senderEmail ?? "")
          .trim()
          .toLowerCase();

        const status = String(tx?.status ?? "")
          .trim()
          .toUpperCase();

        const amount = Number(tx?.amount);

        return (
          Boolean(email) &&
          sender === email &&
          (status === "SUCCESS" || status === "COMPLETED") &&
          Number.isFinite(amount) &&
          amount > 0
        );
      })
    : [];

  // Aggregate expense amounts by transaction category.
  const totals = expenses.reduce((result, tx) => {
    const category = String(tx?.category || "OTHER").trim().toUpperCase();
    const amount = Number(tx?.amount);

    result[category] = (result[category] || 0) + amount;

    return result;
  }, {});

  const chartData = Object.entries(totals)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpense = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const categoryCount = chartData.length;

  return (
    <section
      className="nw-spending-categories"
      aria-labelledby="nw-spending-categories-title"
    >
      {/* Header */}
      <header className="nw-spending-categories__header">
        <div className="nw-spending-categories__title-wrap">
          <span
            className="nw-spending-categories__icon"
            aria-hidden="true"
          >
            <FaChartPie />
          </span>

          <div className="nw-spending-categories__heading">
            <h2 id="nw-spending-categories-title">
              Spending Categories
            </h2>

            <p>Expense distribution</p>
          </div>
        </div>

        <span className="nw-spending-categories__count">
          {categoryCount}{" "}
          {categoryCount === 1 ? "category" : "categories"}
        </span>
      </header>

      {/* Chart and category legend */}
      {categoryCount === 0 ? (
        <div
          className="nw-spending-categories__empty"
          role="status"
        >
          {email
            ? "No successful expense transactions found."
            : "Sign in again to view spending categories."}
        </div>
      ) : (
        <div className="nw-spending-categories__body">
          {/* Donut chart */}
          <div className="nw-spending-categories__donut">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={1}
              minHeight={1}
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="64%"
                  outerRadius="90%"
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        CATEGORY_COLORS[entry.name] ||
                        CATEGORY_COLORS.OTHER ||
                        "#64748b"
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    money(value),
                    CATEGORY_LABELS[name] || name,
                  ]}
                  contentStyle={{
                    background: "#0b1b2d",
                    border: "1px solid #29425e",
                    borderRadius: 10,
                    color: "#f3f7ff",
                    fontSize: 12,
                  }}
                  itemStyle={{
                    color: "#f3f7ff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center amount */}
            <div className="nw-spending-categories__center">
              <strong>{money(totalExpense)}</strong>
              <span>Total spent</span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="nw-spending-categories__list">
            {chartData.map((item) => {
              const percent = totalExpense
                ? (item.value / totalExpense) * 100
                : 0;

              const color =
                CATEGORY_COLORS[item.name] ||
                CATEGORY_COLORS.OTHER ||
                "#64748b";

              return (
                <div
                  className="nw-spending-categories__row"
                  key={item.name}
                  title={`${CATEGORY_LABELS[item.name] || item.name}: ${money(
                    item.value
                  )}`}
                >
                  <span
                    className="nw-spending-categories__dot"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />

                  <span className="nw-spending-categories__name">
                    {CATEGORY_LABELS[item.name] || item.name}
                  </span>

                  <span className="nw-spending-categories__percent">
                    {percent.toFixed(0)}%
                  </span>

                  <strong className="nw-spending-categories__amount">
                    {money(item.value)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="nw-spending-categories__footer">
        <span>
          {categoryCount}{" "}
          {categoryCount === 1 ? "category" : "categories"}
        </span>

        <span>Successful transactions only</span>
      </footer>
    </section>
  );
}

export default SpendingCategoryChart;