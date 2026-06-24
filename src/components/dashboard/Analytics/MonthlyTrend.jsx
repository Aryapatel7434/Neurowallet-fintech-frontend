import "./Analytics.css";
import { FaChartLine } from "react-icons/fa6";

function MonthlyTrend({
  transactions = []
}) {

  const trend =
    transactions.length > 20
      ? "Growing"
      : "Stable";

  return (

    <div className="analytics-card">

      <div className="analytics-header">

        <h3>
          Monthly Trend
        </h3>

        <span className="analytics-badge trend">
          LIVE
        </span>

      </div>

      <div className="analytics-value">

        <FaChartLine />

      </div>

      <h2>
        {trend}
      </h2>

      <p className="analytics-subtitle">

        Based on transaction
        activity this month.

      </p>

    </div>

  );
}

export default MonthlyTrend;