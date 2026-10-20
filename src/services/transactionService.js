
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Existing transaction history.
 * Preserved for Dashboard and Wallet compatibility.
 */
export const getTransactionHistory = async (page = 0, size = 5) => {
    const response = await api.get(API_ENDPOINTS.TRANSACTION_HISTORY, {
        params: { page, size }
    });

    return response.data;
};

/**
 * Server-side filtered transaction history.
 */
export const getFilteredTransactionHistory = async ({
    page = 0,
    size = 10,
    keyword,
    status,
    type,
    category,
    fromDate,
    toDate,
    sortBy = "timestamp",
    direction = "DESC"
} = {}) => {
    const params = {
        page,
        size,
        sortBy,
        direction
    };

    // Add optional filters only when they contain values.
    if (keyword?.trim()) params.keyword = keyword.trim();
    if (status && status !== "ALL") params.status = status;
    if (type && type !== "ALL") params.type = type;
    if (category && category !== "ALL") params.category = category;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await api.get(
        API_ENDPOINTS.TRANSACTION_HISTORY_FILTER,
        { params }
    );

    return response.data;
};
