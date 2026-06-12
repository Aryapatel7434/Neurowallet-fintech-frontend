import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", savings: 12000 },
  { month: "Feb", savings: 15000 },
  { month: "Mar", savings: 18000 },
  { month: "Apr", savings: 25000 },
  { month: "May", savings: 35000 }
];

function SavingsChart() {
  return (
    <div className="chart-card">

      <h3>Savings Growth</h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <LineChart data={data}>

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="savings"
            stroke="#22c55e"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default SavingsChart;