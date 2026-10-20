import React, { useEffect, useState } from "react";
import {
    getDashboardAnalytics,
    getTransactionAnalytics,
    getCategorySpending,
    getSpendingPattern,
} from "../../services/analyticsService";
import "./analyticsPage.css";

const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value ?? 0));

function MetricCard({ label, value, description }) {
    return (
        <article className="analytics-metric">
            <p className="analytics-metric-label">{label}</p>
            <h2 className="analytics-metric-value">{value}</h2>
            <p className="analytics-metric-description">
                {description}
            </p>
        </article>
    );
}

function AnalyticsPage() {
    const [data, setData] = useState({
        dashboard: null,
        transactions: null,
        categories: [],
        spending: null,
    });

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        let active = true;

        const loadAnalytics = async () => {
            setLoading(true);
            setErrors([]);

            const requests = await Promise.allSettled([
                getDashboardAnalytics(),
                getTransactionAnalytics(),
                getCategorySpending(),
                getSpendingPattern(),
            ]);

            if (!active) return;

            const [dashboard, transactions, categories, spending] =
                requests;

            const nextData = {
                dashboard:
                    dashboard.status === "fulfilled"
                        ? dashboard.value
                        : null,

                transactions:
                    transactions.status === "fulfilled"
                        ? transactions.value
                        : null,

                categories:
                    categories.status === "fulfilled" &&
                    Array.isArray(categories.value)
                        ? categories.value
                        : [],

                spending:
                    spending.status === "fulfilled"
                        ? spending.value
                        : null,
            };

            const nextErrors = requests
                .map((result, index) => ({
                    result,
                    label: [
                        "Dashboard summary",
                        "Transaction analytics",
                        "Category spending",
                        "Spending patterns",
                    ][index],
                }))
                .filter(({ result }) => result.status === "rejected")
                .map(({ label }) => label);

            setData(nextData);
            setErrors(nextErrors);
            setLoading(false);
        };

        loadAnalytics();

        return () => {
            active = false;
        };
    }, []);

    const dashboard = data.dashboard ?? {};
    const transactions = data.transactions ?? {};
    const spending = data.spending ?? {};

    const income =
        dashboard.totalIncome ?? transactions.totalIncome;

    const expense =
        dashboard.totalExpense ?? transactions.totalExpense;

    const savings =
        transactions.savings ??
        dashboard.netCashFlow;

    if (loading) {
        return (
            <main className="analytics-page">
                <header className="analytics-header">
                    <p className="analytics-eyebrow">
                        FINANCIAL OVERVIEW
                    </p>
                    <h1>Analytics</h1>
                    <p>Loading your financial data...</p>
                </header>

                <div
                    className="analytics-loading"
                    role="status"
                    aria-live="polite"
                >
                    Loading analytics from NeuroWallet...
                </div>
            </main>
        );
    }

    return (
        <main className="analytics-page">
            <header className="analytics-header">
                <div>
                    <p className="analytics-eyebrow">
                        FINANCIAL OVERVIEW
                    </p>
                    <h1>Analytics</h1>
                    <p>
                        Understand your financial activity using
                        your available transaction data.
                    </p>
                </div>

                <button
                    className="analytics-refresh"
                    type="button"
                    onClick={() => window.location.reload()}
                >
                    Refresh data
                </button>
            </header>

            {errors.length > 0 && (
                <section
                    className="analytics-error"
                    role="alert"
                >
                    <strong>
                        Some analytics could not be loaded.
                    </strong>
                    <p>
                        Unavailable: {errors.join(", ")}.
                        Other successfully loaded sections remain
                        available.
                    </p>
                </section>
            )}

            <section className="analytics-section">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Financial summary</h2>
                        <p>Aggregated figures returned by your backend</p>
                    </div>
                </div>

                <div className="analytics-metrics-grid">
                    <MetricCard
                        label="Total income"
                        value={
                            income == null
                                ? "Unavailable"
                                : formatINR(income)
                        }
                        description="Reported income"
                    />

                    <MetricCard
                        label="Total expenses"
                        value={
                            expense == null
                                ? "Unavailable"
                                : formatINR(expense)
                        }
                        description="Reported expenses"
                    />

                    <MetricCard
                        label="Net savings"
                        value={
                            savings == null
                                ? "Unavailable"
                                : formatINR(savings)
                        }
                        description="Backend-calculated balance of income and expenses"
                    />

                    <MetricCard
                        label="Transactions"
                        value={
                            transactions.totalTransactions == null
                                ? dashboard.transactionCount == null
                                    ? "Unavailable"
                                    : formatNumber(
                                          dashboard.transactionCount
                                      )
                                : formatNumber(
                                      transactions.totalTransactions
                                  )
                        }
                        description="Total transactions reported"
                    />
                </div>
            </section>

            <section className="analytics-section">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Transaction performance</h2>
                        <p>Success and failure metrics from the backend</p>
                    </div>
                </div>

                <div className="analytics-metrics-grid">
                    <MetricCard
                        label="Successful"
                        value={
                            transactions.successfulTransactions == null
                                ? "Unavailable"
                                : formatNumber(
                                      transactions.successfulTransactions
                                  )
                        }
                        description="Successful transactions"
                    />

                    <MetricCard
                        label="Failed"
                        value={
                            transactions.failedTransactions == null
                                ? "Unavailable"
                                : formatNumber(
                                      transactions.failedTransactions
                                  )
                        }
                        description="Failed transactions"
                    />

                    <MetricCard
                        label="Average transaction"
                        value={
                            transactions.averageTransaction == null
                                ? "Unavailable"
                                : formatINR(
                                      transactions.averageTransaction
                                  )
                        }
                        description="Backend-reported average"
                    />

                    <MetricCard
                        label="Largest transaction"
                        value={
                            transactions.largestTransaction == null
                                ? "Unavailable"
                                : formatINR(
                                      transactions.largestTransaction
                                  )
                        }
                        description="Backend-reported largest amount"
                    />
                </div>
            </section>

            <section className="analytics-panels">
                <article className="analytics-panel">
                    <div className="analytics-section-heading">
                        <div>
                            <h2>Spending by category</h2>
                            <p>Category distribution from your backend</p>
                        </div>
                    </div>

                    {data.categories.length === 0 ? (
                        <p className="analytics-empty">
                            No category spending data is available.
                        </p>
                    ) : (
                        <div className="analytics-category-list">
                            {data.categories.map((item, index) => {
                                const percentage = Math.min(
                                    100,
                                    Math.max(
                                        0,
                                        Number(item.percentage ?? 0)
                                    )
                                );

                                return (
                                    <div
                                        className="analytics-category"
                                        key={`${item.category}-${index}`}
                                    >
                                        <div className="analytics-category-top">
                                            <span>{item.category}</span>
                                            <strong>
                                                {formatINR(item.amount)}
                                            </strong>
                                        </div>

                                        <div
                                            className="analytics-progress-track"
                                            role="progressbar"
                                            aria-label={`${item.category} spending`}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={percentage}
                                        >
                                            <div
                                                className="analytics-progress-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>

                                        <p className="analytics-category-percent">
                                            {percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </article>

                <article className="analytics-panel">
                    <div className="analytics-section-heading">
                        <div>
                            <h2>Spending patterns</h2>
                            <p>Behavioral metrics returned by the backend</p>
                        </div>
                    </div>

                    <div className="analytics-pattern-list">
                        <div className="analytics-pattern-item">
                            <span>Total spending</span>
                            <strong>
                                {spending.totalSpending == null
                                    ? "Unavailable"
                                    : formatINR(spending.totalSpending)}
                            </strong>
                        </div>

                        <div className="analytics-pattern-item">
                            <span>Average spending</span>
                            <strong>
                                {spending.averageSpending == null
                                    ? "Unavailable"
                                    : formatINR(spending.averageSpending)}
                            </strong>
                        </div>

                        <div className="analytics-pattern-item">
                            <span>Top category</span>
                            <strong>
                                {spending.topCategory || "Unavailable"}
                            </strong>
                        </div>

                        <div className="analytics-pattern-item">
                            <span>Top category share</span>
                            <strong>
                                {spending.topCategoryPercentage == null
                                    ? "Unavailable"
                                    : `${Number(
                                          spending.topCategoryPercentage
                                      ).toFixed(1)}%`}
                            </strong>
                        </div>

                        <div className="analytics-pattern-item">
                            <span>Active categories</span>
                            <strong>
                                {spending.activeCategories == null
                                    ? "Unavailable"
                                    : formatNumber(
                                          spending.activeCategories
                                      )}
                            </strong>
                        </div>

                        <div className="analytics-pattern-item">
                            <span>Spending concentration</span>
                            <strong>
                                {spending.spendingConcentration ||
                                    "Unavailable"}
                            </strong>
                        </div>
                    </div>
                </article>
            </section>

            <p className="analytics-footnote">
                Metrics reflect the backend's reported calculations.
                This page does not infer missing values or fabricate
                transaction history.
            </p>
        </main>
    );
}

export default AnalyticsPage;
