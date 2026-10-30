import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

// =========================================================
// AI FINANCIAL INSIGHTS
// GET /ai/insights
// =========================================================

export const getAIInsights = async () => {
    const response = await api.get(
        API_ENDPOINTS.AI_INSIGHTS
    );

    return response.data;
};


// =========================================================
// FINANCIAL HEALTH SCORE
// GET /ai/financial-score
// =========================================================

export const getFinancialScore = async () => {
    const response = await api.get(
        API_ENDPOINTS.FINANCIAL_SCORE
    );

    return response.data;
};


// =========================================================
// BUDGET HEALTH
// GET /ai/budget-health
// =========================================================

export const getBudgetHealth = async () => {
    const response = await api.get(
        API_ENDPOINTS.BUDGET_HEALTH
    );

    return response.data;
};


// =========================================================
// GOAL RECOMMENDATION
// GET /ai/goals
// =========================================================

export const getGoalRecommendation = async () => {
    const response = await api.get(
        API_ENDPOINTS.GOAL_RECOMMENDATION
    );

    return response.data;
};


// =========================================================
// GEMINI AI FINANCIAL ASSISTANT
// POST /ai/assistant
// =========================================================

export const askAIAssistant = async (question) => {
    const normalizedQuestion =
        typeof question === "string"
            ? question.trim()
            : "";

    // Frontend validation
    if (!normalizedQuestion) {
        throw new Error(
            "Please enter a financial question."
        );
    }

    if (normalizedQuestion.length > 500) {
        throw new Error(
            "Your question cannot exceed 500 characters."
        );
    }

    const response = await api.post(
        API_ENDPOINTS.AI_ASSISTANT,
        {
            question: normalizedQuestion,
        }
    );

    return response.data;
};