
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  FaMoneyBillTrendUp,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";

import "./CashFlowChart.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value) =>
  currencyFormatter.format(Number(value) || 0);

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function getTransactionDate(transaction) {
  const value =
    transaction.timestamp ??
    transaction.createdAt ??
    transaction.date;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function CashFlowChart({ transactions = [] }) {
  const user = useMemo(() => getCurrentUser(), []);

  const {
    monthlyData,
    totalIncome,
    totalExpense,
    netCashFlow,
    currentNet,
    previousNet,
    successfulCount,
  } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Build the last six calendar months, including year boundaries.
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        currentYear,
        currentMonth - 5 + index,
        1
      );

      return {
        month: MONTHS[date.getMonth()],
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        income: 0,
        expense: 0,
      };
    });

    let income = 0;
    let expense = 0;
    let thisMonthNet = 0;
    let lastMonthNet = 0;
    let count = 0;

    const previousMonthDate = new Date(
      currentYear,
      currentMonth - 1,
      1
    );

    transactions.forEach((transaction) => {
      if (transaction.status !== "SUCCESS") return;

      const amount = Number(transaction.amount);
      if (!Number.isFinite(amount)) return;

      const date = getTransactionDate(transaction);
      if (!date) return;

      count += 1;

      const isIncoming =
        Boolean(user.email) &&
        transaction.receiverEmail === user.email;

      const isOutgoing =
        Boolean(user.email) &&
        transaction.senderEmail === user.email;

      // Only count transactions involving the logged-in user.
      if (!isIncoming && !isOutgoing) return;

      const transactionMonth = date.getMonth();
      const transactionYear = date.getFullYear();

      const chartMonth = months.find(
        (item) =>
          item.monthIndex === transactionMonth &&
          item.year === transactionYear
      );

      if (chartMonth) {
        if (isIncoming) chartMonth.income += amount;
        if (isOutgoing) chartMonth.expense += amount;
      }

      const isCurrentMonth =
        transactionMonth === currentMonth &&
        transactionYear === currentYear;

      const isPreviousMonth =
        transactionMonth === previousMonthDate.getMonth() &&
        transactionYear === previousMonthDate.getFullYear();

      if (isIncoming) {
        income += amount;

        if (isCurrentMonth) thisMonthNet += amount;
        if (isPreviousMonth) lastMonthNet += amount;
      }

      if (isOutgoing) {
        expense += amount;

        if (isCurrentMonth) thisMonthNet -= amount;
        if (isPreviousMonth) lastMonthNet -= amount;
      }
    });

    return {
      monthlyData: months,
      totalIncome: income,
      totalExpense: expense,
      netCashFlow: income - expense,
      currentNet: thisMonthNet,
      previousNet: lastMonthNet,
      successfulCount: count,
    };
  }, [transactions, user.email]);

  const growthPercentage =
    previousNet !== 0
      ? ((currentNet - previousNet) / Math.abs(previousNet)) * 100
      : null;

  const growthIsPositive = currentNet >= previousNet;

  const formatAxisValue = (value) => {
    const amount = Number(value) || 0;
    const absoluteAmount = Math.abs(amount);

    if (absoluteAmount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`;
    }

    if (absoluteAmount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}k`;
    }

    return `₹${amount}`;
  };

  return (
    <section className="chart-card cashflow-card">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <div className="chart-card-icon cashflow-icon">
            <FaMoneyBillTrendUp />
          </div>

          <div>
            <h3>Cash Flow</h3>
            <p>Income and expenses over six months</p>
          </div>
        </div>

        <span
          className={`growth-badge trend-growth ${
            growthIsPositive ? "positive" : "negative"
          }`}
        >
          {growthPercentage === null
            ? "No comparison"
            : `${growthPercentage >= 0 ? "↑" : "↓"} ${Math.abs(
                growthPercentage
              ).toFixed(1)}%`}
        </span>
      </div>

      <div className="analytics-main-value">
        {formatCurrency(netCashFlow)}
      </div>

      <p className="analytics-main-subtitle">
        Net cash flow ·{" "}
        {growthPercentage === null
          ? "No previous-month baseline"
          : `${growthPercentage >= 0 ? "↑" : "↓"} ${Math.abs(
              growthPercentage
            ).toFixed(1)}% vs last month`}
      </p>

      <div className="cashflow-summary">
        <div className="cashflow-summary-item">
          <span className="cashflow-dot income-dot" />
          <div>
            <span className="cashflow-summary-label">Total income</span>
            <strong>{formatCurrency(totalIncome)}</strong>
          </div>
        </div>

        <div className="cashflow-summary-item">
          <span className="cashflow-dot expense-dot" />
          <div>
            <span className="cashflow-summary-label">Total expenses</span>
            <strong>{formatCurrency(totalExpense)}</strong>
          </div>
        </div>
      </div>

      <div className="premium-chart cashflow-chart">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={monthlyData}
            margin={{ top: 10, right: 8, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 5"
              stroke="#24324d"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="#8290aa"
              tick={{ fill: "#8290aa", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#8290aa"
              tick={{ fill: "#8290aa", fontSize: 10 }}
              tickFormatter={formatAxisValue}
              tickLine={false}
              axisLine={false}
              width={55}
            />

            <Tooltip
              cursor={{ stroke: "#536581", strokeDasharray: "4 4" }}
              formatter={(value, name) => [
                formatCurrency(value),
                name,
              ]}
              labelFormatter={(label, payload) => {
                const year = payload?.[0]?.payload?.year;
                return year ? `${label} ${year}` : label;
              }}
              contentStyle={{
                background: "#101c35",
                border: "1px solid #263653",
                borderRadius: "10px",
                color: "#f1f5f9",
                fontSize: "12px",
              }}
              itemStyle={{ padding: "2px 0" }}
            />

            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              wrapperStyle={{
                color: "#aab7cc",
                fontSize: "11px",
                paddingTop: "8px",
              }}
            />

            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 0,
                fill: "#22c55e",
              }}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#f87171"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 0,
                fill: "#f87171",
              }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-footer">
        <div className="analytics-footer-left">
          <FaArrowUpRightFromSquare />
          <span>{successfulCount} successful transactions</span>
        </div>

        <span className="analytics-updated">
          Updated {new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </section>
  );
}

export default CashFlowChart;
