import {
    FaArrowRight,
    FaRobot,
    FaShieldHalved,
    FaLightbulb,
} from "react-icons/fa6";

const formatCurrency = (value) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return "—";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
};

const getRisk = (income, expense) => {
    if (
        typeof income !== "number" ||
        !Number.isFinite(income) ||
        typeof expense !== "number" ||
        !Number.isFinite(expense)
    ) {
        return {
            label: "Not assessed",
            className: "risk-unknown",
            description: "Income and expense data is incomplete.",
        };
    }

    if (income <= 0) {
        return {
            label: expense > 0 ? "Needs attention" : "Limited data",
            className: expense > 0 ? "risk-high" : "risk-medium",
            description:
                "There is not enough positive income data to assess your expense ratio.",
        };
    }

    const ratio = expense / income;

    if (ratio >= 0.9) {
        return {
            label: "High",
            className: "risk-high",
            description:
                "Expenses are at least 90% of recorded income. Review recent spending.",
        };
    }

    if (ratio >= 0.7) {
        return {
            label: "Moderate",
            className: "risk-medium",
            description:
                "Expenses are a substantial share of income. Check your budget against your goals.",
        };
    }

    return {
        label: "Lower",
        className: "risk-low",
        description:
            "Recorded expenses are below 70% of recorded income. Continue reviewing your budget.",
    };
};

const getRecommendation = (insights) => {
    const income = insights.totalIncome;
    const expense = insights.totalExpense;

    const hasIncome =
        typeof income === "number" && Number.isFinite(income);

    const hasExpense =
        typeof expense === "number" && Number.isFinite(expense);

    const netCashFlow =
        typeof insights.netCashFlow === "number" &&
        Number.isFinite(insights.netCashFlow)
            ? insights.netCashFlow
            : hasIncome && hasExpense
              ? income - expense
              : null;

    if (netCashFlow === null) {
        return {
            tag: "Data check",
            title: "Complete your financial picture",
            description:
                "Income or expense information is missing. Check your recorded transactions.",
        };
    }

    if (netCashFlow < 0) {
        return {
            tag: "Cash flow",
            title: "Review spending against income",
            description:
                "Recorded expenses exceed income. Review recent transactions and identify costs you may be able to reduce.",
        };
    }

    if (netCashFlow === 0) {
        return {
            tag: "Budget planning",
            title: "Create room in your budget",
            description:
                "Recorded income and expenses are equal. Review recurring costs and consider a realistic savings target.",
        };
    }

    const category = String(
        insights.topCategory ?? ""
    ).trim().toUpperCase();

    const categoryAdvice = {
        BILLS:
            "Review recurring bills and subscriptions you no longer need.",
        FOOD:
            "Plan meals and review recent food spending.",
        SHOPPING:
            "Separate planned purchases from impulse spending.",
        TRAVEL:
            "Review travel costs and compare options for upcoming journeys.",
    };

    if (categoryAdvice[category]) {
        return {
            tag: "Spending review",
            title: `Review your ${category.toLowerCase()} spending`,
            description: categoryAdvice[category],
        };
    }

    return {
        tag: "Savings opportunity",
        title: "Build a consistent savings habit",
        description:
            "Your recorded income exceeds expenses. Consider setting a manageable savings goal and reviewing cash flow regularly.",
    };
};

function AssistantHeader() {
    return (
        <div className="nw-ai-assistant-header">
            <div className="nw-ai-assistant-icon">
                <FaRobot aria-hidden="true" />
            </div>

            <div className="nw-ai-assistant-heading">
                <h2 id="ai-insights-title">
                    AI Financial Assistant
                </h2>
                <p>Powered by your financial insights</p>
            </div>
        </div>
    );
}

function InsightLoading() {
    return (
        <aside
            className="ai-panel nw-ai-assistant"
            aria-live="polite"
            aria-busy="true"
        >
            <AssistantHeader />

            <div className="nw-ai-message">
                <span className="nw-ai-message-label">
                    <FaRobot aria-hidden="true" />
                    Financial summary
                </span>

                <p>
                    Loading the available financial data...
                </p>
            </div>
        </aside>
    );
}

function InsightEmpty() {
    return (
        <aside className="ai-panel nw-ai-assistant">
            <AssistantHeader />

            <div className="nw-ai-message">
                <span className="nw-ai-message-label">
                    Financial overview
                </span>

                <h3>Your insights will appear here</h3>

                <p>
                    Once your dashboard data is available, this panel
                    will show a financial summary and recommendations
                    based on your recorded activity.
                </p>
            </div>
        </aside>
    );
}

export default function AIInsights({
    dashboardInsights,
    loading = false,
}) {
    if (loading) {
        return <InsightLoading />;
    }

    if (!dashboardInsights) {
        return <InsightEmpty />;
    }

    const insights = dashboardInsights;
    const recommendation = getRecommendation(insights);

    const risk = getRisk(
        insights.totalIncome,
        insights.totalExpense
    );

    const transactionCount =
        typeof insights.transactionCount === "number" &&
        Number.isFinite(insights.transactionCount)
            ? insights.transactionCount
            : null;

    const netCashFlow =
        typeof insights.netCashFlow === "number" &&
        Number.isFinite(insights.netCashFlow)
            ? insights.netCashFlow
            : typeof insights.totalIncome === "number" &&
                Number.isFinite(insights.totalIncome) &&
                typeof insights.totalExpense === "number" &&
                Number.isFinite(insights.totalExpense)
              ? insights.totalIncome - insights.totalExpense
              : null;

    const assistantPrompts = [
        "How can I review my spending?",
        "Analyze my cash flow",
        "Help me plan a savings goal",
    ];

    const handlePrompt = (prompt) => {
        window.dispatchEvent(
            new CustomEvent("neurowallet:ai-prompt", {
                detail: { prompt },
            })
        );
    };

    return (
        <aside
            className="ai-panel nw-ai-assistant"
            aria-labelledby="ai-insights-title"
        >
            <AssistantHeader />

            <div className="nw-ai-message">
                <span className="nw-ai-message-label">
                    <FaRobot aria-hidden="true" />
                    Financial summary
                </span>

                <p>
                    {recommendation.description}
                </p>
            </div>

            <div className="nw-ai-recommendation">
                <div className="nw-ai-recommendation-top">
                    <span className="nw-ai-recommendation-tag">
                        <FaLightbulb aria-hidden="true" />
                        {recommendation.tag}
                    </span>

                    <span
                        className={`risk-badge ${risk.className}`}
                    >
                        {risk.label}
                    </span>
                </div>

                <h3>{recommendation.title}</h3>

                <p>{recommendation.description}</p>
            </div>

            <button
                type="button"
                className="nw-ai-primary-button"
                onClick={() =>
                    handlePrompt(
                        "Summarize my available financial insights"
                    )
                }
            >
                Review financial insights
                <FaArrowRight aria-hidden="true" />
            </button>

            <div className="nw-ai-prompt-list">
                {assistantPrompts.map((prompt) => (
                    <button
                        type="button"
                        className="nw-ai-prompt"
                        key={prompt}
                        onClick={() => handlePrompt(prompt)}
                    >
                        <FaArrowRight aria-hidden="true" />
                        <span>{prompt}</span>
                    </button>
                ))}
            </div>

            <div className="nw-ai-summary">
                <h3>Financial snapshot</h3>

                <div className="nw-ai-summary-grid">
                    <div className="nw-ai-summary-item">
                        <span>Income</span>
                        <strong>
                            {formatCurrency(insights.totalIncome)}
                        </strong>
                    </div>

                    <div className="nw-ai-summary-item">
                        <span>Expenses</span>
                        <strong>
                            {formatCurrency(insights.totalExpense)}
                        </strong>
                    </div>

                    <div className="nw-ai-summary-item">
                        <span>Net cash flow</span>
                        <strong>
                            {formatCurrency(netCashFlow)}
                        </strong>
                    </div>

                    <div className="nw-ai-summary-item">
                        <span>Transactions</span>
                        <strong>
                            {transactionCount === null
                                ? "—"
                                : transactionCount.toLocaleString(
                                      "en-IN"
                                  )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="nw-ai-risk-note">
                <div className="nw-ai-risk-heading">
                    <FaShieldHalved aria-hidden="true" />
                    <span>Expense-to-income check</span>
                </div>

                <p>{risk.description}</p>

                <p className="nw-ai-disclaimer">
                    This is a simple indicator based on available
                    totals, not a credit assessment, fraud detection
                    result, or personalized financial advice.
                </p>
            </div>
        </aside>
    );
}
