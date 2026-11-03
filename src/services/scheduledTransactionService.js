import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Create a scheduled transaction.
 * POST /scheduled-transactions/schedule
 */
export const createScheduledTransaction = async ({
    receiverEmail,
    amount,
    scheduledTime,
}) => {
    const response = await api.post(
        API_ENDPOINTS.CREATE_SCHEDULED_TRANSACTION,
        {
            receiverEmail,
            amount,
            scheduledTime,
        }
    );

    return response.data;
};

/**
 * Get authenticated user's scheduled transactions.
 * GET /scheduled-transactions?page=0&size=10
 */
export const getScheduledTransactions = async ({
    page = 0,
    size = 10,
} = {}) => {
    const response = await api.get(
        API_ENDPOINTS.SCHEDULED_TRANSACTIONS,
        {
            params: { page, size },
        }
    );

    return response.data;
};

/**
 * Get one scheduled transaction by ID.
 * GET /scheduled-transactions/{id}
 */
export const getScheduledTransactionById = async (id) => {
    if (!id) {
        throw new Error("Scheduled transaction ID is required.");
    }

    const response = await api.get(
        API_ENDPOINTS.SCHEDULED_TRANSACTION_BY_ID(id)
    );

    return response.data;
};

/**
 * Cancel a pending scheduled transaction.
 * DELETE /scheduled-transactions/{id}
 */
export const cancelScheduledTransaction = async (id) => {
    if (!id) {
        throw new Error("Scheduled transaction ID is required.");
    }

    const response = await api.delete(
        API_ENDPOINTS.SCHEDULED_TRANSACTION_BY_ID(id)
    );

    return response.data;
};

/**
 * Get account-wide scheduled transaction analytics.
 * GET /scheduled-transactions/analytics
 */
export const getScheduledTransactionAnalytics = async () => {
    const response = await api.get(
        `${API_ENDPOINTS.SCHEDULED_TRANSACTIONS}/analytics`
    );

    return response.data;
};