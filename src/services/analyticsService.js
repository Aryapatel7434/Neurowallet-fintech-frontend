
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Builds query parameters for analytics date filtering.
 *
 * Empty dates are omitted so existing all-time API calls
 * continue working without changes.
 *
 * @param {{fromDate?: string, toDate?: string}} filters
 * @returns {Object}
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
 * Retrieves authenticated user's dashboard aggregates.
 *
 * GET /dashboard/insights
 *
 * Dashboard summary remains all-time.
 *
 * @returns {Promise<Object>}
 */
export const getDashboardAnalytics = async () => {
    const response = await api.get(
        API_ENDPOINTS.DASHBOARD_INSIGHTS
    );

    return response.data;
};

/**
 * Retrieves transaction analytics.
 *
 * GET /ai/transaction-analytics
 *
 * Supports optional date filtering.
 *
 * @param {{fromDate?: string, toDate?: string}} filters
 * @returns {Promise<Object>}
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
 *
 * Expected response:
 * [
 *   {
 *     category: string,
 *     amount: number,
 *     percentage: number
 *   }
 * ]
 *
 * @param {{fromDate?: string, toDate?: string}} filters
 * @returns {Promise<Array>}
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
 *
 * Supports optional date filtering.
 *
 * @param {{fromDate?: string, toDate?: string}} filters
 * @returns {Promise<Object>}
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
 * ApiResponse wraps the report in its `data` field.
 *
 * @returns {Promise<Object|null>}
 */
export const getFinancialIntelligence = async () => {
    const response = await api.get("/ai/intelligence");

    return response.data?.data ?? null;
};
