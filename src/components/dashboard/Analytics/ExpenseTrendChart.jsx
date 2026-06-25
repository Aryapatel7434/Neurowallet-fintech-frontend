import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

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

    if (tx.type !== "DEBIT")
      return;

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

  return (

    <div className="chart-card">

      <div className="chart-header">

        <h3>Expense Trend</h3>

        <span className="analytics-badge expense">
          LIVE
        </span>

      </div>

      <div className="chart-container">

        <ResponsiveContainer
          width="100%"
          height={280}
        >

          <AreaChart data={monthlyData}>

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
              dataKey="expense"
              stroke="#ef4444"
              fill="#ef444433"
              strokeWidth={3}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}

export default ExpenseTrendChart;