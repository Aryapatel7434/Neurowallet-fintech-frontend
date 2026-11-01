import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    FaRobot,
    FaArrowRight,
    FaPiggyBank,
    FaTriangleExclamation,
    FaChartLine,
    FaShieldHeart,
    FaArrowRotateRight,
} from "react-icons/fa6";

// =============================================
// SERVICES
// =============================================

import { getMyWallet } from "../../services/walletService";

import {
    getFilteredTransactionHistory,
} from "../../services/transactionService";

import {
    getDashboardInsights,
} from "../../services/dashboardService";

// =============================================
// STYLES
// =============================================

import "../../styles/dashboard.css";
import "../../styles/loading.css";

// =============================================
// ANALYTICS COMPONENTS
// =============================================

import IncomeExpenseComparison from "../../components/dashboard/Analytics/IncomeExpenseComparison";

import SpendingCategoryChart from "../../components/dashboard/Analytics/SpendingCategoryChart";

import CashFlowChart from "../../components/dashboard/Analytics/CashFlowChart";

import CashFlowInsights from "../../components/dashboard/Analytics/CashFlowInsights";

// =============================================
// AI COMPONENTS
// =============================================

import BudgetHealth from "../../components/dashboard/ai/BudgetHealth";

import SmartGoals from "../../components/dashboard/ai/SmartGoals";

// =============================================
// ACTIVITY
// =============================================

import TransactionTable from "../../components/dashboard/activity/TransactionTable";

// =============================================
// FINANCIAL COMPONENTS
// =============================================

import FinancialOverview from "../../components/dashboard/overview/FinancialOverview";

import FinancialHealth from "../../components/dashboard/health/FinancialHealth";

// =============================================
// LAYOUT
// =============================================

import DashboardHero from "../../components/dashboard/layout/DashboardHero";

import DashboardSkeleton from "../../components/dashboard/common/DashboardSkeleton";

import TransactionRiskMonitor from "../../components/dashboard/security/TransactionRiskMonitor";

// =============================================
// AI HOOK
// =============================================

import useAI from "../../hooks/useAI";

// =============================================
// DATE FILTER HELPERS
// =============================================

const formatLocalDate = (date) => {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// =============================================
// GET DASHBOARD DATE RANGE
// =============================================

const getDashboardDateRange = (period) => {

    const today = new Date();

    const toDate = formatLocalDate(today);

    const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    switch (period) {

        case "Today":

            return {
                fromDate: toDate,
                toDate,
            };

        case "This Week": {

            const day = start.getDay();

            const daysSinceMonday = (day + 6) % 7;

            start.setDate(
                start.getDate() - daysSinceMonday
            );

            return {
                fromDate: formatLocalDate(start),
                toDate,
            };
        }

        case "This Month":

            start.setDate(1);

            return {
                fromDate: formatLocalDate(start),
                toDate,
            };

        case "This Year":

            start.setMonth(0, 1);

            return {
                fromDate: formatLocalDate(start),
                toDate,
            };

        case "All Time":

        default:

            return {
                fromDate: null,
                toDate: null,
            };
    }
};

// =============================================
// DASHBOARD PAGE
// =============================================

function DashboardPage() {

    // =========================================
    // DASHBOARD STATE
    // =========================================

    const [wallet, setWallet] = useState(null);

    const [transactions, setTransactions] = useState([]);

    const [dashboardInsights, setDashboardInsights] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [partialError, setPartialError] = useState("");

    // =========================================
    // GLOBAL FILTER STATE
    // =========================================

    const [dashboardPeriod, setDashboardPeriod] = useState("Today");

    const [dashboardSearch, setDashboardSearch] = useState("");

    // Prevent older API responses from replacing newer results.
    const requestSequence = useRef(0);

    // =========================================
    // AI DATA
    // =========================================

    const {
        insights,
        financialScore,
        budgetHealth,
        goalRecommendation,
        loading: aiLoading,
    } = useAI();

    // =========================================
    // FETCH DASHBOARD DATA
    // =========================================

    const fetchDashboardData = useCallback(async () => {

        const requestId = ++requestSequence.current;

        setLoading(true);

        setError("");

        setPartialError("");

        const {
            fromDate,
            toDate,
        } = getDashboardDateRange(dashboardPeriod);

        try {

            // =================================
            // TRANSACTION FILTER PARAMETERS
            // =================================

            const transactionFilters = {

                page: 0,

                size: 100,

                keyword: dashboardSearch || undefined,

                fromDate: fromDate || undefined,

                toDate: toDate || undefined,

                sortBy: "timestamp",

                direction: "DESC",

            };

            // =================================
            // PARALLEL API REQUESTS
            // =================================

            const results = await Promise.allSettled([

                getMyWallet(),

                getFilteredTransactionHistory(
                    transactionFilters
                ),

                getDashboardInsights({
                    fromDate,
                    toDate,
                }),

            ]);

            // =================================
            // IGNORE STALE RESPONSES
            // =================================

            if (
                requestId !== requestSequence.current
            ) {
                return;
            }

            const [
                walletResult,
                transactionsResult,
                insightsResult,
            ] = results;

            // =================================
            // WALLET RESPONSE
            // =================================

            if (
                walletResult.status === "fulfilled"
            ) {

                setWallet(walletResult.value);

            } else {

                console.error(
                    "Wallet API failed:",
                    walletResult.reason
                );

            }

            // =================================
            // TRANSACTION RESPONSE
            // =================================

            if (
                transactionsResult.status === "fulfilled"
            ) {

                const transactionData =
                    transactionsResult.value;

                const transactionList = Array.isArray(
                    transactionData?.content
                )
                    ? transactionData.content
                    : Array.isArray(transactionData)
                        ? transactionData
                        : [];

                setTransactions(transactionList);

            } else {

                console.error(
                    "Filtered transaction API failed:",
                    transactionsResult.reason
                );

            }

            // =================================
            // DASHBOARD INSIGHTS RESPONSE
            // =================================

            if (
                insightsResult.status === "fulfilled"
            ) {

                setDashboardInsights(
                    insightsResult.value
                );

            } else {

                console.error(
                    "Dashboard insights API failed:",
                    insightsResult.reason
                );

            }

            // =================================
            // API FAILURE HANDLING
            // =================================

            const failedResults = results.filter(
                (result) =>
                    result.status === "rejected"
            );

            if (
                failedResults.length === results.length
            ) {

                setError(
                    "Unable to load dashboard data. Please check your connection and try again."
                );

            } else if (
                failedResults.length > 0
            ) {

                setPartialError(
                    "Some dashboard information could not be loaded. Available information is still displayed."
                );

            }

            // =================================
            // CLEAR REFRESH FLAG
            // =================================

            try {

                sessionStorage.removeItem(
                    "dashboardRefresh"
                );

            } catch (storageError) {

                console.warn(
                    "Could not clear dashboard refresh flag:",
                    storageError
                );

            }

        } catch (err) {

            if (
                requestId !== requestSequence.current
            ) {
                return;
            }

            console.error(
                "Unexpected dashboard loading error:",
                err
            );

            setError(
                "An unexpected error occurred while loading the dashboard."
            );

        } finally {

            if (
                requestId === requestSequence.current
            ) {

                setLoading(false);

            }

        }

    }, [
        dashboardPeriod,
        dashboardSearch,
    ]);

    // =========================================
    // GLOBAL NAVBAR EVENT LISTENERS
    // =========================================

    useEffect(() => {

        // =================================
        // GLOBAL SEARCH EVENT
        // =================================

        const handleDashboardSearch = (event) => {

            setDashboardSearch(
                String(
                    event.detail?.query ?? ""
                ).trim()
            );

        };

        // =================================
        // PERIOD CHANGE EVENT
        // =================================

        const handleDashboardPeriodChange = (event) => {

            const nextPeriod = String(
                event.detail?.period ?? "Today"
            );

            const allowedPeriods = [

                "Today",

                "This Week",

                "This Month",

                "This Year",

                "All Time",

            ];

            setDashboardPeriod(

                allowedPeriods.includes(nextPeriod)
                    ? nextPeriod
                    : "Today"

            );

        };

        // =================================
        // REGISTER EVENTS
        // =================================

        window.addEventListener(
            "neurowallet:dashboard-search",
            handleDashboardSearch
        );

        window.addEventListener(
            "neurowallet:dashboard-period-change",
            handleDashboardPeriodChange
        );

        // =================================
        // CLEANUP EVENTS
        // =================================

        return () => {

            window.removeEventListener(
                "neurowallet:dashboard-search",
                handleDashboardSearch
            );

            window.removeEventListener(
                "neurowallet:dashboard-period-change",
                handleDashboardPeriodChange
            );

        };

    }, []);

    // =========================================
    // INITIAL LOAD + FILTER REFRESH
    // =========================================

    useEffect(() => {

        fetchDashboardData();

        return () => {

            requestSequence.current += 1;

        };

    }, [fetchDashboardData]);

    // =========================================
    // TRANSACTION ACTIVITY SUMMARY
    // =========================================

    const activitySummary = useMemo(() => {

        const summary = {

            total: transactions.length,

            successful: 0,

            pending: 0,

            failed: 0,

        };

        transactions.forEach((transaction) => {

            const status = String(
                transaction?.status || ""
            ).toUpperCase();

            if (status === "SUCCESS") {

                summary.successful += 1;

            } else if (status === "PENDING") {

                summary.pending += 1;

            } else if (status === "FAILED") {

                summary.failed += 1;

            }

        });

        return summary;

    }, [transactions]);

    // =========================================
    // LOADING STATE
    // =========================================

    if (loading) {

        return <DashboardSkeleton />;

    }

    // =========================================
    // ERROR STATE
    // =========================================

    if (error) {

        return (

            <section
                className="nw-dashboard-error"
                role="alert"
            >

                <div className="nw-dashboard-error-content">

                    <h2>Dashboard Unavailable</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        className="nw-dashboard-retry-btn"
                        onClick={fetchDashboardData}
                        disabled={loading}
                    >

                        <FaArrowRotateRight
                            aria-hidden="true"
                        />

                        Try Again

                    </button>

                </div>

            </section>

        );

    }

    // =========================================
    // AI INSIGHTS
    // =========================================

    const savingOpportunity =

        insights?.savingOpportunity ||

        "No saving recommendation is available right now.";

    const budgetAlert =

        insights?.budgetAlert ||

        "No budget alert is available right now.";

    const investmentSuggestion =

        insights?.investmentSuggestion || "";

    const financialRisk =

        insights?.financialRisk || "";

    const confidence = Number(
        insights?.confidence
    );

    const hasConfidence =

        insights?.confidence !== null &&

        insights?.confidence !== undefined &&

        insights?.confidence !== "" &&

        Number.isFinite(confidence);

    const confidencePercentage = hasConfidence

        ? Math.max(
            0,
            Math.min(100, confidence)
        )

        : 0;

    // =========================================
    // DASHBOARD UI
    // =========================================

    return (

        <main className="nw-dashboard-content-area">

            {/* =================================
                ACTIVE FILTER CONTEXT
            ================================= */}

            {(dashboardSearch || dashboardPeriod !== "Today") && (

                <div
                    className="nw-dashboard-filter-context"
                    role="status"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                        color: "#a9b9d0",
                        fontSize: "0.875rem",
                    }}
                >

                    <span>

                        Showing {dashboardPeriod.toLowerCase()} data

                        {dashboardSearch
                            ? ` matching “${dashboardSearch}”`
                            : ""
                        }

                    </span>

                    <button
                        type="button"
                        onClick={() => {

                            setDashboardSearch("");

                            window.dispatchEvent(

                                new CustomEvent(
                                    "neurowallet:dashboard-search",
                                    {
                                        detail: {
                                            query: "",
                                        },
                                    }
                                )

                            );

                        }}
                        style={{
                            border: 0,
                            background: "transparent",
                            color: "#8db8ff",
                            cursor: "pointer",
                        }}
                    >

                        Clear search

                    </button>

                </div>

            )}

            {/* =================================
                ROW 1 — DASHBOARD HERO
            ================================= */}

            <section className="nw-dashboard-hero-section">

                <DashboardHero
                    wallet={wallet}
                    dashboardInsights={dashboardInsights}
                />

            </section>

            {/* =================================
                ROW 2 — FINANCIAL OVERVIEW
            ================================= */}

            <section className="nw-dashboard-overview-section">

                <FinancialOverview
                    wallet={wallet}
                    dashboardInsights={dashboardInsights}
                />

            </section>

            {/* =================================
                ROW 3 — MAIN DASHBOARD GRID
            ================================= */}

            <section className="nw-dashboard-main-grid">

                {/* LEFT — MAIN DASHBOARD */}

                <div className="nw-dashboard-main-left">

                    {/* ANALYTICS */}

                    <section className="nw-dashboard-analytics-grid">

                        <article className="nw-dashboard-panel nw-dashboard-income-panel">

                            <IncomeExpenseComparison
                                transactions={transactions}
                            />

                        </article>

                        <article className="nw-dashboard-panel nw-dashboard-category-panel">

                            <SpendingCategoryChart
                                transactions={transactions}
                            />

                        </article>

                    </section>

                    {/* FINANCIAL HEALTH / BUDGET / GOALS */}

                    <section className="nw-dashboard-financial-grid">

                        <article className="nw-dashboard-panel nw-dashboard-financial-card">

                            <FinancialHealth
                                transactions={transactions}
                                financialScore={financialScore}
                                loading={aiLoading}
                            />

                        </article>

                        <article className="nw-dashboard-panel nw-dashboard-financial-card">

                            <BudgetHealth
                                budgetHealth={budgetHealth}
                                loading={aiLoading}
                            />

                        </article>

                        <article className="nw-dashboard-panel nw-dashboard-financial-card">

                            <SmartGoals
                                goalRecommendation={goalRecommendation}
                                loading={aiLoading}
                            />

                        </article>

                    </section>

                    {/* RECENT TRANSACTIONS / CASH FLOW */}

                    <section className="nw-dashboard-activity-grid">

                        {/* RECENT TRANSACTIONS */}

                        <article className="nw-dashboard-panel nw-dashboard-transactions-panel">

                            <TransactionTable
                                transactions={transactions}
                            />

                        </article>

                        {/* CASH FLOW + CASH FLOW INSIGHTS */}

                        <article className="nw-dashboard-panel nw-dashboard-cashflow-panel">

                            <CashFlowChart
                                transactions={transactions}
                            />

                            <CashFlowInsights
                                transactions={transactions}
                            />

                        </article>

                    </section>

                </div>

                {/* =================================
                    RIGHT — AI SIDEBAR
                ================================= */}

                <aside className="nw-dashboard-ai-sidebar">

                    {/* NEUROWALLET AI ADVISOR */}

                    <section
                        className="nw-dashboard-panel nw-dashboard-ai-panel"
                        aria-label="NeuroWallet AI financial snapshot"
                    >

                        <header className="nw-dashboard-sidebar-heading">

                            <div className="nw-dashboard-sidebar-title">

                                <span className="nw-dashboard-sidebar-icon nw-sidebar-icon-ai">

                                    <FaRobot aria-hidden="true" />

                                </span>

                                <div>

                                    <h2>Neuro AI Advisor</h2>

                                    <p>Personal financial snapshot</p>

                                </div>

                            </div>

                            <span className="nw-dashboard-ai-status">

                                <span className="nw-dashboard-status-dot" />

                                {aiLoading ? "Updating" : "AI"}

                            </span>

                        </header>

                        <div className="nw-dashboard-ai-content">

                            {/* AI CONFIDENCE */}

                            {hasConfidence && (

                                <div className="nw-dashboard-confidence-row">

                                    <div>

                                        <span className="nw-dashboard-mini-label">
                                            AI confidence
                                        </span>

                                        <strong>
                                            {confidencePercentage.toFixed(0)}%
                                        </strong>

                                    </div>

                                    <span className="nw-dashboard-confidence-track">

                                        <span
                                            style={{
                                                width: `${confidencePercentage}%`,
                                            }}
                                        />

                                    </span>

                                </div>

                            )}

                            {/* SAVING OPPORTUNITY */}

                            <article className="nw-dashboard-insight-item nw-insight-positive">

                                <span className="nw-dashboard-insight-icon">

                                    <FaPiggyBank aria-hidden="true" />

                                </span>

                                <div className="nw-dashboard-insight-copy">

                                    <h3>Saving Opportunity</h3>

                                    <p>{savingOpportunity}</p>

                                </div>

                            </article>

                            {/* BUDGET ALERT */}

                            <article className="nw-dashboard-insight-item nw-insight-warning">

                                <span className="nw-dashboard-insight-icon">

                                    <FaTriangleExclamation aria-hidden="true" />

                                </span>

                                <div className="nw-dashboard-insight-copy">

                                    <h3>Budget Alert</h3>

                                    <p>{budgetAlert}</p>

                                </div>

                            </article>

                            {/* INVESTMENT INSIGHT */}

                            {investmentSuggestion && (

                                <article className="nw-dashboard-insight-item nw-insight-investment">

                                    <span className="nw-dashboard-insight-icon">

                                        <FaChartLine aria-hidden="true" />

                                    </span>

                                    <div className="nw-dashboard-insight-copy">

                                        <h3>Investment Insight</h3>

                                        <p>{investmentSuggestion}</p>

                                    </div>

                                </article>

                            )}

                            {/* FINANCIAL RISK */}

                            {financialRisk && (

                                <div className="nw-dashboard-risk-row">

                                    <span>

                                        <FaShieldHeart aria-hidden="true" />

                                        Financial risk

                                    </span>

                                    <strong>{financialRisk}</strong>

                                </div>

                            )}

                            {/* OPEN FULL AI ASSISTANT */}

                            <Link
                                to="/ai-insights"
                                className="nw-dashboard-ai-action"
                            >

                                <FaRobot aria-hidden="true" />

                                Ask Neuro AI

                                <FaArrowRight aria-hidden="true" />

                            </Link>

                        </div>

                    </section>

                    {/* PAYMENT PERFORMANCE */}

                    <section
                        className="nw-payment-performance"
                        aria-label="Payment performance monitor"
                    >

                        <div className="nw-payment-performance-header">

                            <div>

                                <span className="nw-payment-performance-eyebrow">
                                    PAYMENT INTELLIGENCE
                                </span>

                                <h3>Payment Performance</h3>

                                <p>Transaction reliability overview</p>

                            </div>

                            <span className="nw-payment-performance-icon">

                                <FaShieldHeart aria-hidden="true" />

                            </span>

                        </div>

                        <div className="nw-payment-success-overview">

                            <div>

                                <span className="nw-payment-success-label">
                                    Payment success rate
                                </span>

                                <strong>

                                    {activitySummary.total > 0

                                        ? `${(
                                            (activitySummary.successful /
                                                activitySummary.total) * 100
                                        ).toFixed(1)}%`

                                        : "—"
                                    }

                                </strong>

                            </div>

                            <span className="nw-payment-success-caption">

                                {activitySummary.successful} successful out of{" "}

                                {activitySummary.total} loaded transactions

                            </span>

                        </div>

                        <div
                            className="nw-payment-progress-track"
                            role="progressbar"
                            aria-label="Payment success rate"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={

                                activitySummary.total > 0

                                    ? Number((
                                        activitySummary.successful /
                                        activitySummary.total * 100
                                    ).toFixed(1))

                                    : 0

                            }
                        >

                            <span
                                className="nw-payment-progress-success"
                                style={{

                                    width: activitySummary.total > 0

                                        ? `${(
                                            (activitySummary.successful /
                                                activitySummary.total) * 100
                                        )}%`

                                        : "0%",

                                }}
                            />

                        </div>

                        <div className="nw-payment-performance-stats">

                            <div className="nw-payment-performance-stat">

                                <span className="nw-payment-stat-dot success" />

                                <div>

                                    <strong>
                                        {activitySummary.successful}
                                    </strong>

                                    <span>Successful</span>

                                </div>

                            </div>

                            <div className="nw-payment-performance-stat">

                                <span className="nw-payment-stat-dot pending" />

                                <div>

                                    <strong>
                                        {activitySummary.pending}
                                    </strong>

                                    <span>Pending</span>

                                </div>

                            </div>

                            <div className="nw-payment-performance-stat">

                                <span className="nw-payment-stat-dot failed" />

                                <div>

                                    <strong>
                                        {activitySummary.failed}
                                    </strong>

                                    <span>Failed</span>

                                </div>

                            </div>

                        </div>

                        <div className="nw-payment-performance-footer">

                            <FaShieldHeart aria-hidden="true" />

                            <span>
                                Based on the currently loaded transaction records
                            </span>

                        </div>

                    </section>

                    {/* TRANSACTION RISK MONITOR */}

                    <TransactionRiskMonitor
                        transactions={transactions}
                    />

                </aside>

            </section>

            {/* =================================
                PARTIAL API FAILURE NOTICE
            ================================= */}

            {partialError && (

                <div
                    className="nw-dashboard-partial-error"
                    role="status"
                >

                    <span>{partialError}</span>

                    <button
                        type="button"
                        onClick={fetchDashboardData}
                        disabled={loading}
                    >

                        Refresh

                    </button>

                </div>

            )}

        </main>

    );

}

export default DashboardPage;