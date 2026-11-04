
import { useCallback, useContext, useEffect, useState } from "react";
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
import { getUnreadNotifications } from "../../../services/notificationService";

import "../../../styles/sidebar.css";

const getUnreadCount = (response) => {
    if (Array.isArray(response)) return response.length;
    if (Array.isArray(response?.content)) return response.content.length;
    if (Array.isArray(response?.items)) return response.items.length;
    if (Array.isArray(response?.data)) return response.data.length;

    return 0;
};

function Sidebar() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await getUnreadNotifications();
            setUnreadCount(getUnreadCount(response));
        } catch (error) {
            console.error(
                "Failed to load sidebar notification count:",
                error
            );
        }
    }, []);

    useEffect(() => {
        loadUnreadCount();

        const handleNotificationUpdate = () => {
            loadUnreadCount();
        };

        const handleWindowFocus = () => {
            loadUnreadCount();
        };

        window.addEventListener(
            "neurowallet:notifications-updated",
            handleNotificationUpdate
        );

        window.addEventListener("focus", handleWindowFocus);

        const intervalId = window.setInterval(
            loadUnreadCount,
            30000
        );

        return () => {
            window.removeEventListener(
                "neurowallet:notifications-updated",
                handleNotificationUpdate
            );

            window.removeEventListener("focus", handleWindowFocus);

            window.clearInterval(intervalId);
        };
    }, [loadUnreadCount]);

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
                <div
                    className="sidebar-logo nw-sidebar-logo"
                    aria-hidden="true"
                >
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

            <nav
                className="nw-sidebar-nav"
                aria-label="Main navigation"
            >
                <ul className="sidebar-menu">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        const badgeValue =
                            item.path === "/notifications"
                                ? unreadCount
                                : item.badge;

                        const showBadge =
                            item.path === "/notifications"
                                ? unreadCount > 0
                                : Boolean(item.badge);

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

                                    {showBadge && (
                                        <span
                                            className={`nw-sidebar-badge ${
                                                item.badge === "NEW"
                                                    ? "new"
                                                    : "count"
                                            }`}
                                            aria-label={
                                                item.path === "/notifications"
                                                    ? `${unreadCount} unread notifications`
                                                    : item.badge
                                            }
                                        >
                                            {item.path === "/notifications"
                                                ? unreadCount > 99
                                                    ? "99+"
                                                    : badgeValue
                                                : badgeValue}
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

            <section
                className="nw-sidebar-plan"
                aria-label="Premium plan"
            >
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
