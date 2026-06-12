function Navbar() {
  return (
    <div className="dashboard-navbar">

      <div>
        <h2>Welcome Arya 👋</h2>
        <p>Monitor your wallet and AI insights</p>
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
          AP
        </div>

      </div>

    </div>
  );
}

export default Navbar;