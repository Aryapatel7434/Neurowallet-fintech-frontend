import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    FaBell,
    FaChevronDown,
    FaMagnifyingGlass,
    FaCircle,
    FaArrowRightFromBracket,
    FaUser,
    FaWallet,
    FaXmark,
} from "react-icons/fa6";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import { AuthContext } from "../../../context/AuthContext";
import { getUnreadNotifications } from "../../../services/notificationService";

import "./Navbar.css";

const REFRESH_INTERVAL = 60_000;

const PERIOD_OPTIONS = [
    { value: "Today", label: "Today" },
    { value: "This Week", label: "This Week" },
    { value: "This Month", label: "This Month" },
    { value: "This Year", label: "This Year" },
];

function getInitials(user, displayName) {
    if (user?.initials) {
        return user.initials;
    }

    return (
        displayName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase() || "U"
    );
}

function getUnreadCount(response) {
    // Support common API response envelopes without assuming
    // one particular notification DTO structure.
    const payload = response?.data ?? response;

    if (typeof payload === "number") {
        return Math.max(0, payload);
    }

    if (Array.isArray(payload)) {
        return payload.length;
    }

    if (payload && typeof payload === "object") {
        const count =
            payload.unreadCount ??
            payload.count ??
            payload.totalElements;

        if (Number.isFinite(Number(count))) {
            return Math.max(0, Number(count));
        }

        const notifications =
            payload.notifications ??
            payload.content ??
            payload.items;

        if (Array.isArray(notifications)) {
            return notifications.length;
        }
    }

    return null;
}

function Navbar() {
    const {
        user,
        logout,
        isAuthenticated,
        isInitializing,
        sessionRestoreError,
    } = useContext(AuthContext);

    const navigate = useNavigate();
    const location = useLocation();

    const [search, setSearch] = useState("");
    const [period, setPeriod] = useState("Today");

    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(null);
    const [notificationError, setNotificationError] = useState(false);

    const searchRef = useRef(null);
    const profileRef = useRef(null);

    const displayName =
        user?.name ||
        user?.fullName ||
        user?.email?.split("@")[0] ||
        "User";

    const initials = getInitials(user, displayName);

    const roleLabel = user?.role
        ? user.role.replace(/^ROLE_/, "").toLowerCase()
        : "Account";

    const loadUnreadNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setUnreadCount(null);
            return;
        }

        setNotificationLoading(true);

        try {
            const response = await getUnreadNotifications();
            const count = getUnreadCount(response);

            setUnreadCount(count);
            setNotificationError(count === null);
        } catch {
            // Do not display a fabricated notification count.
            setNotificationError(true);
        } finally {
            setNotificationLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch the real unread count and refresh periodically.
    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadCount(null);
            return undefined;
        }

        loadUnreadNotifications();

        const intervalId = window.setInterval(
            loadUnreadNotifications,
            REFRESH_INTERVAL
        );

        return () => window.clearInterval(intervalId);
    }, [isAuthenticated, loadUnreadNotifications]);

    // Refresh when the user returns to this browser tab.
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadUnreadNotifications();
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [loadUnreadNotifications]);

    // Close the profile menu when clicking outside it.
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    // Ctrl+K / Cmd+K focuses global search.
    useEffect(() => {
        const handleShortcut = (event) => {
            const isSearchShortcut =
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k";

            if (!isSearchShortcut) return;

            event.preventDefault();
            searchRef.current?.focus();
        };

        window.addEventListener("keydown", handleShortcut);

        return () => {
            window.removeEventListener("keydown", handleShortcut);
        };
    }, []);

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        const query = search.trim();

        if (!query) return;

        // Shared event contract for dashboard/search consumers.
        window.dispatchEvent(
            new CustomEvent("neurowallet:dashboard-search", {
                detail: { query },
            })
        );
    };

    const handlePeriodChange = (event) => {
        const nextPeriod = event.target.value;

        setPeriod(nextPeriod);

        // Allows dashboard widgets to respond to the selected range.
        window.dispatchEvent(
            new CustomEvent("neurowallet:dashboard-period-change", {
                detail: { period: nextPeriod },
            })
        );
    };

    const handleNotificationsClick = () => {
        navigate("/notifications");
    };

    const handleProfileToggle = () => {
        setProfileOpen((current) => !current);
    };

    const handleLogout = () => {
        setProfileOpen(false);

        if (typeof logout === "function") {
            logout();
        }

        navigate("/", { replace: true });
    };

    const handleWalletNavigation = () => {
        setProfileOpen(false);
        navigate("/wallet");
    };

    const handleDashboardNavigation = () => {
        setProfileOpen(false);
        navigate("/dashboard");
    };

    const isSessionActive =
        Boolean(isAuthenticated) && !sessionRestoreError;

    const sessionLabel = isInitializing
        ? "Verifying session"
        : sessionRestoreError
            ? "Session check failed"
            : isSessionActive
                ? "Session active"
                : "Signed out";

    return (
        <header className="dashboard-navbar nw-navbar">
            {/* SEARCH */}
            <form
                className="navbar-left nw-navbar-search"
                role="search"
                onSubmit={handleSearchSubmit}
            >
                <FaMagnifyingGlass
                    className="search-icon"
                    aria-hidden="true"
                />

                <input
                    ref={searchRef}
                    type="search"
                    placeholder="Search transactions, contacts, insights..."
                    className="search-box"
                    aria-label="Search NeuroWallet"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                {search && (
                    <button
                        type="button"
                        className="nw-search-clear"
                        aria-label="Clear search"
                        onClick={() => {
                            setSearch("");
                            searchRef.current?.focus();
                        }}
                    >
                        <FaXmark />
                    </button>
                )}

                <kbd className="nw-search-shortcut" aria-hidden="true">
                    Ctrl + K
                </kbd>
            </form>

            {/* NAVBAR ACTIONS */}
            <div className="navbar-right nw-navbar-actions">
                {/* PERIOD */}
                <label className="nw-period-control">
                    <span className="sr-only">
                        Dashboard reporting period
                    </span>

                    <select
                        className="dashboard-filter"
                        value={period}
                        onChange={handlePeriodChange}
                        aria-label="Dashboard reporting period"
                    >
                        {PERIOD_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                {/* AUTHENTICATION STATUS */}
                <div
                    className={`nw-session-status ${
                        isSessionActive
                            ? "is-active"
                            : sessionRestoreError
                                ? "has-error"
                                : "is-inactive"
                    }`}
                    role="status"
                    title={sessionLabel}
                >
                    <FaCircle
                        className="nw-session-dot"
                        aria-hidden="true"
                    />

                    <span>{sessionLabel}</span>
                </div>

                {/* NOTIFICATIONS */}
                <button
                    type="button"
                    className="notification-btn nw-notification-btn"
                    onClick={handleNotificationsClick}
                    aria-label={
                        unreadCount === null
                            ? "Open notifications"
                            : `Open notifications, ${unreadCount} unread`
                    }
                    title="Notifications"
                >
                    <FaBell aria-hidden="true" />

                    {notificationLoading && unreadCount === null ? (
                        <span className="nw-notification-loading" />
                    ) : unreadCount > 0 ? (
                        <span className="notification-count">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    ) : notificationError ? (
                        <span
                            className="nw-notification-indicator"
                            aria-label="Notification count unavailable"
                        />
                    ) : null}
                </button>

                {/* PROFILE */}
                <div
                    className="nw-profile-wrapper"
                    ref={profileRef}
                >
                    <button
                        type="button"
                        className="profile-card"
                        aria-expanded={profileOpen}
                        aria-haspopup="menu"
                        onClick={handleProfileToggle}
                    >
                        <span className="profile-avatar">
                            {initials}
                        </span>

                        <span className="profile-info">
                            <span className="profile-name">
                                {displayName}
                            </span>

                            <span className="profile-role">
                                {roleLabel}
                            </span>
                        </span>

                        <FaChevronDown
                            className={`profile-arrow ${
                                profileOpen ? "is-open" : ""
                            }`}
                            aria-hidden="true"
                        />
                    </button>

                    {profileOpen && (
                        <div
                            className="nw-profile-menu"
                            role="menu"
                        >
                            <div className="nw-profile-menu-user">
                                <span className="nw-profile-menu-avatar">
                                    {initials}
                                </span>

                                <span className="nw-profile-menu-user-info">
                                    <strong>{displayName}</strong>
                                    <small>{user?.email || ""}</small>
                                </span>
                            </div>

                            <div className="nw-profile-menu-divider" />

                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleDashboardNavigation}
                            >
                                <FaUser aria-hidden="true" />
                                <span>Dashboard</span>
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleWalletNavigation}
                            >
                                <FaWallet aria-hidden="true" />
                                <span>My wallet</span>
                            </button>

                            <div className="nw-profile-menu-divider" />

                            <button
                                type="button"
                                role="menuitem"
                                className="nw-logout-action"
                                onClick={handleLogout}
                            >
                                <FaArrowRightFromBracket aria-hidden="true" />
                                <span>Sign out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;