import {
  FaWallet,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaPiggyBank,
} from "react-icons/fa6";

function FinancialOverview({
  wallet,
  dashboardInsights,
}) {
  const balance = wallet?.balance || 0;

  const totalIncome =
    dashboardInsights?.totalIncome || 0;

  const totalExpense =
    dashboardInsights?.totalExpense || 0;

  const netCashFlow =
    dashboardInsights?.netCashFlow || 0;

  // -------------------------
  // Dynamic Badge Logic
  // -------------------------

  let incomeBadge = "No Income";

  if (totalIncome > 0) {
    incomeBadge = "+ Income";
  }

  let expenseBadge = "Expense";

  if (totalExpense > totalIncome && totalIncome > 0) {
    expenseBadge = "High Spend";
  }

  if (totalExpense === 0) {
    expenseBadge = "No Expense";
  }

  let cashFlowBadge = "Healthy";

  if (netCashFlow < 0) {
    cashFlowBadge = "Warning";
  }

  if (netCashFlow < -10000) {
    cashFlowBadge = "Critical";
  }

  // -------------------------
  // Currency Format
  // -------------------------

 const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompactCurrency = (amount) => {
  if (Math.abs(amount) >= 100000) {
    return (
      "₹" +
      new Intl.NumberFormat("en-IN", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(amount)
    );
  }

  return formatCurrency(amount);
};
  // -------------------------
  // Monthly Performance
  // -------------------------

  let monthlyChange = 0;

  if (totalIncome > 0) {

    monthlyChange = (
      (netCashFlow / totalIncome) * 100
    ).toFixed(1);

  }

  return (

    <div className="financial-overview">

      {/* ================= BALANCE ================= */}

      <div className="overview-card balance-card">

        <div className="overview-top">

          <div className="overview-icon-wrapper balance-bg">
            <FaWallet className="overview-icon" />
          </div>

          <span className="status-badge live">
            LIVE
          </span>

        </div>

        <h4>Live Balance</h4>

        <h2>
          {formatCompactCurrency(balance)}
        </h2>

        <p className="overview-subtitle">
           {
balance > 0
    ? "Available Wallet Balance"
    : "Wallet balance is currently empty"
}
        </p>

      </div>

      {/* ================= INCOME ================= */}

      <div className="overview-card income-card">

        <div className="overview-top">

          <div className="overview-icon-wrapper income-bg">
            <FaArrowTrendUp className="overview-icon" />
          </div>

          <span className="status-badge success">
            {incomeBadge}
          </span>

        </div>

        <h4>Monthly Income</h4>

        <h2
          style={{
            color:
              totalIncome > 0
                ? "#22c55e"
                : "#ef4444",
          }}
        >
          {formatCompactCurrency(totalIncome)}
        </h2>

        <p className="overview-subtitle">

       {
totalIncome > 0
    ? "Money received this month"
    : "No income received this month"
}


        </p>

        {totalIncome > 0 && (

          <p
            className={
              monthlyChange >= 0
                ? "growth-positive"
                : "growth-negative"
            }
          >
            {monthlyChange >= 0 ? "▲" : "▼"}{" "}
            {Math.abs(monthlyChange)}%
          </p>

        )}

      </div>

      {/* ================= EXPENSE ================= */}

      <div className="overview-card expense-card">

        <div className="overview-top">

          <div className="overview-icon-wrapper expense-bg">
            <FaArrowTrendDown className="overview-icon" />
          </div>

          <span className="status-badge danger">
            {expenseBadge}
          </span>

        </div>

        <h4>Monthly Expense</h4>

        <h2>
          {formatCompactCurrency(totalExpense)}
         
        </h2>

        <p className="overview-subtitle">
         {
totalExpense > 0
    ? "Total outgoing money"
    : "No expense recorded"
}
        </p>

      </div>

      {/* ================= CASH FLOW ================= */}

      <div className="overview-card savings-card">

        <div className="overview-top">

          <div className="overview-icon-wrapper savings-bg">
            <FaPiggyBank className="overview-icon" />
          </div>

          <span
            className="status-badge"
            style={{
              background:
                cashFlowBadge === "Healthy"
                  ? "#14532d"
                  : cashFlowBadge === "Warning"
                  ? "#7c4d00"
                  : "#7f1d1d",

              color:
                cashFlowBadge === "Healthy"
                  ? "#4ade80"
                  : cashFlowBadge === "Warning"
                  ? "#facc15"
                  : "#f87171",
            }}
          >
            {cashFlowBadge}
          </span>

        </div>

        <h4>Net Cash Flow</h4>

        <h2
          style={{
            color:
              netCashFlow >= 0
                ? "#22c55e"
                : "#ef4444",
          }}
        >
          {formatCompactCurrency(netCashFlow)}
        </h2>

       <p className="overview-subtitle">
  {
    netCashFlow > 0
      ? "Positive cash flow"
      : netCashFlow === 0
      ? "Balanced cash flow"
      : "Expenses exceed income"
  }
</p>
      </div>

    </div>

  );
}

export default FinancialOverview;