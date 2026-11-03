
import axiosInstance from "../api/axiosConfig";

/**
 * NeuroWallet - Goal Management API Service
 *
 * Backend base URL:
 * http://localhost:8080/api
 *
 * Authentication:
 * - JWT authentication
 * - Automatic token refresh
 * - Centralized API error handling
 */

const GOALS_API = "/goals";
const AI_GOAL_ADVISOR_API = "/ai/goal-advisor";

const goalService = {

    // ==========================================
    // GET ALL GOALS
    // GET /api/goals?page=0&size=10
    // ==========================================

    getGoals: async (params = {}) => {
        const response = await axiosInstance.get(
            GOALS_API,
            {
                params: {
                    page: 0,
                    size: 10,
                    ...params,
                },
            }
        );

        return response.data;
    },

    // ==========================================
    // GET SINGLE GOAL
    // GET /api/goals/{goalId}
    // ==========================================

    getGoalById: async (goalId) => {
        if (!goalId) {
            throw new Error("Goal ID is required.");
        }

        const response = await axiosInstance.get(
            `${GOALS_API}/${encodeURIComponent(goalId)}`
        );

        return response.data;
    },

    // ==========================================
    // CREATE GOAL
    // POST /api/goals
    // ==========================================

    createGoal: async (goalData) => {
        const response = await axiosInstance.post(
            GOALS_API,
            goalData
        );

        return response.data;
    },

    // ==========================================
    // UPDATE GOAL
    // PUT /api/goals/{goalId}
    // ==========================================

    updateGoal: async (goalId, goalData) => {
        if (!goalId) {
            throw new Error("Goal ID is required.");
        }

        const response = await axiosInstance.put(
            `${GOALS_API}/${encodeURIComponent(goalId)}`,
            goalData
        );

        return response.data;
    },

    // ==========================================
    // DELETE GOAL
    // DELETE /api/goals/{goalId}
    // ==========================================

    deleteGoal: async (goalId) => {
        if (!goalId) {
            throw new Error("Goal ID is required.");
        }

        const response = await axiosInstance.delete(
            `${GOALS_API}/${encodeURIComponent(goalId)}`
        );

        return response.data;
    },

    // ==========================================
    // ADD CONTRIBUTION
    // POST /api/goals/{goalId}/contributions
    // ==========================================

    addContribution: async (goalId, contributionData) => {
        if (!goalId) {
            throw new Error("Goal ID is required.");
        }

        const response = await axiosInstance.post(
            `${GOALS_API}/${encodeURIComponent(goalId)}/contributions`,
            contributionData
        );

        return response.data;
    },

    // ==========================================
    // GET CONTRIBUTION HISTORY
    // GET /api/goals/{goalId}/contributions
    // ==========================================

    getContributionHistory: async (goalId, params = {}) => {
        if (!goalId) {
            throw new Error("Goal ID is required.");
        }

        const response = await axiosInstance.get(
            `${GOALS_API}/${encodeURIComponent(goalId)}/contributions`,
            {
                params: {
                    page: 0,
                    size: 10,
                    ...params,
                },
            }
        );

        return response.data;
    },

    // ==========================================
    // UPDATE GOAL STATUS
    // PATCH /api/goals/{goalId}/status?status=PAUSED
    // ==========================================

    updateGoalStatus: async (goalId, status) => {
        if (!goalId) {
            throw new Error("Goal ID is required.");
        }

        if (!status) {
            throw new Error("Goal status is required.");
        }

        const response = await axiosInstance.patch(
            `${GOALS_API}/${encodeURIComponent(goalId)}/status`,
            null,
            {
                params: {
                    status,
                },
            }
        );

        return response.data;
    },

    // ==========================================
    // AI GOAL ADVISOR
    // GET /api/ai/goal-advisor
    // ==========================================

    getGoalAdvisor: async () => {
        const response = await axiosInstance.get(
            AI_GOAL_ADVISOR_API
        );

        return response.data;
    },
};

export default goalService;
