
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
          email &&
          sender === email &&
          (status === "SUCCESS" || status === "COMPLETED") &&
          Number.isFinite(amount) &&
          amount > 0
        );
      })
    : [];

  const totals = expenses.reduce((result, tx) => {
    const category = tx?.category || "OTHER";
    result[category] =
      (result[category] || 0) + Number(tx.amount);
    return result;
  }, {});

  const chartData = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalExpense = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <section
      className="nw-spending-categories"
      aria-labelledby="nw-spending-categories-title"
    >
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
          {chartData.length}{" "}
          {chartData.length === 1 ? "category" : "categories"}
        </span>
      </header>

      {chartData.length === 0 ? (
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
                  innerRadius="62%"
                  outerRadius="88%"
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
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="nw-spending-categories__center">
              <strong>{money(totalExpense)}</strong>
              <span>Total spent</span>
            </div>
          </div>

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
                >
                  <span
                    className="nw-spending-categories__dot"
                    style={{ backgroundColor: color }}
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

      <footer className="nw-spending-categories__footer">
        <span>{chartData.length} categories</span>
        <span>Successful transactions only</span>
      </footer>
    </section>
  );
}

export default SpendingCategoryChart;
