import "./Analytics.css";

function SpendingInsights({
  transactions = []
}) {

  const totalTransactions =
    transactions.length;

  const totalVolume =
    transactions.reduce(
      (sum, tx) =>
        sum + tx.amount,
      0
    );

  const averageTransaction =
    totalTransactions
      ? Math.round(
          totalVolume /
          totalTransactions
        )
      : 0;

  return (

    <div className="analytics-card">

      <div className="analytics-header">

        <h3>
          Spending Insights
        </h3>

        <span className="analytics-badge">
          AI
        </span>

      </div>

      <div className="metric">

        <span>
          Transactions
        </span>

        <strong>
          {totalTransactions}
        </strong>

      </div>

      <div className="metric">

        <span>
          Total Volume
        </span>

        <strong>
          ₹{totalVolume}
        </strong>

      </div>

      <div className="metric">

        <span>
          Average Transaction
        </span>

        <strong>
          ₹{averageTransaction}
        </strong>

      </div>

    </div>

  );
}

export default SpendingInsights;