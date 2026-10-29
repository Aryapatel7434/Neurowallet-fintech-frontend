
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    FaGaugeHigh,
    FaWallet,
    FaArrowRightArrowLeft,
    FaChartLine,
    FaRobot,
    FaBullseye,
    FaPiggyBank,
    FaCalendarCheck,
    FaBell,
    FaGear,
    FaRightFromBracket,
    FaCrown,
} from "react-icons/fa6";

import { AuthContext } from "../../../context/AuthContext";
import "../../../styles/sidebar.css";
function Sidebar() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const menuItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: FaGaugeHigh,
            end: true,
        },
        {
            label: "Wallet",
            path: "/wallet",
            icon: FaWallet,
        },
        {
            label: "Transactions",
            path: "/transactions",
            icon: FaArrowRightArrowLeft,
        },
        {
            label: "Analytics",
            path: "/analytics",
            icon: FaChartLine,
        },
        {
            label: "AI Insights",
            path: "/ai-insights",
            icon: FaRobot,
            badge: "NEW",
        },
        {
            label: "Goals",
            path: "/goals",
            icon: FaBullseye,
        },
        {
            label: "Budgets",
            path: "/budgets",
            icon: FaPiggyBank,
        },
        {
            label: "Scheduled",
            path: "/scheduled",
            icon: FaCalendarCheck,
        },
        {
            label: "Notifications",
            path: "/notifications",
            icon: FaBell,
            badge: "3",
        },
        {
            label: "Settings",
            path: "/settings",
            icon: FaGear,
        },
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/", { replace: true });
        }
    };

    return (
        <aside className="sidebar nw-sidebar">
            <div className="sidebar-brand nw-sidebar-brand">
                <div className="sidebar-logo nw-sidebar-logo" aria-hidden="true">
                    <span>NW</span>
                </div>

                <div className="sidebar-brand-copy">
                    <h2>NeuroWallet</h2>
                    <span>AI-Powered FinTech</span>
                </div>
            </div>

            <div className="sidebar-section-label">
                WORKSPACE
            </div>

            <nav className="nw-sidebar-nav" aria-label="Main navigation">
                <ul className="sidebar-menu">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `nw-sidebar-link${isActive ? " active" : ""}`
                                    }
                                >
                                    <Icon
                                        className="sidebar-menu-icon"
                                        aria-hidden="true"
                                    />

                                    <span className="nw-sidebar-link-label">
                                        {item.label}
                                    </span>

                                    {item.badge && (
                                        <span
                                            className={`nw-sidebar-badge ${
                                                item.badge === "NEW"
                                                    ? "new"
                                                    : "count"
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}

                    <li className="sidebar-logout-item">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="sidebar-logout nw-sidebar-link"
                        >
                            <FaRightFromBracket
                                className="sidebar-menu-icon"
                                aria-hidden="true"
                            />
                            <span className="nw-sidebar-link-label">
                                Logout
                            </span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="nw-sidebar-spacer" />

            <section className="nw-sidebar-plan" aria-label="Premium plan">
                <div className="nw-sidebar-plan-heading">
                    <span className="nw-sidebar-crown">
                        <FaCrown />
                    </span>

                    <div>
                        <strong>Pro Plan</strong>
                        <span>Premium workspace</span>
                    </div>
                </div>

                <p>
                    Unlock advanced AI insights and higher limits.
                </p>

                <button
                    type="button"
                    className="nw-sidebar-upgrade"
                    onClick={() => navigate("/settings")}
                >
                    Upgrade Now
                </button>
            </section>
        </aside>
    );
}

export default Sidebar;
