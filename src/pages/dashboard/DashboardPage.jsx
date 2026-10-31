
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaRobot,
    FaArrowRight,
    FaPiggyBank,
    FaTriangleExclamation,
    FaChartLine,
    FaShieldHeart,
    FaReceipt,
    FaCircleCheck,
    FaClock,
    FaCircleXmark,
    FaArrowRotateRight,
} from "react-icons/fa6";

// =============================================
// SERVICES
// =============================================

import { getMyWallet } from "../../services/walletService";
import { getTransactionHistory } from "../../services/transactionService";
import { getDashboardInsights } from "../../services/dashboardService";

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

// =============================================
// AI HOOK
// =============================================

import useAI from "../../hooks/useAI";

// =============================================
// HELPERS
// =============================================

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

function formatCurrency(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return currencyFormatter.format(amount);
}

function getTransactionTimestamp(transaction) {
    const value =
        transaction?.timestamp ||
        transaction?.createdAt ||
        transaction?.date;

    const timestamp = new Date(value).getTime();

    return Number.isFinite(timestamp) ? timestamp : 0;
}

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

        setLoading(true);
        setError("");
        setPartialError("");

        try {

            const results = await Promise.allSettled([
                getMyWallet(),
                getTransactionHistory(0, 100),
                getDashboardInsights(),
            ]);

            const [
                walletResult,
                transactionsResult,
                insightsResult,
            ] = results;

            // -------------------------------------
            // WALLET DATA
            // -------------------------------------

            if (walletResult.status === "fulfilled") {

                setWallet(walletResult.value);

            } else {

                setWallet(null);

                console.error(
                    "Wallet API failed:",
                    walletResult.reason
                );

            }

            // -------------------------------------
            // TRANSACTION DATA
            // -------------------------------------

            if (transactionsResult.status === "fulfilled") {

                const transactionData = transactionsResult.value;

                const transactionList = Array.isArray(
                    transactionData?.content
                )
                    ? transactionData.content
                    : Array.isArray(transactionData)
                        ? transactionData
                        : [];

                setTransactions(transactionList);

            } else {

                setTransactions([]);

                console.error(
                    "Transaction API failed:",
                    transactionsResult.reason
                );

            }

            // -------------------------------------
            // DASHBOARD INSIGHTS
            // -------------------------------------

            if (insightsResult.status === "fulfilled") {

                setDashboardInsights(insightsResult.value);

            } else {

                setDashboardInsights(null);

                console.error(
                    "Dashboard insights API failed:",
                    insightsResult.reason
                );

            }

            // -------------------------------------
            // PARTIAL / COMPLETE API FAILURE
            // -------------------------------------

            const failedResults = results.filter(
                (result) => result.status === "rejected"
            );

            if (failedResults.length === results.length) {

                setError(
                    "Unable to load dashboard data. Please check your connection and try again."
                );

            } else if (failedResults.length > 0) {

                setPartialError(
                    "Some dashboard information could not be loaded. Available information is still displayed."
                );

            }

            sessionStorage.removeItem("dashboardRefresh");

        } catch (err) {

            console.error(
                "Unexpected dashboard loading error:",
                err
            );

            setError(
                "An unexpected error occurred while loading the dashboard."
            );

        } finally {

            setLoading(false);

        }

    }, []);

    // =========================================
    // INITIAL DASHBOARD LOAD
    // =========================================

    useEffect(() => {

        fetchDashboardData();

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
    // LATEST TRANSACTION DATE
    // =========================================

    const latestTransactionDate = useMemo(() => {

        if (transactions.length === 0) {
            return null;
        }

        const latestTimestamp = Math.max(
            ...transactions.map(getTransactionTimestamp)
        );

        return latestTimestamp > 0
            ? new Date(latestTimestamp)
            : null;

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

                        <FaArrowRotateRight aria-hidden="true" />

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

    const confidence = Number(insights?.confidence);

    const hasConfidence =
        insights?.confidence !== null &&
        insights?.confidence !== undefined &&
        insights?.confidence !== "" &&
        Number.isFinite(confidence);

    const confidencePercentage = hasConfidence
        ? Math.max(0, Math.min(100, confidence))
        : 0;

    // =========================================
    // DASHBOARD UI
    // =========================================

    return (

        <main className="nw-dashboard-content-area">

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

                {/* =================================
                    LEFT — MAIN DASHBOARD
                ================================= */}

                <div className="nw-dashboard-main-left">

                    {/* ---------------------------------
                        ANALYTICS
                    --------------------------------- */}

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

                    {/* ---------------------------------
                        FINANCIAL HEALTH / BUDGET / GOALS
                    --------------------------------- */}

                    <section className="nw-dashboard-financial-grid">

                        {/* CARD 1 — FINANCIAL HEALTH */}

                        <article className="nw-dashboard-panel nw-dashboard-financial-card">

                            <FinancialHealth
                                transactions={transactions}
                                financialScore={financialScore}
                                loading={aiLoading}
                            />

                        </article>

                        {/* CARD 2 — BUDGET HEALTH */}

                        <article className="nw-dashboard-panel nw-dashboard-financial-card">

                            <BudgetHealth
                                budgetHealth={budgetHealth}
                                loading={aiLoading}
                            />

                        </article>

                        {/* CARD 3 — SAVINGS GOALS */}

                        <article className="nw-dashboard-panel nw-dashboard-financial-card">

                            <SmartGoals
                                goalRecommendation={goalRecommendation}
                                loading={aiLoading}
                            />

                        </article>

                    </section>

                    {/* ---------------------------------
                        RECENT TRANSACTIONS / CASH FLOW
                    --------------------------------- */}

                    <section className="nw-dashboard-activity-grid">

                        <article className="nw-dashboard-panel nw-dashboard-transactions-panel">

                            <TransactionTable
                                transactions={transactions}
                            />

                        </article>

                        <article className="nw-dashboard-panel nw-dashboard-cashflow-panel">

                            <CashFlowChart
                                transactions={transactions}
                            />

                        </article>

                    </section>

                </div>

                {/* =================================
                    RIGHT — AI SIDEBAR
                ================================= */}

                <aside className="nw-dashboard-ai-sidebar">

                    {/* ---------------------------------
                        NEUROWALLET AI FINANCIAL SNAPSHOT
                    --------------------------------- */}

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

                    {/* ---------------------------------
                        RECENT TRANSACTION ACTIVITY
                    --------------------------------- */}

                    <section
                        className="nw-dashboard-panel nw-dashboard-activity-summary"
                        aria-label="Recent transaction activity"
                    >

                        <header className="nw-dashboard-summary-heading">

                            <div>

                                <h2>Recent Activity</h2>

                                <p>

                                    {latestTransactionDate
                                        ? `Latest: ${latestTransactionDate.toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}`
                                        : "Your wallet activity"}

                                </p>

                            </div>

                            <span className="nw-dashboard-summary-icon">

                                <FaReceipt aria-hidden="true" />

                            </span>

                        </header>

                        {/* TOTAL TRANSACTIONS */}

                        <div className="nw-dashboard-activity-total">

                            <strong>{activitySummary.total}</strong>

                            <span>Loaded transactions</span>

                        </div>

                        {/* TRANSACTION STATUS */}

                        <div className="nw-dashboard-activity-stats">

                            {/* SUCCESSFUL */}

                            <div className="nw-activity-stat">

                                <span className="nw-activity-stat-icon is-success">

                                    <FaCircleCheck aria-hidden="true" />

                                </span>

                                <div>

                                    <strong>
                                        {activitySummary.successful}
                                    </strong>

                                    <span>Successful</span>

                                </div>

                            </div>

                            {/* PENDING */}

                            <div className="nw-activity-stat">

                                <span className="nw-activity-stat-icon is-pending">

                                    <FaClock aria-hidden="true" />

                                </span>

                                <div>

                                    <strong>
                                        {activitySummary.pending}
                                    </strong>

                                    <span>Pending</span>

                                </div>

                            </div>

                            {/* FAILED */}

                            <div className="nw-activity-stat">

                                <span className="nw-activity-stat-icon is-failed">

                                    <FaCircleXmark aria-hidden="true" />

                                </span>

                                <div>

                                    <strong>
                                        {activitySummary.failed}
                                    </strong>

                                    <span>Failed</span>

                                </div>

                            </div>

                        </div>

                        <p className="nw-dashboard-activity-note">

                            Based on the transactions currently loaded.

                        </p>

                    </section>

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
                    >

                        Refresh

                    </button>

                </div>

            )}

        </main>

    );

}

export default DashboardPage;
