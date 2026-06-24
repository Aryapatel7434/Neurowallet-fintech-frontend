import "./Analytics.css";
import { FaArrowTrendUp } from "react-icons/fa6";

function IncomeChart({
  transactions = [],
}) {

  const incomeTransactions =
    transactions.filter(
      (t) => t.type === "CREDIT"
    );

  const totalIncome =
    incomeTransactions.reduce(
      (sum, t) =>
        sum + (t.amount || 0),
      0
    );

  return (

    <div className="analytics-card">

      <div className="analytics-header">

        <h3>
          Income Analytics
        </h3>

        <span className="analytics-badge income">
          CREDIT
        </span>

      </div>

      <div className="analytics-value">
        ₹{totalIncome.toLocaleString()}
      </div>

      <p className="analytics-subtitle">
        Total Incoming Money
      </p>

      <div className="analytics-footer">

        <FaArrowTrendUp />

        <span>
          {incomeTransactions.length}
          Transactions
        </span>

      </div>

    </div>

  );
}

export default IncomeChart;