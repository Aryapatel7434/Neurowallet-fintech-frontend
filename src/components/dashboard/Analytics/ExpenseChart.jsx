import "./Analytics.css";

import {
  FaArrowDown,
  FaArrowTrendDown,
  FaArrowUpRightFromSquare
} from "react-icons/fa6";

import {
  AreaChart,
  Area,
  ResponsiveContainer
} from "recharts";

function ExpenseChart({
  transactions = [],
}) {

  const expenseTransactions =
    transactions.filter(
      (t) => t.type === "DEBIT"
    );

  const totalExpense =
    expenseTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

  const chartData = [
    { value: 3200 },
    { value: 2700 },
    { value: 2900 },
    { value: 2200 },
    { value: 1800 },
    { value: 1400 },
    { value: totalExpense || 0 }
  ];

  return (

    <div className="analytics-card">

      <div className="analytics-card-header">

        <div className="analytics-card-title">

          <div className="analytics-card-icon expense-icon">

            <FaArrowDown />

          </div>

          <div>

            <h3>Expense Analytics</h3>

            <p>Real-time expense overview</p>

          </div>

        </div>

        <div className="growth-badge expense-growth">

          <FaArrowTrendDown />

          -9.2%

        </div>

      </div>

      <div className="analytics-main-value">

        ₹{totalExpense.toLocaleString()}

      </div>

      <p className="analytics-main-subtitle">

        Total Outgoing Money

      </p>

      <div className="mini-chart">

        <ResponsiveContainer
          width="100%"
          height={70}
        >

          <AreaChart data={chartData}>

            <defs>

              <linearGradient
                id="expenseFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#a855f7"
                  stopOpacity={0.45}
                />

                <stop
                  offset="100%"
                  stopColor="#a855f7"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <Area
              type="monotone"
              dataKey="value"
              stroke="#c084fc"
              strokeWidth={3}
              fill="url(#expenseFill)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      <div className="analytics-footer">

        <div className="analytics-footer-left">

          <FaArrowUpRightFromSquare />

          <span>

            {expenseTransactions.length} Transactions

          </span>

        </div>

        <span className="analytics-updated">

          Updated just now

        </span>

      </div>

    </div>

  );

}

export default ExpenseChart;