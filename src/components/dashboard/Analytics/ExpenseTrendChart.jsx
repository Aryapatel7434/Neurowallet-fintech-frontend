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

  const monthlyData = [
    { month: "Jan", expense: 0 },
    { month: "Feb", expense: 0 },
    { month: "Mar", expense: 0 },
    { month: "Apr", expense: 0 },
    { month: "May", expense: 0 },
    { month: "Jun", expense: 0 }
  ];

  transactions.forEach((tx) => {

    if (tx.type !== "DEBIT") return;

    const month = new Date(tx.timestamp)
      .toLocaleString("default", {
        month: "short"
      });

    const item = monthlyData.find(
      (m) => m.month === month
    );

    if (item) {

      item.expense += tx.amount || 0;

    }

  });

  const totalExpense = monthlyData.reduce(
    (sum, item) => sum + item.expense,
    0
  );

  const peakExpense = Math.max(
    ...monthlyData.map(item => item.expense),
    0
  );

  const averageExpense =
    transactions.length
      ? Math.round(
          totalExpense / transactions.length
        )
      : 0;

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

              Monthly expense performance

            </p>

          </div>

        </div>

        <div className="trend-growth-badge expense-growth">

          <FaArrowTrendDown />

          -9.2%

        </div>

      </div>

      {/* ================= KPI ================= */}

      <div className="trend-kpi">

        <h1>

          ₹{totalExpense.toLocaleString()}

        </h1>

        <span>

          ↓ 9.2% vs last month

        </span>

      </div>

      {/* ================= CHART ================= */}

      <div className="chart-container">

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
                  stopOpacity={0.45}
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
                fill:"#8fa3c7",
                fontSize:13,
                fontWeight:600
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill:"#8fa3c7",
                fontSize:12
              }}
            />

            <Tooltip
              cursor={false}
              contentStyle={{
                background:"#101c35",
                border:"1px solid rgba(255,255,255,.08)",
                borderRadius:"16px",
                color:"#fff",
                boxShadow:"0 15px 35px rgba(0,0,0,.35)"
              }}
              labelStyle={{
                color:"#94a3b8",
                fontWeight:600
              }}
              itemStyle={{
                color:"#c084fc",
                fontWeight:700
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
                r:7,
                fill:"#c084fc",
                stroke:"#fff",
                strokeWidth:3
              }}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* ================= STATS ================= */}

      <div className="trend-stats">

        <div className="trend-stat">

          <span>

            Transactions

          </span>

          <strong>

            {transactions.length}

          </strong>

        </div>

        <div className="trend-stat">

          <span>

            Average

          </span>

          <strong>

            ₹{averageExpense.toLocaleString()}

          </strong>

        </div>

        <div className="trend-stat">

          <span>

            Peak

          </span>

          <strong>

            ₹{peakExpense.toLocaleString()}

          </strong>

        </div>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="trend-footer">

        <div className="trend-footer-left">

          <FaArrowUpRightFromSquare />

          <span>

            Updated just now

          </span>

        </div>

      </div>

    </div>

  );

}

export default ExpenseTrendChart;