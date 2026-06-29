import "./Analytics.css";
import { FaChartLine } from "react-icons/fa6";

function MonthlyTrend({
  transactions = [],
  dashboardInsights
}) {

  const totalTransactions = transactions.length;

  const totalIncome =
    dashboardInsights?.totalIncome || 0;

  const totalExpense =
    dashboardInsights?.totalExpense || 0;

  const netCashFlow =
    dashboardInsights?.netCashFlow || 0;

  // ==========================
  // Trend Logic
  // ==========================

  let trend = "Stable";

  if (netCashFlow > 10000) {

    trend = "Growing";

  } else if (netCashFlow < 0) {

    trend = "Declining";

  }

  // ==========================
  // Activity Level
  // ==========================

  let activity = "Low";

  if (totalTransactions >= 10) {

    activity = "Moderate";

  }

  if (totalTransactions >= 25) {

    activity = "High";

  }
let trendProgress = 50;

if (trend === "Growing") {

    trendProgress = 90;

} else if (trend === "Stable") {

    trendProgress = 60;

} else {

    trendProgress = 25;

}
  // ==========================
  // Currency Formatter
  // ==========================

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

        <div>

          <h3>
            📈 Monthly Trend
          </h3>

          <p className="analytics-subtitle">
            Live Monthly Performance
          </p>

        </div>

        <span className="analytics-badge live">
    <span className="live-dot"></span>
    LIVE
</span>

      </div>

      {/* ================= ICON ================= */}

      <div className="analytics-value">

        <FaChartLine />

      </div>

      {/* ================= TREND ================= */}

      <h2
        style={{
          color:
            trend === "Growing"
              ? "#22c55e"
              : trend === "Declining"
              ? "#ef4444"
              : "#8b5cf6",
        }}
      >
        {trend}
      </h2>

      {/* ================= METRICS ================= */}

      <div className="metric">

        <span>Transactions</span>

        <strong>
          {totalTransactions}
        </strong>

      </div>

      <div className="metric">

        <span>Income</span>

        <strong>
          {formatCurrency(totalIncome)}
        </strong>

      </div>

      <div className="metric">

        <span>Expense</span>

        <strong>
          {formatCurrency(totalExpense)}
        </strong>

      </div>

      <div className="metric">

        <span>Activity</span>

        <strong>
          {activity}
        </strong>

      </div>
       
          <div className="trend-health">

    <span>
        Financial Health
    </span>

    <strong
        className={
            trend === "Growing"
                ? "health-good"
                : trend === "Stable"
                ? "health-medium"
                : "health-poor"
        }
    >
        {
            trend === "Growing"
                ? "Excellent"
                : trend === "Stable"
                ? "Good"
                : "Needs Attention"
        }
    </strong>

</div>

       <div className="trend-progress">

    <div
        className="trend-progress-fill"
        style={{
            width: `${trendProgress}%`
        }}
    ></div>

</div>
      {/* ================= SUMMARY ================= */}

      <div className="analytics-summary">

        <h4>

          ✓ Monthly Analysis

        </h4>

        <p>

          {trend === "Growing"
            ? "Your financial performance is improving this month."
            : trend === "Declining"
            ? "Expenses are exceeding income. Review your spending."
            : "Your transaction activity remains balanced this month."}

        </p>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="analytics-footer">

         <div className="analytics-footer">

    <span>
        Live Dashboard
    </span>

    <span>

        Updated just now

    </span>

</div>

      </div>

    </div>

  );

}

export default MonthlyTrend;