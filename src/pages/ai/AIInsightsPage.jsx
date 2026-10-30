
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getAIInsights,
    getFinancialScore,
    getBudgetHealth,
    getGoalRecommendation,
    askAIAssistant,
} from "../../services/aiService";

import "./aiInsightsPage.css";

// ======================================================
// FINANCIAL DATA RESOURCES
// ======================================================

const resources = [
    {
        key: "insights",
        title: "Financial Insights",
        description: "Personalized financial analysis",
        load: getAIInsights,
    },
    {
        key: "score",
        title: "Financial Health",
        description: "Your financial health assessment",
        load: getFinancialScore,
    },
    {
        key: "budget",
        title: "Budget Health",
        description: "Your budget assessment",
        load: getBudgetHealth,
    },
    {
        key: "goals",
        title: "Goal Recommendations",
        description: "Your savings and goal recommendations",
        load: getGoalRecommendation,
    },
];

const suggestedQuestions = [
    {
        icon: "📊",
        label: "Analyze my spending",
        question: "Analyze my spending patterns and identify where I can reduce unnecessary expenses.",
    },
    {
        icon: "💰",
        label: "Improve my savings",
        question: "Based on my financial data, how can I improve my monthly savings?",
    },
    {
        icon: "🎯",
        label: "Reach my goals faster",
        question: "Give me a practical plan to achieve my financial goals faster.",
    },
    {
        icon: "🛡️",
        label: "Financial health check",
        question: "Evaluate my financial health and explain the most important areas I should improve.",
    },
];

// ======================================================
// RESPONSE HELPERS
// ======================================================

function unwrapResponse(response) {
    if (
        response &&
        typeof response === "object" &&
        Object.prototype.hasOwnProperty.call(response, "data")
    ) {
        return response.data;
    }

    return response;
}

function normalizeAssistantResponse(response) {
    if (typeof response === "string") {
        const answer = response.trim();

        if (!answer) {
            throw new Error("The AI returned an empty response.");
        }

        return {
            answer,
            intent: null,
            category: null,
            amount: null,
            recommendations: [],
        };
    }

    if (!response || typeof response !== "object") {
        throw new Error("The AI returned an invalid response.");
    }

    // Supports Gemini candidate payloads if the backend ever returns them.
    const candidateText = response.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text)
        .filter(Boolean)
        .join("\n");

    const answer =
        response.answer ||
        response.response ||
        response.message ||
        response.reply ||
        response.content ||
        response.text ||
        response.result ||
        candidateText ||
        "";

    if (typeof answer !== "string" || !answer.trim()) {
        throw new Error("The AI returned an empty answer.");
    }

    return {
        answer: answer.trim(),
        intent: response.intent ?? null,
        category: response.category ?? null,
        amount: response.amount ?? null,
        recommendations: Array.isArray(response.recommendations)
            ? response.recommendations.filter(
                (item) => typeof item === "string" && item.trim()
            )
            : [],
    };
}

function formatLabel(value) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value) {
    if (value === null || value === undefined || value === "") {
        return "Not provided";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "number") {
        return value.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
    }

    if (Array.isArray(value)) {
        return value.length
            ? `${value.length} item${value.length === 1 ? "" : "s"}`
            : "None reported";
    }

    if (typeof value === "object") {
        return "Details available";
    }

    return String(value);
}

// ======================================================
// FINANCIAL DATA DISPLAY
// ======================================================

function DataFields({ data, depth = 0 }) {
    if (data === null || data === undefined) {
        return <p className="ai-empty">No data was returned.</p>;
    }

    if (Array.isArray(data)) {
        if (!data.length) {
            return <p className="ai-empty">No items reported.</p>;
        }

        return (
            <div className="ai-list">
                {data.map((item, index) => (
                    <article className="ai-list-item" key={index}>
                        {typeof item === "object" && item !== null ? (
                            <DataFields data={item} depth={depth + 1} />
                        ) : (
                            <p>{formatValue(item)}</p>
                        )}
                    </article>
                ))}
            </div>
        );
    }

    if (typeof data !== "object") {
        return <p>{formatValue(data)}</p>;
    }

    const entries = Object.entries(data).filter(
        ([, value]) => value !== undefined
    );

    if (!entries.length) {
        return <p className="ai-empty">No details were provided.</p>;
    }

    return (
        <div className={depth === 0 ? "ai-data-grid" : "ai-nested-data"}>
            {entries.map(([key, value]) => {
                const nested = value !== null && typeof value === "object";

                return (
                    <div className="ai-data-field" key={key}>
                        <span className="ai-field-label">
                            {formatLabel(key)}
                        </span>

                        {nested ? (
                            <div className="ai-field-nested">
                                <DataFields
                                    data={value}
                                    depth={depth + 1}
                                />
                            </div>
                        ) : (
                            <strong className="ai-field-value">
                                {formatValue(value)}
                            </strong>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ======================================================
// MESSAGE COMPONENT
// ======================================================

function ChatMessage({ message, onRetry }) {
    const isAssistant = message.role === "assistant";

    const formatIntent = (intent) => {
        if (!intent) return null;

        return String(intent)
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined || amount === "") {
            return null;
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount)) {
            return null;
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(numericAmount);
    };

    const handleCopy = async () => {
        try {
            const completeResponse = [
                message.content,
                ...(message.recommendations || []).map(
                    (item, index) => `${index + 1}. ${item}`
                ),
            ].join("\n\n");

            await navigator.clipboard.writeText(completeResponse);
        } catch (error) {
            console.error("Unable to copy AI response:", error);
        }
    };

    return (
        <article
            className={`ai-message-row ${
                isAssistant ? "assistant-row" : "user-row"
            }`}
        >
            <div className="ai-message-avatar" aria-hidden="true">
                {isAssistant ? "AI" : "YOU"}
            </div>

            <div className="ai-message-content">
                <div className="ai-message-meta">
                    <strong>
                        {isAssistant ? "NeuroWallet AI" : "You"}
                    </strong>

                    <time>
                        {new Date(message.timestamp).toLocaleTimeString(
                            "en-IN",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}
                    </time>
                </div>

                <div className="ai-message-bubble">
                    <p>{message.content}</p>

                    {isAssistant && !message.error && (
                        <>
                            {(message.intent ||
                                message.category ||
                                message.amount !== null) && (
                                <div className="ai-response-metadata">
                                    {message.intent && (
                                        <span>
                                            <small>Analysis</small>
                                            <strong>
                                                {formatIntent(message.intent)}
                                            </strong>
                                        </span>
                                    )}

                                    {message.category && (
                                        <span>
                                            <small>Category</small>
                                            <strong>
                                                {message.category}
                                            </strong>
                                        </span>
                                    )}

                                    {message.amount !== null &&
                                        formatAmount(message.amount) && (
                                            <span>
                                                <small>Amount</small>
                                                <strong>
                                                    {formatAmount(message.amount)}
                                                </strong>
                                            </span>
                                        )}
                                </div>
                            )}

                            {message.recommendations?.length > 0 && (
                                <div className="ai-recommendation-list">
                                    <h4>
                                        <span aria-hidden="true">✦</span>
                                        Recommended actions
                                    </h4>

                                    <ol>
                                        {message.recommendations.map(
                                            (recommendation, index) => (
                                                <li key={`${index}-${recommendation}`}>
                                                    {recommendation}
                                                </li>
                                            )
                                        )}
                                    </ol>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {isAssistant && !message.error && (
                    <button
                        type="button"
                        className="ai-copy-button"
                        onClick={handleCopy}
                    >
                        Copy response
                    </button>
                )}

                {message.error && (
                    <button
                        type="button"
                        className="ai-retry-button"
                        onClick={() => onRetry(message.question)}
                    >
                        Try again
                    </button>
                )}
            </div>
        </article>
    );
}

// ======================================================
// MAIN AI INSIGHTS PAGE
// ======================================================

function AIInsightsPage() {
    // Chat
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState("");

    // Financial resources
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [lastUpdated, setLastUpdated] = useState(null);

    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const requestInProgress = useRef(false);
    const messageId = useRef(0);

    // ==================================================
    // LOAD FINANCIAL DATA
    // ==================================================

    const loadData = useCallback(async () => {
        setLoading(true);
        setErrors({});

        const results = await Promise.allSettled(
            resources.map((resource) => resource.load())
        );

        const nextData = {};
        const nextErrors = {};

        results.forEach((result, index) => {
            const key = resources[index].key;

            if (result.status === "fulfilled") {
                nextData[key] = unwrapResponse(result.value);
            } else {
                nextErrors[key] =
                    result.reason?.response?.data?.message ||
                    result.reason?.message ||
                    "Unable to load this resource.";
            }
        });

        setData(nextData);
        setErrors(nextErrors);
        setLastUpdated(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ==================================================
    // AUTO-SCROLL CHAT
    // ==================================================

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, chatLoading]);

    // ==================================================
    // SEND QUESTION TO GEMINI BACKEND
    // ==================================================

    const sendQuestion = async (input) => {
        const normalizedQuestion =
            typeof input === "string" ? input.trim() : "";

        if (!normalizedQuestion || requestInProgress.current) {
            return;
        }

        if (normalizedQuestion.length > 500) {
            setChatError("Your question cannot exceed 500 characters.");
            return;
        }

        requestInProgress.current = true;
        setChatLoading(true);
        setChatError("");
        setQuestion("");

        const currentMessageId = ++messageId.current;

        const userMessage = {
            id: currentMessageId,
            role: "user",
            content: normalizedQuestion,
            timestamp: new Date().toISOString(),
        };

        setMessages((previous) => [...previous, userMessage]);

        try {
            const response = await askAIAssistant(normalizedQuestion);
            const assistantResponse = normalizeAssistantResponse(
                unwrapResponse(response)
            );

            setMessages((previous) => [
                ...previous,
                {
                    id: ++messageId.current,
                    role: "assistant",
                    content: assistantResponse.answer,
                    intent: assistantResponse.intent,
                    category: assistantResponse.category,
                    amount: assistantResponse.amount,
                    recommendations: assistantResponse.recommendations,
                    timestamp: new Date().toISOString(),
                },
            ]);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to get a response. Please try again.";

            setChatError(errorMessage);

            setMessages((previous) => [
                ...previous,
                {
                    id: ++messageId.current,
                    role: "assistant",
                    content: errorMessage,
                    timestamp: new Date().toISOString(),
                    error: true,
                    question: normalizedQuestion,
                },
            ]);
        } finally {
            requestInProgress.current = false;
            setChatLoading(false);
            textareaRef.current?.focus();
        }
    };

    // ==================================================
    // FORM HANDLERS
    // ==================================================

    const handleSubmit = (event) => {
        event.preventDefault();
        sendQuestion(question);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendQuestion(question);
        }
    };

    const clearConversation = () => {
        if (requestInProgress.current) return;

        setMessages([]);
        setChatError("");
        setQuestion("");
    };

    const failedCount = Object.keys(errors).length;

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <main className="ai-insights-page">

            {/* PAGE HEADER */}

            <header className="ai-page-header">
                <div>
                    <p className="ai-eyebrow">
                        NEUROWALLET INTELLIGENCE
                    </p>

                    <h1>AI Financial Assistant</h1>

                    <p className="ai-page-description">
                        Understand your finances, discover opportunities,
                        and make smarter financial decisions with your
                        Gemini-powered assistant.
                    </p>
                </div>

                <div className="ai-header-actions">
                    <span className="ai-live-indicator">
                        <span />
                        AI ASSISTANT
                    </span>

                    <button
                        type="button"
                        className="ai-refresh-button"
                        onClick={loadData}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "↻ Refresh data"}
                    </button>
                </div>
            </header>

            {/* CHAT WORKSPACE */}

            <section className="ai-chat-workspace">

                <div className="ai-chat-header">
                    <div className="ai-chat-brand">
                        <div className="ai-brand-icon">✦</div>

                        <div>
                            <h2>NeuroWallet AI</h2>
                            <p>Personal financial intelligence</p>
                        </div>
                    </div>

                    <div className="ai-chat-header-actions">
                        <span className="ai-chat-status">
                            <span />
                            Online
                        </span>

                        <button
                            type="button"
                            className="ai-clear-button"
                            onClick={clearConversation}
                            disabled={chatLoading || messages.length === 0}
                        >
                            Clear chat
                        </button>
                    </div>
                </div>

                <div className="ai-chat-body">

                    {/* EMPTY STATE */}

                    {messages.length === 0 && (
                        <div className="ai-welcome">
                            <div className="ai-welcome-icon">✦</div>

                            <p className="ai-welcome-eyebrow">
                                YOUR FINANCIAL COPILOT
                            </p>

                            <h2>
                                Your money deserves
                                <span> smarter decisions.</span>
                            </h2>

                            <p className="ai-welcome-description">
                                Ask questions about your spending, savings,
                                budgets, financial health, and goals.
                            </p>

                            <div className="ai-suggestions">
                                {suggestedQuestions.map((item) => (
                                    <button
                                        type="button"
                                        className="ai-suggestion"
                                        key={item.label}
                                        onClick={() => sendQuestion(item.question)}
                                        disabled={chatLoading}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                        <span className="ai-suggestion-arrow">
                                            →
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CONVERSATION */}

                    {messages.length > 0 && (
                        <div className="ai-conversation">
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    onRetry={sendQuestion}
                                />
                            ))}
                        </div>
                    )}

                    {/* TYPING INDICATOR */}

                    {chatLoading && (
                        <div className="ai-typing-row" role="status">
                            <div className="ai-message-avatar">AI</div>

                            <div className="ai-typing-bubble">
                                <span />
                                <span />
                                <span />
                                <small>Analyzing your question...</small>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* CHAT INPUT */}

                <div className="ai-chat-composer">
                    {chatError && (
                        <p className="ai-chat-error" role="alert">
                            {chatError}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>
                        <textarea
                            ref={textareaRef}
                            value={question}
                            onChange={(event) => {
                                setQuestion(event.target.value);
                                if (chatError) setChatError("");
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about your finances..."
                            maxLength={500}
                            rows={2}
                            disabled={chatLoading}
                            aria-label="Ask your financial assistant"
                        />

                        <div className="ai-composer-footer">
                            <span>
                                AI can make mistakes. Verify important
                                financial decisions.
                            </span>

                            <div>
                                <span>{question.length}/500</span>

                                <button
                                    type="submit"
                                    className="ai-send-button"
                                    disabled={
                                        chatLoading || !question.trim()
                                    }
                                    aria-label="Send message"
                                >
                                    {chatLoading ? "..." : "➤"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            {/* FINANCIAL DATA */}

            <section className="ai-data-section">
                <div className="ai-data-section-heading">
                    <div>
                        <p className="ai-eyebrow">YOUR FINANCIAL PROFILE</p>
                        <h2>Financial Intelligence</h2>
                        <p>
                            Live assessments returned by your authenticated
                            NeuroWallet backend.
                        </p>
                    </div>

                    <span className="ai-data-source">
                        {loading ? "Updating..." : "Backend connected"}
                    </span>
                </div>

                {!loading && failedCount > 0 && (
                    <div className="ai-error-banner" role="alert">
                        {failedCount} financial resource(s) could not be
                        loaded. Other available information is still shown.
                    </div>
                )}

                <div className="ai-resource-grid">
                    {resources.map((resource) => {
                        const hasData = Object.prototype.hasOwnProperty.call(
                            data,
                            resource.key
                        );

                        const failed = Boolean(errors[resource.key]);

                        return (
                            <article
                                className="ai-resource-card"
                                key={resource.key}
                            >
                                <div className="ai-card-heading">
                                    <div>
                                        <h3>{resource.title}</h3>
                                        <p>{resource.description}</p>
                                    </div>

                                    <span
                                        className={`ai-status-tag ${
                                            failed
                                                ? "ai-status-error"
                                                : hasData
                                                  ? "ai-status-success"
                                                  : "ai-status-pending"
                                        }`}
                                    >
                                        {failed
                                            ? "Unavailable"
                                            : hasData
                                              ? "Received"
                                              : loading
                                                ? "Loading"
                                                : "No data"}
                                    </span>
                                </div>

                                {failed ? (
                                    <div className="ai-section-error">
                                        {errors[resource.key]}
                                    </div>
                                ) : hasData ? (
                                    <DataFields data={data[resource.key]} />
                                ) : (
                                    <p className="ai-empty">
                                        {loading
                                            ? "Loading financial data..."
                                            : "No response available."}
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>

            <footer className="ai-page-footer">
                <span>
                    Powered by NeuroWallet AI · Authenticated backend
                </span>

                <span>
                    {lastUpdated
                        ? `Last updated ${lastUpdated.toLocaleTimeString()}`
                        : "Waiting for financial data"}
                </span>
            </footer>
        </main>
    );
}

export default AIInsightsPage;
