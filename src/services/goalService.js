
import axiosInstance from "../api/axiosConfig";

/**
 * NeuroWallet - Goal Management API Service
 *
 * Uses the shared Axios client:
 * - JWT authentication
 * - Automatic access-token refresh
 * - Centralized API error normalization
 *
 * Backend base URL:
 * http://localhost:8080/api
 */

const GOALS_API = "/goals";
const AI_GOAL_ADVISOR_API = "/ai/goal-advisor";

const goalService = {

    // -----------------------------------------------------
    // GET ALL GOALS - PAGINATION
    // GET /api/goals
    // -----------------------------------------------------

    getGoals: async (params = {}) => {
        const response = await axiosInstance.get(
            GOALS_API,
            { params }
        );

        return response.data;
    },

    // -----------------------------------------------------
    // GET SINGLE GOAL
    // GET /api/goals/{goalId}
    // -----------------------------------------------------

    getGoalById: async (goalId) => {
        const response = await axiosInstance.get(
            `${GOALS_API}/${encodeURIComponent(goalId)}`
        );

        return response.data;
    },

    // -----------------------------------------------------
    // CREATE GOAL
    // POST /api/goals
    // -----------------------------------------------------

    createGoal: async (goalData) => {
        const response = await axiosInstance.post(
            GOALS_API,
            goalData
        );

        return response.data;
    },

    // -----------------------------------------------------
    // UPDATE GOAL
    // PUT /api/goals/{goalId}
    // -----------------------------------------------------

    updateGoal: async (goalId, goalData) => {
        const response = await axiosInstance.put(
            `${GOALS_API}/${encodeURIComponent(goalId)}`,
            goalData
        );

        return response.data;
    },

    // -----------------------------------------------------
    // DELETE GOAL
    // DELETE /api/goals/{goalId}
    // -----------------------------------------------------

    deleteGoal: async (goalId) => {
        const response = await axiosInstance.delete(
            `${GOALS_API}/${encodeURIComponent(goalId)}`
        );

        return response.data;
    },

    // -----------------------------------------------------
    // ADD CONTRIBUTION
    // POST /api/goals/{goalId}/contributions
    // -----------------------------------------------------

    addContribution: async (goalId, contributionData) => {
        const response = await axiosInstance.post(
            `${GOALS_API}/${encodeURIComponent(goalId)}/contributions`,
            contributionData
        );

        return response.data;
    },

    // -----------------------------------------------------
    // CONTRIBUTION HISTORY
    // GET /api/goals/{goalId}/contributions
    // -----------------------------------------------------

    getContributionHistory: async (goalId, params = {}) => {
        const response = await axiosInstance.get(
            `${GOALS_API}/${encodeURIComponent(goalId)}/contributions`,
            { params }
        );

        return response.data;
    },

    // -----------------------------------------------------
    // UPDATE GOAL LIFECYCLE STATUS
    // PATCH /api/goals/{goalId}/status
    // -----------------------------------------------------

    updateGoalStatus: async (goalId, status) => {
        const response = await axiosInstance.patch(
            `${GOALS_API}/${encodeURIComponent(goalId)}/status`,
            { status }
        );

        return response.data;
    },

    // -----------------------------------------------------
    // AI GOAL ADVISOR
    // GET /api/ai/goal-advisor
    // -----------------------------------------------------

    getGoalAdvisor: async () => {
        const response = await axiosInstance.get(
            AI_GOAL_ADVISOR_API
        );

        return response.data;
    },
};

export default goalService;
