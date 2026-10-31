
import "./FinancialHealth.css";

import {
    FaShieldHeart,
    FaArrowTrendUp,
    FaTriangleExclamation,
    FaReceipt,
} from "react-icons/fa6";

const getHealthStatus = (score, rating) => {
    if (typeof rating === "string" && rating.trim()) return rating.trim();
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Needs Improvement";
};

const getStatusClass = (status = "") => {
    const value = status.toLowerCase();

    if (value.includes("excellent")) return "excellent";
    if (value.includes("good")) return "good";
    if (value.includes("average")) return "average";
    if (value.includes("unavailable")) return "unavailable";

    return "needs-improvement";
};

const getRiskClass = (risk = "") => {
    const value = String(risk).toLowerCase();

    if (value.includes("low")) return "low";
    if (value.includes("medium")) return "medium";
    if (value.includes("high")) return "high";

    return "unknown";
};

function FinancialHealth({
    transactions = [],
    financialScore,
    loading = false,
}) {
    const transactionCount = Array.isArray(transactions)
        ? transactions.length
        : 0;

    const rawScore = financialScore?.score;
    const parsedScore = Number(rawScore);

    const hasScore =
        rawScore !== null &&
        rawScore !== undefined &&
        rawScore !== "" &&
        Number.isFinite(parsedScore);

    const score = hasScore
        ? Math.min(100, Math.max(0, parsedScore))
        : null;

    const displayedScore = score == null
        ? "—"
        : Math.round(score);

    const status = score == null
        ? "Unavailable"
        : getHealthStatus(score, financialScore?.rating);

    const risk = financialScore?.risk;
    const hasRisk = typeof risk === "string" && risk.trim();

    const insight =
        typeof financialScore?.remark === "string" &&
        financialScore.remark.trim()
            ? financialScore.remark.trim()
            : score == null
                ? "Your financial health score is not available yet."
                : score >= 80
                    ? "Your financial position looks strong. Maintain your savings discipline."
                    : score >= 70
                        ? "You are building healthy financial habits. Keep improving consistency."
                        : score >= 50
                            ? "Review your spending and work towards stronger savings."
                            : "Focus on managing expenses and improving financial stability.";

    if (loading && score == null) {
        return (
            <section className="health-card" aria-busy="true">
                <header className="health-header">
                    <span className="health-icon"><FaShieldHeart /></span>
                    <div className="health-heading">
                        <h2>Financial Health</h2>
                        <p>Evaluating your financial position</p>
                    </div>
                </header>
                <div className="health-loading">
                    <span className="health-spinner" />
                    <span>Calculating financial score...</span>
                </div>
            </section>
        );
    }

    return (
        <section className="health-card">
            <header className="health-header">
                <span className="health-icon"><FaShieldHeart /></span>

                <div className="health-heading">
                    <h2>Financial Health</h2>
                    <p>Wallet and transaction health</p>
                </div>

                <span className={`health-badge health-badge--${getStatusClass(status)}`}>
                    {status}
                </span>
            </header>

            <div className="health-main">
                <div
                    className={`health-gauge ${score == null ? "is-empty" : ""}`}
                    style={{ "--health-value": `${score ?? 0}%` }}
                    role="progressbar"
                    aria-label="Financial health score"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={score ?? 0}
                    aria-valuetext={
                        score == null ? "Score unavailable" : `${displayedScore} out of 100`
                    }
                >
                    <div className="health-gauge-inner">
                        <strong>{displayedScore}</strong>
                        <span>/ 100</span>
                        <small>{status}</small>
                    </div>
                </div>

                <div className="health-details">
                    <div className="health-detail-row">
                        <span>Risk level</span>
                        <strong className={`risk-value risk-${getRiskClass(risk)}`}>
                            {hasRisk ? risk : "Unavailable"}
                        </strong>
                    </div>

                    <div className="health-detail-row">
                        <span>Activity loaded</span>
                        <strong>{transactionCount} records</strong>
                    </div>

                    <div className="health-detail-row">
                        <span>Score trend</span>
                        <strong className="health-neutral">
                            {score == null ? "Unavailable" : "Current score"}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="health-insight">
                <span className="health-insight-icon">
                    {score != null && score >= 70
                        ? <FaArrowTrendUp />
                        : <FaTriangleExclamation />}
                </span>

                <div>
                    <strong>Financial Insight</strong>
                    <p>{insight}</p>
                </div>
            </div>

            <footer className="health-footer">
                <FaReceipt />
                <span>
                    {hasScore
                        ? "Based on your backend financial score"
                        : "Financial score currently unavailable"}
                </span>
            </footer>
        </section>
    );
}

export default FinancialHealth;
