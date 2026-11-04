
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { toast } from "react-toastify";

import {
    FaBell,
    FaCheck,
    FaCheckDouble,
    FaClock,
    FaMagnifyingGlass,
    FaRotate,
    FaInbox,
    FaCircle,
    FaArrowRight,
} from "react-icons/fa6";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../../services/notificationService";

import "./NotificationsPage.css";

// =====================================================
// CONSTANTS
// =====================================================

const FILTERS = ["ALL", "UNREAD", "READ"];

const NOTIFICATION_UPDATE_EVENT =
    "neurowallet:notifications-updated";

// =====================================================
// HELPERS
// =====================================================

const getNotificationId = (notification) =>
    notification?.id ?? notification?.notificationId;

const isNotificationRead = (notification) =>
    notification?.isRead === true ||
    notification?.read === true;

const getNotificationMessage = (notification) =>
    String(
        notification?.message ??
        notification?.title ??
        "Notification"
    );

const getNotificationDate = (notification) =>
    notification?.createdAt ??
    notification?.created_at ??
    null;

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback;

const getNotificationsFromResponse = (data) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    throw new Error(
        "Unexpected notifications response format."
    );
};

const notifyNotificationUpdate = () => {
    window.dispatchEvent(
        new Event(NOTIFICATION_UPDATE_EVENT)
    );
};

const formatRelativeTime = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    const difference = Date.now() - date.getTime();

    if (difference < 0) {
        return formatFullDate(value);
    }

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatFullDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

// =====================================================
// METRIC CARD
// =====================================================

function NotificationMetric({
    icon: Icon,
    label,
    value,
    variant,
}) {
    return (
        <article
            className={`notification-metric ${variant || ""}`}
        >
            <div className="notification-metric-top">
                <span>{label}</span>

                <span className="notification-metric-icon">
                    <Icon />
                </span>
            </div>

            <strong>{value}</strong>

            <small>
                {label === "Unread"
                    ? "Needs your attention"
                    : "In your notification center"}
            </small>
        </article>
    );
}

// =====================================================
// MAIN NOTIFICATIONS PAGE
// =====================================================

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [activeFilter, setActiveFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const [busyIds, setBusyIds] = useState(
        () => new Set()
    );

    const [markingAll, setMarkingAll] = useState(false);

    const requestSequence = useRef(0);
    const mounted = useRef(false);

    // =================================================
    // LOAD NOTIFICATIONS
    // =================================================

    const loadNotifications = useCallback(
        async ({ quiet = false } = {}) => {
            const requestId = ++requestSequence.current;

            if (quiet) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            try {
                const response = await getNotifications();

                const items =
                    getNotificationsFromResponse(response);

                if (
                    !mounted.current ||
                    requestId !== requestSequence.current
                ) {
                    return;
                }

                setNotifications(items);
            } catch (loadError) {
                if (
                    !mounted.current ||
                    requestId !== requestSequence.current
                ) {
                    return;
                }

                setError(
                    getErrorMessage(
                        loadError,
                        "Unable to load your notifications."
                    )
                );
            } finally {
                if (
                    mounted.current &&
                    requestId === requestSequence.current
                ) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        []
    );

    // =================================================
    // INITIAL LOAD AND CLEANUP
    // =================================================

    useEffect(() => {
        mounted.current = true;

        loadNotifications();

        return () => {
            mounted.current = false;
            requestSequence.current += 1;
        };
    }, [loadNotifications]);

    // =================================================
    // METRICS
    // =================================================

    const unreadCount = useMemo(
        () =>
            notifications.filter(
                (item) => !isNotificationRead(item)
            ).length,
        [notifications]
    );

    const readCount =
        notifications.length - unreadCount;

    const recentCount = useMemo(() => {
        const cutoff =
            Date.now() - 7 * 24 * 60 * 60 * 1000;

        return notifications.filter((item) => {
            const value = getNotificationDate(item);

            if (!value) return false;

            const date = new Date(value);

            return (
                !Number.isNaN(date.getTime()) &&
                date.getTime() >= cutoff
            );
        }).length;
    }, [notifications]);

    // =================================================
    // SEARCH AND FILTER
    // =================================================

    const filteredNotifications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return notifications.filter((item) => {
            const read = isNotificationRead(item);

            const matchesFilter =
                activeFilter === "ALL" ||
                (activeFilter === "READ" && read) ||
                (activeFilter === "UNREAD" && !read);

            const matchesSearch =
                !query ||
                getNotificationMessage(item)
                    .toLowerCase()
                    .includes(query);

            return matchesFilter && matchesSearch;
        });
    }, [
        notifications,
        activeFilter,
        search,
    ]);

    // =================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =================================================

    const handleRead = async (notification) => {
        const id = getNotificationId(notification);

        if (
            id == null ||
            isNotificationRead(notification) ||
            busyIds.has(id)
        ) {
            return;
        }

        setBusyIds((current) => {
            const next = new Set(current);
            next.add(id);
            return next;
        });

        try {
            await markNotificationRead(id);

            if (!mounted.current) return;

            setNotifications((current) =>
                current.map((item) =>
                    getNotificationId(item) === id
                        ? {
                            ...item,
                            isRead: true,
                            read: true,
                        }
                        : item
                )
            );

            // Synchronize sidebar unread badge.
            notifyNotificationUpdate();

            toast.success(
                "Notification marked as read."
            );
        } catch (readError) {
            toast.error(
                getErrorMessage(
                    readError,
                    "Unable to update this notification."
                )
            );
        } finally {
            if (mounted.current) {
                setBusyIds((current) => {
                    const next = new Set(current);
                    next.delete(id);
                    return next;
                });
            }
        }
    };

    // =================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =================================================

    const handleMarkAll = async () => {
        if (unreadCount === 0 || markingAll) {
            return;
        }

        setMarkingAll(true);

        try {
            await markAllNotificationsRead();

            if (!mounted.current) return;

            setNotifications((current) =>
                current.map((item) => ({
                    ...item,
                    isRead: true,
                    read: true,
                }))
            );

            // Synchronize sidebar unread badge.
            notifyNotificationUpdate();

            toast.success(
                "All notifications marked as read."
            );
        } catch (markError) {
            toast.error(
                getErrorMessage(
                    markError,
                    "Unable to mark all notifications as read."
                )
            );
        } finally {
            if (mounted.current) {
                setMarkingAll(false);
            }
        }
    };

    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh = () => {
        loadNotifications({ quiet: true });
    };

    // =================================================
    // CLEAR FILTERS
    // =================================================

    const handleClearFilters = () => {
        setSearch("");
        setActiveFilter("ALL");
    };

    // =================================================
    // RENDER
    // =================================================

    return (
        <main
            className="notifications-page"
            aria-busy={loading || markingAll}
        >
            {/* PAGE HEADER */}

            <header className="notifications-page-header">
                <div className="notifications-heading-content">

                    <div className="notifications-breadcrumb">
                        <span>NEUROWALLET</span>
                        <FaArrowRight />
                        <span>ACTIVITY CENTER</span>
                    </div>

                    <div className="notifications-title-row">

                        <span className="notifications-title-icon">
                            <FaBell />
                        </span>

                        <div>
                            <h1>Notifications</h1>

                            <p>
                                Stay informed about your wallet activity
                                and important account updates.
                            </p>
                        </div>

                    </div>
                </div>

                <div className="notifications-header-actions">

                    <button
                        type="button"
                        className="notification-action-btn notification-refresh-btn"
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                    >
                        <FaRotate
                            className={
                                refreshing
                                    ? "notification-spinning"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing"
                            : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="notification-action-btn notification-mark-all-btn"
                        onClick={handleMarkAll}
                        disabled={
                            loading ||
                            markingAll ||
                            unreadCount === 0
                        }
                    >
                        <FaCheckDouble />

                        {markingAll
                            ? "Updating..."
                            : "Mark all as read"}
                    </button>

                </div>
            </header>

            {/* OVERVIEW METRICS */}

            <section className="notifications-overview">

                <NotificationMetric
                    icon={FaInbox}
                    label="Total notifications"
                    value={notifications.length}
                    variant="blue"
                />

                <NotificationMetric
                    icon={FaBell}
                    label="Unread"
                    value={unreadCount}
                    variant="orange"
                />

                <NotificationMetric
                    icon={FaCheck}
                    label="Read"
                    value={readCount}
                    variant="green"
                />

                <NotificationMetric
                    icon={FaClock}
                    label="Last 7 days"
                    value={recentCount}
                    variant="purple"
                />

            </section>

            {/* NOTIFICATION FEED */}

            <section className="notifications-feed-panel">

                <div className="notifications-feed-heading">

                    <div>
                        <span className="notifications-eyebrow">
                            YOUR ACTIVITY
                        </span>

                        <h2>Notification feed</h2>

                        <p>
                            Review your latest account and wallet updates.
                        </p>
                    </div>

                    <span className="notifications-feed-count">
                        {filteredNotifications.length} shown
                    </span>

                </div>

                {/* TOOLBAR */}

                <div className="notifications-toolbar">

                    <div className="notifications-search">

                        <FaMagnifyingGlass />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search notifications..."
                            aria-label="Search notifications"
                        />

                    </div>

                    <div
                        className="notifications-filter-group"
                        role="group"
                        aria-label="Filter notifications"
                    >

                        {FILTERS.map((filter) => (

                            <button
                                key={filter}
                                type="button"
                                className={
                                    activeFilter === filter
                                        ? "notification-filter active"
                                        : "notification-filter"
                                }
                                onClick={() =>
                                    setActiveFilter(filter)
                                }
                                aria-pressed={
                                    activeFilter === filter
                                }
                            >

                                {filter === "ALL"
                                    ? "All"
                                    : filter === "UNREAD"
                                        ? "Unread"
                                        : "Read"}

                                {filter === "UNREAD" &&
                                    unreadCount > 0 && (
                                        <span>
                                            {unreadCount}
                                        </span>
                                    )}

                            </button>

                        ))}

                    </div>

                </div>

                {/* LOADING STATE */}

                {loading && (

                    <div className="notifications-loading">

                        {[1, 2, 3, 4].map((item) => (

                            <div
                                className="notification-skeleton"
                                key={item}
                            >
                                <span />

                                <div>
                                    <i />
                                    <i />
                                </div>

                            </div>

                        ))}

                        <span className="notifications-loading-label">
                            Loading your notifications...
                        </span>

                    </div>

                )}

                {/* ERROR STATE */}

                {!loading && error && (

                    <div className="notifications-state notifications-error-state">

                        <span className="notifications-state-icon">
                            <FaBell />
                        </span>

                        <h3>
                            We couldn't load your notifications
                        </h3>

                        <p>{error}</p>

                        <button
                            type="button"
                            className="notification-action-btn notification-mark-all-btn"
                            onClick={() => loadNotifications()}
                        >
                            <FaRotate />
                            Try again
                        </button>

                    </div>

                )}

                {/* EMPTY STATE */}

                {!loading &&
                    !error &&
                    notifications.length === 0 && (

                        <div className="notifications-state">

                            <span className="notifications-state-icon">
                                <FaInbox />
                            </span>

                            <h3>You're all caught up</h3>

                            <p>
                                New wallet and account notifications
                                will appear here when available.
                            </p>

                        </div>

                    )}

                {/* NO SEARCH RESULTS */}

                {!loading &&
                    !error &&
                    notifications.length > 0 &&
                    filteredNotifications.length === 0 && (

                        <div className="notifications-state">

                            <span className="notifications-state-icon">
                                <FaMagnifyingGlass />
                            </span>

                            <h3>No matching notifications</h3>

                            <p>
                                Try another search term or change
                                the selected filter.
                            </p>

                            <button
                                type="button"
                                className="notification-clear-filter"
                                onClick={handleClearFilters}
                            >
                                Clear filters
                            </button>

                        </div>

                    )}

                {/* NOTIFICATION LIST */}

                {!loading &&
                    !error &&
                    filteredNotifications.length > 0 && (

                        <div className="notifications-list">

                            {filteredNotifications.map(
                                (notification, index) => {

                                    const id =
                                        getNotificationId(notification);

                                    const read =
                                        isNotificationRead(notification);

                                    const message =
                                        getNotificationMessage(notification);

                                    const createdAt =
                                        getNotificationDate(notification);

                                    const busy =
                                        busyIds.has(id);

                                    return (

                                        <article
                                            key={
                                                id ??
                                                `${createdAt ?? "notification"}-${index}`
                                            }
                                            className={
                                                `notification-item ${
                                                    read ? "read" : "unread"
                                                }`
                                            }
                                        >

                                            <div
                                                className={
                                                    `notification-item-icon ${
                                                        read ? "read" : "unread"
                                                    }`
                                                }
                                            >
                                                {read
                                                    ? <FaCheck />
                                                    : <FaBell />}
                                            </div>

                                            <div className="notification-item-body">

                                                <div className="notification-item-topline">

                                                    <div className="notification-item-title">

                                                        {!read && (
                                                            <FaCircle
                                                                className="notification-unread-dot"
                                                            />
                                                        )}

                                                        <h3>{message}</h3>

                                                    </div>

                                                    <time
                                                        dateTime={
                                                            createdAt || undefined
                                                        }
                                                        title={formatFullDate(
                                                            createdAt
                                                        )}
                                                    >
                                                        {formatRelativeTime(
                                                            createdAt
                                                        )}
                                                    </time>

                                                </div>

                                                <div className="notification-item-meta">

                                                    <span>
                                                        {read
                                                            ? "Read"
                                                            : "Unread"}
                                                    </span>

                                                    <span className="notification-meta-separator" />

                                                    <span>
                                                        {formatFullDate(
                                                            createdAt
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                            {!read && (

                                                <button
                                                    type="button"
                                                    className="notification-item-read-btn"
                                                    onClick={() =>
                                                        handleRead(notification)
                                                    }
                                                    disabled={
                                                        busy || id == null
                                                    }
                                                    aria-label={
                                                        `Mark as read: ${message}`
                                                    }
                                                >
                                                    <FaCheck />

                                                    {busy
                                                        ? "Saving..."
                                                        : "Mark read"}

                                                </button>

                                            )}

                                        </article>

                                    );
                                }
                            )}

                        </div>

                    )}

                {/* FEED FOOTER */}

                {!loading &&
                    !error &&
                    notifications.length > 0 && (

                        <footer className="notifications-feed-footer">

                            <span>
                                Showing {filteredNotifications.length} of{" "}
                                {notifications.length} notifications
                            </span>

                            <span>
                                <FaCheckDouble />
                                Read status is synced with your account
                            </span>

                        </footer>

                    )}

            </section>

        </main>
    );
}

export default NotificationsPage;
