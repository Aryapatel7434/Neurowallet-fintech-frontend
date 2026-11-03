
import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

// =========================================================
// CONFIGURATION
// =========================================================

const AI_TIMEOUT = 90000;

// =========================================================
// RESPONSE VALIDATION
// =========================================================

const validateResponse = (data, endpointName) => {
    if (
        data === null ||
        data === undefined ||
        typeof data !== "object"
    ) {
        throw new Error(
            `${endpointName} returned an invalid response.`
        );
    }

    return data;
};

// =========================================================
// BUDGET CRUD OPERATIONS
// =========================================================

// CREATE BUDGET
// POST /api/budgets

export const createBudget = async (budgetData) => {
    const response = await api.post(
        API_ENDPOINTS.BUDGETS,
        budgetData
    );

    return validateResponse(
        response.data,
        "Create Budget API"
    );
};

// GET MY BUDGETS
// GET /api/budgets?page=0&size=10

export const getMyBudgets = async ({
    page = 0,
    size = 10,
} = {}) => {
    const response = await api.get(
        API_ENDPOINTS.MY_BUDGETS,
        {
            params: { page, size },
        }
    );

    return validateResponse(
        response.data,
        "My Budgets API"
    );
};

// GET BUDGET SUMMARY
// GET /api/budgets/summary

export const getBudgetSummary = async () => {
    const response = await api.get(
        API_ENDPOINTS.BUDGET_SUMMARY
    );

    return validateResponse(
        response.data,
        "Budget Summary API"
    );
};

// GET ACTIVE BUDGETS
// GET /api/budgets/active

export const getActiveBudgets = async () => {
    const response = await api.get(
        API_ENDPOINTS.ACTIVE_BUDGETS
    );

    return validateResponse(
        response.data,
        "Active Budgets API"
    );
};

// GET BUDGET BY ID
// GET /api/budgets/{budgetId}

export const getBudgetById = async (budgetId) => {
    if (!budgetId) {
        throw new Error("Budget ID is required.");
    }

    const response = await api.get(
        API_ENDPOINTS.BUDGET_BY_ID(budgetId)
    );

    return validateResponse(
        response.data,
        "Budget Details API"
    );
};

// UPDATE BUDGET
// PUT /api/budgets/{budgetId}

export const updateBudget = async (
    budgetId,
    budgetData
) => {
    if (!budgetId) {
        throw new Error("Budget ID is required.");
    }

    const response = await api.put(
        API_ENDPOINTS.BUDGET_BY_ID(budgetId),
        budgetData
    );

    return validateResponse(
        response.data,
        "Update Budget API"
    );
};

// DELETE BUDGET
// DELETE /api/budgets/{budgetId}
// Backend returns 204 No Content.

export const deleteBudget = async (budgetId) => {
    if (!budgetId) {
        throw new Error("Budget ID is required.");
    }

    const response = await api.delete(
        API_ENDPOINTS.BUDGET_BY_ID(budgetId)
    );

    return response.status === 204;
};

// UPDATE BUDGET STATUS
// PATCH /api/budgets/{budgetId}/status

export const updateBudgetStatus = async (
    budgetId,
    status
) => {
    if (!budgetId) {
        throw new Error("Budget ID is required.");
    }

    if (!["ACTIVE", "PAUSED"].includes(status)) {
        throw new Error(
            "Invalid budget status. Allowed: ACTIVE, PAUSED."
        );
    }

    const response = await api.patch(
        API_ENDPOINTS.BUDGET_STATUS(budgetId),
        { status }
    );

    return validateResponse(
        response.data,
        "Update Budget Status API"
    );
};

// =========================================================
// BUDGET HEALTH
// GET /api/ai/budget-health
// =========================================================

export const getBudgetHealth = async () => {
    const response = await api.get(
        API_ENDPOINTS.BUDGET_HEALTH,
        {
            timeout: AI_TIMEOUT,
        }
    );

    return validateResponse(
        response.data,
        "Budget Health API"
    );
};

// =========================================================
// AI BUDGET ADVISOR
// GET /api/ai/budget-advisor
// =========================================================

export const getBudgetAdvisor = async () => {
    const response = await api.get(
        API_ENDPOINTS.BUDGET_ADVISOR,
        {
            timeout: AI_TIMEOUT,
        }
    );

    return validateResponse(
        response.data,
        "Budget Advisor API"
    );
};

// =========================================================
// COMPLETE BUDGET DASHBOARD DATA
// =========================================================

export const getBudgetDashboardData = async () => {
    const [
        healthResult,
        advisorResult,
        summaryResult,
        budgetsResult,
    ] = await Promise.allSettled([
        getBudgetHealth(),
        getBudgetAdvisor(),
        getBudgetSummary(),
        getMyBudgets(),
    ]);

    return {
        health:
            healthResult.status === "fulfilled"
                ? healthResult.value
                : null,

        advisor:
            advisorResult.status === "fulfilled"
                ? advisorResult.value
                : null,

        summary:
            summaryResult.status === "fulfilled"
                ? summaryResult.value
                : null,

        budgets:
            budgetsResult.status === "fulfilled"
                ? budgetsResult.value
                : null,

        errors: {
            health:
                healthResult.status === "rejected"
                    ? healthResult.reason
                    : null,

            advisor:
                advisorResult.status === "rejected"
                    ? advisorResult.reason
                    : null,

            summary:
                summaryResult.status === "rejected"
                    ? summaryResult.reason
                    : null,

            budgets:
                budgetsResult.status === "rejected"
                    ? budgetsResult.reason
                    : null,
        },
    };
};
