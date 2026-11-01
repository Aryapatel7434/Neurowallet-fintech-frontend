
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getUnreadNotifications
} from "../../services/notificationService";

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const loadUnreadCount = async () => {
    try {
      const unreadNotifications = await getUnreadNotifications();
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Failed to load unread notifications:", error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const handleBellClick = () => {
    navigate("/notifications");
  };

  return (
    <div className="notification-container">
      <button
        type="button"
        className="notification-btn"
        onClick={handleBellClick}
        aria-label={`Open notifications. ${unreadCount} unread notifications`}
        title="Open Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default NotificationBell;
