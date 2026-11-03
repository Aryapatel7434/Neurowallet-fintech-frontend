
export const API_ENDPOINTS = {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    REGISTER: "/users/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",

    // =========================================================
    // WALLET
    // =========================================================

    GET_WALLET: "/wallet/me",
    WALLET_SUMMARY: "/wallet/summary",
    ADD_MONEY: "/wallet/add-money",
    WITHDRAW: "/wallet/withdraw",

    // =========================================================
    // TRANSACTIONS
    // =========================================================

    TRANSACTION_HISTORY: "/transactions/history",
    TRANSACTION_HISTORY_FILTER: "/transactions/history/filter",
    TRANSFER: "/transactions/send",

    // =========================================================
    // DASHBOARD
    // =========================================================

    DASHBOARD_INSIGHTS: "/dashboard/insights",

    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    NOTIFICATIONS: "/notifications",
    UNREAD_NOTIFICATIONS: "/notifications/unread",

    MARK_NOTIFICATION_READ: (id) =>
        `/notifications/${id}/read`,

    MARK_ALL_NOTIFICATIONS_READ: "/notifications/read-all",

    // =========================================================
    // AI FINANCIAL INTELLIGENCE
    // =========================================================

    AI_INSIGHTS: "/ai/insights",
    FINANCIAL_SCORE: "/ai/financial-score",

    // Existing AI budget endpoints
    BUDGET_HEALTH: "/ai/budget-health",
    BUDGET_ADVISOR: "/ai/budget-advisor",

    GOAL_RECOMMENDATION: "/ai/goals",

    // Legacy single-question assistant
    AI_ASSISTANT: "/ai/assistant",

    // Fraud detection
    AI_FRAUD: (transactionId) =>
        `/ai/fraud/${encodeURIComponent(transactionId)}`,

    // =========================================================
    // PERSISTENT AI CONVERSATIONS
    // =========================================================

    AI_CONVERSATIONS: "/ai/conversations",

    AI_CONVERSATION: (conversationId) =>
        `/ai/conversations/${encodeURIComponent(conversationId)}`,

    AI_CONVERSATION_MESSAGES: (conversationId) =>
        `/ai/conversations/${encodeURIComponent(conversationId)}/messages`,

    // =========================================================
    // BUDGET MANAGEMENT - CRUD APIs
    // =========================================================

    // Create budget: POST
    BUDGETS: "/budgets",

    // Get paginated budgets: GET
    MY_BUDGETS: "/budgets",

    // Get budget summary: GET
    BUDGET_SUMMARY: "/budgets/summary",

    // Get active budgets: GET
    ACTIVE_BUDGETS: "/budgets/active",

    // Get, update and delete a specific budget
    BUDGET_BY_ID: (budgetId) =>
        `/budgets/${encodeURIComponent(budgetId)}`,

    // Update budget status: PATCH
    BUDGET_STATUS: (budgetId) =>
        `/budgets/${encodeURIComponent(budgetId)}/status`,

    // =========================================================
    // SCHEDULED TRANSACTIONS
    // =========================================================

    SCHEDULED_TRANSACTIONS: "/scheduled-transactions",

    CREATE_SCHEDULED_TRANSACTION:
        "/scheduled-transactions/schedule",

    SCHEDULED_TRANSACTION_BY_ID: (id) =>
        `/scheduled-transactions/${encodeURIComponent(id)}`,
};
