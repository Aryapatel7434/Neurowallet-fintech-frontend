import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=========================================================
 NEUROWALLET — TRANSACTION SERVICE
=========================================================

 Features:
 1. Transfer Money
 2. Get Transaction History
 3. Get Filtered Transaction History
 4. Pagination
 5. Keyword Search
 6. Status / Type / Category Filters
 7. Date Range Filtering
 8. Sorting

 Backend:
 POST /transactions/send
 GET  /transactions/history
 GET  /transactions/history/filter
=========================================================
*/


/*
=========================================================
 VALIDATE PAGINATION
=========================================================
*/

const validatePagination = (page, size) => {

    if (!Number.isInteger(page) || page < 0) {
        throw new RangeError(
            "Page must be a non-negative integer."
        );
    }

    if (!Number.isInteger(size) || size < 1 || size > 100) {
        throw new RangeError(
            "Page size must be between 1 and 100."
        );
    }

};


/*
=========================================================
 VALIDATE DATE
=========================================================
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


/*
=========================================================
 TRANSFER MONEY
 POST /transactions/send
=========================================================
*/

export const transferMoney = async (
    receiverEmail,
    amount,
    category
) => {

    if (!receiverEmail?.trim()) {
        throw new Error("Receiver email is required.");
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        throw new RangeError("Amount must be greater than zero.");
    }

    if (!category) {
        throw new Error("Transaction category is required.");
    }

    const response = await api.post(
        API_ENDPOINTS.TRANSFER,
        {
            receiverEmail: receiverEmail.trim(),
            amount: Number(amount),
            category,
        }
    );

    return response.data;

};


/*
=========================================================
 GET TRANSACTION HISTORY
 GET /transactions/history
=========================================================
*/

export const getTransactionHistory = async (
    page = 0,
    size = 10
) => {

    validatePagination(page, size);

    const response = await api.get(
        API_ENDPOINTS.TRANSACTION_HISTORY,
        {
            params: {
                page,
                size,
            },
        }
    );

    return response.data;

};


/*
=========================================================
 GET FILTERED TRANSACTION HISTORY
 GET /transactions/history/filter
=========================================================
*/

export const getFilteredTransactionHistory = async (
    filters = {}
) => {

    const {
        page = 0,
        size = 10,
        keyword,
        status,
        type,
        category,
        fromDate,
        toDate,
        sortBy = "timestamp",
        direction = "DESC",
        signal,
    } = filters;

    validatePagination(page, size);

    if (fromDate && !isValidDate(fromDate)) {
        throw new RangeError(
            "Invalid fromDate. Expected YYYY-MM-DD."
        );
    }

    if (toDate && !isValidDate(toDate)) {
        throw new RangeError(
            "Invalid toDate. Expected YYYY-MM-DD."
        );
    }

    if (fromDate && toDate && fromDate > toDate) {
        throw new RangeError(
            "fromDate cannot be later than toDate."
        );
    }

    const allowedSortFields = [
        "timestamp",
        "amount",
    ];

    if (!allowedSortFields.includes(sortBy)) {
        throw new Error("Unsupported transaction sort field.");
    }

    const normalizedDirection = String(direction).toUpperCase();

    if (!["ASC", "DESC"].includes(normalizedDirection)) {
        throw new Error("Sort direction must be ASC or DESC.");
    }

    const params = {
        page,
        size,
        sortBy,
        direction: normalizedDirection,
    };

    if (typeof keyword === "string" && keyword.trim()) {
        params.keyword = keyword.trim();
    }

    if (status) {
        params.status = status;
    }

    if (type) {
        params.type = type;
    }

    if (category) {
        params.category = category;
    }

    if (fromDate) {
        params.fromDate = fromDate;
    }

    if (toDate) {
        params.toDate = toDate;
    }

    const response = await api.get(
        API_ENDPOINTS.TRANSACTION_HISTORY_FILTER,
        {
            params,
            signal,
        }
    );

    return response.data;

};