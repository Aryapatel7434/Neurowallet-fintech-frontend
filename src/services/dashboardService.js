import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
/*
=================================
DASHBOARD INSIGHTS
GET /dashboard/insights
=================================
*/

export const getDashboardInsights = async () => {

    const response = await api.get(
       API_ENDPOINTS.DASHBOARD_INSIGHTS
    );

    return response.data;

};