
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaChartLine } from "react-icons/fa6";
import "./IncomeExpenseComparison.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const axisMoney = (value) => {
  const amount = Number(value) || 0;

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }

  return `₹${amount}`;
};

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

const getDate = (transaction) => {
  const value =
    transaction?.timestamp ??
    transaction?.createdAt ??
    transaction?.date;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date =
    typeof value === "number"
      ? new Date(value < 1e12 ? value * 1000 : value)
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isSuccessful = (transaction) => {
  const status = String(transaction?.status ?? "")
    .trim()
    .toUpperCase();

  return status === "SUCCESS" || status === "COMPLETED";
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;

  return (
    <div className="nw-chart-tooltip">
      <p className="nw-chart-tooltip__title">
        {label} {data?.year}
      </p>

      {payload.map((item) => (
        <div className="nw-chart-tooltip__row" key={item.dataKey}>
          <span
            className="nw-chart-tooltip__dot"
            style={{ background: item.color }}
          />

          <span>{item.name}</span>

          <strong>{money(item.value)}</strong>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload = [] }) => (
  <div className="nw-income-expense__legend">
    {payload.map((item) => (
      <span className="nw-income-expense__legend-item" key={item.value}>
        <span
          className={`nw-income-expense__legend-dot nw-income-expense__legend-dot--${item.dataKey}`}
        />
        {item.value}
      </span>
    ))}
  </div>
);

function IncomeExpenseComparison({ transactions = [] }) {
  const email = getUserEmail();
  const now = new Date();

  const chartData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 5 + index,
      1
    );

    return {
      month: MONTHS[date.getMonth()],
      label: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      income: 0,
      expenses: 0,
      net: 0,
    };
  });

  if (email && Array.isArray(transactions)) {
    transactions.forEach((transaction) => {
      if (!isSuccessful(transaction)) return;

      const date = getDate(transaction);
      if (!date) return;

      const month = chartData.find(
        (item) =>
          item.year === date.getFullYear() &&
          item.monthIndex === date.getMonth()
      );

      if (!month) return;

      const amount = Number(transaction?.amount);

      if (!Number.isFinite(amount) || amount <= 0) return;

      const senderEmail = String(
        transaction?.senderEmail ?? ""
      ).trim().toLowerCase();

      const receiverEmail = String(
        transaction?.receiverEmail ?? ""
      ).trim().toLowerCase();

      if (receiverEmail === email) {
        month.income += amount;
      }

      if (senderEmail === email) {
        month.expenses += amount;
      }
    });
  }

  chartData.forEach((item) => {
    item.net = item.income - item.expenses;
  });

  const hasActivity = chartData.some(
    (item) => item.income > 0 || item.expenses > 0
  );

  return (
    <section
      className="nw-income-expense"
      aria-labelledby="nw-income-expense-title"
    >
      <header className="nw-income-expense__header">
        <div className="nw-income-expense__title-wrap">
          <span className="nw-income-expense__icon" aria-hidden="true">
            <FaChartLine />
          </span>

          <div className="nw-income-expense__heading">
            <h2 id="nw-income-expense-title">
              Income vs Expenses
            </h2>

            <p>Track your cash flow over time</p>
          </div>
        </div>

        <span className="nw-income-expense__period">
          Last 6 months
        </span>
      </header>

      {!email ? (
        <div className="nw-income-expense__empty" role="status">
          Sign in again to view your personal cash-flow analytics.
        </div>
      ) : !hasActivity ? (
        <div className="nw-income-expense__empty" role="status">
          No successful income or expense transactions were found
          for the last six months.
          <span>
            This chart only includes transactions available in your
            current transaction history.
          </span>
        </div>
      ) : (
        <div className="nw-income-expense__chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 8,
                right: 8,
                left: 0,
                bottom: 0,
              }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                stroke="#1b3550"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#a9bfd9",
                  fontSize: 10,
                }}
                axisLine={{ stroke: "#29425e" }}
                tickLine={false}
                interval={0}
                tickMargin={8}
              />

              <YAxis
                width={48}
                tickFormatter={axisMoney}
                tick={{
                  fill: "#91a8c5",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
                tickMargin={5}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                content={<CustomLegend />}
                verticalAlign="top"
                align="right"
                height={35}
              />

              <Bar
                dataKey="income"
                name="Income"
                fill="#328cff"
                radius={[4, 4, 0, 0]}
                maxBarSize={23}
              />

              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#ff536b"
                radius={[4, 4, 0, 0]}
                maxBarSize={23}
              />

              <Line
                dataKey="net"
                name="Net Cash Flow"
                type="monotone"
                stroke="#00d69a"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#00d69a",
                  stroke: "#071a2b",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default IncomeExpenseComparison;
