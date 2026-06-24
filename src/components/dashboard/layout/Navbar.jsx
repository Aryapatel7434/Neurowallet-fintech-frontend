import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

function Navbar() {
  const { user } = useContext(AuthContext);

  const currentHour = new Date().getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
  }

  return (
    <div className="dashboard-navbar">

      <div className="navbar-left">
        <span className="navbar-badge">
          NeuroWallet AI
        </span>

        <h2>
          {greeting},{" "}
          {user?.name || "Arya"} 👋
        </h2>

        <p>
          Welcome back to your financial command center.
        </p>
      </div>

      <div className="navbar-right">

        <div className="ai-status">
          <span className="status-dot"></span>
          AI Active
        </div>

        <button className="notification-btn">
          🔔
        </button>

        <div className="profile-circle">
          {user?.initials || "AP"}
        </div>

      </div>

    </div>
  );
}

export default Navbar;