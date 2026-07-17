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

const currentMonth =
    new Date().getMonth();

const monthNames = [];

for (let i = 5; i >= 0; i--) {

    const index =
        (currentMonth - i + 12) % 12;

    monthNames.push(
        allMonths[index]
    );

}
const monthlyData = monthNames.map(month => ({
    month,
    income: 0,
    expense: 0
}));
const user = JSON.parse(localStorage.getItem("user")) || {};
transactions.forEach(tx => {

    if (tx.status !== "SUCCESS") return;

    const month =
        allMonths[new Date(tx.timestamp).getMonth()];

    const item = monthlyData.find(
        m => m.month === month
    );

    if (!item) return;

    if (tx.receiverEmail === user.email) {
        item.income += Number(tx.amount);
    }

    if (tx.senderEmail === user.email) {
        item.expense += Number(tx.amount);
    }

});
 const totalIncome = transactions
    .filter(
        tx =>
            tx.status === "SUCCESS" &&
            tx.receiverEmail === user?.email
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
const previousMonth =
    currentMonth === 0
        ? 11
        : currentMonth - 1;

let currentNet = 0;
let previousNet = 0;

transactions.forEach(tx => {

    if (tx.status !== "SUCCESS") return;

    const month =
        new Date(tx.timestamp).getMonth();

    if (month === currentMonth) {

        if (tx.receiverEmail === user.email)
            currentNet += Number(tx.amount);

        if (tx.senderEmail === user.email)
            currentNet -= Number(tx.amount);

    }

    if (month === previousMonth) {

        if (tx.receiverEmail === user.email)
            previousNet += Number(tx.amount);

        if (tx.senderEmail === user.email)
            previousNet -= Number(tx.amount);

    }

});

let growthPercentage = 0;

if (previousNet !== 0) {

    growthPercentage =
        ((currentNet - previousNet) /
            Math.abs(previousNet)) *
        100;

}
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
{
growthPercentage >= 0
? `↑ ${growthPercentage.toFixed(1)}%`
: `↓ ${Math.abs(growthPercentage).toFixed(1)}%`
}
        </div>

      </div>

      <div className="analytics-main-value">

        ₹{netCashFlow.toLocaleString("en-IN")}

      </div>

      <p className="analytics-main-subtitle">

      {
growthPercentage >= 0
? `↑ ${growthPercentage.toFixed(1)}% vs last month`
: `↓ ${Math.abs(growthPercentage).toFixed(1)}% vs last month`
}

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
    tickFormatter={(value) =>
        `₹${value / 1000}k`
    }
/>
<Tooltip
    cursor={false}
    formatter={(value, name) => [

        `₹${Number(value).toLocaleString("en-IN")}`,
        name

    ]}
    labelFormatter={label =>
        `${label} ${new Date().getFullYear()}`
    }
    contentStyle={{
        background:"#101c35",
        border:"1px solid rgba(255,255,255,.08)",
        borderRadius:"16px",
        color:"#fff",
        boxShadow:"0 15px 35px rgba(0,0,0,.35)"
    }}
/>
           <Legend
    verticalAlign="bottom"
    iconType="circle"
/>

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
              animationDuration={1800}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      <div className="analytics-footer">

        <div className="analytics-footer-left">

          <FaArrowUpRightFromSquare />

          <span>

           {
transactions.filter(
tx => tx.status === "SUCCESS"
).length
} Transactions

          </span>

        </div>

        <div className="analytics-updated">

          {`Updated ${new Date().toLocaleString("en-IN")}`}

        </div>

      </div>

    </div>

  );

}

export default CashFlowChart;