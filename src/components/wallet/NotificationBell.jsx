import {
useEffect,
useState
} from "react";

import {

getNotifications,

getUnreadNotifications,

markNotificationRead,

markAllNotificationsRead

}
from "../../services/notificationService";

function NotificationBell() {

const [
notifications,
setNotifications
] = useState([]);

const [


unreadCount,

setUnreadCount


] = useState(0);

const [


open,

setOpen


] = useState(false);

const loadNotifications =
async () => {


  try {

    const allNotifications =
      await getNotifications();

    const unreadNotifications =
      await getUnreadNotifications();

    setNotifications(
      allNotifications
    );

    setUnreadCount(
      unreadNotifications.length
    );

  } catch (error) {

    console.error(error);

  }
};


useEffect(() => {


loadNotifications();


}, []);

const handleNotificationClick =
async (id) => {


  try {

    await markNotificationRead(id);

    await loadNotifications();

  } catch (error) {

    console.error(error);

  }
};


const handleMarkAllRead =
async () => {


  try {

    await markAllNotificationsRead();

    await loadNotifications();

  } catch (error) {

    console.error(error);

  }
};


return (


<div
  className="notification-container"
>

  <button
    className="notification-btn"
    onClick={() =>
      setOpen(!open)
    }
  >

    🔔

    <span
      className="notification-count"
    >

      {unreadCount}

    </span>

  </button>

  {

    open && (

      <div
        className="notification-dropdown"
      >

        <div
          className="notification-header"
        >

          <h3>
            Notifications
          </h3>

          <button
            className="mark-all-btn"
            onClick={
              handleMarkAllRead
            }
          >

            Mark All Read

          </button>

        </div>

        {

          notifications.length === 0

            ? (

              <p>
                No Notifications
              </p>

            )

            : (

              notifications.map(
                notification => (

                  <div

                    key={
                      notification.id
                    }

                    className="notification-item"

                    onClick={() =>
                      handleNotificationClick(
                        notification.id
                      )
                    }

                  >

                    <div
                      className="notification-message"
                    >

                      {
                        notification.message
                      }

                    </div>

                    <div
                      className="notification-time"
                    >

                      {
                        new Date(
                          notification.createdAt
                        ).toLocaleString()
                      }

                    </div>

                  </div>

                )
              )

            )

        }

      </div>

    )

  }

</div>


);
}

export default NotificationBell;
