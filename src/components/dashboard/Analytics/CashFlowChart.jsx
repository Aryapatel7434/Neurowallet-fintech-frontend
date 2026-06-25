import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

function CashFlowChart({
  transactions = []
}) {

  const monthlyData = [
    { month: "Jan", income: 0, expense: 0 },
    { month: "Feb", income: 0, expense: 0 },
    { month: "Mar", income: 0, expense: 0 },
    { month: "Apr", income: 0, expense: 0 },
    { month: "May", income: 0, expense: 0 },
    { month: "Jun", income: 0, expense: 0 }
  ];

  transactions.forEach((tx) => {

    const month = new Date(tx.timestamp)
      .toLocaleString("default", {
        month: "short"
      });

    const item = monthlyData.find(
      m => m.month === month
    );

    if (!item) return;

    if (tx.type === "CREDIT")
      item.income += tx.amount;

    if (tx.type === "DEBIT")
      item.expense += tx.amount;

  });

  return (

    <div className="chart-card">

      <div className="chart-header">

        <h3>Cash Flow</h3>

        <span className="analytics-badge">
          LIVE
        </span>

      </div>

      <div className="chart-container">

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <LineChart data={monthlyData}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#22304b"
            />

            <XAxis
              dataKey="month"
              stroke="#94a3b8"
            />

            <YAxis
              stroke="#94a3b8"
            />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}

export default CashFlowChart;