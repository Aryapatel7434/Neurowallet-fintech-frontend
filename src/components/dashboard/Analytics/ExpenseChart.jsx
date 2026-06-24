import "./Analytics.css";
import { FaArrowTrendDown } from "react-icons/fa6";

function ExpenseChart({
  transactions = [],
}) {

  const expenseTransactions =
    transactions.filter(
      (t) => t.type === "DEBIT"
    );

  const totalExpense =
    expenseTransactions.reduce(
      (sum, t) =>
        sum + (t.amount || 0),
      0
    );

  return (

    <div className="analytics-card">

      <div className="analytics-header">

        <h3>
          Expense Analytics
        </h3>

        <span className="analytics-badge expense">
          DEBIT
        </span>

      </div>

      <div className="analytics-value">
        ₹{totalExpense.toLocaleString()}
      </div>

      <p className="analytics-subtitle">
        Total Outgoing Money
      </p>

      <div className="analytics-footer">

        <FaArrowTrendDown />

        <span>
          {expenseTransactions.length}
          Transactions
        </span>

      </div>

    </div>

  );
}

export default ExpenseChart;