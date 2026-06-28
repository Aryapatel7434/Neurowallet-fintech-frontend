import {
  FaArrowRight,
  FaArrowTrendDown,
  FaArrowTrendUp,
} from "react-icons/fa6";

function AIInsights({
  dashboardInsights,
  loading,
}) {

  if (loading) {
    return (
      <div className="insight-card">
        <div className="recommendation">
          <h4>Loading AI Insights...</h4>
        </div>
      </div>
    );
  }

  if (!dashboardInsights) {
    return (
      <div className="insight-card">
        <div className="recommendation">
          <h4>No Insight Available</h4>
        </div>
      </div>
    );
  }

  const {
    totalIncome,
    totalExpense,
    netCashFlow,
    transactionCount,
    topCategory,
    topCategoryAmount,
  } = dashboardInsights;

  /* =============================
      AI Recommendation
  ============================== */

  let recommendation = "";

  if (netCashFlow < 0) {

    switch (topCategory) {

      case "FOOD":
        recommendation =
          "Food expenses are your largest cost. Consider cooking at home more often to improve your monthly savings.";
        break;

      case "SHOPPING":
        recommendation =
          "Shopping is your highest expense. Setting a monthly shopping budget can significantly improve your cash flow.";
        break;

      case "TRAVEL":
        recommendation =
          "Travel expenses are dominating your spending. Planning trips in advance can help reduce costs.";
        break;

      case "BILLS":
        recommendation =
          "Bills account for most of your spending. Review subscriptions and recurring payments to reduce monthly expenses.";
        break;

      case "ENTERTAINMENT":
        recommendation =
          "Entertainment spending is relatively high. A small reduction could improve your monthly savings.";
        break;

      default:
        recommendation =
          `Your expenses are higher than your income. Try reducing your spending on ${topCategory}.`;
    }

  } else {

    recommendation =
      "Excellent financial discipline! Your income currently exceeds your expenses. Keep maintaining this healthy spending pattern.";

  }

  /* =============================
      Financial Risk
  ============================== */

  let risk = "Low Risk";

  if (totalExpense > totalIncome) {

    risk = "High Risk";

  } else if (totalExpense > totalIncome * 0.7) {

    risk = "Medium Risk";

  }

  return (

    <div className="insight-card">

      {/* ================= HEADER ================= */}

    <div className="ai-header">

    <div>

        <h3>🤖 AI Smart Insight</h3>

        <p>
            Personalized Financial Analysis
        </p>

    </div>

    <span className="ai-status">

        Live

    </span>

</div>
      {/* ================= INCOME ================= */}

      <div className="expense-row">

        <span>💰 Total Income</span>

        <strong>
          ₹{Number(totalIncome).toLocaleString("en-IN")}
        </strong>

        <span className="up">
          <FaArrowTrendUp />
        </span>

      </div>

      {/* ================= EXPENSE ================= */}

      <div className="expense-row">

        <span>💸 Total Expense</span>

      <strong
style={{
color:
netCashFlow>=0
?
"#22c55e"
:
"#ef4444"
}}
>

{netCashFlow>=0?"+":"-"}₹
{Math.abs(netCashFlow).toLocaleString()}

</strong>
        <span className="down">
          <FaArrowTrendDown />
        </span>

      </div>

      {/* ================= CATEGORY ================= */}

      <div className="expense-row">

        <span>🏷 Top Category</span>

        <strong>
          {topCategory}
        </strong>

        <span>

          ₹{Number(topCategoryAmount).toLocaleString("en-IN")}

        </span>

      </div>

      {/* ================= AI RECOMMENDATION ================= */}

      <div className="recommendation">

      <h4>🤖 AI Recommendation</h4>

<p className="recommendation-text">
    {recommendation}
</p>

<div className="recommendation-tip">
    💡 Suggested Action
</div>

<p className="tip-text">
    Review recurring subscriptions and reduce unnecessary monthly expenses.
</p>

        {/* ================= SUMMARY ================= */}

        <div className="summary-grid">

          <div className="summary-item">
    <span>💸 Spending</span>
    <strong>₹{Number(topCategoryAmount).toLocaleString()}</strong>
</div>

<div className="summary-item">
    <span>📈 Cash Flow</span>
    <strong>
        {netCashFlow >= 0 ? "+" : "-"}₹
        {Math.abs(netCashFlow).toLocaleString()}
    </strong>
</div>

<div className="summary-item">
    <span>🧾 Transactions</span>
    <strong>{transactionCount}</strong>
</div>

        </div>

        {/* ================= RISK ================= */}
      <div className="risk-section">

    <span>Financial Risk</span>

    <span
        className={`risk-badge ${
            risk === "High Risk"
                ? "high"
                : risk === "Medium Risk"
                ? "medium"
                : "low"
        }`}
    >
        {risk === "High Risk" && "🔴"}
        {risk === "Medium Risk" && "🟡"}
        {risk === "Low Risk" && "🟢"}

        {" "}
        {risk}

    </span>

</div>

      </div>

      {/* ================= BUTTON ================= */}

      <button className="analysis-btn">

       <button className="analysis-btn">

    View Complete Financial Analysis

    <FaArrowRight />

</button>

        <FaArrowRight />

      </button>

    </div>

  );

}

export default AIInsights;