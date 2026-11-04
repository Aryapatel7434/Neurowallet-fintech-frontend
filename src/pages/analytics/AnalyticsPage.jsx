
import React, { useCallback, useEffect, useState } from "react";

import {
    getDashboardAnalytics,
    getTransactionAnalytics,
    getCategorySpending,
    getSpendingPattern,
} from "../../services/analyticsService";

import "./analyticsPage.css";

// ============================================================
// FORMATTERS
// ============================================================

const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value ?? 0));

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getDateRange = (days) => {
    const today = new Date();
    const from = new Date(today);

    from.setDate(today.getDate() - (days - 1));

    return {
        fromDate: formatDate(from),
        toDate: formatDate(today),
    };
};

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({ label, value, description }) {
    return (
        <article className="analytics-metric">
            <p className="analytics-metric-label">{label}</p>

            <h2 className="analytics-metric-value">
                {value}
            </h2>

            <p className="analytics-metric-description">
                {description}
            </p>
        </article>
    );
}

// ============================================================
// ANALYTICS PAGE
// ============================================================

function AnalyticsPage() {
    const [data, setData] = useState({
        dashboard: null,
        transactions: null,
        categories: [],
        spending: null,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errors, setErrors] = useState([]);

    // Date filter state.
    const [selectedRange, setSelectedRange] = useState("ALL");

    const [customFromDate, setCustomFromDate] = useState("");
    const [customToDate, setCustomToDate] = useState("");

    const [dateError, setDateError] = useState("");

    // Applied dates are separate from the dates being edited.
    const [appliedFilters, setAppliedFilters] = useState({
        fromDate: "",
        toDate: "",
    });

    // Refresh trigger.
    const [refreshKey, setRefreshKey] = useState(0);

    // ========================================================
    // LOAD ANALYTICS
    // ========================================================

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        setRefreshing(true);
        setErrors([]);

        const filters = {
            ...(appliedFilters.fromDate && {
                fromDate: appliedFilters.fromDate,
            }),
            ...(appliedFilters.toDate && {
                toDate: appliedFilters.toDate,
            }),
        };

        const requests = await Promise.allSettled([
            // Dashboard endpoint currently returns all-time data.
            getDashboardAnalytics(),

            getTransactionAnalytics(filters),
            getCategorySpending(filters),
            getSpendingPattern(filters),
        ]);

        return requests;
    }, [appliedFilters]);

    useEffect(() => {
        let active = true;

        const execute = async () => {
            try {
                const requests = await loadAnalytics();

                if (!active) {
                    return;
                }

                const [
                    dashboard,
                    transactions,
                    categories,
                    spending,
                ] = requests;

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

                const labels = [
                    "Dashboard summary",
                    "Transaction analytics",
                    "Category spending",
                    "Spending patterns",
                ];

                const nextErrors = requests
                    .map((result, index) => ({
                        result,
                        label: labels[index],
                    }))
                    .filter(
                        ({ result }) =>
                            result.status === "rejected"
                    )
                    .map(({ label }) => label);

                setData(nextData);
                setErrors(nextErrors);
            } catch (error) {
                if (active) {
                    setErrors([
                        error?.message ||
                            "Unable to load analytics.",
                    ]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        };

        execute();

        return () => {
            active = false;
        };
    }, [loadAnalytics, refreshKey]);

    // ========================================================
    // DATE FILTER HANDLERS
    // ========================================================

    const handleRangeChange = (event) => {
        const range = event.target.value;

        setSelectedRange(range);
        setDateError("");

        if (range === "ALL") {
            setAppliedFilters({
                fromDate: "",
                toDate: "",
            });

            return;
        }

        if (range === "CUSTOM") {
            return;
        }

        const days = Number(range);

        if (!Number.isInteger(days) || days <= 0) {
            setDateError("Please select a valid date range.");
            return;
        }

        const dates = getDateRange(days);

        setCustomFromDate(dates.fromDate);
        setCustomToDate(dates.toDate);

        setAppliedFilters(dates);
    };

    const handleCustomDateApply = () => {
        setDateError("");

        if (!customFromDate || !customToDate) {
            setDateError(
                "Please select both a start date and an end date."
            );
            return;
        }

        if (customFromDate > customToDate) {
            setDateError(
                "Start date cannot be after end date."
            );
            return;
        }

        setAppliedFilters({
            fromDate: customFromDate,
            toDate: customToDate,
        });
    };

    const handleRefresh = () => {
        setRefreshKey((current) => current + 1);
    };

    // ========================================================
    // DERIVED DATA
    // ========================================================

    const dashboard = data.dashboard ?? {};
    const transactions = data.transactions ?? {};
    const spending = data.spending ?? {};

    const income =
        transactions.totalIncome ?? dashboard.totalIncome;

    const expense =
        transactions.totalExpense ?? dashboard.totalExpense;

    const savings =
        transactions.savings ?? dashboard.netCashFlow;

    const selectedDateDescription =
        appliedFilters.fromDate && appliedFilters.toDate
            ? `${appliedFilters.fromDate} to ${appliedFilters.toDate}`
            : appliedFilters.fromDate
                ? `From ${appliedFilters.fromDate}`
                : appliedFilters.toDate
                    ? `Until ${appliedFilters.toDate}`
                    : "All available time";

    // ========================================================
    // LOADING VIEW
    // ========================================================

    if (loading && !data.transactions && !data.dashboard) {
        return (
            <main className="analytics-page">
                <header className="analytics-header">
                    <div>
                        <p className="analytics-eyebrow">
                            FINANCIAL OVERVIEW
                        </p>

                        <h1>Analytics</h1>

                        <p>
                            Loading your financial data...
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

    // ========================================================
    // MAIN VIEW
    // ========================================================

    return (
        <main className="analytics-page">

            {/* PAGE HEADER */}

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
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    {refreshing ? "Refreshing..." : "Refresh data"}
                </button>
            </header>

            {/* DATE FILTER */}

            <section
                className="analytics-section"
                aria-label="Analytics date filters"
            >
                <div className="analytics-section-heading">
                    <div>
                        <h2>Analytics period</h2>

                        <p>
                            Filter transaction analytics by date.
                        </p>
                    </div>
                </div>

                <div className="analytics-filter-controls">
                    <label htmlFor="analytics-date-range">
                        Select period
                    </label>

                    <select
                        id="analytics-date-range"
                        value={selectedRange}
                        onChange={handleRangeChange}
                    >
                        <option value="ALL">All Time</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="CUSTOM">Custom Range</option>
                    </select>
                </div>

                {selectedRange === "CUSTOM" && (
                    <div className="analytics-custom-date">

                        <div>
                            <label htmlFor="analytics-from-date">
                                Start date
                            </label>

                            <input
                                id="analytics-from-date"
                                type="date"
                                value={customFromDate}
                                max={customToDate || undefined}
                                onChange={(event) =>
                                    setCustomFromDate(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor="analytics-to-date">
                                End date
                            </label>

                            <input
                                id="analytics-to-date"
                                type="date"
                                value={customToDate}
                                min={customFromDate || undefined}
                                onChange={(event) =>
                                    setCustomToDate(event.target.value)
                                }
                            />
                        </div>

                        <button
                            type="button"
                            className="analytics-refresh"
                            onClick={handleCustomDateApply}
                        >
                            Apply filter
                        </button>
                    </div>
                )}

                {dateError && (
                    <p className="analytics-filter-error" role="alert">
                        {dateError}
                    </p>
                )}

                <p className="analytics-filter-description">
                    Showing transaction analytics for:{" "}
                    <strong>{selectedDateDescription}</strong>
                </p>

                {refreshing && (
                    <p
                        className="analytics-filter-description"
                        role="status"
                        aria-live="polite"
                    >
                        Updating analytics...
                    </p>
                )}
            </section>

            {/* PARTIAL LOAD ERRORS */}

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

            {/* FINANCIAL SUMMARY */}

            <section className="analytics-section">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Financial summary</h2>

                        <p>
                            Aggregated figures returned by your backend
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

            {/* TRANSACTION PERFORMANCE */}

            <section className="analytics-section">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Transaction performance</h2>

                        <p>
                            Success and failure metrics from the backend
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

            {/* CATEGORY AND SPENDING PANELS */}

            <section className="analytics-panels">

                {/* CATEGORY SPENDING */}

                <article className="analytics-panel">
                    <div className="analytics-section-heading">
                        <div>
                            <h2>Spending by category</h2>

                            <p>
                                Category distribution from your backend
                            </p>
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

                {/* SPENDING PATTERNS */}

                <article className="analytics-panel">
                    <div className="analytics-section-heading">
                        <div>
                            <h2>Spending patterns</h2>

                            <p>
                                Behavioral metrics returned by the backend
                            </p>
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

            {/* FOOTNOTE */}

            <p className="analytics-footnote">
                Transaction metrics reflect the selected date range.
                Dashboard summary remains all-time because its API
                currently does not support date filtering. This page
                does not infer missing values or fabricate transaction
                history.
            </p>
        </main>
    );
}

export default AnalyticsPage;
