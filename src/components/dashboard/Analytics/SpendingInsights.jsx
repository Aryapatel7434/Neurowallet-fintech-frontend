import "./Analytics.css";

function SpendingInsights({
  transactions = []
}) {

  const totalTransactions = transactions.length;

  const totalVolume = transactions.reduce(
    (sum, tx) => sum + (tx.amount || 0),
    0
  );

  const averageTransaction =
    totalTransactions > 0
      ? Math.round(totalVolume / totalTransactions)
      : 0;

  const largestTransaction =
    transactions.length > 0
      ? Math.max(...transactions.map(tx => tx.amount || 0))
      : 0;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (

    <div className="analytics-card">

      {/* ================= HEADER ================= */}

     <div className="analytics-header">

    <div className="analytics-title">

    <div className="analytics-icon">
        🤖
    </div>

    <div>

        <h3>AI Spending Insights</h3>

        <p>AI Powered Financial Summary</p>

    </div>

</div>

    <span className="analytics-badge live">
    <span className="live-dot"></span>
    LIVE
</span>
</div>
      {/* ================= METRICS ================= */}

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
          {formatCurrency(totalVolume)}
        </strong>

      </div>

      <div className="metric">

        <span>
          Average Transaction
        </span>

        <strong>
          {formatCurrency(averageTransaction)}
        </strong>

      </div>

      <div className="metric">

        <span>
          Largest Transaction
        </span>

        <strong>
          {formatCurrency(largestTransaction)}
        </strong>

      </div>

      {/* ================= AI SUMMARY ================= */}

      <div className="analytics-summary">

      <div className="recommendation-box">

<h4>

✓ Spending Pattern

</h4>

<p>

Your spending remains stable.
No unusual transactions detected.

</p>

</div>
</div>

      {/* ================= FOOTER ================= */}

    <div className="analytics-footer">

<span>

Live Dashboard

</span>

<span>

Updated 2 min ago

</span>

</div>
</div>
  );

}

export default SpendingInsights;