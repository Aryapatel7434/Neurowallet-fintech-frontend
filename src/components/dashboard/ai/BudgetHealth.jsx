import { FaChartLine } from "react-icons/fa6";
function BudgetHealth({ wallet }) {

  const balance =
    wallet?.balance || 0;

  const score =
    balance > 5000
      ? 85
      : balance > 1000
      ? 65
      : 35;

  return (

    <div className="budget-card">

       <h2>
  <FaChartLine />
  Budget Health
</h2>

      <div className="budget-progress">

        <div
          className="budget-fill"
          style={{
            width: `${score}%`
          }}
        />

      </div>

      <h3>{score}%</h3>

      <p>

        {score >= 80
          ? "Excellent Financial Position"
          : score >= 60
          ? "Healthy Spending"
          : "Budget Needs Attention"}

      </p>

    </div>

  );
}

export default BudgetHealth;