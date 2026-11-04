
export const API_ENDPOINTS = {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
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

    BUDGET_HEALTH: "/ai/budget-health",
    BUDGET_ADVISOR: "/ai/budget-advisor",

    GOAL_RECOMMENDATION: "/ai/goals",

    AI_ASSISTANT: "/ai/assistant",

    AI_FRAUD: (transactionId) =>
        `/ai/fraud/${encodeURIComponent(transactionId)}`,

    // =========================================================
    // ANALYTICS
    // =========================================================

    TRANSACTION_ANALYTICS: "/ai/transaction-analytics",
    CATEGORY_SPENDING: "/ai/category-spending",
    SPENDING_PATTERN: "/ai/spending-pattern",

    // =========================================================
    // PERSISTENT AI CONVERSATIONS
    // =========================================================

    AI_CONVERSATIONS: "/ai/conversations",

    AI_CONVERSATION: (conversationId) =>
        `/ai/conversations/${encodeURIComponent(conversationId)}`,

    AI_CONVERSATION_MESSAGES: (conversationId) =>
        `/ai/conversations/${encodeURIComponent(conversationId)}/messages`,

    // =========================================================
    // BUDGET MANAGEMENT
    // =========================================================

    BUDGETS: "/budgets",
    MY_BUDGETS: "/budgets",
    BUDGET_SUMMARY: "/budgets/summary",
    ACTIVE_BUDGETS: "/budgets/active",

    BUDGET_BY_ID: (budgetId) =>
        `/budgets/${encodeURIComponent(budgetId)}`,

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
