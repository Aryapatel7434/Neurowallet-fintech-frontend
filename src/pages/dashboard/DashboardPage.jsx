import "../../styles/dashboard.css";
import "../../styles/loading.css";
import { useState, useEffect } from "react";

import { getDashboardStats } from "../../services/dashboardService";
import { getMyWallet } from "../../services/walletService";

import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";

import ExecutiveStats from "../../components/dashboard/ExecutiveStats";

import WalletCard from "../../components/dashboard/WalletCard";
import InsightCard from "../../components/dashboard/InsightCard";
import TransactionTable from "../../components/dashboard/TransactionTable";

import QuickActions from "../../components/dashboard/QuickActions";
import GoalTracker from "../../components/dashboard/GoalTracker";
import ActivityFeed from "../../components/dashboard/ActivityFeed";

import IncomeChart from "../../components/dashboard/charts/IncomeChart";
import ExpenseChart from "../../components/dashboard/charts/ExpenseChart";
import SavingChart from "../../components/dashboard/charts/SavingChart";

import AIAdvisorCard from "../../components/dashboard/AIAdvisorCard";
import WalletAccounts from "../../components/dashboard/WalletAccounts";
import UpcomingBills from "../../components/dashboard/UpcomingBills";
import CategorySummary from "../../components/dashboard/CategorySummary";

function DashboardPage() {

const [stats, setStats] = useState({
balance: 0,
income: 0,
expenses: 0,
savings: 0
});

const [wallet, setWallet] = useState(null);

const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

const loadDashboard = async () => {


try {

  const data =
    await getDashboardStats();

  setStats(data);

} catch (error) {

  console.error(error);

  setError(
    "Failed to load dashboard data"
  );

} finally {

  setLoading(false);

}


};

const loadWallet = async () => {


try {

  const data =
    await getMyWallet();

  console.log(
    "Wallet Data:",
    data
  );

  setWallet(data);

} catch (error) {

  console.error(
    "Wallet Error:",
    error
  );
}

};

useEffect(() => {


loadDashboard();

loadWallet();


}, []);

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

        loadDashboard();

        loadWallet();

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

    <div>
      Executive Stats Test
    </div>

    <div className="cards-grid">

      <WalletCard
        title="Total Balance"
        amount={
          wallet
            ? `₹${wallet.balance}`
            : "Loading..."
        }
        growth="12.5%"
      />

       <WalletCard
        title="Income"
        amount={`₹${stats.income}`}
        growth="8%"
    />

      <WalletCard
        title="Expenses"
        amount={`₹${stats.expenses}`}
        growth="3%"
    />

    <WalletCard
      title="Savings"
      amount={`₹${stats.savings}`}
      growth="15%"
    />
    </div>

    <div className="chart-grid">

      <IncomeChart />

      <ExpenseChart />

    </div>

    <div className="chart-grid-single">

      <SavingChart />

    </div>

    <AIAdvisorCard />

    <div className="middle-grid">

      <InsightCard />

    </div>

    <TransactionTable />

    <div className="finance-grid">

      <WalletAccounts />

      <UpcomingBills />

      <CategorySummary />

    </div>

    <div className="bottom-grid">

      <QuickActions />

      <GoalTracker />

      <ActivityFeed />

    </div>

  </div>

</div>


);
}

export default DashboardPage;
