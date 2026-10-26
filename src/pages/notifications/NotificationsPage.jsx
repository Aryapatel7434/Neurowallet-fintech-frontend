import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationService";

function getNotificationId(notification) {
  return notification?.id ?? notification?.notificationId;
}

function isNotificationRead(notification) {
  return Boolean(notification?.isRead ?? notification?.read ?? false);
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    fallback
  );
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const requestSequence = useRef(0);
  const mounted = useRef(false);

  const loadNotifications = useCallback(async ({ quiet = false } = {}) => {
    const requestId = ++requestSequence.current;
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const data = await getNotifications();
      if (!mounted.current || requestId !== requestSequence.current) return;

      // The API normally returns an array. Accept common paginated response shapes too.
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.items)
            ? data.items
            : null;

      if (!items) {
        throw new Error("The notifications response was not a list.");
      }
      setNotifications(items);
    } catch (loadError) {
      if (!mounted.current || requestId !== requestSequence.current) return;
      setError(
        getErrorMessage(
          loadError,
          "Unable to load notifications. Please try again."
        )
      );
    } finally {
      if (mounted.current && requestId === requestSequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadNotifications();
    return () => {
      mounted.current = false;
      // Invalidate any request that is still in flight when leaving this page.
      requestSequence.current += 1;
    };
  }, [loadNotifications]);

  const handleRead = async (notification) => {
    const id = getNotificationId(notification);
    if (id == null || isNotificationRead(notification) || busyIds.has(id)) return;

    setBusyIds((current) => new Set(current).add(id));
    try {
      await markNotificationRead(id);
      if (!mounted.current) return;
      setNotifications((current) =>
        current.map((item) =>
          getNotificationId(item) === id
            ? { ...item, isRead: true, read: true }
            : item
        )
      );
    } catch (readError) {
      toast.error(
        getErrorMessage(readError, "Unable to mark this notification as read.")
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

  const handleMarkAll = async () => {
    const hasUnread = notifications.some((item) => !isNotificationRead(item));
    if (!hasUnread || markingAll) return;

    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      if (!mounted.current) return;
      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true, read: true }))
      );
      toast.success("All notifications marked as read.");
    } catch (markAllError) {
      toast.error(
        getErrorMessage(
          markAllError,
          "Unable to mark all notifications as read. Please try again."
        )
      );
    } finally {
      if (mounted.current) setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !isNotificationRead(notification)
  ).length;

  return (
    <section className="notifications-page" aria-busy={loading || markingAll}>
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          {!loading && (
            <p aria-live="polite">
              {unreadCount === 0
                ? "You're all caught up."
                : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
            </p>
          )}
        </div>
        <div className="notifications-actions">
          <button
            type="button"
            className="mark-all-btn"
            onClick={handleMarkAll}
            disabled={loading || markingAll || unreadCount === 0}
          >
            {markingAll ? "Marking…" : "Mark All Read"}
          </button>
          <button
            type="button"
            className="mark-all-btn"
            onClick={() => loadNotifications({ quiet: true })}
            disabled={loading || refreshing}
            aria-label="Refresh notifications"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="notifications-state" role="status">
          Loading notifications…
        </div>
      )}

      {!loading && error && (
        <div className="notifications-state notifications-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => loadNotifications()}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="notifications-state" role="status">
          <h2>No notifications yet</h2>
          <p>Updates about your wallet and transactions will appear here.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map((notification, index) => {
            const id = getNotificationId(notification);
            const read = isNotificationRead(notification);
            const busy = busyIds.has(id);
            const createdAt = notification.createdAt ?? notification.created_at;
            const parsedDate = createdAt ? new Date(createdAt) : null;
            const dateLabel = parsedDate && !Number.isNaN(parsedDate.getTime())
              ? parsedDate.toLocaleString()
              : "Date unavailable";

            return (
              <article
                key={id ?? `${createdAt ?? "notification"}-${index}`}
                className={`notification-card ${read ? "is-read" : "is-unread"}`}
              >
                <div className="notification-card-content">
                  <h3>{notification.message ?? notification.title ?? "Notification"}</h3>
                  <p>{dateLabel}</p>
                </div>
                {!read && (
                  <button
                    type="button"
                    className="notification-read-btn"
                    onClick={() => handleRead(notification)}
                    disabled={busy || id == null}
                    aria-label={`Mark notification as read: ${notification.message ?? notification.title ?? "Notification"}`}
                  >
                    {busy ? "Saving…" : "Mark read"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default NotificationsPage;