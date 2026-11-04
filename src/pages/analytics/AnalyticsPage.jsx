
import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

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
    new Intl.NumberFormat("en-IN").format(
        Number(value ?? 0)
    );

const INITIAL_DATA = {
    dashboard: null,
    transactions: null,
    categories: [],
    spending: null,
};

function MetricCard({ label, value, description }) {
    return (
        <article className="analytics-metric">
            <p className="analytics-metric-label">
                {label}
            </p>

            <h2 className="analytics-metric-value">
                {value}
            </h2>

            <p className="analytics-metric-description">
                {description}
            </p>
        </article>
    );
}

function AnalyticsPage() {
    const [data, setData] = useState(INITIAL_DATA);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errors, setErrors] = useState([]);

    const [datePreset, setDatePreset] = useState("all");

    const [customFromDate, setCustomFromDate] =
        useState("");

    const [customToDate, setCustomToDate] =
        useState("");

    const [appliedFilters, setAppliedFilters] =
        useState({});

    const [filterError, setFilterError] =
        useState("");

    const [refreshKey, setRefreshKey] = useState(0);

    /**
     * Generate date filters for predefined periods.
     *
     * Dates use the browser's local calendar date.
     */
    const getPresetFilters = useCallback((preset) => {
        if (preset === "all") {
            return {};
        }

        const today = new Date();

        const toDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");

        const from = new Date(today);

        switch (preset) {
            case "7":
                from.setDate(from.getDate() - 6);
                break;

            case "30":
                from.setDate(from.getDate() - 29);
                break;

            case "90":
                from.setDate(from.getDate() - 89);
                break;

            default:
                return {};
        }

        const fromDate = [
            from.getFullYear(),
            String(from.getMonth() + 1).padStart(2, "0"),
            String(from.getDate()).padStart(2, "0"),
        ].join("-");

        return {
            fromDate,
            toDate,
        };
    }, []);

    /**
     * Load all analytics using one consistent date range.
     *
     * Each section is handled independently so one failed
     * endpoint does not hide the remaining analytics.
     */
    useEffect(() => {
        let active = true;

        const loadAnalytics = async () => {
            setLoading(true);
            setRefreshing(refreshKey > 0);
            setErrors([]);

            const requests = await Promise.allSettled([
                getDashboardAnalytics(appliedFilters),
                getTransactionAnalytics(appliedFilters),
                getCategorySpending(appliedFilters),
                getSpendingPattern(appliedFilters),
            ]);

            if (!active) {
                return;
            }

            const [
                dashboardResult,
                transactionResult,
                categoryResult,
                spendingResult,
            ] = requests;

            const nextData = {
                dashboard:
                    dashboardResult.status === "fulfilled"
                        ? dashboardResult.value
                        : null,

                transactions:
                    transactionResult.status === "fulfilled"
                        ? transactionResult.value
                        : null,

                categories:
                    categoryResult.status === "fulfilled" &&
                    Array.isArray(categoryResult.value)
                        ? categoryResult.value
                        : [],

                spending:
                    spendingResult.status === "fulfilled"
                        ? spendingResult.value
                        : null,
            };

            const resultLabels = [
                "Dashboard summary",
                "Transaction analytics",
                "Category spending",
                "Spending patterns",
            ];

            const failedSections = requests
                .map((result, index) => ({
                    result,
                    label: resultLabels[index],
                }))
                .filter(
                    ({ result }) =>
                        result.status === "rejected"
                )
                .map(({ label }) => label);

            setData(nextData);
            setErrors(failedSections);
            setLoading(false);
            setRefreshing(false);
        };

        loadAnalytics();

        return () => {
            active = false;
        };
    }, [appliedFilters, refreshKey]);

    /**
     * Apply predefined date filters.
     */
    const handlePresetChange = (preset) => {
        setDatePreset(preset);
        setFilterError("");

        if (preset === "custom") {
            return;
        }

        setAppliedFilters(getPresetFilters(preset));
    };

    /**
     * Validate and apply a custom date range.
     */
    const handleCustomDateApply = () => {
        setFilterError("");

        if (!customFromDate || !customToDate) {
            setFilterError(
                "Please select both start and end dates."
            );
            return;
        }

        if (customFromDate > customToDate) {
            setFilterError(
                "Start date cannot be after end date."
            );
            return;
        }

        setAppliedFilters({
            fromDate: customFromDate,
            toDate: customToDate,
        });

        setDatePreset("custom");
    };

    /**
     * Refresh analytics without reloading the application.
     */
    const handleRefresh = () => {
        setRefreshKey((previous) => previous + 1);
    };

    /**
     * Data references.
     */
    const dashboard = data.dashboard ?? {};
    const transactions = data.transactions ?? {};
    const spending = data.spending ?? {};

    /**
     * Financial metrics.
     *
     * Prefer transaction analytics because it uses the same
     * selected date range as the other analytics endpoints.
     */
    const income =
        transactions.totalIncome ??
        dashboard.totalIncome;

    const expense =
        transactions.totalExpense ??
        dashboard.totalExpense;

    const savings =
        transactions.savings ??
        dashboard.netCashFlow;

    const transactionCount =
        transactions.totalTransactions ??
        dashboard.transactionCount;

    const formatPeriod = () => {
        if (!appliedFilters.fromDate || !appliedFilters.toDate) {
            return "All-time financial activity";
        }

        return `${appliedFilters.fromDate} to ${appliedFilters.toDate}`;
    };

    /**
     * Loading state.
     */
    if (loading && !data.dashboard && !data.transactions) {
        return (
            <main className="analytics-page">
                <header className="analytics-header">
                    <div>
                        <p className="analytics-eyebrow">
                            FINANCIAL OVERVIEW
                        </p>

                        <h1>Analytics</h1>

                        <p>
                            Loading your financial analytics...
                        </p>
                    </div>
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
            {/* Page header */}
            <header className="analytics-header">
                <div>
                    <p className="analytics-eyebrow">
                        FINANCIAL OVERVIEW
                    </p>

                    <h1>Analytics</h1>

                    <p>
                        Understand your financial activity
                        through intelligent financial insights.
                    </p>
                </div>

                <button
                    className="analytics-refresh"
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    aria-label="Refresh analytics data"
                >
                    {refreshing
                        ? "Refreshing..."
                        : "Refresh data"}
                </button>
            </header>

            {/* Date filters */}
            <section
                className="analytics-section"
                aria-label="Analytics date filters"
            >
                <div className="analytics-section-heading">
                    <div>
                        <h2>Analytics period</h2>

                        <p>
                            Select a period to analyze your
                            financial activity.
                        </p>
                    </div>
                </div>

                <div className="analytics-filter-controls">
                    {[
                        { label: "All Time", value: "all" },
                        { label: "Last 7 Days", value: "7" },
                        { label: "Last 30 Days", value: "30" },
                        { label: "Last 90 Days", value: "90" },
                        { label: "Custom Range", value: "custom" },
                    ].map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={
                                datePreset === option.value
                                    ? "analytics-filter-active"
                                    : ""
                            }
                            onClick={() =>
                                handlePresetChange(option.value)
                            }
                            aria-pressed={
                                datePreset === option.value
                            }
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {datePreset === "custom" && (
                    <div className="analytics-custom-date">
                        <label>
                            Start date

                            <input
                                type="date"
                                value={customFromDate}
                                max={customToDate || undefined}
                                onChange={(event) =>
                                    setCustomFromDate(
                                        event.target.value
                                    )
                                }
                            />
                        </label>

                        <label>
                            End date

                            <input
                                type="date"
                                value={customToDate}
                                min={customFromDate || undefined}
                                onChange={(event) =>
                                    setCustomToDate(
                                        event.target.value
                                    )
                                }
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleCustomDateApply}
                        >
                            Apply range
                        </button>
                    </div>
                )}

                {filterError && (
                    <p
                        className="analytics-filter-error"
                        role="alert"
                    >
                        {filterError}
                    </p>
                )}

                <p className="analytics-filter-description">
                    Showing: {formatPeriod()}
                </p>
            </section>

            {/* Partial API errors */}
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
                        Other successfully loaded sections
                        remain available.
                    </p>

                    <button
                        type="button"
                        className="analytics-refresh"
                        onClick={handleRefresh}
                    >
                        Retry
                    </button>
                </section>
            )}

            {/* Financial summary */}
            <section className="analytics-section">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Financial summary</h2>

                        <p>
                            Financial aggregates for the selected period.
                        </p>
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
                        description="Backend-calculated net savings"
                    />

                    <MetricCard
                        label="Transactions"
                        value={
                            transactionCount == null
                                ? "Unavailable"
                                : formatNumber(transactionCount)
                        }
                        description="Total reported transactions"
                    />
                </div>
            </section>

            {/* Transaction performance */}
            <section className="analytics-section">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Transaction performance</h2>

                        <p>
                            Transaction success and failure metrics.
                        </p>
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
                        description="Average successful transaction"
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
                        description="Largest successful transaction"
                    />
                </div>
            </section>

            {/* Category and spending panels */}
            <section className="analytics-panels">
                <article className="analytics-panel">
                    <div className="analytics-section-heading">
                        <div>
                            <h2>Spending by category</h2>

                            <p>
                                Category-wise spending distribution.
                            </p>
                        </div>
                    </div>

                    {data.categories.length === 0 ? (
                        <p className="analytics-empty">
                            No category spending data is available
                            for this period.
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
                                            <span>
                                                {item.category}
                                            </span>

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

                            <p>
                                Behavioral metrics from your transactions.
                            </p>
                        </div>
                    </div>

                    <div className="analytics-pattern-list">
                        <div className="analytics-pattern-item">
                            <span>Total spending</span>

                            <strong>
                                {spending.totalSpending == null
                                    ? "Unavailable"
                                    : formatINR(
                                          spending.totalSpending
                                      )}
                            </strong>
                        </div>

                        <div className="analytics-pattern-item">
                            <span>Average spending</span>

                            <strong>
                                {spending.averageSpending == null
                                    ? "Unavailable"
                                    : formatINR(
                                          spending.averageSpending
                                      )}
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

            {/* Data transparency */}
            <p className="analytics-footnote">
                Analytics are calculated from authenticated
                backend transaction records using the selected
                date range. Missing values are not estimated
                or fabricated.
            </p>
        </main>
    );
}

export default AnalyticsPage;
