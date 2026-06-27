import "./Analytics.css";
import {
  AreaChart,
  Area,
  ResponsiveContainer
} from "recharts";
import {
  FaArrowTrendUp,
  FaMoneyBillTrendUp,
  FaArrowUpRightFromSquare
} from "react-icons/fa6";

function IncomeChart({
  transactions = [],
}) {
const user = JSON.parse(
  localStorage.getItem("user")
);
console.log("USER EMAIL:", user?.email);

transactions.forEach(tx => {
    console.log(
        tx.receiverEmail,
        "===",
        user?.email,
        "=",
        tx.receiverEmail === user?.email
    );
});

const incomeTransactions = transactions.filter(
    tx => tx.receiverEmail === user?.email
);

  const totalIncome =
    incomeTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

  const growth = 18.4;
const monthNames = [
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

const monthlyIncome = {};

incomeTransactions.forEach((tx) => {

  const month =
    monthNames[
      new Date(tx.timestamp).getMonth()
    ];

  monthlyIncome[month] =
    (monthlyIncome[month] || 0) +
    Number(tx.amount);

});

const chartData =
  monthNames.map((month) => ({
    month,
    value: monthlyIncome[month] || 0
  }));

console.log("Income Transactions:", incomeTransactions);
console.log("Income Chart:", chartData);


  return (

    <div className="analytics-card income-card">

      {/* ================= HEADER ================= */}

      <div className="analytics-card-header">

        <div className="analytics-card-title">

          <div className="analytics-card-icon income-icon">

            <FaMoneyBillTrendUp />

          </div>

          <div>

            <h3>

              Income Analytics

            </h3>

            <p>

              Real-time income overview

            </p>

          </div>

        </div>

        <span className="growth-badge income-growth">

          <FaArrowTrendUp />

          +{growth}%

        </span>

      </div>

      {/* ================= VALUE ================= */}

      <div className="analytics-main-value">

        ₹{totalIncome.toLocaleString("en-IN")}

      </div>

      <p className="analytics-main-subtitle">

        Total Incoming Money

      </p>

      {/* ================= CHART PLACEHOLDER ================= */}

       <div className="mini-chart">

    <ResponsiveContainer
        width="100%"
        height={70}
    >

       <AreaChart data={chartData}>

            <defs>

                <linearGradient
                    id="incomeFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >

                    <stop
                        offset="0%"
                        stopColor="#3b82f6"
                        stopOpacity={0.5}
                    />

                    <stop
                        offset="100%"
                        stopColor="#3b82f6"
                        stopOpacity={0}
                    />

                </linearGradient>

            </defs>

            <Area
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={3}
                fill="url(#incomeFill)"
            />

        </AreaChart>

    </ResponsiveContainer>

</div>

      {/* ================= FOOTER ================= */}

      <div className="analytics-footer">

        <div className="analytics-footer-left">

          <FaArrowUpRightFromSquare />

          <span>

            {incomeTransactions.length} Transactions

          </span>

        </div>

        <span className="analytics-updated">

          Updated just now

        </span>

      </div>

    </div>

  );

}

export default IncomeChart;