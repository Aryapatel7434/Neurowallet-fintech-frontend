import "./DashboardHero.css";
import { FaWallet } from "react-icons/fa6";

function DashboardHero() {
  return (
    <section className="hero-section">

      <div className="hero-banner">

        <div className="hero-content">
          <span className="hero-badge">
            NeuroWallet AI
          </span>

          {/* <h1>
            Welcome Back Arya 👋
          </h1>

          <p>
            Monitor your wallet, transactions,
            spending patterns and AI insights
            from a single dashboard.
          </p> */}
        </div>

        <div className="hero-right">

          <div className="hero-status">
            ● AI Monitoring Active
          </div>

          <div className="hero-balance-card">

            <FaWallet className="hero-wallet-icon" />

            <div>
              <span>Total Balance</span>

              <h2>₹25,450</h2>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default DashboardHero;