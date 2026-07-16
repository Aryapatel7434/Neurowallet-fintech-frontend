import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import {
  FaArrowTrendDown,
  FaArrowDown,
  FaArrowUpRightFromSquare
} from "react-icons/fa6";

function ExpenseTrendChart({
  transactions = []
}) {

  // ================= CURRENT USER =================

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // ================= EXPENSE TRANSACTIONS =================

  const expenseTransactions =
    transactions.filter(
      tx => tx.senderEmail === user?.email
    );

  // ================= MONTHS =================

// ================= LAST 6 MONTHS =================

const allMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const currentMonth = new Date().getMonth();

const previousMonth =
  currentMonth === 0
    ? 11
    : currentMonth - 1;

const monthNames = [];

for (let i = 5; i >= 0; i--) {

  const index =
    (currentMonth - i + 12) % 12;

  monthNames.push(allMonths[index]);

}
const monthlyExpense = {};

expenseTransactions.forEach(tx => {

    const month =
        allMonths[
            new Date(tx.timestamp).getMonth()
        ];

    if (monthNames.includes(month)) {

        monthlyExpense[month] =
            (monthlyExpense[month] || 0) +
            Number(tx.amount);

    }

});

const monthlyData =
    monthNames.map(month => ({

        month,

        expense:
            monthlyExpense[month] || 0

    }));

  // ================= KPI =================

  const totalExpense =
    expenseTransactions.reduce(

      (sum, tx) =>
        sum + Number(tx.amount),

      0

    );

const peakExpense =
  monthlyData.length
    ? Math.max(
        ...monthlyData.map(item => item.expense)
      )
    : 0;

  const averageExpense =
    expenseTransactions.length

      ? Math.round(
        totalExpense /
        expenseTransactions.length
      )

      : 0;

  // ================= GROWTH =================

  let currentExpense = 0;
  let previousExpense = 0;

  expenseTransactions.forEach(tx => {

    const month =
      new Date(tx.timestamp).getMonth();

if (month === currentMonth) {

    currentExpense += Number(tx.amount);

}

    if (month === previousMonth) {

      previousExpense += Number(tx.amount);

    }

  });

  let growthPercentage = 0;

  if (previousExpense > 0) {

    growthPercentage =
      (
        (
          currentExpense -
          previousExpense
        )
        /
        previousExpense
      ) * 100;

  }

  return (

    <div className="chart-card">

      {/* ================= HEADER ================= */}

      <div className="trend-card-header">

        <div className="trend-title-group">

          <div className="trend-icon expense-trend-icon">

            <FaArrowDown />

          </div>

          <div>

            <h3 className="trend-title">

              Expense Trend

            </h3>

            <p className="trend-subtitle">

              Money spent from successful wallet transactions.

            </p>

          </div>

        </div>

        <div className="trend-growth-badge expense-growth">

          <FaArrowTrendDown />

          {

            totalExpense > 0

              ? "Expense Active"

              : "No Expense"

          }

        </div>

      </div>

      {/* ================= KPI ================= */}

      <div className="trend-kpi">

        <h1>

          ₹{totalExpense.toLocaleString("en-IN")}

        </h1>

        <span>

          {

            growthPercentage >= 0

              ? `↑ ${growthPercentage.toFixed(1)}% vs last month`

              : `↓ ${Math.abs(growthPercentage).toFixed(1)}% vs last month`

          }

        </span>

      </div>

      {/* ================= CHART ================= */}

      <div className="chart-container">

        {

          expenseTransactions.length > 0

            ?

            (

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <AreaChart data={monthlyData}>

                  <defs>

                    <linearGradient
                      id="expenseTrendFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                     <stop
    offset="0%"
    stopColor="#a855f7"
    stopOpacity={0.60}
/>

                      <stop
                        offset="100%"
                        stopColor="#a855f7"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,.06)"
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#8fa3c7",
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  />

                  <YAxis
                    domain={['auto', 'auto']}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#8fa3c7",
                      fontSize: 12
                    }}
                  />

                  <Tooltip

                    formatter={(value) => [

                      `₹${Number(value).toLocaleString("en-IN")}`,

                      "Expense"

                    ]}

                    labelFormatter={(label) =>

                      `${label} ${new Date().getFullYear()}`

                    }

                    cursor={false}

                    contentStyle={{
                      background: "#101c35",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: "16px",
                      color: "#fff",
                      boxShadow: "0 15px 35px rgba(0,0,0,.35)"
                    }}

                    labelStyle={{
                      color: "#94a3b8",
                      fontWeight: 600
                    }}

                    itemStyle={{
                      color: "#c084fc",
                      fontWeight: 700
                    }}

                  />

               <Area
    type="monotone"
    dataKey="expense"
    stroke="#c084fc"
    strokeWidth={4}
    fill="url(#expenseTrendFill)"
    animationDuration={1500}
    dot={false}
    activeDot={{
        r: 7,
        fill: "#c084fc",
        stroke: "#fff",
        strokeWidth: 3
    }}
/>
                </AreaChart>

              </ResponsiveContainer>

            )

            :

            (

              <div className="analytics-empty-chart">

                No expense recorded yet.

              </div>

            )

        }

      </div>

      {/* ================= STATS ================= */}

      <div className="trend-stats">

        <div className="trend-stat">

          <span>

            Transactions

          </span>

          <strong>

            {expenseTransactions.length}

          </strong>

        </div>

        <div className="trend-stat">

          <span>

            Average

          </span>

          <strong>

            ₹{averageExpense.toLocaleString("en-IN")}

          </strong>

        </div>

        <div className="trend-stat">

          <span>

            Peak

          </span>

          <strong>

            ₹{peakExpense.toLocaleString("en-IN")}

          </strong>

        </div>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="trend-footer">

        <div className="trend-footer-left">

          <FaArrowUpRightFromSquare />

          <span>

            {`Updated ${new Date().toLocaleString("en-IN")}`}

          </span>

        </div>

      </div>

    </div>

  );

}

export default ExpenseTrendChart;