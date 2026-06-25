import {
    FaChartLine,
    FaRobot,
    FaChartPie,
    FaMoneyBillTrendUp
} from "react-icons/fa6";
import "../../styles/dashboard.css";
import "../../styles/loading.css";

import { useEffect, useState } from "react";

import { getMyWallet } from "../../services/walletService";
import { getTransactionHistory } from "../../services/transactionService";

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

function DashboardPage() {
const [wallet, setWallet] = useState(null);
 const totalBalance =
wallet?.balance || 0;

const [loading, setLoading] = useState(true);
const [transactions,
setTransactions] =
useState([]);
const [error, setError] = useState("");

useEffect(() => {

fetchDashboardData();

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

    console.log(
      "Transactions:",
      transactionData
    );

    setWallet(walletData);

      setTransactions(
  transactionData.content || []
);

  } catch(error) {

    console.error(error);

  } finally {

    setLoading(false);

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

      <DashboardHero />

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

   <DashboardSection

    title="Analytics"

    icon={<FaChartLine />}

    badge="LIVE"

    showRefresh

>

  <div className="analytics-row">

    <IncomeChart
      transactions={transactions}
    />

    <ExpenseChart
      transactions={transactions}
    />

  </div>

</DashboardSection>

      {/* =========================
          PERFORMANCE CHARTS
      ========================== */}

 <DashboardSection

    title="Performance"

    icon={<FaMoneyBillTrendUp />}

    badge="Realtime"

    showRefresh

>

  <div className="analytics-row">

    <IncomeTrendChart
      transactions={transactions}
    />

    <ExpenseTrendChart
      transactions={transactions}
    />

  </div>

</DashboardSection>

      {/* =========================
          ADVANCED ANALYTICS
      ========================== */}
    <DashboardSection

    title="Cash Flow & Spending"

    icon={<FaChartPie />}

    badge="Analytics"

    showRefresh

    showExport

>
  <div className="analytics-row">

    <CashFlowChart
      transactions={transactions}
    />

    <SpendingCategoryChart
      transactions={transactions}
    />

  </div>

</DashboardSection>
     
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
