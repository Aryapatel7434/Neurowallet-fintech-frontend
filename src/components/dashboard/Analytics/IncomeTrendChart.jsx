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
  FaArrowTrendUp,
  FaArrowUpRightFromSquare
} from "react-icons/fa6";

function IncomeTrendChart({
  transactions = []
}) {

  const monthlyData = [
    { month: "Jan", income: 0 },
    { month: "Feb", income: 0 },
    { month: "Mar", income: 0 },
    { month: "Apr", income: 0 },
    { month: "May", income: 0 },
    { month: "Jun", income: 0 }
  ];

  transactions.forEach((tx) => {

    if (tx.type !== "CREDIT") return;

    const month = new Date(tx.timestamp)
      .toLocaleString("default", {
        month: "short"
      });

    const item = monthlyData.find(
      (m) => m.month === month
    );

    if (item) {

      item.income += tx.amount || 0;

    }

  });

  const totalIncome = monthlyData.reduce(
    (sum, item) => sum + item.income,
    0
  );

  const peakIncome = Math.max(
    ...monthlyData.map(item => item.income),
    0
  );

  const averageIncome =
    transactions.length
      ? Math.round(
          totalIncome / transactions.length
        )
      : 0;

  return (

    <div className="chart-card">

      {/* ================= HEADER ================= */}

      <div className="trend-card-header">

        <div className="trend-title-group">

          <div className="trend-icon income-trend-icon">

            <FaArrowTrendUp />

          </div>

          <div>

            <h3 className="trend-title">

              Income Trend

            </h3>

            <p className="trend-subtitle">

              Monthly revenue performance

            </p>

          </div>

        </div>

        <div className="trend-growth-badge income-growth">

          <FaArrowTrendUp />

          +18.4%

        </div>

      </div>

      {/* ================= KPI ================= */}

      <div className="trend-kpi">

        <h1>

          ₹{totalIncome.toLocaleString()}

        </h1>

        <span>

          ↑ 18.4% vs last month

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
                id="incomeTrendFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#22c55e"
                  stopOpacity={0.45}
                />

                <stop
                  offset="100%"
                  stopColor="#22c55e"
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
    tickLine={false}
    axisLine={false}
    tick={{
        fill: "#8fa3c7",
        fontSize: 12
    }}
/>

          <Tooltip
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
        color: "#22c55e",
        fontWeight: 700
    }}
/>

         <Area
    type="monotone"

    dataKey="income"

    stroke="#22c55e"

    strokeWidth={4}

    fill="url(#incomeTrendFill)"

    animationDuration={1500}

    activeDot={{
        r:7,
        fill:"#22c55e",
        stroke:"#fff",
        strokeWidth:3
    }}

    dot={false}
/>

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* ================= FOOTER ================= */}

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

            ₹{averageIncome.toLocaleString()}

          </strong>

        </div>

        <div className="trend-stat">

          <span>

            Peak

          </span>

          <strong>

            ₹{peakIncome.toLocaleString()}

          </strong>

        </div>

      </div>

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

export default IncomeTrendChart;