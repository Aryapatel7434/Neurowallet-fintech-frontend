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

import "./Analytics.css";

function CashFlowChart({ transactions = [] }) {

  const monthlyData = [
    { month: "Jan", income: 0, expense: 0 },
    { month: "Feb", income: 0, expense: 0 },
    { month: "Mar", income: 0, expense: 0 },
    { month: "Apr", income: 0, expense: 0 },
    { month: "May", income: 0, expense: 0 },
    { month: "Jun", income: 0, expense: 0 },
  ];
const user = JSON.parse(localStorage.getItem("user"));
 transactions.forEach((tx) => {

    if (tx.status !== "SUCCESS") return;

    const month = new Date(tx.timestamp).toLocaleString(
      "default",
      { month: "short" }
    );

    const item = monthlyData.find(
      (m) => m.month === month
    );

    if (!item) return;

    if (tx.receiverEmail === user.email) {
        item.income += Number(tx.amount || 0);
    }

    if (tx.senderEmail === user.email) {
        item.expense += Number(tx.amount || 0);
    }

});
 const totalIncome = transactions
    .filter(
        tx =>
            tx.status === "SUCCESS" &&
            tx.receiverEmail === user.email
    )
    .reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0
    );

const totalExpense = transactions
    .filter(
        tx =>
            tx.status === "SUCCESS" &&
            tx.senderEmail === user.email
    )
    .reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0
    );

  const netCashFlow = totalIncome - totalExpense;

  return (

    <div className="chart-card">

      <div className="chart-card-header">

        <div className="chart-card-title">

          <div className="chart-card-icon cashflow-icon">

            <FaMoneyBillTrendUp />

          </div>

          <div>

            <h3>Cash Flow</h3>

            <p>
              Overall money movement
            </p>

          </div>

        </div>

        <div className="growth-badge trend-growth">

          +5.2%

        </div>

      </div>

      <div className="analytics-main-value">

        ₹{netCashFlow.toLocaleString("en-IN")}

      </div>

      <p className="analytics-main-subtitle">

        Net Cash Flow

      </p>

      <div className="premium-chart">

        <ResponsiveContainer
          width="100%"
          height={240}
        >

          <LineChart
            data={monthlyData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#24324d"
            />

            <XAxis
              dataKey="month"
              stroke="#94a3b8"
            />

            <YAxis
              stroke="#94a3b8"
            />

            <Tooltip
              contentStyle={{
                background: "#132344",
                border: "1px solid #2f5cff",
                borderRadius: "14px",
                color: "#fff",
              }}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#22c55e"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      <div className="analytics-footer">

        <div className="analytics-footer-left">

          <FaArrowUpRightFromSquare />

          <span>

            {transactions.length} Transactions

          </span>

        </div>

        <div className="analytics-updated">

          Updated just now

        </div>

      </div>

    </div>

  );

}

export default CashFlowChart;