import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=================================
AI INSIGHTS
GET /api/ai/insights
=================================
*/

export const getAIInsights = async () => {

    const response =
        await api.get(API_ENDPOINTS.AI_INSIGHTS);

    return response.data;

};

/*
=================================
FINANCIAL SCORE
GET /api/ai/financial-score
=================================
*/

export const getFinancialScore = async () => {

    const response =
        await api.get(API_ENDPOINTS.FINANCIAL_SCORE);

    return response.data;

};

/*
=================================
BUDGET HEALTH
GET /api/ai/budget-health
=================================
*/

export const getBudgetHealth = async () => {

    const response =
        await api.get(API_ENDPOINTS.BUDGET_HEALTH);

    return response.data;

};

/*
=================================
GOAL RECOMMENDATION
GET /api/ai/goals
=================================
*/

export const getGoalRecommendation = async () => {

    const response =
        await api.get(API_ENDPOINTS.GOAL_RECOMMENDATION);

    return response.data;

};