import React, { useEffect, useState } from "react";
import {
    getAIInsights,
    getFinancialScore,
    getBudgetHealth,
    getGoalRecommendation,
} from "../../services/aiService";
import {
    getFinancialIntelligence,
} from "../../services/analyticsService";
import "./aiInsightsPage.css";

const formatINR = (value) => {
    if (value == null || value === "") return "Unavailable";

    const amount = Number(value);
    if (!Number.isFinite(amount)) return "Unavailable";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
};

const displayValue = (value) => {
    if (value == null || value === "") return "Unavailable";

    if (typeof value === "object") {
        return value.message ?? value.description ?? JSON.stringify(value);
    }

    return String(value);
};

function InfoCard({ title, children }) {
    return (
        <article className="ai-insights-card">
            <h2>{title}</h2>
            {children}
        </article>
    );
}

function AIInsightsPage() {
    const [data, setData] = useState({
        insights: null,
        score: null,
        budget: null,
        goals: null,
        intelligence: null,
    });

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        let active = true;

        async function loadData() {
            setLoading(true);
            setErrors([]);

            const results = await Promise.allSettled([
                getAIInsights(),
                getFinancialScore(),
                getBudgetHealth(),
                getGoalRecommendation(),
                getFinancialIntelligence(),
            ]);

            if (!active) return;

            const labels = [
                "AI insights",
                "Financial score",
                "Budget health",
                "Goal recommendations",
                "Financial intelligence",
            ];

            setData({
                insights:
                    results[0].status === "fulfilled"
                        ? results[0].value
                        : null,
                score:
                    results[1].status === "fulfilled"
                        ? results[1].value
                        : null,
                budget:
                    results[2].status === "fulfilled"
                        ? results[2].value
                        : null,
                goals:
                    results[3].status === "fulfilled"
                        ? results[3].value
                        : null,
                intelligence:
                    results[4].status === "fulfilled"
                        ? results[4].value
                        : null,
            });

            setErrors(
                results
                    .map((result, index) => ({
                        result,
                        label: labels[index],
                    }))
                    .filter(
                        ({ result }) =>
                            result.status === "rejected"
                    )
                    .map(({ label }) => label)
            );

            setLoading(false);
        }

        loadData();

        return () => {
            active = false;
        };
    }, []);

    const score = data.score ?? {};
    const budget = data.budget ?? {};
    const goals = data.goals ?? {};
    const intelligence = data.intelligence ?? {};

    const reportInsights = Array.isArray(intelligence.insights)
        ? intelligence.insights
        : [];

    const aiInsight =
        intelligence.aiInsight ?? data.insights ?? {};

    if (loading) {
        return (
            <main className="ai-insights-page">
                <header className="ai-insights-header">
                    <p className="ai-insights-eyebrow">
                        NEUROWALLET INTELLIGENCE
                    </p>
                    <h1>AI Insights</h1>
                    <p>Analyzing your available financial data...</p>
                </header>

                <div role="status" className="ai-insights-status">
                    Loading insights from your backend...
                </div>
            </main>
        );
    }

    return (
        <main className="ai-insights-page">
            <header className="ai-insights-header">
                <div>
                    <p className="ai-insights-eyebrow">
                        NEUROWALLET INTELLIGENCE
                    </p>
                    <h1>AI Insights</h1>
                    <p>
                        Explore financial health, budget signals,
                        and personalized insights derived by your
                        backend services.
                    </p>
                </div>

                <button
                    type="button"
                    className="ai-insights-refresh"
                    onClick={() => window.location.reload()}
                >
                    Refresh insights
                </button>
            </header>

            {errors.length > 0 && (
                <section className="ai-insights-error" role="alert">
                    <strong>Some sections are unavailable.</strong>
                    <p>
                        Failed to load: {errors.join(", ")}.
                        Available sections are still shown.
                    </p>
                </section>
            )}

            <section className="ai-insights-grid">
                <InfoCard title="Financial health score">
                    <p className="ai-insights-primary-value">
                        {score.score == null
                            ? displayValue(score.financialScore)
                            : displayValue(score.score)}
                    </p>
                    <p className="ai-insights-muted">
                        Rating: {displayValue(score.rating)}
                    </p>
                    <p className="ai-insights-muted">
                       Risk level: {displayValue(score.risk)}
                    </p>
                    <p>
                        {displayValue(score.remark)}
                    </p>
                </InfoCard>

                <InfoCard title="Budget health">
                    <div className="ai-insights-detail-row">
                        <span>Income</span>
                        <strong>{formatINR(budget.totalIncome)}</strong>
                    </div>
                    <div className="ai-insights-detail-row">
                        <span>Expenses</span>
                        <strong>{formatINR(budget.totalExpense)}</strong>
                    </div>
                  <div className="ai-insights-detail-row">
    <span>Remaining budget</span>
    <strong>{formatINR(budget.remainingBudget)}</strong>
</div>
                    <p>
                        {displayValue(
                            budget.healthStatus ??
                            budget.budgetHealth ??
                            budget.remark
                        )}
                    </p>
                </InfoCard>

                <InfoCard title="Goal recommendations">
                    <p>
                        {displayValue(
                            goals.recommendation ??
                            goals.message ??
                            goals.summary
                        )}
                    </p>

                    {goals.suggestedGoals && (
                        <ul className="ai-insights-list">
                            {(Array.isArray(goals.suggestedGoals)
                                ? goals.suggestedGoals
                                : [goals.suggestedGoals]
                            ).map((goal, index) => (
                                <li key={index}>
                                    {displayValue(goal)}
                                </li>
                            ))}
                        </ul>
                    )}
                </InfoCard>

                <InfoCard title="AI financial explanation">
                    <p>
                        {displayValue(
                            aiInsight.explanation ??
                            aiInsight.insight ??
                            aiInsight.summary ??
                            aiInsight.message
                        )}
                    </p>
                </InfoCard>
            </section>

            <section className="ai-insights-card ai-insights-report">
                <h2>Smart financial insights</h2>

                {reportInsights.length === 0 ? (
                    <p className="ai-insights-muted">
                        No smart insights were returned by the backend.
                    </p>
                ) : (
                    <div className="ai-insights-list-grid">
                        {reportInsights.map((item, index) => (
                            <article
                                className="ai-insights-item"
                                key={item.id ?? `${item.title ?? "insight"}-${index}`}
                            >
                                <h3>
                                    {displayValue(item.title ?? item.category)}
                                </h3>
                                <p>
                                    {displayValue(
                                        item.description ??
                                        item.message ??
                                        item.insight
                                    )}
                                </p>
                                {item.recommendation && (
                                    <p className="ai-insights-recommendation">
                                        {displayValue(item.recommendation)}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <p className="ai-insights-disclaimer">
                Insights depend on the data and analysis returned by
                NeuroWallet services. Review financial decisions carefully;
                automated insights are informational, not guarantees.
            </p>
        </main>
    );
}

export default AIInsightsPage;