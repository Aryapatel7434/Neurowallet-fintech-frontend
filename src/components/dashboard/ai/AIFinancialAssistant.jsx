import "./AIFinancialAssistant.css";
import {
    FaRobot,
    FaPiggyBank,
    FaTriangleExclamation,
    FaChartLine,
    FaShieldHeart,
    FaCircleCheck
} from "react-icons/fa6";

function AIFinancialAssistant({
    insights,
    loading
}) {

    if (loading) {

        return (

            <div className="ai-advisor-card">

                <div className="advisor-header">

                    <div className="advisor-title">

                        <div className="advisor-icon">

                            <FaRobot />

                        </div>

                        <div>

                            <h2>

                                NeuroWallet AI Advisor

                            </h2>

                            <p>

                                AI Powered Personal Financial Assistant

                            </p>

                        </div>

                    </div>

                    <span className="advisor-badge">

                        Loading...

                    </span>

                </div>

                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        fontWeight: "600"
                    }}
                >
                    Generating AI Insights...
                </div>

            </div>

        );

    }

    const confidence =
        insights?.confidence ?? 0;

    const savingOpportunity =
        insights?.savingOpportunity ??
        "No saving opportunities available.";

    const budgetAlert =
        insights?.budgetAlert ??
        "No budget alerts.";

    const investmentSuggestion =
        insights?.investmentSuggestion ??
        "No investment suggestion available.";

    const financialRisk =
        insights?.financialRisk ??
        "Unknown";

    const confidenceStatus =
        confidence >= 90
            ? "Excellent"
            : confidence >= 75
            ? "Good"
            : confidence >= 60
            ? "Average"
            : "Needs Attention";

    const riskClass =
        financialRisk.toLowerCase() === "low"
            ? "risk-low"
            : financialRisk.toLowerCase() === "medium"
            ? "risk-medium"
            : "risk-high";

    return (

        <div className="ai-advisor-card">

            {/* ================= HEADER ================= */}

            <div className="advisor-header">

                <div className="advisor-title">

                    <div className="advisor-icon">

                        <FaRobot />

                    </div>

                    <div>

                        <h2>

                            NeuroWallet AI Advisor

                        </h2>

                        <p>

                            AI Powered Personal Financial Assistant

                        </p>

                    </div>

                </div>

                <span className="advisor-badge">

                    <span className="live-dot"></span>

                    LIVE AI

                </span>

            </div>

            {/* ================= AI CONFIDENCE ================= */}

            <div className="advisor-confidence">

                <div>

                    <span className="confidence-label">

                        AI Confidence

                    </span>

                    <h1>

                        {confidence}%

                    </h1>

                </div>

                <div className="confidence-status">

                    {confidenceStatus}

                </div>

            </div>

            {/* ================= SAVING ================= */}

            <div className="advisor-item positive">

                <div className="advisor-item-header">

                    <h4>

                        <FaPiggyBank />

                        Saving Opportunity

                    </h4>

                </div>

                <p>

                    {savingOpportunity}

                </p>

            </div>

            {/* ================= WARNING ================= */}

            <div className="advisor-item warning">

                <div className="advisor-item-header">

                    <h4>

                        <FaTriangleExclamation />

                        Budget Alert

                    </h4>

                </div>

                <p>

                    {budgetAlert}

                </p>

            </div>

            {/* ================= INVESTMENT ================= */}

            <div className="advisor-item success">

                <div className="advisor-item-header">

                    <h4>

                        <FaChartLine />

                        Investment Suggestion

                    </h4>

                </div>

                <p>

                    {investmentSuggestion}

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

                <span className={riskClass}>

                    {financialRisk}

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