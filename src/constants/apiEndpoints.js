export const API_ENDPOINTS = {

    // ==========================
    // AUTH
    // ==========================

    LOGIN: "/auth/login",

    REGISTER: "/auth/register",

    FORGOT_PASSWORD: "/auth/forgot-password",

    RESET_PASSWORD: "/auth/reset-password",

    // ==========================
    // WALLET
    // ==========================

    GET_WALLET: "/wallet/me",

    ADD_MONEY: "/wallet/add-money",

    WITHDRAW: "/wallet/withdraw",

    // ==========================
    // TRANSACTIONS
    // ==========================

    TRANSACTION_HISTORY:
        "/transactions/history",

    TRANSFER:
        "/transactions/send",

    // ==========================
    // DASHBOARD
    // ==========================

    DASHBOARD_INSIGHTS:
        "/dashboard/insights",

    // ==========================
    // AI
    // ==========================

    AI_INSIGHTS:
        "/ai/insights",

    FINANCIAL_SCORE:
        "/ai/financial-score",

    BUDGET_HEALTH:
        "/ai/budget-health",

    GOAL_RECOMMENDATION:
        "/ai/goals"

};