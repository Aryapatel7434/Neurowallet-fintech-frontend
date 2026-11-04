
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Builds optional date query parameters.
 * Empty values are omitted to preserve all-time behavior.
 */
const buildDateParams = (filters = {}) => {
    const params = {};

    if (filters.fromDate) {
        params.fromDate = filters.fromDate;
    }

    if (filters.toDate) {
        params.toDate = filters.toDate;
    }

    return params;
};

/**
 * Retrieves authenticated user's dashboard analytics.
 *
 * GET /dashboard/insights
 * Supports optional date filtering.
 */
export const getDashboardAnalytics = async (filters = {}) => {
    const response = await api.get(
        API_ENDPOINTS.DASHBOARD_INSIGHTS,
        {
            params: buildDateParams(filters),
        }
    );

    return response.data;
};

/**
 * Retrieves transaction analytics.
 *
 * GET /ai/transaction-analytics
 */
export const getTransactionAnalytics = async (filters = {}) => {
    const response = await api.get(
        API_ENDPOINTS.TRANSACTION_ANALYTICS,
        {
            params: buildDateParams(filters),
        }
    );

    return response.data;
};

/**
 * Retrieves spending distribution by category.
 *
 * GET /ai/category-spending
 */
export const getCategorySpending = async (filters = {}) => {
    const response = await api.get(
        API_ENDPOINTS.CATEGORY_SPENDING,
        {
            params: buildDateParams(filters),
        }
    );

    return response.data;
};

/**
 * Retrieves spending pattern analytics.
 *
 * GET /ai/spending-pattern
 */
export const getSpendingPattern = async (filters = {}) => {
    const response = await api.get(
        API_ENDPOINTS.SPENDING_PATTERN,
        {
            params: buildDateParams(filters),
        }
    );

    return response.data;
};

/**
 * Retrieves the unified financial intelligence report.
 *
 * GET /ai/intelligence
 *
 * ApiResponse wraps the report in its data field.
 */
export const getFinancialIntelligence = async () => {
    const response = await api.get("/ai/intelligence");

    return response.data?.data ?? null;
};
