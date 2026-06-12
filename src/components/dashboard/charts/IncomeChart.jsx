import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", income: 30000 },
  { month: "Feb", income: 45000 },
  { month: "Mar", income: 50000 },
  { month: "Apr", income: 55000 },
  { month: "May", income: 60000 }
];

function IncomeChart() {
  return (
    <div className="chart-card">

      <h3>Income Trend</h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <BarChart data={data}>

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="income"
            fill="#2563eb"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default IncomeChart;