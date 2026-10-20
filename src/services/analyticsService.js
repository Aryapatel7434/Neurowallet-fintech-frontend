import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Retrieves authenticated user's dashboard aggregates.
 * GET /dashboard/insights
 */
export const getDashboardAnalytics = async () => {
    const response = await api.get(
        API_ENDPOINTS.DASHBOARD_INSIGHTS
    );

    return response.data;
};

/**
 * Retrieves authenticated user's transaction analytics.
 * GET /ai/transaction-analytics
 */
export const getTransactionAnalytics = async () => {
    const response = await api.get(
        "/ai/transaction-analytics"
    );

    return response.data;
};

/**
 * Retrieves spending distribution by category.
 * GET /ai/category-spending
 *
 * Expected response:
 * [{ category, amount, percentage }]
 */
export const getCategorySpending = async () => {
    const response = await api.get(
        "/ai/category-spending"
    );

    return response.data;
};

/**
 * Retrieves authenticated user's spending pattern.
 * GET /ai/spending-pattern
 */
export const getSpendingPattern = async () => {
    const response = await api.get(
        "/ai/spending-pattern"
    );

    return response.data;
};

/**
 * Retrieves the unified financial intelligence report.
 * GET /ai/intelligence
 *
 * ApiResponse wraps the report in its `data` field.
 */
export const getFinancialIntelligence = async () => {
    const response = await api.get("/ai/intelligence");

    return response.data?.data ?? null;
};
