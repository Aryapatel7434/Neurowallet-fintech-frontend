
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaPiggyBank,
  FaTriangleExclamation,
  FaChartLine,
  FaShieldHeart,
  FaArrowRight,
  FaComments,
} from "react-icons/fa6";

import "./AIFinancialAssistant.css";

function getInsight(value, fallback) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return value.trim();
}

function AIFinancialAssistant({ insights, loading }) {
  const recommendations = [
    {
      key: "saving",
      title: "Saving Opportunity",
      description: getInsight(
        insights?.savingOpportunity,
        "No saving recommendation is available yet."
      ),
      icon: <FaPiggyBank />,
      type: "positive",
    },
    {
      key: "budget",
      title: "Budget Alert",
      description: getInsight(
        insights?.budgetAlert,
        "No budget alert is available."
      ),
      icon: <FaTriangleExclamation />,
      type: "warning",
    },
    {
      key: "investment",
      title: "Investment Suggestion",
      description: getInsight(
        insights?.investmentSuggestion,
        "No investment suggestion is available yet."
      ),
      icon: <FaChartLine />,
      type: "information",
    },
  ];

  const risk = getInsight(
    insights?.financialRisk,
    "Unavailable"
  );

  const riskClass =
    risk.toLowerCase() === "low"
      ? "nw-ai-risk--low"
      : risk.toLowerCase() === "medium"
        ? "nw-ai-risk--medium"
        : risk.toLowerCase() === "high"
          ? "nw-ai-risk--high"
          : "nw-ai-risk--unknown";

  return (
    <section
      className="nw-ai-advisor"
      aria-label="NeuroWallet AI Advisor"
    >
      {/* Header */}
      <header className="nw-ai-advisor__header">
        <div className="nw-ai-advisor__identity">
          <div className="nw-ai-advisor__icon">
            <FaRobot />
          </div>

          <div className="nw-ai-advisor__heading">
            <h2>Neuro AI Advisor</h2>
            <p>Your personal financial assistant</p>
          </div>
        </div>

        <span className="nw-ai-advisor__status">
          <span className="nw-ai-advisor__status-dot" />
          AI
        </span>
      </header>

      {/* Insights */}
      <div className="nw-ai-advisor__body">
        <div className="nw-ai-advisor__section-heading">
          <h3>Key Insights</h3>

          <Link
            to="/ai-insights"
            className="nw-ai-advisor__view-all"
          >
            View All <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <div
            className="nw-ai-advisor__loading"
            role="status"
            aria-live="polite"
          >
            <span className="nw-ai-advisor__spinner" />
            <span>Analyzing financial activity...</span>
          </div>
        ) : !insights ? (
          <div className="nw-ai-advisor__empty">
            <FaRobot />
            <p>AI insights are temporarily unavailable.</p>
          </div>
        ) : (
          <div className="nw-ai-advisor__insights">
            {recommendations.map((item) => (
              <article
                className={`nw-ai-insight nw-ai-insight--${item.type}`}
                key={item.key}
              >
                <span className="nw-ai-insight__icon">
                  {item.icon}
                </span>

                <div className="nw-ai-insight__content">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Financial Risk */}
        {!loading && insights && (
          <div className="nw-ai-advisor__risk">
            <span className="nw-ai-advisor__risk-label">
              <FaShieldHeart />
              Financial Risk
            </span>

            <span className={`nw-ai-risk ${riskClass}`}>
              {risk}
            </span>
          </div>
        )}

        {/* Full AI assistant navigation */}
        <Link
          to="/ai-insights"
          className="nw-ai-advisor__ask-button"
        >
          <FaComments />
          <span>Ask Neuro AI</span>
          <FaArrowRight className="nw-ai-advisor__ask-arrow" />
        </Link>
      </div>
    </section>
  );
}

export default AIFinancialAssistant;
