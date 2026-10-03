import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=================================================
GET ALL NOTIFICATIONS
GET /notifications
=================================================
*/

export const getNotifications = async () => {

    const response =
        await api.get(
            API_ENDPOINTS.NOTIFICATIONS
        );

    return response.data;
};


/*
=================================================
GET UNREAD NOTIFICATIONS
GET /notifications/unread
=================================================
*/

export const getUnreadNotifications = async () => {

    const response =
        await api.get(
            API_ENDPOINTS.UNREAD_NOTIFICATIONS
        );

    return response.data;
};


/*
=================================================
MARK NOTIFICATION AS READ
PUT /notifications/{id}/read
=================================================
*/

export const markNotificationRead = async (
    id
) => {

    const response =
        await api.put(
            API_ENDPOINTS.MARK_NOTIFICATION_READ(id)
        );

    return response.data;
};


/*
=================================================
MARK ALL NOTIFICATIONS AS READ
PUT /notifications/read-all
=================================================
*/

export const markAllNotificationsRead =
    async () => {

        const response =
            await api.put(
                API_ENDPOINTS
                    .MARK_ALL_NOTIFICATIONS_READ
            );

        return response.data;
    };