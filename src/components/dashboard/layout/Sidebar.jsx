
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FaGaugeHigh,
    FaWallet,
    FaArrowRightArrowLeft,
    FaChartLine,
    FaRobot,
    FaGear,
    FaRightFromBracket,
} from "react-icons/fa6";

import { AuthContext } from "../../../context/AuthContext";

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
        },
        {
            label: "Settings",
            path: "/settings",
            icon: FaGear,
        },
    ];

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo" aria-hidden="true">
                    NW
                </div>
                <div className="sidebar-brand-copy">
                    <h2>NeuroWallet</h2>
                    <span>AI FINANCIAL PLATFORM</span>
                </div>
            </div>

            <div className="sidebar-section-label">
                WORKSPACE
            </div>

            <nav aria-label="Main navigation">
                <ul className="sidebar-menu">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        isActive ? "active" : ""
                                    }
                                >
                                    <Icon
                                        className="sidebar-menu-icon"
                                        aria-hidden="true"
                                    />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}

                    <li className="sidebar-logout-item">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="sidebar-logout"
                        >
                            <FaRightFromBracket
                                className="sidebar-menu-icon"
                                aria-hidden="true"
                            />
                            <span>Logout</span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <span className="sidebar-footer-indicator" />
                <span>Secure financial workspace</span>
            </div>
        </aside>
    );
}

export default Sidebar;
