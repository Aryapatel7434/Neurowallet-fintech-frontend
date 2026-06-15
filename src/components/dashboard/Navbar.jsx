import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";

function Navbar() {

  const { user } =
    useContext(AuthContext);

  return (

    <div className="dashboard-navbar">

      <div>

        <h2>
          Welcome {user?.name || "User"} 👋
        </h2>

        <p>
          Monitor your wallet and AI insights
        </p>

      </div>

      <div className="navbar-right">

        <input
          type="text"
          placeholder="Search..."
          className="search-box"
        />

        <span className="notification">
          🔔
        </span>

        <div className="profile-circle">

          {user?.initials || "U"}

        </div>

      </div>

    </div>

  );
}

export default Navbar;