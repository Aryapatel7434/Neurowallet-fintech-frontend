import "./AIFinancialAssistant.css";
import {
  FaRobot,
  FaPiggyBank,
  FaTriangleExclamation,
  FaChartLine,
  FaShieldHeart,
  FaCircleCheck
} from "react-icons/fa6";

function AIFinancialAssistant() {

  const confidence = 98;

  return (

    <div className="ai-advisor-card">

      {/* ================= HEADER ================= */}

      <div className="advisor-header">

        <div className="advisor-title">

          <div className="advisor-icon">

            <FaRobot />

          </div>

          <div>

            <h2>NeuroWallet AI Advisor</h2>

            <p>
              AI Powered Personal Financial Assistant
            </p>

          </div>

        </div>

        <span className="advisor-badge">

          <span className="live-dot"></span>

          LIVE

        </span>

      </div>

      {/* ================= AI CONFIDENCE ================= */}

      <div className="advisor-confidence">

        <div>

          <span className="confidence-label">

            AI Confidence

          </span>

          <h1>{confidence}%</h1>

        </div>

        <div className="confidence-status">

          Excellent

        </div>

      </div>

      {/* ================= SAVING ================= */}

      <div className="advisor-item positive">

        <div className="advisor-item-header">

          <h4>

            <FaPiggyBank />

            Saving Opportunity

          </h4>

          <span className="advisor-score">

            97%

          </span>

        </div>

        <p>

          You can save approximately
          <strong> ₹2,450 </strong>
          this month by reducing food
          delivery expenses.

        </p>

      </div>

      {/* ================= WARNING ================= */}

      <div className="advisor-item warning">

        <div className="advisor-item-header">

          <h4>

            <FaTriangleExclamation />

            Budget Alert

          </h4>

          <span className="advisor-score">

            91%

          </span>

        </div>

        <p>

          Shopping expenses are
          <strong> 22% </strong>
          higher than your monthly
          average.

        </p>

      </div>

      {/* ================= INVESTMENT ================= */}

      <div className="advisor-item success">

        <div className="advisor-item-header">

          <h4>

            <FaChartLine />

            Investment Suggestion

          </h4>

          <span className="advisor-score">

            95%

          </span>

        </div>

        <p>

          You currently have positive
          cash flow. Consider starting a
          monthly SIP investment.

        </p>

      </div>

      {/* ================= RISK ================= */}

      <div className="advisor-risk">

        <div>

          <FaShieldHeart />

          <span>

            Financial Risk

          </span>

        </div>

        <span className="risk-low">

          LOW

        </span>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="advisor-footer">

        <div>

          <FaCircleCheck />

          Updated Just Now

        </div>

        <span>

          Powered by NeuroWallet AI

        </span>

      </div>

    </div>

  );

}

export default AIFinancialAssistant;