import { useEffect, useState } from "react";

import { getMyWallet } from "../../services/walletService";
import { getTransactionHistory } from "../../services/transactionService";
import { getDashboardInsights } from "../../services/dashboardService";
import {
    FaChartLine,
    FaRobot,
    FaChartPie,
    FaMoneyBillTrendUp
} from "react-icons/fa6";
import "../../styles/dashboard.css";
import "../../styles/loading.css";

import Sidebar from "../../components/dashboard/layout/Sidebar";
import Navbar from "../../components/dashboard/layout/Navbar";

import IncomeChart from "../../components/dashboard/Analytics/IncomeChart";
import ExpenseChart from "../../components/dashboard/Analytics/ExpenseChart";

import QuickActions from "../../components/dashboard/ai/QuickActions";

import ActivityTimeline from "../../components/dashboard/activity/ActivityTimeline";
import RecentTransactions from "../../components/dashboard/activity/RecentTransactions";

import AIFinancialAssistant from "../../components/dashboard/ai/AIFinancialAssistant";
import FinancialOverview from "../../components/dashboard/overview/FinancialOverview";
import FinancialHealth
from "../../components/dashboard/health/FinancialHealth";
import TransactionTable
from "../../components/dashboard/activity/TransactionTable";
import AIInsights
from "../../components/dashboard/insights/AIInsights";
import SpendingInsights
from "../../components/dashboard/Analytics/SpendingInsights";
import BudgetHealth
from "../../components/dashboard/ai/BudgetHealth";
import MonthlyTrend
from "../../components/dashboard/Analytics/MonthlyTrend";
import SmartGoals
from "../../components/dashboard/ai/SmartGoals";
import AIAdvisor
from "../../components/dashboard/ai/AIAdvisor";
import GoalRecommendation
from "../../components/dashboard/ai/GoalRecommendation";
import FinancialScore
from "../../components/dashboard/ai/FinancialScore";
import IncomeTrendChart
from "../../components/dashboard/Analytics/IncomeTrendChart";
import ExpenseTrendChart from "../../components/dashboard/Analytics/ExpenseTrendChart";
import CashFlowChart
from "../../components/dashboard/Analytics/CashFlowChart";
import SpendingCategoryChart
from "../../components/dashboard/Analytics/SpendingCategoryChart";
import DashboardSection
from "../../components/dashboard/common/DashboardSection";
import DashboardHero from "../../components/dashboard/layout/DashboardHero";
import AnalyticsHeader from "../../components/dashboard/Analytics/AnalyticsHeader";
import PerformanceHeader
from "../../components/dashboard/Analytics/PerformanceHeader";
import InsightsHeader
from "../../components/dashboard/Analytics/InsightsHeader";
import CashFlowHeader
from "../../components/dashboard/Analytics/CashFlowHeader";
import AIAssistantHeader
from "../../components/dashboard/ai/AIAssistantHeader";
import DashboardSkeleton
from "../../components/dashboard/common/DashboardSkeleton";
import useAI from "../../hooks/useAI";
function DashboardPage() {
const [wallet, setWallet] = useState(null);
 const totalBalance =
wallet?.balance || 0;

const [loading, setLoading] = useState(true);
const [transactions,
setTransactions] =
useState([]);
const [error, setError] = useState("");
const [dashboardInsights, setDashboardInsights] = useState(null);

const {
    insights,
    financialScore,
    budgetHealth,
    goalRecommendation,
    loading: aiLoading,
    error: aiError
} = useAI();
useEffect(() => {

    const loadDashboard = async () => {

        await fetchDashboardData();

        sessionStorage.removeItem(
            "dashboardRefresh"
        );

    };

    loadDashboard();

}, []);
const fetchDashboardData =
async () => {

 try {

    console.log("Fetching Wallet...");
    const walletData = await getMyWallet();
    console.log(walletData);

    console.log("Fetching Transactions...");
    const transactionData = await getTransactionHistory();
    console.log(transactionData);

    console.log("Fetching Dashboard...");
    const insightsData = await getDashboardInsights();
    console.log(insightsData);

    setWallet(walletData);
    setTransactions(transactionData.content || []);
    setDashboardInsights(insightsData);

}
catch (error) {

    console.error("API ERROR");
    console.error(error);

    console.error(error.response);

    console.error(error.response?.data);

    setError(
        error.response?.data?.message ||
        "Unable to load dashboard."
    );

}
finally {

    setLoading(false);

}
};
if (loading) {

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-content">

                <Navbar />

                <DashboardSkeleton />

            </div>

        </div>

    );

}

if (error) {


return (

  <div style={{ padding: "50px" }}>

    <h2>
      ⚠️ Dashboard Error
    </h2>

    <p>{error}</p>

    <button
      className="retry-btn"
        onClick={() => {
    setError("");
    setLoading(true);

    fetchDashboardData();
}}
    >
      Retry
    </button>

  </div>

);
}
 return (
  <div className="dashboard-layout">

    <Sidebar />

    <div className="dashboard-content">

      {/* =========================
          TOP NAVBAR
      ========================== */}

      <Navbar />

    <DashboardHero

    wallet={wallet}

    dashboardInsights={dashboardInsights}

/>

      {/* =========================
          FINANCIAL OVERVIEW
      ========================== */}

     <FinancialOverview
    wallet={wallet}
    dashboardInsights={dashboardInsights}
/>

      {/* =========================
          COMMAND CENTER
      ========================== */}

 <div className="health-layout">

    <FinancialHealth
        wallet={wallet}
        transactions={transactions}
    />

    <div className="ai-right-panel">
<AIInsights
    dashboardInsights={dashboardInsights}
/>
    </div>

</div>

      {/* =========================
          RECENT TRANSACTIONS
      ========================== */}

      <TransactionTable
        transactions={transactions}
      />

      {/* =========================
          ANALYTICS
      ========================== */}
<div className="dashboard-section">

    <AnalyticsHeader />

    <div className="analytics-row">

        <IncomeChart
            transactions={transactions}
        />

        <ExpenseChart
            transactions={transactions}
        />

    </div>

</div>
  

      {/* =========================
          PERFORMANCE CHARTS
      ========================== */}
<div className="dashboard-section">

    <PerformanceHeader />

    <div className="analytics-row">

        <IncomeTrendChart
            transactions={transactions}
        />

        <ExpenseTrendChart
            transactions={transactions}
        />

    </div>

</div>


      {/* =========================
          ADVANCED ANALYTICS
      ========================== */}
  <div className="dashboard-section">

    <CashFlowHeader />

    <div className="analytics-row">

        <CashFlowChart
            transactions={transactions}
        />

        <SpendingCategoryChart
            transactions={transactions}
        />

    </div>

</div>
     
      {/* =========================
          INSIGHTS
      ========================== */}
   {/* <DashboardSection>

    <InsightsHeader />

    <div className="analytics-row">

        <SpendingInsights
            transactions={transactions}
        />

        <MonthlyTrend
            transactions={transactions}
            dashboardInsights={dashboardInsights}
        />

    </div>

</DashboardSection> */}

<div className="dashboard-section">

    <InsightsHeader />

    <div className="analytics-row">

        <SpendingInsights
            transactions={transactions}
        />

        <MonthlyTrend
            transactions={transactions}
            dashboardInsights={dashboardInsights}
        />

    </div>

</div>

      {/* =========================
          ACTIVITY
      ========================== */}

      <ActivityTimeline
    transactions={transactions}
/>

      {/* =========================
          AI ASSISTANT
      ========================== */}
{/* =========================
    AI ASSISTANT
========================= */}

<div className="dashboard-section ai-section">

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
      <QuickActions
    onRefresh={fetchDashboardData}
/>

    </div>

</div>

    </div>

  </div>
);
}

 
 
export default DashboardPage;