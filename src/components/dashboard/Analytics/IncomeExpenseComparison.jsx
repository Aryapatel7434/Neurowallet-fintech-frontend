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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const axisMoney = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
};

const getUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
  } catch {
    return "";
  }
};

const getDate = (transaction) => {
  const value = transaction?.timestamp ?? transaction?.createdAt ?? transaction?.date;
  if (value === null || value === undefined || value === "") return null;
  const date = typeof value === "number"
    ? new Date(value < 1e12 ? value * 1000 : value)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSuccessful = (transaction) => {
  const status = String(transaction?.status ?? "").trim().toUpperCase();
  return status === "SUCCESS" || status === "COMPLETED";
};

function IncomeExpenseComparison({ transactions = [] }) {
  const email = getUserEmail();
  const now = new Date();

  const chartData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      month: MONTHS[date.getMonth()],
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      income: 0,
      expenses: 0,
      net: 0,
    };
  });

  let incomeCount = 0;
  let expenseCount = 0;

  if (email && Array.isArray(transactions)) {
    transactions.forEach((transaction) => {
      if (!isSuccessful(transaction)) return;
      const date = getDate(transaction);
      if (!date) return;

      const month = chartData.find(
        (item) => item.year === date.getFullYear() && item.monthIndex === date.getMonth()
      );
      if (!month) return;

      const amount = Number(transaction?.amount);
      if (!Number.isFinite(amount) || amount <= 0) return;

      if (String(transaction?.receiverEmail ?? "").trim().toLowerCase() === email) {
        month.income += amount;
        incomeCount += 1;
      }

      if (String(transaction?.senderEmail ?? "").trim().toLowerCase() === email) {
        month.expenses += amount;
        expenseCount += 1;
      }
    });
  }

  chartData.forEach((item) => {
    item.net = item.income - item.expenses;
  });

  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const hasActivity = chartData.some((item) => item.income > 0 || item.expenses > 0);

  return (
    <section className="nw-income-expense" aria-labelledby="nw-income-expense-title">
      <header className="nw-income-expense__header">
        <div className="nw-income-expense__title-wrap">
          <span className="nw-income-expense__icon" aria-hidden="true"><FaChartLine /></span>
          <div className="nw-income-expense__heading">
            <h2 id="nw-income-expense-title">Income vs Expenses</h2>
            <p>Track your cash flow over the last six months</p>
          </div>
        </div>
        <span className="nw-income-expense__period">Last 6 months</span>
      </header>

      <div className="nw-income-expense__totals">
        <div className="nw-income-expense__total">
          <span>Total income</span>
          <strong>{money(totalIncome)}</strong>
          <small>{incomeCount} successful incoming {incomeCount === 1 ? "payment" : "payments"}</small>
        </div>
        <div className="nw-income-expense__total">
          <span>Total expenses</span>
          <strong>{money(totalExpenses)}</strong>
          <small>{expenseCount} successful outgoing {expenseCount === 1 ? "payment" : "payments"}</small>
        </div>
      </div>

      {!email ? (
        <div className="nw-income-expense__empty" role="status">
          Sign in again to view your personal cash-flow analytics.
        </div>
      ) : !hasActivity ? (
        <div className="nw-income-expense__empty" role="status">
          No successful income or expense transactions were found for the last six months.
          <span>Older transactions are not included in this six-month view.</span>
        </div>
      ) : (
        <div className="nw-income-expense__chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid stroke="#20364e" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#b7c8df", fontSize: 11 }}
                axisLine={{ stroke: "#314963" }}
                tickLine={false}
              />
              <YAxis
                width={48}
                tickFormatter={axisMoney}
                tick={{ fill: "#91a8c5", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => [money(value), name]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload ? `${label} ${payload[0].payload.year}` : label
                }
                contentStyle={{ background: "#0b1b2d", border: "1px solid #29425e", borderRadius: 10, color: "#f3f7ff" }}
                labelStyle={{ color: "#f3f7ff", fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ color: "#c4d4e8", fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="income" name="Income" fill="#3295ff" radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Bar dataKey="expenses" name="Expenses" fill="#f05b70" radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Line dataKey="net" name="Net cash flow" type="monotone" stroke="#20c99a" strokeWidth={2} dot={{ r: 2, fill: "#20c99a" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default IncomeExpenseComparison;
