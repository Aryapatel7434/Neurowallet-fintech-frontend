
import { useCallback, useEffect, useState } from "react";

// Services
import { getMyWallet } from "../../services/walletService";
import { getTransactionHistory } from "../../services/transactionService";
import { getDashboardInsights } from "../../services/dashboardService";

// Styles
import "../../styles/dashboard.css";
import "../../styles/loading.css";

// Dashboard Analytics
import IncomeExpenseComparison from "../../components/dashboard/Analytics/IncomeExpenseComparison";
import SpendingCategoryChart from "../../components/dashboard/Analytics/SpendingCategoryChart";
import CashFlowChart from "../../components/dashboard/Analytics/CashFlowChart";

// AI Components
import AIFinancialAssistant from "../../components/dashboard/ai/AIFinancialAssistant";
import BudgetHealth from "../../components/dashboard/ai/BudgetHealth";
import SmartGoals from "../../components/dashboard/ai/SmartGoals";
import GoalRecommendation from "../../components/dashboard/ai/GoalRecommendation";

// Activity
import TransactionTable from "../../components/dashboard/activity/TransactionTable";

// Overview and Health
import FinancialOverview from "../../components/dashboard/overview/FinancialOverview";
import FinancialHealth from "../../components/dashboard/health/FinancialHealth";

// Layout
import DashboardHero from "../../components/dashboard/layout/DashboardHero";
import DashboardSkeleton from "../../components/dashboard/common/DashboardSkeleton";

// AI Hook
import useAI from "../../hooks/useAI";


function DashboardPage() {

    // =========================================
    // DASHBOARD STATE
    // =========================================

    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboardInsights, setDashboardInsights] = useState(null);

    // =========================================
    // AI DATA
    // =========================================

    const {
        insights,
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


            // Wallet
            if (walletResult.status === "fulfilled") {
                setWallet(walletResult.value);
            }


            // Transactions
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


            // Dashboard Insights
            if (insightsResult.status === "fulfilled") {
                setDashboardInsights(insightsResult.value);
            }


            // Check complete API failure
            const allFailed = results.every(
                (result) => result.status === "rejected"
            );

            if (allFailed) {
                setError(
                    "Unable to load dashboard data. Please try again."
                );
            }

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
        };

    }, [fetchDashboardData]);


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


    // =========================================
    // TARGET NEUROWALLET DASHBOARD
    // =========================================

    return (

        <main className="nw-dashboard-content-area">

            {/* =================================
                ROW 1: OVERVIEW + AI ASSISTANT
            ================================= */}

            <section className="nw-dashboard-primary">

                <div className="nw-dashboard-greeting">

                    <DashboardHero
                        wallet={wallet}
                        dashboardInsights={dashboardInsights}
                    />

                </div>


                <div className="nw-dashboard-overview">

                    <FinancialOverview
                        wallet={wallet}
                        dashboardInsights={dashboardInsights}
                    />

                </div>


                {/* Primary Analytics */}

                <div className="nw-dashboard-chart-grid">

                    <div className="nw-dashboard-income-chart nw-reference-chart-card">

                        <IncomeExpenseComparison
                            transactions={transactions}
                        />

                    </div>


                    <div className="nw-dashboard-category-chart nw-reference-chart-card">

                        <SpendingCategoryChart
                            transactions={transactions}
                        />

                    </div>

                </div>

            </section>


            {/* AI Financial Assistant */}

            <aside className="nw-dashboard-assistant">

                <AIFinancialAssistant
                    transactions={transactions}
                    insights={insights}
                    loading={aiLoading}
                />

            </aside>


            {/* =================================
                ROW 2: FINANCIAL HEALTH CARDS
            ================================= */}

            <section className="nw-dashboard-health-grid">

                {/* Financial Health */}

                <article className="nw-dashboard-health-card">

                    <FinancialHealth
                        wallet={wallet}
                        transactions={transactions}
                    />

                </article>


                {/* Budget Health */}

                <article className="nw-dashboard-health-card">

                    <BudgetHealth
                        budgetHealth={budgetHealth}
                        loading={aiLoading}
                    />

                </article>


                {/* Savings Goals */}

                <article className="nw-dashboard-health-card">

                    <SmartGoals
                        goalRecommendation={goalRecommendation}
                        loading={aiLoading}
                    />

                </article>


                {/* AI Recommendation */}

                <article className="nw-dashboard-health-card">

                    <GoalRecommendation
                        wallet={wallet}
                        goalRecommendation={goalRecommendation}
                        loading={aiLoading}
                    />

                </article>

            </section>


            {/* =================================
                ROW 3: TRANSACTIONS + CASH FLOW
            ================================= */}

            <section className="nw-dashboard-bottom-grid">

                <div className="nw-dashboard-transactions">

                    <TransactionTable
                        transactions={transactions}
                    />

                </div>


                <div className="nw-dashboard-cashflow">

                    <CashFlowChart
                        transactions={transactions}
                    />

                </div>

            </section>

        </main>

    );

}

export default DashboardPage;
