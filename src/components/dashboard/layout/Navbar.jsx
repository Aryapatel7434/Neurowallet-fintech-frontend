
import { useContext, useState } from "react";

import {
    FaBell,
    FaChevronDown,
    FaMagnifyingGlass,
    FaCircle,
} from "react-icons/fa6";

import { AuthContext } from "../../../context/AuthContext";

import "./Navbar.css";

function Navbar() {
    const { user } = useContext(AuthContext);
    const [search, setSearch] = useState("");
    const [period, setPeriod] = useState("Today");
    const [profileOpen, setProfileOpen] = useState(false);

    const displayName = user?.name || user?.fullName || "User";

    const initials =
        user?.initials ||
        displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        const query = search.trim();

        if (!query) return;

        // Keep the search field controlled without inventing
        // a global search API that the application may not have.
        window.dispatchEvent(
            new CustomEvent("neurowallet:dashboard-search", {
                detail: { query },
            })
        );
    };

    return (
        <header className="dashboard-navbar nw-navbar">
            <form
                className="navbar-left nw-navbar-search"
                role="search"
                onSubmit={handleSearchSubmit}
            >
                <FaMagnifyingGlass className="search-icon" />

                <input
                    type="search"
                    placeholder="Search transactions, contacts, insights..."
                    className="search-box"
                    aria-label="Search dashboard"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <span className="nw-search-shortcut" aria-hidden="true">
                    Ctrl + K
                </span>
            </form>

            <div className="navbar-right nw-navbar-actions">
                <label className="nw-period-control">
                    <span className="sr-only">Dashboard period</span>

                    <select
                        className="dashboard-filter"
                        value={period}
                        onChange={(event) => setPeriod(event.target.value)}
                    >
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                        <option value="This Year">This Year</option>
                    </select>
                </label>

                <div
                    className="backend-status"
                    title="Backend connection indicator"
                >
                    <FaCircle className="backend-dot" />
                    <span>Connected</span>
                </div>

                <button
                    type="button"
                    className="notification-btn"
                    aria-label="Notifications: 3 unread"
                >
                    <FaBell />
                    <span className="notification-count">3</span>
                </button>

                <div className="nw-profile-wrapper">
                    <button
                        type="button"
                        className="profile-card"
                        aria-expanded={profileOpen}
                        onClick={() => setProfileOpen((open) => !open)}
                    >
                        <span className="profile-avatar">
                            {initials || "U"}
                        </span>

                        <span className="profile-info">
                            <span className="profile-name">
                                {displayName}
                            </span>

                            <span className="profile-role">
                                Premium User
                            </span>
                        </span>

                        <FaChevronDown
                            className={`profile-arrow ${
                                profileOpen ? "is-open" : ""
                            }`}
                        />
                    </button>

                    {profileOpen && (
                        <div className="nw-profile-menu">
                            <div className="nw-profile-menu-heading">
                                {displayName}
                            </div>

                            <button
                                type="button"
                                onClick={() => setProfileOpen(false)}
                            >
                                Close menu
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
