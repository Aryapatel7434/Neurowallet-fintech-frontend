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

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const incomeTransactions = transactions.filter(
    tx =>
      tx.receiverEmail === user?.email
  );

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

const currentMonthIndex =
    new Date().getMonth();

const monthNames = [];

for (let i = 5; i >= 0; i--) {

    const index =
        (currentMonthIndex - i + 12) % 12;

    monthNames.push(allMonths[index]);

}

const monthlyIncome = {};

incomeTransactions.forEach(tx => {

 const month =
    allMonths[
        new Date(tx.timestamp).getMonth()
    ];
  monthlyIncome[month] =
    (monthlyIncome[month] || 0) +
    Number(tx.amount);

});

const monthlyData =
  monthNames.map(month => ({

    month,

    income:
      monthlyIncome[month] || 0

  }));
  console.log("monthNames:", monthNames);
console.log("monthlyIncome:", monthlyIncome);
console.log("monthlyData:", monthlyData);
const totalIncome =
  incomeTransactions.reduce(

    (sum, tx) =>
      sum + Number(tx.amount),

    0

  );

const peakIncome =
  incomeTransactions.length

    ? Math.max(
        ...incomeTransactions.map(

          tx => Number(tx.amount)

        )
      )

    : 0;

const averageIncome =
  incomeTransactions.length

    ? Math.round(
        totalIncome /
        incomeTransactions.length
      )

    : 0;

    // ================= GROWTH CALCULATION =================

const currentMonth =
  new Date().getMonth();

const previousMonth =
  currentMonth === 0
    ? 11
    : currentMonth - 1;

let currentIncome = 0;
let previousIncome = 0;

incomeTransactions.forEach(tx => {

  const month =
    new Date(tx.timestamp).getMonth();

  if (month === currentMonth) {

    currentIncome += Number(tx.amount);

  }

  if (month === previousMonth) {

    previousIncome += Number(tx.amount);

  }
console.log(
    tx.timestamp,
    new Date(tx.timestamp).toLocaleString("default", {
        month: "short"
    })
);
});

let growthPercentage = 0;

if (previousIncome > 0) {

  growthPercentage =
    (
      (
        currentIncome -
        previousIncome
      ) /
      previousIncome
    ) * 100;

}
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

{
totalIncome > 0
?
"Income Active"
:
"No Income"
}

        </div>

      </div>

      {/* ================= KPI ================= */}

      <div className="trend-kpi">

        <h1>

          ₹{totalIncome.toLocaleString()}

        </h1>

       <span>

{
growthPercentage >= 0
?
`↑ ${growthPercentage.toFixed(1)}% vs last month`
:
`↓ ${Math.abs(growthPercentage).toFixed(1)}% vs last month`
}

</span>

      </div>

      {/* ================= CHART ================= */}

   
<div className="chart-container">

{
incomeTransactions.length > 0
?

(

<ResponsiveContainer
    width="100%"
    height={280}
>

<AreaChart data={monthlyData}>

    {/* Paste your ORIGINAL chart code here */}

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
            fill:"#8fa3c7",
            fontSize:13,
            fontWeight:600
        }}
    />

    <YAxis
        domain={['auto','auto']}
        tickLine={false}
        axisLine={false}
        tick={{
            fill:"#8fa3c7",
            fontSize:12
        }}
    />

    <Tooltip
        formatter={(value)=>[
            `₹${Number(value).toLocaleString("en-IN")}`,
            "Income"
        ]}
        labelFormatter={(label)=>
            `${label} ${new Date().getFullYear()}`
        }
        cursor={false}
        contentStyle={{
            background:"#101c35",
            border:"1px solid rgba(255,255,255,.08)",
            borderRadius:"16px",
            color:"#fff"
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

)

:

(

<div className="analytics-empty-chart">

    No income recorded yet.

</div>

)

}

</div>
      {/* ================= FOOTER ================= */}

      <div className="trend-stats">

        <div className="trend-stat">

          <span>

            Transactions

          </span>

          <strong>

          {incomeTransactions.length}

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

          {
`Updated ${new Date().toLocaleString("en-IN")}`
}

          </span>

        </div>

      </div>

    </div>

  );

}

export default IncomeTrendChart;