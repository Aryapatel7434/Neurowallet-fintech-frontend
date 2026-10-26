
import { useCallback, useEffect, useRef, useState } from "react";

import { getMyWallet } from "../../services/walletService";
import { getTransactionHistory } from "../../services/transactionService";
import { getDashboardInsights } from "../../services/dashboardService";

import "../../styles/dashboard.css";
import "../../styles/loading.css";

import IncomeChart from "../../components/dashboard/Analytics/IncomeChart";
import ExpenseChart from "../../components/dashboard/Analytics/ExpenseChart";
import IncomeTrendChart from "../../components/dashboard/Analytics/IncomeTrendChart";
import ExpenseTrendChart from "../../components/dashboard/Analytics/ExpenseTrendChart";
import CashFlowChart from "../../components/dashboard/Analytics/CashFlowChart";
import SpendingCategoryChart from "../../components/dashboard/Analytics/SpendingCategoryChart";
import SpendingInsights from "../../components/dashboard/Analytics/SpendingInsights";
import MonthlyTrend from "../../components/dashboard/Analytics/MonthlyTrend";

import QuickActions from "../../components/dashboard/ai/QuickActions";
import AIFinancialAssistant from "../../components/dashboard/ai/AIFinancialAssistant";
import BudgetHealth from "../../components/dashboard/ai/BudgetHealth";
import SmartGoals from "../../components/dashboard/ai/SmartGoals";
import GoalRecommendation from "../../components/dashboard/ai/GoalRecommendation";
import FinancialScore from "../../components/dashboard/ai/FinancialScore";

import ActivityTimeline from "../../components/dashboard/activity/ActivityTimeline";
import TransactionTable from "../../components/dashboard/activity/TransactionTable";

import FinancialOverview from "../../components/dashboard/overview/FinancialOverview";
import FinancialHealth from "../../components/dashboard/health/FinancialHealth";
import AIInsights from "../../components/dashboard/insights/AIInsights";

import DashboardHero from "../../components/dashboard/layout/DashboardHero";
import AnalyticsHeader from "../../components/dashboard/Analytics/AnalyticsHeader";
import PerformanceHeader from "../../components/dashboard/Analytics/PerformanceHeader";
import InsightsHeader from "../../components/dashboard/Analytics/InsightsHeader";
import CashFlowHeader from "../../components/dashboard/Analytics/CashFlowHeader";
import AIAssistantHeader from "../../components/dashboard/ai/AIAssistantHeader";
import DashboardSkeleton from "../../components/dashboard/common/DashboardSkeleton";

import useAI from "../../hooks/useAI";

function DashboardPage() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboardInsights, setDashboardInsights] = useState(null);
    const dashboardRequestId = useRef(0);

    const {
        insights,
        financialScore,
        budgetHealth,
        goalRecommendation,
        loading: aiLoading,
    } = useAI();

    const fetchDashboardData = useCallback(async () => {
        // Each refresh supersedes earlier requests so stale responses cannot
        // overwrite data from a newer dashboard refresh.
        const requestId = ++dashboardRequestId.current;
        const isCurrentRequest = () => dashboardRequestId.current === requestId;

        setLoading(true);
        setError("");

        try {
            const results = await Promise.allSettled([
                getMyWallet(),
                getTransactionHistory(),
                getDashboardInsights(),
            ]);

            if (!isCurrentRequest()) return;

            const [walletResult, transactionsResult, insightsResult] = results;

            if (walletResult.status === "fulfilled") {
                setWallet(walletResult.value);
            }

            if (transactionsResult.status === "fulfilled") {
                const transactionData = transactionsResult.value;

                setTransactions(
                    Array.isArray(transactionData?.content)
                        ? transactionData.content
                        : Array.isArray(transactionData)
                          ? transactionData
                          : []
                );
            }

            if (insightsResult.status === "fulfilled") {
                setDashboardInsights(insightsResult.value);
            }

            const allFailed = results.every(
                (result) => result.status === "rejected"
            );

            if (allFailed) {
                setError(
                    "Unable to load dashboard data. Please try again."
                );
            }
        } catch (err) {
            if (!isCurrentRequest()) return;

            console.error("Unexpected dashboard loading error:", err);
            setError(
                "An unexpected error occurred while loading the dashboard."
            );
        } finally {
            if (isCurrentRequest()) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            await fetchDashboardData();

            if (active) {
                sessionStorage.removeItem("dashboardRefresh");
            }
        };

        loadDashboard();

        return () => {
            active = false;
            // Invalidate in-flight work when leaving the page.
            dashboardRequestId.current += 1;
        };
    }, [fetchDashboardData]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <section
                className="dashboard-page-content-inner dashboard-error-state"
                role="alert"
            >
                <h2>Dashboard Error</h2>
                <p>{error}</p>

                <button
                    type="button"
                    className="retry-btn"
                    onClick={fetchDashboardData}
                    disabled={loading}
                >
                    Retry
                </button>
            </section>
        );
    }

    return (
        <div className="dashboard-page-content-inner">
            <DashboardHero
                wallet={wallet}
                dashboardInsights={dashboardInsights}
            />

            {/* Financial overview */}
            <FinancialOverview
                wallet={wallet}
                dashboardInsights={dashboardInsights}
            />

            {/* Financial health and AI insights */}
            <div className="health-layout">
                <FinancialHealth
                    wallet={wallet}
                    transactions={transactions}
                />

                <div className="ai-right-panel">
                    <AIInsights dashboardInsights={dashboardInsights} />
                </div>
            </div>

            {/* Recent transactions */}
            <TransactionTable transactions={transactions} />

            {/* Transaction analytics */}
            <section className="dashboard-section">
                <AnalyticsHeader />

                <div className="analytics-row">
                    <IncomeChart transactions={transactions} />
                    <ExpenseChart transactions={transactions} />
                </div>
            </section>

            {/* Performance charts */}
            <section className="dashboard-section">
                <PerformanceHeader />

                <div className="analytics-row">
                    <IncomeTrendChart transactions={transactions} />
                    <ExpenseTrendChart transactions={transactions} />
                </div>
            </section>

            {/* Advanced analytics */}
            <section className="dashboard-section">
                <CashFlowHeader />

                <div className="analytics-row">
                    <CashFlowChart transactions={transactions} />
                    <SpendingCategoryChart transactions={transactions} />
                </div>
            </section>

            {/* Spending insights and monthly trends */}
            <section className="dashboard-section">
                <InsightsHeader />

                <div className="analytics-row">
                    <SpendingInsights transactions={transactions} />

                    <MonthlyTrend
                        transactions={transactions}
                        dashboardInsights={dashboardInsights}
                    />
                </div>
            </section>

            {/* Activity timeline */}
            <ActivityTimeline transactions={transactions} />

            {/* AI assistant and financial recommendations */}
            <section className="dashboard-section ai-section">
                <AIAssistantHeader />

                <div className="ai-grid">
                    <AIFinancialAssistant
                        transactions={transactions}
                        insights={insights}
                        loading={aiLoading}
                    />

                    <BudgetHealth
                        wallet={wallet}
                        budgetHealth={budgetHealth}
                        loading={aiLoading}
                    />

                    <FinancialScore
                        wallet={wallet}
                        financialScore={financialScore}
                        loading={aiLoading}
                    />

                    <SmartGoals
                        goalRecommendation={goalRecommendation}
                        loading={aiLoading}
                    />

                    <GoalRecommendation
                        wallet={wallet}
                        goalRecommendation={goalRecommendation}
                        loading={aiLoading}
                    />

                    <QuickActions onRefresh={fetchDashboardData} />
                </div>
            </section>
        </div>
    );
}

export default DashboardPage;
