import {
  PieChart,
  Pie,
  Tooltip,
  Cell
} from "recharts";

const data = [
  { name: "Food", value: 8000 },
  { name: "Fuel", value: 5000 },
  { name: "Shopping", value: 12000 },
  { name: "Bills", value: 6000 }
];

const COLORS = [
  "#2563eb",
  "#22c55e",
  "#f97316",
  "#ef4444"
];

function ExpenseChart() {
  return (
    <div className="chart-card">

      <h3>Expense Breakdown</h3>

      <PieChart
        width={350}
        height={250}
      >

        <Pie
          data={data}
          dataKey="value"
          outerRadius={90}
        >

          {
            data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))
          }

        </Pie>

        <Tooltip />

      </PieChart>

    </div>
  );
}

export default ExpenseChart;