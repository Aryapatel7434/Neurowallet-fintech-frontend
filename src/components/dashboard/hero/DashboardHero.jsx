import "./DashboardHero.css";
import { FaWallet } from "react-icons/fa6";

function DashboardHero({
    wallet,
    dashboardInsights
}) {
  const user =
    JSON.parse(
        localStorage.getItem("user")
    );

const balance =
    wallet?.balance || 0;

const totalIncome =
    dashboardInsights?.totalIncome || 0;

const totalExpense =
    dashboardInsights?.totalExpense || 0;

const netCashFlow =
    dashboardInsights?.netCashFlow || 0;


    const hour = new Date().getHours();

let greeting = "Good Evening";

if (hour < 12) {

    greeting = "Good Morning";

} else if (hour < 18) {

    greeting = "Good Afternoon";

}
  return (
    <section className="hero-section">

      <div className="hero-banner">

        <div className="hero-content">
          <span className="hero-badge">
            NeuroWallet AI
          </span>

         <h1>

    {greeting},

    {" "}

    {user?.name || "User"}

    👋

</h1>

<p>

    Welcome back to NeuroWallet AI.

    Monitor your wallet, transactions,

    analytics and financial insights

    from one secure dashboard.

</p>
        </div>

        <div className="hero-right">

          <div className="hero-status">
            ● AI Monitoring Active
          </div>

          <div className="hero-balance-card">

            <FaWallet className="hero-wallet-icon" />

            <div>
              <span>Total Balance</span>

              <h2>

₹{Number(balance).toLocaleString("en-IN")}

</h2>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default DashboardHero;