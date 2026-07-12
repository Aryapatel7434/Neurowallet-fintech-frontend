import "./Analytics.css";

import {
  FaArrowDown,
  FaArrowTrendDown,
  FaArrowUpRightFromSquare
} from "react-icons/fa6";

import {
  AreaChart,
  Area,
  ResponsiveContainer
} from "recharts";

function ExpenseChart({
  transactions = [],
}) {

  // Logged-in user
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // Expense Transactions
  const expenseTransactions =
    transactions.filter(
      tx => tx.senderEmail === user?.email
    );
const totalExpense =
    expenseTransactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
    );
 const monthNames = [

"Jan","Feb","Mar","Apr",

"May","Jun","Jul","Aug",

"Sep","Oct","Nov","Dec"

];

const monthlyExpense = {};

expenseTransactions.forEach(tx=>{

const month=

monthNames[
new Date(tx.timestamp).getMonth()
];

monthlyExpense[month]=

(monthlyExpense[month]||0)

+

Number(tx.amount);

});

const chartData=

monthNames.map(month=>({

month,

value:

monthlyExpense[month]

||

0

}));

const expenseStatus =

totalExpense>0

?

"High Spending"

:

"No Expense";
  return (

    <div className="analytics-card">

      <div className="analytics-card-header">

        <div className="analytics-card-title">

          <div className="analytics-card-icon expense-icon">

            <FaArrowDown />

          </div>

          <div>

            <h3>Expense Analytics</h3>

            <p>Money spent from successful wallet transactions.</p>

          </div>

        </div>

        <div className="growth-badge expense-growth">

<FaArrowTrendDown/>

{expenseStatus}

</div>
      </div>

      <div className="analytics-main-value">

        ₹{
Number(totalExpense)
.toLocaleString("en-IN")
}

      </div>

      <p className="analytics-main-subtitle">

       Total amount debited from your wallet

      </p>
<div className="analytics-summary">

<div>

<span>

Largest Expense

</span>

<strong>

₹{

expenseTransactions.length

?

Math.max(

...expenseTransactions.map(

t=>Number(t.amount)

)

).toLocaleString("en-IN")

:

0

}

</strong>

</div>

<div>

<span>

Payments

</span>

<strong>

{

expenseTransactions.length

}

</strong>

</div>

</div>
     <div className="mini-chart">

{

expenseTransactions.length>0

?

        <ResponsiveContainer
          width="100%"
          height={70}
        >

          <AreaChart data={chartData}>

            <defs>

              <linearGradient
                id="expenseFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#a855f7"
                  stopOpacity={0.45}
                />

                <stop
                  offset="100%"
                  stopColor="#a855f7"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <Area
              type="monotone"
              dataKey="value"
              stroke="#c084fc"
              strokeWidth={3}
              fill="url(#expenseFill)"
            />

          </AreaChart>

        </ResponsiveContainer>

        :

(

<div className="analytics-empty-chart">

No expense available

</div>

)

}

      </div>

      <div className="analytics-footer">

        <div className="analytics-footer-left">

          <FaArrowUpRightFromSquare />

          <span>

            {expenseTransactions.length} Transactions

          </span>

        </div>

        <span className="analytics-updated">

          Live Backend Data

        </span>

      </div>

    </div>

  );

}

export default ExpenseChart;