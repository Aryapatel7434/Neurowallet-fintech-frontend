
import {
  useEffect,
  useState
} from "react";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
}
from "../../services/notificationService";

function NotificationsPage() {

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const loadNotifications =
    async () => {

      try {

        const data =
          await getNotifications();

        setNotifications(
          data
        );

      } catch (error) {

        console.error(error);

      }
    };

  useEffect(() => {

    loadNotifications();

  }, []);

  const handleRead =
    async (id) => {

      await markNotificationRead(
        id
      );

      loadNotifications();
    };

  const handleMarkAll =
    async () => {

      await markAllNotificationsRead();

      loadNotifications();
    };

  return (

    <div
      className="notifications-page"
    >

      <div
        className="notifications-header"
      >

        <h1>
          Notifications
        </h1>

        <button
          className="mark-all-btn"
          onClick={
            handleMarkAll
          }
        >
          Mark All Read
        </button>

      </div>

      {

        notifications.map(
          notification => (

            <div
              key={
                notification.id
              }
              className="notification-card"
              onClick={() =>
                handleRead(
                  notification.id
                )
              }
            >

              <h3>
                {
                  notification.message
                }
              </h3>

              <p>

                {
                  new Date(
                    notification.createdAt
                  ).toLocaleString()
                }

              </p>

            </div>

          )
        )

      }

    </div>

  );

}

export default NotificationsPage;