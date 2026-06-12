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
import "../../styles/dashboard.css";
function DashboardPage() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

      {/* Navbar */}
<Navbar />

{/* Executive KPI Section */}
<div>Executive Stats Test</div>

<div className="cards-grid"></div>
        {/* Wallet Cards */}
        <div className="cards-grid">

          <WalletCard
            title="Total Balance"
            amount="₹1,25,000"
            growth="12.5%"
          />

          <WalletCard
            title="Income"
            amount="₹50,000"
            growth="8%"
          />

          <WalletCard
            title="Expenses"
            amount="₹15,000"
            growth="3%"
          />

          <WalletCard
            title="Savings"
            amount="₹35,000"
            growth="15%"
          />

        </div>

        {/* Charts */}
        <div className="chart-grid">

          <IncomeChart />

          <ExpenseChart />

        </div>

        <div className="chart-grid-single">

          <SavingChart />

        </div>

        {/* AI Advisor */}
        <AIAdvisorCard />

        {/* Insight Card */}
        <div className="middle-grid">

          <InsightCard />

        </div>

        {/* Transactions */}
        <TransactionTable />

            <div className="finance-grid">

            <WalletAccounts />

             <UpcomingBills />

            <CategorySummary />

        </div>
        {/* Bottom Widgets */}
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