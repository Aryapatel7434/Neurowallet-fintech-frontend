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
    BUDGET_HEALTH: "/ai/budget-health",
    GOAL_RECOMMENDATION: "/ai/goals",

    // Legacy single-question assistant
    AI_ASSISTANT: "/ai/assistant",

    // =========================================================
    // PERSISTENT AI CONVERSATIONS
    // =========================================================

    AI_CONVERSATIONS: "/ai/conversations",

    AI_CONVERSATION: (conversationId) =>
        `/ai/conversations/${encodeURIComponent(conversationId)}`,

    AI_CONVERSATION_MESSAGES: (conversationId) =>
        `/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
};