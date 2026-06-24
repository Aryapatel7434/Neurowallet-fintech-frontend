import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../../context/AuthContext";

function Sidebar() {

  const navigate = useNavigate();

  const { logout } =
    useContext(AuthContext);

  const handleLogout = () => {

    logout();

    navigate("/");

  };

  return (

    <div className="sidebar">

      <div className="sidebar-logo">
        NW
      </div>

      <h2>NeuroWallet</h2>

      <ul className="sidebar-menu">

        <li>🏠 Dashboard</li>

       <li
           onClick={() =>
            navigate("/wallet")
       }
      style={{
         cursor: "pointer"
      }}
    >
     💰 Wallet
    </li>

        <li>💳 Transactions</li>

        <li>📊 Analytics</li>

        <li>🤖 AI Insights</li>

        <li>⚙ Settings</li>

        <li
          onClick={handleLogout}
          style={{
            cursor: "pointer"
          }}
        >
          🚪 Logout
        </li>

      </ul>

    </div>

  );
}

export default Sidebar;