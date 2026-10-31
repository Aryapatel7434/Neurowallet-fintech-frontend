
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiActivity,
  FiArrowUpRight,
  FiBarChart2,
  FiCheck,
  FiCreditCard,
  FiEdit2,
  FiFileText,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiSliders,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  getAIInsights,
  getFinancialScore,
  getBudgetHealth,
  getGoalRecommendation,
  askAIAssistant,
} from "../../services/aiService";

import api from "../../api/axiosConfig";
import "./aiInsightsPage.css";

// These are the real endpoints exposed by AIController.
// axiosConfig supplies the backend base URL and authentication headers.
const RESOURCE_LOADERS = [
  ["insights", getAIInsights],
  ["score", getFinancialScore],
  ["budget", getBudgetHealth],
  ["goals", getGoalRecommendation],
  [
    "analytics",
    () => api.get("/ai/transaction-analytics").then((response) => response.data),
  ],
];

const QUICK_PROMPTS = [
  {
    icon: FiBarChart2,
    title: "Analyze my spending",
    prompt:
      "Analyze my spending patterns and identify the categories where I can reduce unnecessary expenses.",
  },
  {
    icon: FiTrendingUp,
    title: "Improve my savings",
    prompt:
      "Based on my financial data, how can I improve my monthly savings? Give me a practical plan.",
  },
  {
    icon: FiTarget,
    title: "Reach my goals faster",
    prompt:
      "Recommend a realistic monthly savings plan to help me reach my financial goals faster.",
  },
  {
    icon: FiShield,
    title: "Financial health check",
    prompt:
      "Evaluate my financial health and explain the most important areas I should improve.",
  },
];

const createConversation = () => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "New conversation",
  updatedAt: new Date().toISOString(),
  messages: [],
});

function unwrap(value) {
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Object.keys(value).length <= 3
  ) {
    return value.data;
  }

  return value;
}

function firstDefined(source, keys, fallback = null) {
  if (!source || typeof source !== "object") {
    return fallback;
  }

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return fallback;
}

function money(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
}

function percentage(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number) ? `${number.toFixed(2)}%` : "—";
}

function scoreValue(data) {
  const value = firstDefined(data, ["score"]);

  if (value === null) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(0, Math.min(100, number))
    : null;
}

function assistantText(data) {
  if (typeof data === "string") {
    return data;
  }

  return firstDefined(
    data,
    ["answer", "response", "message", "content"],
    "The AI service returned no answer."
  );
}

function formatTime(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function errorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "The request could not be completed. Please try again."
  );
}

function MetricCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <article className={`ai-metric-card tone-${tone}`}>
      <div className="ai-metric-top">
        <span className="ai-metric-icon">
          <Icon />
        </span>
        <span className="ai-metric-label">{label}</span>
      </div>

      <strong className="ai-metric-value">{value}</strong>
    </article>
  );
}

function LoadingLine() {
  return (
    <div className="ai-loading-line">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function AIInsightsPage() {
  const [resources, setResources] = useState({
    insights: null,
    score: null,
    budget: null,
    goals: null,
    analytics: null,
  });

  const [resourceState, setResourceState] = useState("loading");
  const [resourceError, setResourceError] = useState("");

  const [conversations, setConversations] = useState(() => [
    createConversation(),
  ]);

  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [mobilePanel, setMobilePanel] = useState("chat");

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  const activeConversation = useMemo(
    () =>
      conversations.find((item) => item.id === activeId) ||
      conversations[0] ||
      null,
    [conversations, activeId]
  );

  const visibleConversations = useMemo(() => {
    const term = query.trim().toLowerCase();

    const sorted = [...conversations].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    if (!term) {
      return sorted;
    }

    return sorted.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.messages.some((entry) =>
          entry.content.toLowerCase().includes(term)
        )
    );
  }, [conversations, query]);

  // Load all financial resources from the authenticated backend.
  const loadFinancialData = useCallback(async () => {
    setResourceState("loading");
    setResourceError("");

    const results = await Promise.allSettled(
      RESOURCE_LOADERS.map(([, load]) => load())
    );

    const next = {};
    let failures = 0;

    results.forEach((result, index) => {
      const key = RESOURCE_LOADERS[index][0];

      if (result.status === "fulfilled") {
        next[key] = unwrap(result.value);
      } else {
        next[key] = null;
        failures += 1;
        console.error(`NeuroWallet AI resource failed: ${key}`, result.reason);
      }
    });

    setResources((current) => ({
      ...current,
      ...next,
    }));

    setResourceState(
      failures === results.length ? "error" : "ready"
    );

    if (failures > 0) {
      setResourceError(
        `${failures} financial data source(s) could not be loaded. Available data is still displayed.`
      );
    }
  }, []);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages?.length, sending]);

  const handleCreateConversation = () => {
    const item = createConversation();

    setConversations((current) => [item, ...current]);
    setActiveId(item.id);
    setChatError("");
    setMobilePanel("chat");

    inputRef.current?.focus();
  };

  const handleDeleteConversation = (id) => {
    setConversations((current) => {
      const remaining = current.filter((item) => item.id !== id);

      if (remaining.length === 0) {
        const fresh = createConversation();
        setActiveId(fresh.id);
        return [fresh];
      }

      if (activeId === id) {
        setActiveId(remaining[0].id);
      }

      return remaining;
    });

    setMenuId(null);
  };

  const handleBeginRename = (item) => {
    setRenameId(item.id);
    setRenameValue(item.title);
    setMenuId(null);
  };

  const handleSaveRename = (id) => {
    const title = renameValue.trim();

    if (!title) {
      return;
    }

    setConversations((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, title: title.slice(0, 80) }
          : item
      )
    );

    setRenameId(null);
  };

  // The existing backend request accepts a question string only.
  // It does not currently accept conversation history.
  const sendQuestion = async (rawText = message) => {
    const question = rawText.trim();

    if (!question || sending || !activeConversation) {
      return;
    }

    if (question.length > 500) {
      setChatError("Please keep your question within 500 characters.");
      return;
    }

    const conversationId = activeConversation.id;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    setConversations((current) =>
      current.map((item) =>
        item.id === conversationId
          ? {
              ...item,
              title:
                item.messages.length === 0
                  ? question.slice(0, 42) +
                    (question.length > 42 ? "…" : "")
                  : item.title,
              updatedAt: new Date().toISOString(),
              messages: [...item.messages, userMessage],
            }
          : item
      )
    );

    setMessage("");
    setChatError("");
    setSending(true);

    try {
      const response = unwrap(await askAIAssistant(question));
      const content = assistantText(response);

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: String(content),
        createdAt: new Date().toISOString(),
        meta:
          response && typeof response === "object"
            ? {
                intent: response.intent,
                category: response.category,
                amount: response.amount,
                recommendations: Array.isArray(response.recommendations)
                  ? response.recommendations
                  : [],
              }
            : null,
      };

      setConversations((current) =>
        current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                updatedAt: new Date().toISOString(),
                messages: [...item.messages, assistantMessage],
              }
            : item
        )
      );
    } catch (error) {
      setChatError(errorMessage(error));

      // Remove the optimistic user message if the request failed.
      setConversations((current) =>
        current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                messages: item.messages.filter(
                  (entry) => entry.id !== userMessage.id
                ),
              }
            : item
        )
      );
    } finally {
      setSending(false);
    }
  };

  // Exact field mappings from the backend response DTOs.
  const score = scoreValue(resources.score);
  const scoreRating = resources.score?.rating;
  const scoreRisk = resources.score?.risk;
  const scoreRemark = resources.score?.remark;

  const budget = resources.budget || {};
  const analytics = resources.analytics || {};

  const income = budget.totalIncome;
  const expense = budget.totalExpense;
  const remainingBudget = budget.remainingBudget;
  const budgetHealth = budget.healthPercentage;
  const budgetStatus = budget.status;

  const savings = analytics.savings;
  const savingsRatio = analytics.savingsRatio;
  const totalTransactions = analytics.totalTransactions;
  const successfulTransactions = analytics.successfulTransactions;
  const failedTransactions = analytics.failedTransactions;

  const insightData = resources.insights || {};

  const insightList = [
    {
      title: "Saving opportunity",
      body: insightData.savingOpportunity,
    },
    {
      title: "Budget alert",
      body: insightData.budgetAlert,
    },
    {
      title: "Investment suggestion",
      body: insightData.investmentSuggestion,
    },
    {
      title: "Financial risk",
      body: insightData.financialRisk,
    },
  ].filter(
    (item) =>
      typeof item.body === "string" &&
      item.body.trim().length > 0
  );

  const goal = resources.goals || {};

  const hasGoal =
    goal.goalName ||
    goal.recommendation ||
    goal.targetAmount !== null ||
    goal.currentAmount !== null;

  return (
    <main className="ai-workspace-page">
      <header className="ai-workspace-header">
        <div className="ai-header-brand">
          <span className="ai-brand-mark">
            <FiZap />
          </span>

          <div>
            <span className="ai-eyebrow">
              NEUROWALLET INTELLIGENCE
            </span>
            <h1>AI Financial Workspace</h1>
          </div>
        </div>

        <div className="ai-header-actions">
          <span className="ai-model-status">
            <i />
            Gemini AI connected through your backend
          </span>

          <button
            className="ai-icon-button"
            onClick={loadFinancialData}
            title="Refresh financial data"
            aria-label="Refresh financial data"
            disabled={resourceState === "loading"}
          >
            <FiRefreshCw
              className={
                resourceState === "loading" ? "ai-spin" : ""
              }
            />
          </button>
        </div>
      </header>

      <nav className="ai-mobile-tabs" aria-label="AI workspace panels">
        <button
          className={mobilePanel === "library" ? "active" : ""}
          onClick={() => setMobilePanel("library")}
        >
          History
        </button>

        <button
          className={mobilePanel === "chat" ? "active" : ""}
          onClick={() => setMobilePanel("chat")}
        >
          Assistant
        </button>

        <button
          className={mobilePanel === "insights" ? "active" : ""}
          onClick={() => setMobilePanel("insights")}
        >
          Insights
        </button>
      </nav>

      <div className="ai-workspace-grid">
        {/* LEFT: CONVERSATION LIBRARY */}
        <aside
          className={`ai-library-panel ${
            mobilePanel === "library" ? "mobile-visible" : ""
          }`}
        >
          <div className="ai-panel-heading">
            <div>
              <span className="ai-eyebrow">YOUR SPACE</span>
              <h2>Conversations</h2>
            </div>

            <button
              className="ai-icon-button"
              onClick={handleCreateConversation}
              title="New conversation"
              aria-label="New conversation"
            >
              <FiPlus />
            </button>
          </div>

          <button
            className="ai-new-chat-button"
            onClick={handleCreateConversation}
          >
            <FiPlus />
            New conversation
            <span>⌘ K</span>
          </button>

          <label className="ai-search-box">
            <FiSearch />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />

            <kbd>/</kbd>
          </label>

          <div className="ai-library-label">RECENT</div>

          <div className="ai-conversation-list">
            {visibleConversations.length > 0 ? (
              visibleConversations.map((item) => (
                <div
                  key={item.id}
                  className={`ai-conversation-row ${
                    item.id === activeId ? "selected" : ""
                  }`}
                >
                  {renameId === item.id ? (
                    <form
                      className="ai-rename-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleSaveRename(item.id);
                      }}
                    >
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(event) =>
                          setRenameValue(event.target.value)
                        }
                        maxLength={80}
                      />

                      <button type="submit" aria-label="Save title">
                        <FiCheck />
                      </button>

                      <button
                        type="button"
                        onClick={() => setRenameId(null)}
                        aria-label="Cancel rename"
                      >
                        <FiX />
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        className="ai-conversation-select"
                        onClick={() => {
                          setActiveId(item.id);
                          setMobilePanel("chat");
                        }}
                      >
                        <FiMessageCircle />

                        <span>
                          <strong>{item.title}</strong>
                          <small>
                            {item.messages.length
                              ? `${item.messages.length} messages · ${formatTime(
                                  item.updatedAt
                                )}`
                              : "New chat"}
                          </small>
                        </span>
                      </button>

                      <div className="ai-conversation-menu-wrap">
                        <button
                          className="ai-more-button"
                          onClick={() =>
                            setMenuId(
                              menuId === item.id ? null : item.id
                            )
                          }
                          aria-label="Conversation options"
                        >
                          <FiMoreHorizontal />
                        </button>

                        {menuId === item.id && (
                          <div className="ai-popover-menu">
                            <button
                              onClick={() => handleBeginRename(item)}
                            >
                              <FiEdit2 />
                              Rename
                            </button>

                            <button
                              className="danger"
                              onClick={() =>
                                handleDeleteConversation(item.id)
                              }
                            >
                              <FiTrash2 />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="ai-empty-search">
                No matching conversations.
              </div>
            )}
          </div>

          <div className="ai-library-footer">
            <span className="ai-footer-avatar">NW</span>

            <div>
              <strong>NeuroWallet AI</strong>
              <small>Personal finance assistant</small>
            </div>

            <FiSliders />
          </div>
        </aside>

        {/* CENTER: GEMINI AI ASSISTANT */}
        <section
          className={`ai-chat-panel ${
            mobilePanel === "chat" ? "mobile-visible" : ""
          }`}
        >
          <div className="ai-chat-heading">
            <div className="ai-assistant-avatar">
              <FiZap />
            </div>

            <div>
              <h2>Neuro AI Assistant</h2>
              <p>
                <span />
                Online · Financial context enabled
              </p>
            </div>

            <button
              className="ai-icon-button ai-chat-tools"
              title="New conversation"
              onClick={handleCreateConversation}
            >
              <FiEdit2 />
            </button>
          </div>

          <div className="ai-chat-scroll" ref={scrollRef}>
            {activeConversation?.messages?.length > 0 ? (
              <div className="ai-message-stream">
                <div className="ai-date-divider">
                  <span>CONVERSATION</span>
                </div>

                {activeConversation.messages.map((item) => (
                  <article
                    key={item.id}
                    className={`ai-message ${
                      item.role === "user"
                        ? "from-user"
                        : "from-assistant"
                    }`}
                  >
                    {item.role !== "user" && (
                      <span className="ai-message-avatar">
                        <FiZap />
                      </span>
                    )}

                    <div className="ai-message-content">
                      <div className="ai-message-meta">
                        {item.role === "user" ? "You" : "Neuro AI"}
                        <time>{formatTime(item.createdAt)}</time>
                      </div>

                      <div className="ai-message-bubble">
                        {item.content}
                      </div>

                      {item.meta?.intent && (
                        <div className="ai-response-tags">
                          <span>
                            {String(item.meta.intent).replaceAll("_", " ")}
                          </span>

                          {item.meta.category && (
                            <span>{item.meta.category}</span>
                          )}

                          {item.meta.amount != null && (
                            <span>{money(item.meta.amount)}</span>
                          )}
                        </div>
                      )}

                      {item.meta?.recommendations?.length > 0 && (
                        <div className="ai-recommendation-list">
                          <strong>Recommended next steps</strong>

                          {item.meta.recommendations.map(
                            (text, index) => (
                              <p key={`${item.id}-${index}`}>
                                <FiCheck />
                                {text}
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}

                {sending && (
                  <div className="ai-message from-assistant">
                    <span className="ai-message-avatar">
                      <FiZap />
                    </span>

                    <div className="ai-message-content">
                      <div className="ai-message-meta">
                        Neuro AI
                        <span>Analyzing your financial context</span>
                      </div>

                      <div className="ai-message-bubble ai-thinking">
                        <LoadingLine />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ai-chat-welcome">
                <div className="ai-welcome-orb">
                  <FiZap />
                </div>

                <span className="ai-eyebrow">
                  YOUR FINANCIAL COPILOT
                </span>

                <h2>
                  Make your money
                  <br />
                  <em>work smarter.</em>
                </h2>

                <p>
                  Ask about your spending, savings, budget, or financial
                  health. Neuro AI uses the financial context available
                  to your authenticated account.
                </p>

                <div className="ai-prompt-grid">
                  {QUICK_PROMPTS.map(
                    ({ icon: Icon, title, prompt }) => (
                      <button
                        key={title}
                        className="ai-prompt-card"
                        onClick={() => sendQuestion(prompt)}
                        disabled={sending}
                      >
                        <span>
                          <Icon />
                        </span>

                        <strong>{title}</strong>
                        <FiArrowUpRight />
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {chatError && (
            <div className="ai-chat-error" role="alert">
              <FiX />
              {chatError}

              <button
                onClick={() => setChatError("")}
                aria-label="Dismiss error"
              >
                <FiX />
              </button>
            </div>
          )}

          <form
            className="ai-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendQuestion();
            }}
          >
            <textarea
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendQuestion();
                }
              }}
              placeholder="Ask Neuro AI about your finances…"
              maxLength={500}
              rows={2}
              aria-label="Ask Neuro AI"
            />

            <div className="ai-composer-bottom">
              <span>
                <FiShield />
                Your financial data is scoped to your authenticated account
                <b>{message.length}/500</b>
              </span>

              <button
                type="submit"
                disabled={!message.trim() || sending}
                aria-label="Send message"
              >
                <FiSend />
              </button>
            </div>
          </form>

          <p className="ai-disclaimer">
            AI-generated guidance is informational and is not professional
            financial advice.
          </p>
        </section>

        {/* RIGHT: LIVE FINANCIAL INTELLIGENCE */}
        <aside
          className={`ai-insights-panel ${
            mobilePanel === "insights" ? "mobile-visible" : ""
          }`}
        >
          <div className="ai-panel-heading">
            <div>
              <span className="ai-eyebrow">LIVE FINANCIAL DATA</span>
              <h2>Intelligence</h2>
            </div>

            <span
              className={`ai-data-indicator ${resourceState}`}
              title={`Financial data: ${resourceState}`}
            >
              <i />
            </span>
          </div>

          {resourceError && (
            <div className="ai-resource-warning">
              {resourceError}
            </div>
          )}

          <div className="ai-score-card">
            <div className="ai-score-head">
              <span>FINANCIAL HEALTH</span>
              <FiActivity />
            </div>

            <div className="ai-score-main">
              <strong>
                {resourceState === "loading" ? "—" : score ?? "—"}
              </strong>
              <span>/ 100</span>
            </div>

            <div className="ai-score-track">
              <i style={{ width: `${score ?? 0}%` }} />
            </div>

            <p>
              {scoreRating || scoreRemark || "Financial score from your account"}
            </p>

            {scoreRisk && (
              <p className="ai-score-risk">
                Risk level: {scoreRisk}
              </p>
            )}
          </div>

          <div className="ai-section-title">
            <h3>Budget overview</h3>
            <span>From your account</span>
          </div>

          <div className="ai-metrics-grid">
            <MetricCard
              icon={FiTrendingUp}
              label="Total income"
              value={money(income)}
              tone="green"
            />

            <MetricCard
              icon={FiCreditCard}
              label="Total expenses"
              value={money(expense)}
              tone="orange"
            />

            <MetricCard
              icon={FiTarget}
              label="Savings"
              value={money(savings)}
              tone="blue"
            />

            <MetricCard
              icon={FiActivity}
              label="Savings ratio"
              value={percentage(savingsRatio)}
              tone="purple"
            />
          </div>

          <div className="ai-budget-detail">
            <div>
              <span>Remaining budget</span>
              <strong>{money(remainingBudget)}</strong>
            </div>

            <div>
              <span>Budget health</span>
              <strong>
                {budgetHealth == null ? "—" : `${budgetHealth}%`}
              </strong>
            </div>

            {budgetStatus && (
              <p>
                Budget status: <strong>{budgetStatus}</strong>
              </p>
            )}
          </div>

          <div className="ai-section-title">
            <h3>Transaction activity</h3>
            <span>Analytics</span>
          </div>

          <div className="ai-transaction-summary">
            <div>
              <span>Total</span>
              <strong>{totalTransactions ?? "—"}</strong>
            </div>

            <div>
              <span>Successful</span>
              <strong>{successfulTransactions ?? "—"}</strong>
            </div>

            <div>
              <span>Failed</span>
              <strong>{failedTransactions ?? "—"}</strong>
            </div>
          </div>

          <div className="ai-section-title">
            <h3>AI insights</h3>
            <span>{insightList.length} signals</span>
          </div>

          <div className="ai-insight-stack">
            {resourceState === "loading" ? (
              <div className="ai-insight-skeleton">
                <LoadingLine />
              </div>
            ) : insightList.length > 0 ? (
              insightList.map((item) => (
                <article
                  className="ai-insight-item"
                  key={item.title}
                >
                  <span className="ai-insight-icon">
                    <FiZap />
                  </span>

                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="ai-empty-data">
                <FiFileText />
                <span>
                  No insight items returned by the backend yet.
                </span>
              </div>
            )}
          </div>

          <div className="ai-section-title">
            <h3>Goal recommendations</h3>
            <FiTarget />
          </div>

          <div className="ai-goal-card">
            {resourceState === "loading" ? (
              <LoadingLine />
            ) : hasGoal ? (
              <>
                {goal.goalName && (
                  <strong className="ai-goal-name">
                    {goal.goalName}
                  </strong>
                )}

                <div className="ai-goal-amounts">
                  <span>{money(goal.currentAmount)}</span>
                  <span>of {money(goal.targetAmount)}</span>
                </div>

                <div className="ai-goal-progress">
                  <i
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, Number(goal.progressPercentage) || 0)
                      )}%`,
                    }}
                  />
                </div>

                {goal.recommendation && (
                  <p>
                    <FiCheck />
                    {goal.recommendation}
                  </p>
                )}
              </>
            ) : (
              <p className="ai-muted">
                No goal recommendations available yet.
              </p>
            )}
          </div>

          <button
            className="ai-refresh-link"
            onClick={loadFinancialData}
            disabled={resourceState === "loading"}
          >
            <FiRefreshCw />
            Refresh intelligence
          </button>
        </aside>
      </div>
    </main>
  );
}
