import "../../styles/dashboard.css";
import "../../styles/loading.css";
import { useEffect, useState } from "react";
import {
  getMyWallet
} from "../../services/walletService";
import {
  getTransactionHistory
} from "../../services/transactionService";
import ExecutiveStats
from "../../components/dashboard/ExecutiveStats";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";


import WalletOverview from "../../components/dashboard/WalletOverview";

import RecentTransactions from "../../components/dashboard/RecentTransactions";

import QuickActions from "../../components/dashboard/QuickActions";

import ActivityTimeline from "../../components/dashboard/ActivityTimeline";

import  IncomeChart from "../../components/dashboard/Analytics/IncomeChart";
import ExpenseChart from "../../components/dashboard/Analytics/ExpenseChart";
import SavingChart from "../../components/dashboard/Analytics/SavingChart";

import AIFinancialAssistant from "../../components/dashboard/AIFinancialAssistant";

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
      transactionData
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
    <ExecutiveStats />
    <div className="cards-grid">

         <ExecutiveStats
           wallet={wallet}
      />
    </div>

    <div className="chart-grid">

      <IncomeChart />

      <ExpenseChart />

    </div>

    <div className="chart-grid-single">

      <SavingChart />

    </div>

    <AIFinancialAssistant />

     <RecentTransactions
  transactions={transactions}
/>
    
    <div className="finance-grid">


    </div>
     <div className="bottom-grid">

  <QuickActions />

  <ActivityTimeline />

</div>
   
  </div>

</div>


);
}
export default DashboardPage;