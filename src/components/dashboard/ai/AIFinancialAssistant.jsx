import {
  FaRobot,
  FaPiggyBank,
  FaTriangleExclamation,
  FaChartLine
} from "react-icons/fa6";
function AIFinancialAssistant() {
  return (
    <div className="ai-advisor-card">

      <div className="advisor-header">

        <h3>
          <FaRobot />
          NeuroWallet AI Advisor
        </h3>

        <span className="advisor-badge">
          LIVE
        </span>

      </div>

      <div className="advisor-item positive">

        <h4>
          <FaPiggyBank />
          Saving Opportunity
        </h4>

        <p>
          You can save approximately ₹2,450
          this month by reducing food delivery
          expenses.
        </p>

      </div>

      <div className="advisor-item warning">

        <h4>
          <FaTriangleExclamation />
          Budget Alert
        </h4>

        <p>
          Shopping expenses are 22% higher
          than your average.
        </p>

      </div>

      <div className="advisor-item success">

        <h4>
          <FaChartLine />
          Investment Suggestion
        </h4>

        <p>
          You have surplus cash flow.
          Consider SIP investment.
        </p>

      </div>

    </div>
  );
}

export default AIFinancialAssistant;