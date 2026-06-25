import { useContext } from "react";

import {
  FaBell,
  FaChevronDown,
  FaMagnifyingGlass,
  FaCircle
} from "react-icons/fa6";

import { AuthContext } from "../../../context/AuthContext";

function Navbar() {

  const { user } = useContext(AuthContext);

  return (

    <header className="dashboard-navbar">

      {/* =========================
            LEFT
      ========================== */}

      <div className="navbar-left">

        <div className="search-wrapper">

          <FaMagnifyingGlass
            className="search-icon"
          />

          <input
            type="text"
            placeholder="Search..."
            className="search-box"
          />

        </div>

      </div>

      {/* =========================
            RIGHT
      ========================== */}

      <div className="navbar-right">

        {/* Dashboard Filter */}

        <select
          className="dashboard-filter"
        >

          <option>Today</option>

          <option>This Week</option>

          <option>This Month</option>

          <option>This Year</option>

        </select>

        {/* Backend Status */}

        <div className="backend-status">

          <FaCircle
            className="backend-dot"
          />

          <span>

            Connected

          </span>

        </div>

        {/* Notification */}

        <button
          className="notification-btn"
        >

          <FaBell />

          <span
            className="notification-count"
          >

            3

          </span>

        </button>

        {/* Profile */}

        <div className="profile-card">

          <div className="profile-avatar">

            {user?.initials || "AP"}

          </div>
           <div className="profile-info">
    <span className="profile-name">
        {user?.name || "Arya"}
    </span>
</div>
          
          <FaChevronDown
            className="profile-arrow"
          />

        </div>

      </div>

    </header>

  );

}

export default Navbar;