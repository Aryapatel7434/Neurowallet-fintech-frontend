import {
    FaArrowRight,
    FaArrowTrendDown,
    FaArrowTrendUp
} from "react-icons/fa6";

function AIInsights({
    dashboardInsights,
    loading
}) {

    if (loading) {
        return (
            <div className="ai-panel">
                <h3>Loading AI Insights...</h3>
            </div>
        );
    }

    if (!dashboardInsights) {
        return (
            <div className="ai-panel">
                <h3>No Insights Available</h3>
            </div>
        );
    }

    const {
        totalIncome,
        totalExpense,
        netCashFlow,
        transactionCount,
        topCategory,
        topCategoryAmount
    } = dashboardInsights;

    /* ==========================
        AI Recommendation
    =========================== */

    let recommendationTitle = "";
    let recommendationText = "";
    let recommendationPriority = "";

    if (netCashFlow < 0) {

        recommendationPriority = "High Priority";

        switch (topCategory) {

            case "BILLS":
                recommendationTitle = "Reduce Recurring Bills";
                recommendationText =
                    `Bills account for ₹${Number(topCategoryAmount).toLocaleString("en-IN")} of your spending. Review subscriptions and recurring payments to improve your monthly cash flow.`;
                break;

            case "FOOD":
                recommendationTitle = "Optimize Food Budget";
                recommendationText =
                    `Food is currently your highest expense. Weekly budgeting can significantly improve your savings.`;
                break;

            case "SHOPPING":
                recommendationTitle = "Control Shopping Expenses";
                recommendationText =
                    `Shopping is your largest spending category. Consider setting a monthly shopping budget.`;
                break;

            case "TRAVEL":
                recommendationTitle = "Reduce Travel Expenses";
                recommendationText =
                    `Travel expenses are impacting your cash flow. Advance planning can reduce unnecessary costs.`;
                break;

            default:
                recommendationTitle = "Reduce Monthly Spending";
                recommendationText =
                    `Your expenses currently exceed your income. Focus on reducing spending in ${topCategory}.`;
        }

    } else {

        recommendationPriority = "Healthy";

        recommendationTitle = "Excellent Financial Discipline";

        recommendationText =
            "Your income currently exceeds your expenses. Continue maintaining this healthy financial behaviour.";

    }

    /* ==========================
        Risk
    =========================== */

    let risk = "Low Risk";

    if (totalExpense > totalIncome) {

        risk = "High Risk";

    } else if (totalExpense > totalIncome * 0.7) {

        risk = "Medium Risk";

    }

    return (

        <div className="ai-panel">

            {/* ================= HEADER ================= */}

            <div className="ai-header">

                <div>

                    <h3>
                        🤖 AI Smart Insight
                    </h3>

                    <p>
                        Personalized Financial Analysis
                    </p>

                </div>

                <span className="ai-status">
                    Live
                </span>

            </div>

            <div className="ai-divider"></div>

            {/* ================= AI RECOMMENDATION ================= */}

            <div className="recommendation-section">

                <div className="recommendation-top">

                    <span className="recommendation-tag">

                        🤖 AI Recommendation

                    </span>

                    <span
                        className={`priority-badge ${
                            recommendationPriority === "Healthy"
                                ? "healthy"
                                : "high"
                        }`}
                    >
                        {recommendationPriority}
                    </span>

                </div>

                <h2>

                    {recommendationTitle}

                </h2>

                <p>

                    {recommendationText}

                </p>

            </div>

            <div className="ai-divider"></div>

            {/* ================= FINANCIAL SUMMARY ================= */}

            <div className="summary-grid">

                <div className="summary-item">

                    <span>

                        Top Category

                    </span>

                    <strong>

                        {topCategory}

                    </strong>

                </div>

                <div className="summary-item">

                    <span>

                        Category Spend

                    </span>

                    <strong>

                        ₹{Number(topCategoryAmount).toLocaleString("en-IN")}

                    </strong>

                </div>

                <div className="summary-item">

                    <span>

                        Cash Flow

                    </span>

                    <strong
                        style={{
                            color:
                                netCashFlow >= 0
                                    ? "#22c55e"
                                    : "#ef4444"
                        }}
                    >
                        {netCashFlow >= 0 ? "+" : "-"}₹
                        {Math.abs(netCashFlow).toLocaleString("en-IN")}
                    </strong>

                </div>

                <div className="summary-item">

                    <span>

                        Transactions

                    </span>

                    <strong>

                        {transactionCount}

                    </strong>

                </div>

            </div>

            <div className="ai-divider"></div>

            {/* ================= RISK ================= */}

            <div className="risk-section">

                <span>

                    Financial Risk

                </span>

                <span
                    className={`risk-badge ${
                        risk === "High Risk"
                            ? "high"
                            : risk === "Medium Risk"
                            ? "medium"
                            : "low"
                    }`}
                >

                    {risk}

                </span>

            </div>

            <div className="ai-divider"></div>

            {/* ================= CTA ================= */}

            <button className="analysis-btn">

                View Complete Financial Analysis

                <FaArrowRight />

            </button>

        </div>

    );

}

export default AIInsights;