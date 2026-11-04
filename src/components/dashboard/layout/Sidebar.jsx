
import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

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
} from "react-icons/fa6";

import { AuthContext } from "../../../context/AuthContext";
import { getUnreadNotifications } from "../../../services/notificationService";

import "../../../styles/sidebar.css";

/* ============================================================
   UNREAD NOTIFICATION COUNT
============================================================ */

const getUnreadCount = (response) => {
    if (Array.isArray(response)) return response.length;
    if (Array.isArray(response?.content)) return response.content.length;
    if (Array.isArray(response?.items)) return response.items.length;
    if (Array.isArray(response?.data)) return response.data.length;

    return 0;
};

/* ============================================================
   SIDEBAR COMPONENT
============================================================ */

function Sidebar() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const [unreadCount, setUnreadCount] = useState(0);

    /* ========================================================
       LOAD UNREAD NOTIFICATIONS
    ======================================================== */

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

    /* ========================================================
       NOTIFICATION SYNCHRONIZATION
    ======================================================== */

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

        window.addEventListener(
            "focus",
            handleWindowFocus
        );

        const intervalId = window.setInterval(
            loadUnreadCount,
            30000
        );

        return () => {
            window.removeEventListener(
                "neurowallet:notifications-updated",
                handleNotificationUpdate
            );

            window.removeEventListener(
                "focus",
                handleWindowFocus
            );

            window.clearInterval(intervalId);
        };
    }, [loadUnreadCount]);

    /* ========================================================
       SIDEBAR NAVIGATION ITEMS
    ======================================================== */

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

    /* ========================================================
       SECURE LOGOUT
    ======================================================== */

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/", { replace: true });
        }
    };

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <aside className="sidebar nw-sidebar">

            {/* BRAND */}
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

            {/* SECTION LABEL */}
            <div className="sidebar-section-label">
                WORKSPACE
            </div>

            {/* NAVIGATION */}
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
                                        `nw-sidebar-link${
                                            isActive ? " active" : ""
                                        }`
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

                    {/* LOGOUT */}
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

            {/* FLEXIBLE SIDEBAR SPACE */}
            <div className="nw-sidebar-spacer" />

        </aside>
    );
}

export default Sidebar;
