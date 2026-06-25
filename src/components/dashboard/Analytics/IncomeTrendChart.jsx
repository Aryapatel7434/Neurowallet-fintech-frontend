import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

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

    if (tx.type !== "CREDIT")
      return;

    const month =
      new Date(tx.timestamp)
        .toLocaleString(
          "default",
          {
            month: "short"
          }
        );

    const item =
      monthlyData.find(
        (m) => m.month === month
      );

    if (item) {

      item.income +=
        tx.amount || 0;

    }

  });

  return (

    <div className="chart-card">

      <div className="chart-header">

        <h3>
          Income Trend
        </h3>

        <span className="analytics-badge income">
          LIVE
        </span>

      </div>

      <div className="chart-container">

        <ResponsiveContainer
          width="100%"
          height={280}
        >

          <AreaChart
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

            <Tooltip />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              fill="#22c55e33"
              strokeWidth={3}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}

export default IncomeTrendChart;