import {
  FaArrowTrendUp,
  FaShieldHeart
} from "react-icons/fa6";

function FinancialHealth({
  wallet,
  transactions = [],
}) {

  const score =
    wallet?.balance > 1000 ? 87 : 62;

  const progress = score;

  return (

        <div className="health-card">

    <div className="health-header">

        <div>

            <h3>Financial Health</h3>

            <p>Overall account wellness</p>

        </div>

        <div className="health-percent">

            87%

        </div>

    </div>

    <div className="progress-wrapper">

        <div className="progress-bar">

            <div className="progress-fill"></div>

        </div>

    </div>

    <div className="score-section">

        <h1>87</h1>

        <span>Excellent Score</span>

    </div>

    <div className="health-metrics">

        <div>

            <label>Trend</label>

            <strong>+5%</strong>

        </div>

        <div>

            <label>Expenses</label>

            <strong>Stable</strong>

        </div>

        <div>

            <label>Target</label>

            <strong>90</strong>

        </div>

    </div>

</div>

  );

}

export default FinancialHealth;