import NotificationBell from "./NotificationBell";
function WalletHeader({ wallet }) {

  const hour =
    new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (

     <div className="wallet-header">

  <div className="hero-top-right">
    <NotificationBell />
  </div>

      <div className="hero-left">

        <h1>
          NeuroWallet AI
        </h1>

        <h2>
          AI Powered Smart Financial Assistant
        </h2>

        <p>
          Track expenses, transfer money,
          manage finances and receive
          intelligent insights.
        </p>

        <div className="wallet-growth">
          ↑ 12.5% This Month
        </div>

      </div>

      <div className="hero-right">

        <div className="hero-balance-card">

          <span>
            Available Balance
          </span>

          <h1>
            ₹{wallet?.balance}
          </h1>

          <p>
            Financial Health: Excellent
          </p>

        </div>

      </div>

    </div>

  );
}

export default WalletHeader;