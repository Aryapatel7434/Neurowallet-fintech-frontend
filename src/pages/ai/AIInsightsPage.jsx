import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    FaArrowRight,
    FaBolt,
    FaBullseye,
    FaChartLine,
    FaCheck,
    FaClipboard,
    FaCoins,
    FaLightbulb,
    FaLock,
    FaPaperPlane,
    FaWallet,
} from "react-icons/fa";

import {
    FaArrowUpRightFromSquare,
    FaShieldHalved,
    FaRotate,
    FaTrashCan,
    FaCircleExclamation,
} from "react-icons/fa6";

import {
    getAIInsights,
    getFinancialScore,
    getBudgetHealth,
    getGoalRecommendation,
    askAIAssistant,
} from "../../services/aiService";

import "./aiInsightsPage.css";

const MAX_QUESTION_LENGTH = 500;

const resources = [
    {
        key: "insights",
        title: "AI Financial Insights",
        description: "Personalized financial intelligence",
        load: getAIInsights,
    },
    {
        key: "score",
        title: "Financial Health",
        description: "Backend-calculated health assessment",
        load: getFinancialScore,
    },
    {
        key: "budget",
        title: "Budget Health",
        description: "Income, expenses and remaining budget",
        load: getBudgetHealth,
    },
    {
        key: "goals",
        title: "Goal Recommendation",
        description: "Your current recommended savings goal",
        load: getGoalRecommendation,
    },
];

const suggestedQuestions = [
    {
        icon: <FaChartLine />,
        label: "Analyze my spending",
        detail: "Find patterns and categories to review",
        question:
            "Analyze my spending patterns and identify where I can reduce unnecessary expenses.",
    },
    {
        icon: <FaCoins />,
        label: "Improve my savings",
        detail: "Build a practical savings plan",
        question:
            "Based on my financial data, how can I improve my monthly savings?",
    },
    {
        icon: <FaArrowUpRightFromSquare />,
        label: "Reach my goals faster",
        detail: "Review your current goal progress",
        question:
            "Give me a practical plan to achieve my financial goals faster based on my current financial data.",
    },
    {
        icon: <FaShieldHalved />,
        label: "Check my financial health",
        detail: "Understand strengths and risks",
        question:
            "Evaluate my financial health and explain the most important areas I should improve.",
    },
];

function unwrapResponse(response) {
    let value = response;

    for (let depth = 0; depth < 2; depth += 1) {
        if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            Object.prototype.hasOwnProperty.call(value, "data")
        ) {
            value = value.data;
        } else {
            break;
        }
    }

    return value;
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

    const answer = response.answer;

    if (typeof answer !== "string" || !answer.trim()) {
        throw new Error(
            "The AI response did not contain a valid answer."
        );
    }

    return {
        answer: answer.trim(),
        intent: response.intent ?? null,
        category: response.category ?? null,
        amount: response.amount ?? null,
        recommendations: Array.isArray(response.recommendations)
            ? response.recommendations
                .filter(
                    (item) =>
                        typeof item === "string" && item.trim()
                )
                .slice(0, 5)
            : [],
    };
}

function formatLabel(value) {
    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return String(value);
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(numeric);
}

function formatValue(value, key = "") {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not provided";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "number") {
        const currencyLike =
            /amount|income|expense|saving|budget|balance|spend|target|transactionvalue/i.test(
                key
            );

        return currencyLike
            ? formatCurrency(value)
            : value.toLocaleString("en-IN", {
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

function getErrorMessage(error) {
    return (
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to complete the request. Please try again."
    );
}

function formatTime(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function DataFields({ data, depth = 0 }) {
    if (data === null || data === undefined) {
        return (
            <p className="ai-empty">
                No data was returned by this endpoint.
            </p>
        );
    }

    if (Array.isArray(data)) {
        if (!data.length) {
            return (
                <p className="ai-empty">
                    No items reported.
                </p>
            );
        }

        return (
            <div className="ai-data-list">
                {data.map((item, index) => (
                    <div
                        className="ai-data-list-item"
                        key={`${depth}-${index}`}
                    >
                        {item && typeof item === "object" ? (
                            <DataFields
                                data={item}
                                depth={depth + 1}
                            />
                        ) : (
                            <span>{formatValue(item)}</span>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    if (typeof data !== "object") {
        return (
            <p className="ai-empty">
                {formatValue(data)}
            </p>
        );
    }

    const entries = Object.entries(data).filter(
        ([, value]) => value !== undefined
    );

    if (!entries.length) {
        return (
            <p className="ai-empty">
                No details were provided.
            </p>
        );
    }

    return (
        <div
            className={
                depth === 0
                    ? "ai-data-grid"
                    : "ai-nested-grid"
            }
        >
            {entries.map(([key, value]) => {
                const nested =
                    value !== null &&
                    typeof value === "object";

                return (
                    <div
                        className="ai-data-field"
                        key={key}
                    >
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
                                {formatValue(value, key)}
                            </strong>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


function readField(source, candidates) {
    if (!source || typeof source !== "object") return undefined;
    const entries = Object.entries(source);
    for (const candidate of candidates) {
        const match = entries.find(
            ([key]) => key.toLowerCase() === candidate.toLowerCase()
        );
        if (match && match[1] !== null && match[1] !== undefined && match[1] !== "") {
            return match[1];
        }
    }
    return undefined;
}

function displayFinancialValue(value, currency = false) {
    if (value === null || value === undefined || value === "") return "—";
    if (currency && Number.isFinite(Number(value))) return formatCurrency(value);
    if (typeof value === "number") return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    return String(value);
}

function FinancialRecordCard({ icon, title, subtitle, status, metrics, insight, accent = "" }) {
    return (
        <article className={`ai-overview-card ${accent}`}>
            <div className="ai-overview-card-top">
                <div className="ai-overview-icon">{icon}</div>
                <span className={`ai-overview-status ${status === "Unavailable" ? "is-error" : ""}`}>
                    <span />
                    {status}
                </span>
            </div>
            <div className="ai-overview-title">
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
            <div className="ai-overview-metrics">
                {metrics.map((metric) => (
                    <div className="ai-overview-metric" key={metric.label}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                    </div>
                ))}
            </div>
            {insight ? (
                <p className="ai-overview-insight">{insight}</p>
            ) : (
                <p className="ai-overview-insight muted">No additional recommendation returned.</p>
            )}
        </article>
    );
}

function ChatMessage({ message, onRetry, onCopy }) {
    const assistant = message.role === "assistant";
    const [copied, setCopied] = useState(false);

    const copyResponse = async () => {
        const content = [
            message.content,
            ...(message.recommendations || []).map(
                (item, index) => `${index + 1}. ${item}`
            ),
        ].join("\n\n");

        try {
            await onCopy(content);
            setCopied(true);
            window.setTimeout(
                () => setCopied(false),
                1600
            );
        } catch {
            setCopied(false);
        }
    };

    const amount =
        message.amount !== null &&
        message.amount !== undefined
            ? formatCurrency(message.amount)
            : null;

    return (
        <article
            className={`ai-message-row ${
                assistant ? "assistant-row" : "user-row"
            }`}
        >
            <div
                className={`ai-message-avatar ${
                    assistant
                        ? "assistant-avatar"
                        : "user-avatar"
                }`}
                aria-hidden="true"
            >
                {assistant ? <FaBolt /> : "YOU"}
            </div>

            <div className="ai-message-content">
                <div className="ai-message-meta">
                    <strong>
                        {assistant ? "NeuroWallet AI" : "You"}
                    </strong>

                    {assistant && (
                        <span className="ai-message-model">
                            FINANCIAL COPILOT
                        </span>
                    )}

                    <time>
                        {formatTime(message.timestamp)}
                    </time>
                </div>

                <div
                    className={`ai-message-bubble ${
                        message.error ? "message-error" : ""
                    }`}
                >
                    <p>{message.content}</p>

                    {assistant &&
                        !message.error &&
                        (message.intent ||
                            message.category ||
                            amount) && (
                            <div className="ai-response-metadata">
                                {message.intent && (
                                    <span>
                                        <small>Analysis</small>
                                        <strong>
                                            {formatLabel(message.intent)}
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

                                {amount && (
                                    <span>
                                        <small>Amount</small>
                                        <strong>{amount}</strong>
                                    </span>
                                )}
                            </div>
                        )}

                    {assistant &&
                        !message.error &&
                        message.recommendations?.length > 0 && (
                            <div className="ai-recommendation-list">
                                <h4>
                                    <FaLightbulb />
                                    Recommended next steps
                                </h4>

                                <ol>
                                    {message.recommendations.map(
                                        (item, index) => (
                                            <li
                                                key={`${message.id}-${index}`}
                                            >
                                                {item}
                                            </li>
                                        )
                                    )}
                                </ol>
                            </div>
                        )}
                </div>

                {assistant && !message.error && (
                    <div className="ai-message-actions">
                        <button
                            type="button"
                            onClick={copyResponse}
                            aria-label="Copy AI response"
                        >
                            {copied ? <FaCheck /> : <FaClipboard />}
                            {copied
                                ? "Copied"
                                : "Copy response"}
                        </button>
                    </div>
                )}

                {message.error && (
                    <div className="ai-message-actions">
                        <button
                            type="button"
                            className="ai-retry-button"
                            onClick={() =>
                                onRetry(
                                    message.question,
                                    message.id
                                )
                            }
                        >
                            <FaRotate />
                            Retry request
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}

function AIInsightsPage() {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState("");
    // This reflects the last real assistant request, not a guessed API health check.
    const [assistantStatus, setAssistantStatus] = useState("idle");
    const [expandedSignal, setExpandedSignal] = useState(null);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [lastUpdated, setLastUpdated] = useState(null);

    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const requestInProgress = useRef(false);
    const messageId = useRef(0);
    const mountedRef = useRef(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        setErrors({});

        const results = await Promise.allSettled(
            resources.map((resource) => resource.load())
        );

        if (!mountedRef.current) return;

        const nextData = {};
        const nextErrors = {};

        results.forEach((result, index) => {
            const key = resources[index].key;

            if (result.status === "fulfilled") {
                nextData[key] = unwrapResponse(result.value);
            } else {
                nextErrors[key] = getErrorMessage(
                    result.reason
                );
            }
        });

        setData(nextData);
        setErrors(nextErrors);
        setLastUpdated(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        loadData();

        return () => {
            mountedRef.current = false;
        };
    }, [loadData]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, chatLoading]);

    const copyText = useCallback(async (text) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const temporary = document.createElement("textarea");
        temporary.value = text;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";

        document.body.appendChild(temporary);
        temporary.select();

        const copied = document.execCommand("copy");
        temporary.remove();

        if (!copied) {
            throw new Error(
                "Copy is not available in this browser."
            );
        }
    }, []);

    const sendQuestion = useCallback(
        async (input, retryMessageId = null) => {
            const normalizedQuestion =
                typeof input === "string"
                    ? input.trim()
                    : "";

            if (
                !normalizedQuestion ||
                requestInProgress.current
            ) {
                return;
            }

            if (
                normalizedQuestion.length >
                MAX_QUESTION_LENGTH
            ) {
                setChatError(
                    `Your question cannot exceed ${MAX_QUESTION_LENGTH} characters.`
                );
                return;
            }

            requestInProgress.current = true;
            setChatLoading(true);
            setAssistantStatus("connecting");
            setChatError("");
            setQuestion("");

            if (retryMessageId) {
                setMessages((previous) =>
                    previous.filter(
                        (message) =>
                            message.id !== retryMessageId
                    )
                );
            } else {
                setMessages((previous) => [
                    ...previous,
                    {
                        id: ++messageId.current,
                        role: "user",
                        content: normalizedQuestion,
                        timestamp: new Date().toISOString(),
                    },
                ]);
            }

            try {
                const rawResponse =
                    await askAIAssistant(
                        normalizedQuestion
                    );

                const assistantResponse =
                    normalizeAssistantResponse(
                        unwrapResponse(rawResponse)
                    );

                if (!mountedRef.current) return;

                setAssistantStatus("available");
                setMessages((previous) => [
                    ...previous,
                    {
                        id: ++messageId.current,
                        role: "assistant",
                        content: assistantResponse.answer,
                        intent: assistantResponse.intent,
                        category: assistantResponse.category,
                        amount: assistantResponse.amount,
                        recommendations:
                            assistantResponse.recommendations,
                        timestamp: new Date().toISOString(),
                    },
                ]);
            } catch (error) {
                if (!mountedRef.current) return;

                const errorMessage =
                    getErrorMessage(error);

                setAssistantStatus("error");
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

                if (mountedRef.current) {
                    setChatLoading(false);
                    textareaRef.current?.focus();
                }
            }
        },
        []
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        sendQuestion(question);
    };

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            sendQuestion(question);
        }
    };

    const clearConversation = () => {
        if (requestInProgress.current) return;

        setMessages([]);
        setChatError("");
        setQuestion("");
        textareaRef.current?.focus();
    };

    const insight = data.insights || {};
    const score = data.score || {};
    const budget = data.budget || {};
    const goal = data.goals || {};


    const failedCount = Object.keys(errors).length;


    return (
        <main className="ai-insights-page">
            <header className="ai-page-header">
                <div className="ai-page-heading-copy">
                    <p className="ai-eyebrow">
                        NEUROWALLET INTELLIGENCE
                    </p>

                    <h1>AI Financial Assistant</h1>

                    <p className="ai-page-description">
                        Your personal financial copilot,
                        grounded in the financial data returned
                        by your NeuroWallet account.
                    </p>
                </div>

                <div className="ai-header-actions">
                    <span className="ai-live-indicator">
                        <span />
                        GEMINI ASSISTANT
                    </span>

                    <button
                        type="button"
                        className="ai-refresh-button"
                        onClick={loadData}
                        disabled={loading}
                    >
                        <FaRotate
                            className={
                                loading ? "ai-spinning" : ""
                            }
                        />
                        {loading
                            ? "Refreshing"
                            : "Refresh data"}
                    </button>
                </div>
            </header>

            <section
                className="ai-capability-strip"
                aria-label="Assistant capabilities"
            >
                <div>
                    <FaChartLine />
                    <span>Spending analysis</span>
                </div>

                <div>
                    <FaCoins />
                    <span>Savings guidance</span>
                </div>

                <div>
                    <FaBullseye />
                    <span>Goal planning</span>
                </div>

                <div>
                    <FaShieldHalved />
                    <span>Financial health</span>
                </div>
            </section>

            <section className="ai-workspace-grid">
                <div className="ai-chat-workspace">
                    <div className="ai-chat-header">
                        <div className="ai-chat-brand">
                            <div className="ai-brand-icon">
                                <FaBolt />
                            </div>

                            <div>
                                <h2>NeuroWallet AI</h2>
                                <p>
                                    Personal financial intelligence
                                </p>
                            </div>
                        </div>

                        <div className="ai-chat-header-actions">
                            <span className={`ai-chat-status ai-chat-status-${assistantStatus}`}>
                                <span />
                                {chatLoading
                                    ? "Connecting"
                                    : assistantStatus === "available"
                                        ? "Assistant responded"
                                        : assistantStatus === "error"
                                            ? "Request failed"
                                            : "Ready to chat"}
                            </span>

                            <button
                                type="button"
                                className="ai-clear-button"
                                onClick={clearConversation}
                                disabled={
                                    chatLoading ||
                                    messages.length === 0
                                }
                            >
                                <FaTrashCan />
                                New chat
                            </button>
                        </div>
                    </div>

                    <div
                        className="ai-chat-body"
                        aria-live="polite"
                    >
                        {messages.length === 0 ? (
                            <div className="ai-welcome">
                                <div className="ai-welcome-icon">
                                    <FaBolt />
                                </div>

                                <p className="ai-welcome-eyebrow">
                                    YOUR FINANCIAL COPILOT
                                </p>

                                <h2>
                                    Your money deserves{" "}
                                    <span>
                                        smarter decisions.
                                    </span>
                                </h2>

                                <p className="ai-welcome-description">
                                    Ask a question about your
                                    finances. NeuroWallet sends
                                    it to your authenticated
                                    backend, which builds trusted
                                    financial context before
                                    requesting an answer from Gemini.
                                </p>

                                <div className="ai-suggestions">
                                    {suggestedQuestions.map(
                                        (item) => (
                                            <button
                                                type="button"
                                                className="ai-suggestion"
                                                key={item.label}
                                                onClick={() =>
                                                    sendQuestion(
                                                        item.question
                                                    )
                                                }
                                                disabled={chatLoading}
                                            >
                                                <span className="ai-suggestion-icon">
                                                    {item.icon}
                                                </span>

                                                <span className="ai-suggestion-copy">
                                                    <strong>
                                                        {item.label}
                                                    </strong>
                                                    <small>
                                                        {item.detail}
                                                    </small>
                                                </span>

                                                <FaArrowRight className="ai-suggestion-arrow" />
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="ai-conversation">
                                {messages.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        onRetry={sendQuestion}
                                        onCopy={copyText}
                                    />
                                ))}
                            </div>
                        )}

                        {chatLoading && (
                            <div
                                className="ai-typing-row"
                                role="status"
                                aria-label="NeuroWallet AI is preparing a response"
                            >
                                <div className="ai-message-avatar assistant-avatar">
                                    <FaBolt />
                                </div>

                                <div className="ai-typing-bubble">
                                    <span />
                                    <span />
                                    <span />
                                    <small>
                                        Reviewing your financial context...
                                    </small>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {chatError && (
                        <div
                            className="ai-chat-error"
                            role="alert"
                        >
                            <FaCircleExclamation />
                            <span>{chatError}</span>

                            <button
                                type="button"
                                onClick={() => setChatError("")}
                                aria-label="Dismiss error"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <div className="ai-chat-composer">
                        <form onSubmit={handleSubmit}>
                            <textarea
                                ref={textareaRef}
                                value={question}
                                onChange={(event) => {
                                    setQuestion(event.target.value);

                                    if (chatError) {
                                        setChatError("");
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything about your finances..."
                                maxLength={MAX_QUESTION_LENGTH}
                                rows={2}
                                disabled={chatLoading}
                                aria-label="Ask your financial assistant"
                            />

                            <div className="ai-composer-footer">
                                <span>
                                    <FaLock />
                                    Your question is sent to your authenticated NeuroWallet API.
                                </span>

                                <div>
                                    <span>
                                        {question.length}/{MAX_QUESTION_LENGTH}
                                    </span>

                                    <button
                                        type="submit"
                                        className="ai-send-button"
                                        disabled={
                                            chatLoading ||
                                            !question.trim()
                                        }
                                        aria-label="Send message"
                                    >
                                        {chatLoading ? (
                                            <span className="ai-send-spinner" />
                                        ) : (
                                            <FaPaperPlane />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <p className="ai-chat-disclaimer">
                        <FaCircleExclamation />
                        AI-generated information is educational,
                        may be inaccurate, and is not personalized
                        investment, tax or legal advice. Verify
                        important decisions independently.
                    </p>
                </div>

                <aside className="ai-insight-rail">
                    <div className="ai-rail-heading">
                        <div>
                            <p className="ai-eyebrow">
                                AI ANALYST DESK
                            </p>
                            <h2>Financial signals</h2>
                        </div>

                        <span
                            className={`ai-data-source ${
                                loading
                                    ? "is-loading"
                                    : failedCount
                                        ? "has-warning"
                                        : "is-ready"
                            }`}
                        >
                            {loading
                                ? "Updating"
                                : failedCount
                                    ? "Partial data"
                                    : "API data"}
                        </span>
                    </div>

                    <div className="ai-rail-context">
                        <span className="ai-rail-context-mark"><FaBolt /></span>
                        <div>
                            <strong>Analysis context</strong>
                            <p>Financial insights are grounded in your authenticated account data, budget assessment and savings goal.</p>
                        </div>
                    </div>

                    <section className="ai-rail-card ai-rail-card-opportunity">
                        <div className="ai-rail-card-heading">
                            <span className="ai-rail-icon">
                                <FaLightbulb />
                            </span>

                            <div>
                                <h3>Opportunity</h3>
                                <p>
                                    AI-generated financial insight
                                </p>
                            </div>
                        </div>

                        <p>
                            {insight.savingOpportunity ||
                                (loading
                                    ? "Loading your saving opportunity..."
                                    : "No saving opportunity was returned.")}
                        </p>
                    </section>

                    <section className="ai-rail-card ai-rail-card-warning">
                        <div className="ai-rail-card-heading">
                            <span className="ai-rail-icon">
                                <FaCircleExclamation />
                            </span>

                            <div>
                                <h3>Budget perspective</h3>
                                <p>
                                    Spending and income assessment
                                </p>
                            </div>
                        </div>

                        <p>
                            {insight.budgetAlert ||
                                (loading
                                    ? "Loading your budget assessment..."
                                    : "No budget alert was returned.")}
                        </p>
                    </section>

                    <section className="ai-rail-card">
                        <div className="ai-rail-card-heading">
                            <span className="ai-rail-icon">
                                <FaShieldHalved />
                            </span>

                            <div>
                                <h3>Risk perspective</h3>
                                <p>Backend financial assessment</p>
                            </div>
                        </div>

                        <p>
                            {insight.financialRisk ||
                                score.risk ||
                                (loading
                                    ? "Loading your risk assessment..."
                                    : "No risk assessment was returned.")}
                        </p>
                    </section>

                    {failedCount > 0 && (
                        <div
                            className="ai-rail-error"
                            role="status"
                        >
                            <FaCircleExclamation />

                            <span>
                                {failedCount} of {resources.length}{" "}
                                financial data requests could not
                                be loaded. Chat requests use the
                                separate assistant endpoint.
                            </span>
                        </div>
                    )}

                    <div className="ai-rail-footnote">
                        <FaLock />

                        <span>
                            Financial metrics are read from
                            authenticated backend endpoints.
                            Gemini responses are not used to
                            calculate your financial score.
                        </span>
                    </div>
                </aside>
            </section>

            <section className="ai-intelligence-section">
                {(() => {
                    const insight = data.insights || {};
                    const budget = data.budget || {};
                    const goals = data.goals || {};
                    const income = Number(readField(budget, ["totalIncome", "income"]));
                    const expenses = Number(readField(budget, ["totalExpense", "totalExpenses", "expenses"]));
                    const remaining = Number(readField(budget, ["remainingBudget", "remainingBalance"]));
                    const hasCashFlow = Number.isFinite(income) && income > 0 && Number.isFinite(expenses) && expenses >= 0;
                    const safeRemaining = Number.isFinite(remaining) && remaining >= 0 ? remaining : Math.max(income - expenses, 0);
                    const expenseWidth = hasCashFlow ? Math.min((expenses / income) * 100, 100) : 0;
                    const remainingWidth = hasCashFlow ? Math.max(100 - expenseWidth, 0) : 0;
                    const primaryInsight = readField(insight, ["savingOpportunity", "summary", "recommendation", "investmentSuggestion"]);
                    const budgetInsight = readField(insight, ["budgetAlert", "budgetRecommendation"]);
                    const riskInsight = readField(insight, ["financialRisk", "riskAssessment"]);
                    const goalInsight = readField(goals, ["recommendation", "description", "advice"]);
                    const goalName = readField(goals, ["goalName", "name"]);
                    const target = readField(goals, ["targetAmount", "target"]);
                    const progress = readField(goals, ["progressPercentage", "progress"]);
                    const updated = lastUpdated ? lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : null;
                    const signals = [
                        { label: "Savings opportunity", text: primaryInsight, tone: "blue", source: "AI insights" },
                        { label: "Budget observation", text: budgetInsight, tone: "amber", source: "Budget analysis" },
                        { label: "Risk perspective", text: riskInsight || readField(data.score || {}, ["remark", "assessment", "recommendation"]), tone: "violet", source: "Financial assessment" },
                        { label: "Goal direction", text: goalInsight, tone: "green", source: goalName ? String(goalName) : "Goal recommendation" },
                    ].filter((item) => item.text);
                    return (
                        <>
                            <div className="ai-intelligence-heading">
                                <div>
                                    <p className="ai-eyebrow">NEUROWALLET · AI ANALYSIS</p>
                                    <h2>Intelligence brief</h2>
                                    <p>Insights and next steps derived from your latest financial data.</p>
                                </div>
                                <div className="ai-brief-meta">
                                    <span className="ai-brief-live-dot" />
                                    {updated ? `Data refreshed at ${updated}` : loading ? "Analyzing your data" : "Awaiting data"}
                                </div>
                            </div>

                            <div className="ai-intelligence-layout">
                                <article className="ai-brief-feature">
                                    <div className="ai-brief-feature-top">
                                        <span className="ai-brief-kicker"><FaLightbulb /> EXECUTIVE SUMMARY</span>
                                        <span className="ai-brief-index">01 / ANALYSIS</span>
                                    </div>
                                    <h3>What your financial data is telling us</h3>
                                    <p className="ai-brief-lead">
                                        {primaryInsight || (loading ? "Your financial insights are being prepared from your account data." : "No primary AI insight is available yet. Refresh your data to request the latest assessment.")}
                                    </p>
                                    <div className="ai-brief-divider" />
                                    <div className="ai-brief-feature-foot">
                                        <span><FaLock /> Based on authenticated account data</span>
                                        <span>{errors.insights ? "Insight endpoint unavailable" : data.insights ? "AI insight received" : "Insight pending"}</span>
                                    </div>
                                </article>

                                <article className="ai-cashflow-panel">
                                    <div className="ai-panel-heading">
                                        <div>
                                            <span className="ai-panel-overline">CASH FLOW BREAKDOWN</span>
                                            <h3>Income allocation</h3>
                                        </div>
                                        <span className="ai-panel-icon"><FaChartLine /></span>
                                    </div>
                                    {hasCashFlow ? (
                                        <>
                                            <div className="ai-cashflow-total">{formatCurrency(income)}<span> total income</span></div>
                                            <div className="ai-cashflow-track" aria-label="Income allocation">
                                                <span className="ai-cashflow-expense" style={{ width: `${expenseWidth}%` }} />
                                                <span className="ai-cashflow-remaining" style={{ width: `${remainingWidth}%` }} />
                                            </div>
                                            <div className="ai-cashflow-legend">
                                                <div><i className="expense-dot" /><span>Expenses · {expenseWidth.toFixed(1)}%</span><strong>{formatCurrency(expenses)}</strong></div>
                                                <div><i className="remaining-dot" /><span>Unspent · {remainingWidth.toFixed(1)}%</span><strong>{formatCurrency(safeRemaining)}</strong></div>
                                            </div>
                                            <p className="ai-cashflow-caption">A proportional view of recorded income allocated to expenses and the remaining amount.</p>
                                        </>
                                    ) : (
                                        <div className="ai-visual-empty">Cash-flow visualization will appear when the budget endpoint returns income and expense values.</div>
                                    )}
                                </article>
                            </div>

                            <div className="ai-signal-header">
                                <div>
                                    <span className="ai-panel-overline">FROM YOUR FINANCIAL DATA</span>
                                    <h3>Signals worth your attention</h3>
                                </div>
                                <span className="ai-signal-count">{signals.length} {signals.length === 1 ? "signal" : "signals"}</span>
                            </div>

                            <div className="ai-signal-list">
                                {signals.length ? signals.map((signal, index) => {
                                    const isExpanded = expandedSignal === signal.label;
                                    return (
                                        <article className={`ai-signal-row signal-${signal.tone}${isExpanded ? " is-expanded" : ""}`} key={signal.label}>
                                            <span className="ai-signal-number">0{index + 1}</span>
                                            <div className="ai-signal-copy">
                                                <div className="ai-signal-titleline">
                                                    <h4>{signal.label}</h4>
                                                    <span>{signal.source}</span>
                                                </div>
                                                <p>{signal.text}</p>
                                                {isExpanded && (
                                                    <div className="ai-signal-detail">
                                                        <span className="ai-signal-detail-label">DATA SOURCE</span>
                                                        <span>{signal.source} · Authenticated NeuroWallet account data</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className="ai-signal-mark"
                                                aria-expanded={isExpanded}
                                                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${signal.label}`}
                                                onClick={() => setExpandedSignal(isExpanded ? null : signal.label)}
                                            >
                                                <FaArrowRight />
                                            </button>
                                        </article>
                                    );
                                }) : (
                                    <div className="ai-visual-empty">No additional recommendations were returned by the connected endpoints.</div>
                                )}
                            </div>

                            {goalName && (
                                <div className="ai-goal-direction-strip">
                                    <div className="ai-goal-direction-icon"><FaBullseye /></div>
                                    <div className="ai-goal-direction-copy">
                                        <span>YOUR CURRENT SAVINGS FOCUS</span>
                                        <strong>{String(goalName)}</strong>
                                        {goalInsight && <p>{goalInsight}</p>}
                                    </div>
                                    <div className="ai-goal-direction-target">
                                        <span>Target</span>
                                        <strong>{displayFinancialValue(target, true)}</strong>
                                        {progress !== undefined && <small>{displayFinancialValue(progress)}% progress</small>}
                                    </div>
                                </div>
                            )}

                            <div className="ai-intelligence-footnote"><FaLock /> Financial values and assessments are supplied by your authenticated NeuroWallet APIs. This section interprets existing data; it does not calculate or replace your financial score.</div>
                        </>
                    );
                })()}
            </section>

            <footer className="ai-page-footer">
                <span>
                    <FaLock />
                    Authenticated NeuroWallet API · Current-page conversation
                </span>

                <span>
                    AI can make mistakes. Verify important financial decisions.
                </span>
            </footer>
        </main>
    );
}

export default AIInsightsPage;