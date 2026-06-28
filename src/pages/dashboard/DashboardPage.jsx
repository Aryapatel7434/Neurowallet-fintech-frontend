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
import CashFlowHeader
from "../../components/dashboard/Analytics/CashFlowHeader";
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

const [loadingInsights, setLoadingInsights] = useState(true);
useEffect(() => {

    fetchDashboardData();

    fetchDashboardInsights();

}, []);
const fetchDashboardData =
async () => {

  try {
    
    const walletData =
      await getMyWallet();

    const transactionData =
      await getTransactionHistory();

    console.log(
      "Wallet:",
      walletData
    );

   console.log("FULL API RESPONSE");
console.log(transactionData);

console.log("CONTENT");
console.log(transactionData.content);

console.log("FIRST");
console.log(transactionData.content?.[0]);

    setWallet(walletData);

      setTransactions(
  transactionData.content || []
);
console.log("Dashboard Transactions:");
console.log(transactionData.content);

console.log("First Transaction:");
console.log(transactionData.content?.[0]);
  } catch(error) {

    console.error(error);

  } finally {

    setLoading(false);

  }
};
const fetchDashboardInsights = async () => {

    try {

        const data = await getDashboardInsights();

        console.log("========== Dashboard API ==========");
        console.log(data);
        console.log("==================================");

        setDashboardInsights(data);

    } catch (error) {

        console.log("Dashboard API Error");
        console.log(error);

    } finally {

        setLoadingInsights(false);

    }

};
if (loading) {


return (

  <div style={{ padding: "50px" }}>
    Loading Dashboard...
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
        transactions={transactions}
      />

      {/* =========================
          COMMAND CENTER
      ========================== */}

      <div className="command-grid">

        <FinancialHealth
          wallet={wallet}
          transactions={transactions}
        />

       <AIInsights
    transactions={transactions}
    dashboardInsights={dashboardInsights}
    loading={loadingInsights}
/>

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
     <DashboardSection title="Insights">

  <div className="analytics-row">

    <SpendingInsights
      transactions={transactions}
    />

    <MonthlyTrend
      transactions={transactions}
    />

  </div>

</DashboardSection>

      {/* =========================
          ACTIVITY
      ========================== */}

      <ActivityTimeline />

      {/* =========================
          AI ASSISTANT
      ========================== */}
 <DashboardSection

    title="AI Assistant"

    icon={<FaRobot />}

    badge="AI"

    showRefresh

>

  <div className="ai-grid">

    <AIFinancialAssistant
      transactions={transactions}
    />

    <BudgetHealth
      wallet={wallet}
    />

    <FinancialScore
      wallet={wallet}
    />

    <SmartGoals
      wallet={wallet}
    />

    <GoalRecommendation
      wallet={wallet}
    />

    <QuickActions />

  </div>

</DashboardSection>
      

    </div>

  </div>
);
}

 
 
export default DashboardPage;