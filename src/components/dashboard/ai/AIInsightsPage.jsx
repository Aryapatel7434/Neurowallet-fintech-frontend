
import { useEffect, useRef, useState } from "react";
import {
    FaRobot,
    FaPaperPlane,
    FaArrowRotateRight,
    FaTrash,
    FaCopy,
    FaCheck,
    FaLightbulb,
    FaChartLine,
    FaWallet,
    FaPiggyBank,
    FaBullseye,
    FaShieldHalved,
    FaCircleExclamation,
    FaSparkles,
    FaRegMessage,
    FaClock,
} from "react-icons/fa6";

import { askAIAssistant } from "../../services/aiService";
import "./aiInsightsPage.css";

const SUGGESTED_PROMPTS = [
    {
        icon: FaChartLine,
        title: "Analyze my spending",
        description: "Understand where my money goes",
        question: "Analyze my spending pattern and identify areas where I could reduce expenses.",
    },
    {
        icon: FaPiggyBank,
        title: "Improve my savings",
        description: "Find practical saving opportunities",
        question: "Analyze my savings and suggest practical ways to improve my savings rate.",
    },
    {
        icon: FaWallet,
        title: "Review my cash flow",
        description: "Understand my income and expenses",
        question: "Analyze my cash flow using my financial data and explain my current financial position.",
    },
    {
        icon: FaBullseye,
        title: "Reach my financial goals",
        description: "Get guidance for my savings goals",
        question: "Review my financial goals and suggest practical steps to reach them faster.",
    },
];

const INITIAL_MESSAGE = {
    id: "welcome",
    role: "assistant",
    answer:
        "Hello! I'm your NeuroWallet AI Financial Assistant. I can help you understand your spending, review your cash flow, improve your savings habits, and explore your financial goals using the financial context available to your account. What would you like to understand today?",
    recommendations: [],
    createdAt: new Date(),
    isWelcome: true,
};

function getErrorMessage(error) {
    const status = error?.response?.status;
    const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error;

    if (status === 401 || status === 403) {
        return "Your session may have expired or you may not have permission to use the assistant. Please sign in again and retry.";
    }

    if (status === 400 || status === 422) {
        return serverMessage || "Your question could not be processed. Please check it and try again.";
    }

    if (status === 429) {
        return "The AI service is receiving too many requests. Please wait a moment before trying again.";
    }

    if (status >= 500) {
        return "The AI service is temporarily unavailable. Please try again shortly.";
    }

    if (!error?.response) {
        return "Unable to connect to NeuroWallet. Check your network connection and backend service.";
    }

    return serverMessage || error?.message || "Something went wrong. Please try again.";
}

function formatIntent(value) {
    if (!value) return null;

    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAmount(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return null;
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);
}

function MessageTime({ date }) {
    if (!date) return null;

    return (
        <time className="ai-message-time">
            {new Date(date).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            })}
        </time>
    );
}

function AssistantMessage({ message, onCopy, copiedId }) {
    return (
        <article className="ai-chat-message assistant-message">
            <div className="ai-message-avatar assistant-avatar">
                <FaRobot aria-hidden="true" />
            </div>

            <div className="ai-message-content">
                <div className="ai-message-author">
                    <strong>NeuroWallet AI</strong>
                    <span className="ai-message-ai-tag">GEMINI</span>
                    <MessageTime date={message.createdAt} />
                </div>

                <div className="ai-message-bubble">
                    <p className="ai-answer-text">{message.answer}</p>

                    {(message.intent || message.category || message.amount != null) && (
                        <div className="ai-response-metadata">
                            {message.intent && (
                                <span>
                                    <small>Intent</small>
                                    <strong>{formatIntent(message.intent)}</strong>
                                </span>
                            )}

                            {message.category && (
                                <span>
                                    <small>Category</small>
                                    <strong>{formatIntent(message.category)}</strong>
                                </span>
                            )}

                            {message.amount != null && (
                                <span>
                                    <small>Amount</small>
                                    <strong>{formatAmount(message.amount) || String(message.amount)}</strong>
                                </span>
                            )}
                        </div>
                    )}

                    {Array.isArray(message.recommendations) &&
                        message.recommendations.length > 0 && (
                            <section className="ai-recommendations">
                                <div className="ai-recommendations-heading">
                                    <FaLightbulb aria-hidden="true" />
                                    <strong>Recommended next steps</strong>
                                </div>

                                <ul>
                                    {message.recommendations.map((item, index) => (
                                        <li key={`${index}-${String(item)}`}>
                                            {String(item)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                </div>

                <div className="ai-message-actions">
                    <button
                        type="button"
                        onClick={() => onCopy(message)}
                        aria-label="Copy AI response"
                        title="Copy response"
                    >
                        {copiedId === message.id ? <FaCheck /> : <FaCopy />}
                        <span>{copiedId === message.id ? "Copied" : "Copy"}</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

function UserMessage({ message }) {
    return (
        <article className="ai-chat-message user-message">
            <div className="ai-message-content">
                <div className="ai-message-author">
                    <strong>You</strong>
                    <MessageTime date={message.createdAt} />
                </div>

                <div className="ai-message-bubble">
                    <p>{message.question}</p>
                </div>
            </div>

            <div className="ai-message-avatar user-avatar" aria-hidden="true">
                You
            </div>
        </article>
    );
}

function AIInsightsPage() {
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [question, setQuestion] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    const conversationEndRef = useRef(null);
    const inputRef = useRef(null);
    const sendingRef = useRef(false);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, sending, error]);

    const submitQuestion = async (value = question) => {
        const normalizedQuestion = value.trim();

        if (!normalizedQuestion || sendingRef.current) {
            return;
        }

        if (normalizedQuestion.length > 500) {
            setError("Your question cannot exceed 500 characters.");
            return;
        }

        sendingRef.current = true;
        setSending(true);
        setError("");
        setQuestion("");

        const userMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            question: normalizedQuestion,
            createdAt: new Date(),
        };

        setMessages((previous) => [...previous, userMessage]);

        try {
            const response = await askAIAssistant(normalizedQuestion);

            const answer =
                typeof response?.answer === "string"
                    ? response.answer.trim()
                    : "";

            if (!answer) {
                throw new Error(
                    "The AI service returned an empty answer. Please try again."
                );
            }

            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                answer,
                intent: response.intent ?? null,
                category: response.category ?? null,
                amount: response.amount ?? null,
                recommendations: Array.isArray(response.recommendations)
                    ? response.recommendations.filter(
                        (item) => typeof item === "string" && item.trim()
                    )
                    : [],
                createdAt: new Date(),
            };

            setMessages((previous) => [
                ...previous,
                assistantMessage,
            ]);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            sendingRef.current = false;
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        submitQuestion();
    };

    const handleSuggestion = (prompt) => {
        setQuestion(prompt);
        submitQuestion(prompt);
    };

    const handleCopy = async (message) => {
        try {
            const text = [
                message.answer,
                ...(message.recommendations || []).map(
                    (item, index) => `${index + 1}. ${item}`
                ),
            ].join("\n\n");

            await navigator.clipboard.writeText(text);
            setCopiedId(message.id);

            window.setTimeout(() => {
                setCopiedId((current) =>
                    current === message.id ? null : current
                );
            }, 1800);
        } catch {
            setError("Unable to copy this response. Please select and copy the text manually.");
        }
    };

    const clearConversation = () => {
        if (sendingRef.current) return;

        setMessages([
            {
                ...INITIAL_MESSAGE,
                createdAt: new Date(),
            },
        ]);
        setQuestion("");
        setError("");
        setCopiedId(null);
        inputRef.current?.focus();
    };

    const retryLastQuestion = () => {
        const lastQuestion = [...messages]
            .reverse()
            .find((message) => message.role === "user")?.question;

        if (lastQuestion) {
            submitQuestion(lastQuestion);
        }
    };

    const showSuggestions = messages.length === 1;

    return (
        <main className="ai-insights-page">
            <div className="ai-workspace">

                {/* PAGE HEADER */}
                <header className="ai-workspace-header">
                    <div className="ai-header-brand">
                        <div className="ai-header-icon">
                            <FaRobot />
                        </div>

                        <div>
                            <p className="ai-eyebrow">
                                NEUROWALLET INTELLIGENCE
                            </p>
                            <h1>AI Financial Assistant</h1>
                            <p className="ai-page-description">
                                Understand your finances, explore your spending,
                                and make more informed financial decisions.
                            </p>
                        </div>
                    </div>

                    <div className="ai-header-status">
                        <span className="ai-live-indicator" />
                        <span>AI Assistant</span>
                    </div>
                </header>

                {/* CAPABILITY STRIP */}
                <section className="ai-capability-strip" aria-label="Assistant capabilities">
                    <div>
                        <FaChartLine />
                        <span>Spending analysis</span>
                    </div>
                    <div>
                        <FaWallet />
                        <span>Cash flow insights</span>
                    </div>
                    <div>
                        <FaPiggyBank />
                        <span>Savings guidance</span>
                    </div>
                    <div>
                        <FaShieldHalved />
                        <span>Financial awareness</span>
                    </div>
                </section>

                {/* CHAT WORKSPACE */}
                <section className="ai-chat-shell" aria-label="AI financial conversation">
                    <div className="ai-chat-toolbar">
                        <div className="ai-chat-toolbar-title">
                            <span className="ai-toolbar-icon">
                                <FaRegMessage />
                            </span>
                            <div>
                                <h2>Financial conversation</h2>
                                <p>Ask questions about your finances</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="ai-clear-button"
                            onClick={clearConversation}
                            disabled={sending || messages.length === 1}
                        >
                            <FaTrash />
                            <span>New chat</span>
                        </button>
                    </div>

                    {/* MESSAGES */}
                    <div className="ai-conversation" role="log" aria-live="polite" aria-relevant="additions">
                        {messages.map((message) =>
                            message.role === "user" ? (
                                <UserMessage
                                    key={message.id}
                                    message={message}
                                />
                            ) : (
                                <AssistantMessage
                                    key={message.id}
                                    message={message}
                                    onCopy={handleCopy}
                                    copiedId={copiedId}
                                />
                            )
                        )}

                        {sending && (
                            <div className="ai-chat-message assistant-message">
                                <div className="ai-message-avatar assistant-avatar">
                                    <FaRobot />
                                </div>

                                <div className="ai-message-content">
                                    <div className="ai-message-author">
                                        <strong>NeuroWallet AI</strong>
                                        <span className="ai-message-ai-tag">GEMINI</span>
                                    </div>

                                    <div className="ai-typing-bubble" role="status">
                                        <span />
                                        <span />
                                        <span />
                                        <p>Analyzing your question...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={conversationEndRef} />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="ai-chat-error" role="alert">
                            <FaCircleExclamation />
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={retryLastQuestion}
                                disabled={sending || !messages.some((item) => item.role === "user")}
                            >
                                <FaArrowRotateRight />
                                Retry
                            </button>
                        </div>
                    )}

                    {/* SUGGESTIONS */}
                    {showSuggestions && (
                        <section className="ai-suggestions">
                            <div className="ai-suggestions-heading">
                                <FaSparkles />
                                <span>Start with a suggested question</span>
                            </div>

                            <div className="ai-suggestion-grid">
                                {SUGGESTED_PROMPTS.map((prompt) => {
                                    const Icon = prompt.icon;

                                    return (
                                        <button
                                            type="button"
                                            className="ai-suggestion-card"
                                            key={prompt.title}
                                            onClick={() => handleSuggestion(prompt.question)}
                                            disabled={sending}
                                        >
                                            <span className="ai-suggestion-icon">
                                                <Icon />
                                            </span>
                                            <span className="ai-suggestion-copy">
                                                <strong>{prompt.title}</strong>
                                                <small>{prompt.description}</small>
                                            </span>
                                            <span className="ai-suggestion-arrow">↗</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* COMPOSER */}
                    <form className="ai-composer" onSubmit={handleSubmit}>
                        <div className="ai-composer-input-wrap">
                            <textarea
                                ref={inputRef}
                                value={question}
                                onChange={(event) => {
                                    setQuestion(event.target.value);
                                    if (error) setError("");
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        !event.shiftKey &&
                                        !event.nativeEvent.isComposing
                                    ) {
                                        event.preventDefault();
                                        handleSubmit(event);
                                    }
                                }}
                                placeholder="Ask anything about your finances..."
                                rows={2}
                                maxLength={500}
                                disabled={sending}
                                aria-label="Ask your financial question"
                            />

                            <div className="ai-composer-bottom">
                                <span>
                                    <FaShieldHalved />
                                    Your question is processed through your authenticated account.
                                </span>
                                <small>{question.length}/500</small>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="ai-send-button"
                            disabled={sending || !question.trim()}
                            aria-label="Send question"
                        >
                            {sending ? (
                                <span className="ai-send-spinner" />
                            ) : (
                                <FaPaperPlane />
                            )}
                        </button>
                    </form>

                    <div className="ai-chat-disclaimer">
                        <FaShieldHalved />
                        <span>
                            AI can make mistakes. Verify important financial
                            information before making decisions. This assistant
                            does not execute transactions or guarantee investment returns.
                        </span>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="ai-workspace-footer">
                    <span>
                        <FaClock />
                        Conversation is maintained in this page session only.
                    </span>
                    <span>Powered by NeuroWallet AI</span>
                </footer>
            </div>
        </main>
    );
}

export default AIInsightsPage;
