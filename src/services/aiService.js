import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

// =========================================================
// CONFIGURATION
// =========================================================

const AI_TIMEOUT = 90000;
const STANDARD_TIMEOUT = 15000;

const MAX_QUESTION_LENGTH = 500;
const MAX_CONVERSATION_TITLE_LENGTH = 120;

// =========================================================
// VALIDATION
// =========================================================

const normalizeQuestion = (question) => {
    const value =
        typeof question === "string"
            ? question.trim()
            : "";

    if (!value) {
        throw new Error(
            "Please enter a financial question."
        );
    }

    if (value.length > MAX_QUESTION_LENGTH) {
        throw new Error(
            `Your question cannot exceed ${MAX_QUESTION_LENGTH} characters.`
        );
    }

    return value;
};

const validateConversationId = (conversationId) => {
    if (
        typeof conversationId !== "string" ||
        !conversationId.trim()
    ) {
        throw new Error(
            "A valid conversation ID is required."
        );
    }

    return conversationId.trim();
};

const normalizeTitle = (title) => {
    const value =
        typeof title === "string"
            ? title.trim()
            : "";

    if (!value) {
        throw new Error(
            "Conversation title is required."
        );
    }

    if (value.length > MAX_CONVERSATION_TITLE_LENGTH) {
        throw new Error(
            `Title cannot exceed ${MAX_CONVERSATION_TITLE_LENGTH} characters.`
        );
    }

    return value;
};

// =========================================================
// AI FINANCIAL INSIGHTS
// GET /api/ai/insights
// =========================================================

export const getAIInsights = async () => {
    const response = await api.get(
        API_ENDPOINTS.AI_INSIGHTS,
        {
            timeout: AI_TIMEOUT,
        }
    );

    return response.data;
};

// =========================================================
// FINANCIAL HEALTH SCORE
// GET /api/ai/financial-score
// =========================================================

export const getFinancialScore = async () => {
    const response = await api.get(
        API_ENDPOINTS.FINANCIAL_SCORE
    );

    return response.data;
};

// =========================================================
// BUDGET HEALTH
// GET /api/ai/budget-health
// =========================================================

export const getBudgetHealth = async () => {
    const response = await api.get(
        API_ENDPOINTS.BUDGET_HEALTH
    );

    return response.data;
};

// =========================================================
// GOAL RECOMMENDATION
// GET /api/ai/goals
// =========================================================

export const getGoalRecommendation = async () => {
    const response = await api.get(
        API_ENDPOINTS.GOAL_RECOMMENDATION
    );

    return response.data;
};

// =========================================================
// LEGACY AI ASSISTANT
// POST /api/ai/assistant
// =========================================================

export const askAIAssistant = async (question) => {
    const normalizedQuestion =
        normalizeQuestion(question);

    const response = await api.post(
        API_ENDPOINTS.AI_ASSISTANT,
        {
            question: normalizedQuestion,
        },
        {
            timeout: AI_TIMEOUT,
        }
    );

    return response.data;
};

// =========================================================
// CREATE NEW CONVERSATION
// POST /api/ai/conversations
// =========================================================

export const createAIConversation = async (
    title = "New conversation"
) => {
    const normalizedTitle =
        typeof title === "string" && title.trim()
            ? normalizeTitle(title)
            : "New conversation";

    const response = await api.post(
        API_ENDPOINTS.AI_CONVERSATIONS,
        {
            title: normalizedTitle,
        },
        {
            timeout: STANDARD_TIMEOUT,
        }
    );

    return response.data;
};

// =========================================================
// GET ALL CONVERSATIONS
// GET /api/ai/conversations
// =========================================================

export const listAIConversations = async () => {
    const response = await api.get(
        API_ENDPOINTS.AI_CONVERSATIONS,
        {
            timeout: STANDARD_TIMEOUT,
        }
    );

    return response.data;
};

// =========================================================
// GET CONVERSATION DETAILS
// GET /api/ai/conversations/{conversationId}
// =========================================================

export const getAIConversation = async (
    conversationId
) => {
    const id = validateConversationId(conversationId);

    const response = await api.get(
        API_ENDPOINTS.AI_CONVERSATION(id),
        {
            timeout: STANDARD_TIMEOUT,
        }
    );

    return response.data;
};

// =========================================================
// RENAME CONVERSATION
// PATCH /api/ai/conversations/{conversationId}
// =========================================================

export const renameAIConversation = async (
    conversationId,
    title
) => {
    const id = validateConversationId(conversationId);
    const normalizedTitle = normalizeTitle(title);

    const response = await api.patch(
        API_ENDPOINTS.AI_CONVERSATION(id),
        {
            title: normalizedTitle,
        },
        {
            timeout: STANDARD_TIMEOUT,
        }
    );

    return response.data;
};

// =========================================================
// DELETE CONVERSATION
// DELETE /api/ai/conversations/{conversationId}
// =========================================================

export const deleteAIConversation = async (
    conversationId
) => {
    const id = validateConversationId(conversationId);

    await api.delete(
        API_ENDPOINTS.AI_CONVERSATION(id),
        {
            timeout: STANDARD_TIMEOUT,
        }
    );
};

// =========================================================
// SEND MESSAGE TO PERSISTENT CONVERSATION
// POST /api/ai/conversations/{conversationId}/messages
// =========================================================

export const sendAIConversationMessage = async (
    conversationId,
    question
) => {
    const id = validateConversationId(conversationId);
    const normalizedQuestion = normalizeQuestion(question);

    const response = await api.post(
        API_ENDPOINTS.AI_CONVERSATION_MESSAGES(id),
        {
            question: normalizedQuestion,
        },
        {
            timeout: AI_TIMEOUT,
        }
    );

    return response.data;
};