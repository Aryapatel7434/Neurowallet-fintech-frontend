
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=========================================================
 NEUROWALLET — DASHBOARD SERVICE
=========================================================

 Responsibilities:
 - Fetch authenticated dashboard analytics
 - Support date-based financial reporting
 - Validate reporting date ranges
 - Support request cancellation
 - Preserve backward compatibility

 Backend:
 GET /api/dashboard/insights

 Query Parameters:
 fromDate = YYYY-MM-DD
 toDate   = YYYY-MM-DD
=========================================================
*/

/**
 * Validates a date string in YYYY-MM-DD format.
 *
 * @param {string|null|undefined} date
 * @returns {boolean}
 */
const isValidDate = (date) => {
    if (typeof date !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

/**
 * Validates dashboard reporting filters.
 *
 * @param {Object} filters
 */
const validateDashboardFilters = ({
    fromDate,
    toDate,
}) => {
    if (fromDate != null && !isValidDate(fromDate)) {
        throw new RangeError(
            "Invalid fromDate. Expected YYYY-MM-DD."
        );
    }

    if (toDate != null && !isValidDate(toDate)) {
        throw new RangeError(
            "Invalid toDate. Expected YYYY-MM-DD."
        );
    }

    if (
        fromDate &&
        toDate &&
        fromDate > toDate
    ) {
        throw new RangeError(
            "fromDate cannot be later than toDate."
        );
    }
};

/**
 * Fetches dashboard financial insights.
 *
 * @param {Object} filters
 * @param {string|null} filters.fromDate
 * @param {string|null} filters.toDate
 * @param {AbortSignal} [filters.signal]
 *
 * @returns {Promise<Object>}
 */
export const getDashboardInsights = async ({
    fromDate = null,
    toDate = null,
    signal,
} = {}) => {

    // ---------------------------------------------
    // VALIDATE FILTERS
    // ---------------------------------------------

    validateDashboardFilters({
        fromDate,
        toDate,
    });

    // ---------------------------------------------
    // BUILD QUERY PARAMETERS
    // ---------------------------------------------

    const params = {};

    if (fromDate) {
        params.fromDate = fromDate;
    }

    if (toDate) {
        params.toDate = toDate;
    }

    // ---------------------------------------------
    // API REQUEST
    // ---------------------------------------------

    const response = await api.get(
        API_ENDPOINTS.DASHBOARD_INSIGHTS,
        {
            params,
            signal,
        }
    );

    // ---------------------------------------------
    // RETURN BACKEND RESPONSE
    // ---------------------------------------------

    return response.data;
};
