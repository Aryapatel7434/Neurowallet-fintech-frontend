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

    <Navbar />

    <FinancialOverview
      wallet={wallet}
      transactions={transactions}
    />

    <div className="command-grid">

      <FinancialHealth
        wallet={wallet}
        transactions={transactions}
      />

      <AIInsights
        transactions={transactions}
      />

    </div>

    {/* Charts Temporarily Disabled */}

    {/*
    <div className="analytics-row">

      <IncomeChart
        transactions={transactions}
      />

      <ExpenseChart
        transactions={transactions}
      />

    </div>
    */}

     <TransactionTable
  transactions={transactions}
/>
<div className="analytics-row">

  <IncomeChart
    transactions={transactions}
  />

  <ExpenseChart
    transactions={transactions}
  />

</div>

<div className="analytics-row">

  <SpendingInsights
    transactions={transactions}
  />

  <MonthlyTrend
    transactions={transactions}
  />

</div>

    <ActivityTimeline />
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

  </div>
</div>
  );
}

 
 
export default DashboardPage;
