
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaBullseye,
    FaPlus,
    FaArrowTrendUp,
    FaWallet,
    FaFlagCheckered,
    FaMagnifyingGlass,
    FaRotateRight,
    FaPen,
    FaTrash,
    FaCoins,
    FaGraduationCap,
    FaPlane,
    FaHouse,
    FaCar,
    FaLaptop,
    FaShieldHalved,
    FaChartLine,
    FaRobot,
    FaCalendarDays,
    FaArrowRight,
    FaXmark,
    FaLightbulb,
    FaCircleCheck,
    FaClock,
    FaPause,
    FaPlay,
    FaBan,
    FaClockRotateLeft,
    FaChevronLeft,
    FaChevronRight,
    FaTriangleExclamation,
    FaCircleInfo,
    FaCheck,
} from "react-icons/fa6";

import { toast } from "react-toastify";

import goalService from "../../services/goalService";
import "./GoalsPage.css";

// ======================================================
// CONSTANTS
// ======================================================

const INITIAL_FORM = {
    goalName: "",
    description: "",
    category: "OTHER",
    targetAmount: "",
    targetDate: "",
    priority: "MEDIUM",
};

const PAGE_SIZE = 6;
const HISTORY_PAGE_SIZE = 5;

const CATEGORY_CONFIG = {
    EMERGENCY_FUND: {
        label: "Emergency fund",
        icon: FaShieldHalved,
        color: "emerald",
    },
    EDUCATION: {
        label: "Education",
        icon: FaGraduationCap,
        color: "blue",
    },
    TRAVEL: {
        label: "Travel",
        icon: FaPlane,
        color: "violet",
    },
    VEHICLE: {
        label: "Vehicle",
        icon: FaCar,
        color: "orange",
    },
    HOME: {
        label: "Home",
        icon: FaHouse,
        color: "cyan",
    },
    GADGETS: {
        label: "Gadgets",
        icon: FaLaptop,
        color: "pink",
    },
    INVESTMENT: {
        label: "Investment",
        icon: FaChartLine,
        color: "green",
    },
    OTHER: {
        label: "Other",
        icon: FaBullseye,
        color: "slate",
    },
};

// ======================================================
// FORMATTERS
// ======================================================

const formatCurrency = (value) => {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? `${value}T00:00:00`
            : value
    );

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatDateTime = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const formatLabel = (value) => {
    if (!value) return "Not available";

    return String(value)
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
};

// ======================================================
// RESPONSE HELPERS
// ======================================================

const getGoalsFromResponse = (response) => {
    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    return [];
};

const getPageContent = (response) => {
    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    return [];
};

const getProgress = (goal) => {
    const supplied = Number(goal?.progressPercentage);

    if (Number.isFinite(supplied)) {
        return Math.min(100, Math.max(0, supplied));
    }

    const target = Number(goal?.targetAmount || 0);
    const saved = Number(goal?.currentAmount || 0);

    if (target <= 0) return 0;

    return Math.min(100, Math.max(0, (saved / target) * 100));
};

// ======================================================
// STATUS HELPERS
// ======================================================

const getStatusClass = (status) => {
    return String(status || "ACTIVE").toLowerCase();
};

const canEditGoal = (goal) => {
    return ["ACTIVE", "PAUSED"].includes(goal.status);
};

const canPauseGoal = (goal) => {
    return goal.status === "ACTIVE";
};

const canResumeGoal = (goal) => {
    return goal.status === "PAUSED";
};

const canCancelGoal = (goal) => {
    return ["ACTIVE", "PAUSED"].includes(goal.status);
};

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
    icon: Icon,
    label,
    value,
    helper,
    color,
}) {
    return (
        <article className={`goals-summary-card ${color}`}>
            <div className="goals-summary-top">
                <span className="goals-summary-icon">
                    <Icon />
                </span>

                <span className="goals-summary-helper">
                    {helper}
                </span>
            </div>

            <p>{label}</p>
            <h2>{value}</h2>
        </article>
    );
}

// ======================================================
// GOAL CARD
// ======================================================

function GoalCard({
    goal,
    busy,
    onEdit,
    onDelete,
    onContribute,
    onHistory,
    onStatusChange,
}) {
    const category =
        CATEGORY_CONFIG[goal.category] ||
        CATEGORY_CONFIG.OTHER;

    const CategoryIcon = category.icon;

    const progress = getProgress(goal);

    const completed = goal.status === "COMPLETED";
    const active = goal.status === "ACTIVE";
    const paused = goal.status === "PAUSED";

    const remaining = Math.max(
        0,
        Number(goal.targetAmount || 0) -
        Number(goal.currentAmount || 0)
    );

    return (
        <article className="goals-card">

            <div className="goals-card-heading">

                <div className={`goals-category-icon ${category.color}`}>
                    <CategoryIcon />
                </div>

                <div className="goals-card-menu">

                    <span className={`goals-status ${getStatusClass(goal.status)}`}>
                        {formatLabel(goal.status)}
                    </span>

                    {canEditGoal(goal) && (
                        <button
                            type="button"
                            className="goals-icon-button"
                            onClick={() => onEdit(goal)}
                            disabled={busy}
                            title="Edit goal"
                            aria-label={`Edit ${goal.goalName}`}
                        >
                            <FaPen />
                        </button>
                    )}

                    <button
                        type="button"
                        className="goals-icon-button danger"
                        onClick={() => onDelete(goal)}
                        disabled={busy}
                        title="Delete goal"
                        aria-label={`Delete ${goal.goalName}`}
                    >
                        <FaTrash />
                    </button>

                </div>
            </div>

            <div className="goals-card-title">

                <div>
                    <span className="goals-category-label">
                        {category.label}
                    </span>

                    <h3>{goal.goalName}</h3>
                </div>

                <span className={`goals-priority ${getStatusClass(goal.priority)}`}>
                    {formatLabel(goal.priority)}
                </span>

            </div>

            {goal.description && (
                <p className="goals-card-description">
                    {goal.description}
                </p>
            )}

            <div className="goals-progress-info">
                <span>Goal progress</span>
                <strong>{progress.toFixed(1)}%</strong>
            </div>

            <div
                className="goals-progress-track"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${goal.goalName} progress`}
            >
                <span
                    className={`goals-progress-fill ${category.color}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="goals-amount-row">

                <div>
                    <strong>
                        {formatCurrency(goal.currentAmount)}
                    </strong>
                    <span>Saved</span>
                </div>

                <div className="goals-target-amount">
                    <strong>
                        {formatCurrency(goal.targetAmount)}
                    </strong>
                    <span>Target</span>
                </div>

            </div>

            <div className="goals-card-footer">

                <div className="goals-deadline">
                    <FaCalendarDays />

                    <span>
                        {completed
                            ? "Goal achieved"
                            : Number(goal.remainingDays) < 0
                                ? `${Math.abs(Number(goal.remainingDays))} days overdue`
                                : `${goal.remainingDays ?? "—"} days left`}
                    </span>
                </div>

                {active && (
                    <button
                        type="button"
                        className="goals-contribute-button"
                        onClick={() => onContribute(goal)}
                        disabled={busy || remaining <= 0}
                    >
                        Add savings <FaArrowRight />
                    </button>
                )}

                {completed && (
                    <span className="goals-completed-label">
                        <FaCircleCheck /> Achieved
                    </span>
                )}

            </div>

            <div className="goals-card-extra-actions">

                <button
                    type="button"
                    onClick={() => onHistory(goal)}
                    disabled={busy}
                >
                    <FaClockRotateLeft /> History
                </button>

                {canPauseGoal(goal) && (
                    <button
                        type="button"
                        onClick={() => onStatusChange(goal, "PAUSED")}
                        disabled={busy}
                    >
                        <FaPause /> Pause
                    </button>
                )}

                {canResumeGoal(goal) && (
                    <button
                        type="button"
                        onClick={() => onStatusChange(goal, "ACTIVE")}
                        disabled={busy}
                    >
                        <FaPlay /> Resume
                    </button>
                )}

                {canCancelGoal(goal) && (
                    <button
                        type="button"
                        className="danger"
                        onClick={() => onStatusChange(goal, "CANCELLED")}
                        disabled={busy}
                    >
                        <FaBan /> Cancel
                    </button>
                )}

            </div>

        </article>
    );
}

// ======================================================
// GOAL FORM MODAL
// ======================================================

function GoalFormModal({
    open,
    editingGoal,
    saving,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (!open) return;

        if (editingGoal) {
            setForm({
                goalName: editingGoal.goalName || "",
                description: editingGoal.description || "",
                category: editingGoal.category || "OTHER",
                targetAmount: editingGoal.targetAmount ?? "",
                targetDate: editingGoal.targetDate || "",
                priority: editingGoal.priority || "MEDIUM",
            });
        } else {
            setForm(INITIAL_FORM);
        }
    }, [open, editingGoal]);

    if (!open) return null;

    const updateField = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const submit = (event) => {
        event.preventDefault();

        if (form.goalName.trim().length < 3) {
            toast.error(
                "Goal name must contain at least 3 characters."
            );
            return;
        }

        const targetAmount = Number(form.targetAmount);

        if (
            !Number.isFinite(targetAmount) ||
            targetAmount <= 0
        ) {
            toast.error("Enter a valid target amount.");
            return;
        }

        if (
            !form.targetDate ||
            form.targetDate <= new Date().toISOString().slice(0, 10)
        ) {
            toast.error("Please select a future target date.");
            return;
        }

        onSubmit({
            ...form,
            goalName: form.goalName.trim(),
            description: form.description.trim(),
            targetAmount,
        });
    };

    return (
        <div
            className="goals-modal-backdrop"
            onMouseDown={onClose}
        >
            <section
                className="goals-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="goal-form-title"
                onMouseDown={(event) => event.stopPropagation()}
            >

                <div className="goals-modal-header">

                    <div>
                        <span className="goals-modal-eyebrow">
                            GOAL MANAGEMENT
                        </span>

                        <h2 id="goal-form-title">
                            {editingGoal
                                ? "Update your goal"
                                : "Create a new goal"}
                        </h2>

                        <p>
                            Turn your next milestone into a structured savings plan.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="goals-icon-button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close dialog"
                    >
                        <FaXmark />
                    </button>

                </div>

                <form
                    onSubmit={submit}
                    className="goals-form"
                >

                    <label>
                        Goal name

                        <input
                            name="goalName"
                            value={form.goalName}
                            onChange={updateField}
                            placeholder="e.g. Build an emergency fund"
                            maxLength={100}
                            required
                        />
                    </label>

                    <div className="goals-form-grid">

                        <label>
                            Category

                            <select
                                name="category"
                                value={form.category}
                                onChange={updateField}
                                required
                            >
                                {Object.entries(CATEGORY_CONFIG).map(
                                    ([value, config]) => (
                                        <option key={value} value={value}>
                                            {config.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label>
                            Priority

                            <select
                                name="priority"
                                value={form.priority}
                                onChange={updateField}
                                required
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </label>

                    </div>

                    <div className="goals-form-grid">

                        <label>
                            Target amount (₹)

                            <input
                                type="number"
                                name="targetAmount"
                                value={form.targetAmount}
                                onChange={updateField}
                                min="0.01"
                                step="0.01"
                                placeholder="100000"
                                required
                            />
                        </label>

                        <label>
                            Target date

                            <input
                                type="date"
                                name="targetDate"
                                value={form.targetDate}
                                onChange={updateField}
                                min={
                                    new Date(Date.now() + 86400000)
                                        .toISOString()
                                        .slice(0, 10)
                                }
                                required
                            />
                        </label>

                    </div>

                    <label>
                        Description
                        <span className="goals-optional">
                            (optional)
                        </span>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={updateField}
                            placeholder="What are you saving for?"
                            rows={3}
                            maxLength={500}
                        />
                    </label>

                    <div className="goals-form-actions">

                        <button
                            type="button"
                            className="goals-secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="goals-primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingGoal
                                    ? "Save changes"
                                    : "Create goal"}
                        </button>

                    </div>

                </form>

            </section>
        </div>
    );
}

// ======================================================
// CONTRIBUTION MODAL
// ======================================================

function ContributionModal({
    goal,
    saving,
    onClose,
    onSubmit,
}) {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        setAmount("");
        setNote("");
    }, [goal?.goalId]);

    if (!goal) return null;

    const remaining = Math.max(
        0,
        Number(goal.targetAmount || 0) -
        Number(goal.currentAmount || 0)
    );

    const submit = (event) => {
        event.preventDefault();

        const value = Number(amount);

        if (!Number.isFinite(value) || value <= 0) {
            toast.error("Enter a valid contribution amount.");
            return;
        }

        if (value > remaining) {
            toast.error(
                "Contribution cannot exceed the remaining amount."
            );
            return;
        }

        onSubmit({
            amount: value,
            note: note.trim(),
        });
    };

    return (
        <div
            className="goals-modal-backdrop"
            onMouseDown={onClose}
        >
            <section
                className="goals-modal goals-contribution-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="contribution-title"
                onMouseDown={(event) => event.stopPropagation()}
            >

                <div className="goals-modal-header">

                    <div>
                        <span className="goals-modal-eyebrow">
                            SAVINGS CONTRIBUTION
                        </span>

                        <h2 id="contribution-title">
                            Add to your goal
                        </h2>

                        <p>{goal.goalName}</p>
                    </div>

                    <button
                        type="button"
                        className="goals-icon-button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close dialog"
                    >
                        <FaXmark />
                    </button>

                </div>

                <div className="goals-contribution-summary">
                    <span>Remaining amount</span>
                    <strong>{formatCurrency(remaining)}</strong>
                </div>

                <form
                    onSubmit={submit}
                    className="goals-form"
                >

                    <label>
                        Contribution amount (₹)

                        <input
                            type="number"
                            min="0.01"
                            max={remaining}
                            step="0.01"
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value)
                            }
                            placeholder="Enter amount"
                            required
                        />
                    </label>

                    <label>
                        Note
                        <span className="goals-optional">
                            (optional)
                        </span>

                        <textarea
                            value={note}
                            onChange={(event) =>
                                setNote(event.target.value)
                            }
                            maxLength={500}
                            rows={3}
                            placeholder="Add a note for this contribution"
                        />
                    </label>

                    <div className="goals-form-actions">

                        <button
                            type="button"
                            className="goals-secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="goals-primary-button"
                            disabled={saving || remaining <= 0}
                        >
                            {saving
                                ? "Adding..."
                                : "Confirm contribution"}
                        </button>

                    </div>

                </form>

            </section>
        </div>
    );
}

// ======================================================
// CONTRIBUTION HISTORY MODAL
// ======================================================

function ContributionHistoryModal({
    goal,
    onClose,
}) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const loadHistory = useCallback(async () => {
        if (!goal?.goalId) return;

        setLoading(true);
        setError("");

        try {
            const response =
                await goalService.getContributionHistory(
                    goal.goalId,
                    {
                        page,
                        size: HISTORY_PAGE_SIZE,
                    }
                );

            setHistory(getPageContent(response));

            const pageData = response?.data ?? response;

            setTotalPages(
                Number(pageData?.totalPages ?? 0)
            );

            setTotalElements(
                Number(pageData?.totalElements ?? 0)
            );

        } catch (err) {
            console.error(
                "Contribution history failed:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to load contribution history."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [goal?.goalId, page]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        setPage(0);
    }, [goal?.goalId]);

    if (!goal) return null;

    return (
        <div
            className="goals-modal-backdrop"
            onMouseDown={onClose}
        >
            <section
                className="goals-modal goals-history-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-title"
                onMouseDown={(event) => event.stopPropagation()}
            >

                <div className="goals-modal-header">

                    <div>
                        <span className="goals-modal-eyebrow">
                            SAVINGS ACTIVITY
                        </span>

                        <h2 id="history-title">
                            Contribution history
                        </h2>

                        <p>{goal.goalName}</p>
                    </div>

                    <button
                        type="button"
                        className="goals-icon-button"
                        onClick={onClose}
                        aria-label="Close history"
                    >
                        <FaXmark />
                    </button>

                </div>

                <div className="goals-history-summary">
                    <div>
                        <span>Total saved</span>
                        <strong>
                            {formatCurrency(goal.currentAmount)}
                        </strong>
                    </div>

                    <div>
                        <span>Contributions</span>
                        <strong>{totalElements}</strong>
                    </div>
                </div>

                {loading ? (
                    <div className="goals-loading-state">
                        <span className="goals-loader" />
                        <strong>Loading contribution history...</strong>
                    </div>
                ) : error ? (
                    <div className="goals-load-error" role="alert">
                        <p>{error}</p>

                        <button
                            type="button"
                            className="goals-secondary-button"
                            onClick={loadHistory}
                        >
                            Try again
                        </button>
                    </div>
                ) : history.length > 0 ? (
                    <>

                        <div className="goals-history-list">

                            {history.map((item) => (
                                <article
                                    className="goals-history-item"
                                    key={item.contributionId}
                                >

                                    <div className="goals-history-icon">
                                        <FaCoins />
                                    </div>

                                    <div className="goals-history-details">

                                        <strong>
                                            {formatCurrency(item.amount)}
                                        </strong>

                                        <span>
                                            {item.note || "Savings contribution"}
                                        </span>

                                        <small>
                                            {formatDateTime(item.createdAt)}
                                        </small>

                                        <small>
                                            Source: {formatLabel(item.source)}
                                        </small>

                                    </div>

                                    <span className="goals-history-success">
                                        <FaCheck /> Added
                                    </span>

                                </article>
                            ))}

                        </div>

                        {totalPages > 1 && (
                            <div className="goals-pagination">

                                <span>
                                    Page {page + 1} of {totalPages}
                                </span>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.max(0, current - 1)
                                            )
                                        }
                                        disabled={page === 0 || loading}
                                    >
                                        <FaChevronLeft /> Previous
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.min(
                                                    totalPages - 1,
                                                    current + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            page >= totalPages - 1 ||
                                            loading
                                        }
                                    >
                                        Next <FaChevronRight />
                                    </button>
                                </div>

                            </div>
                        )}

                    </>
                ) : (
                    <div className="goals-empty-state">
                        <div className="goals-empty-icon">
                            <FaClockRotateLeft />
                        </div>

                        <h3>No contributions yet</h3>

                        <p>
                            Your savings contributions will appear here
                            once you start adding money to this goal.
                        </p>
                    </div>
                )}

            </section>
        </div>
    );
}

// ======================================================
// AI ADVISOR COMPONENT
// ======================================================

function GoalAdvisorPanel({
    advisor,
    loading,
    error,
    onGenerate,
}) {
    const plans = Array.isArray(advisor?.goalPlans)
        ? advisor.goalPlans
        : [];

    const actions = Array.isArray(advisor?.priorityActions)
        ? advisor.priorityActions
        : [];

    return (
        <section className="goals-advisor-panel">

            <div className="goals-advisor-icon">
                <FaRobot />
            </div>

            <div className="goals-advisor-content">

                <span className="goals-section-eyebrow">
                    NEUROWALLET INTELLIGENCE
                </span>

                <h2>AI Goal Advisor</h2>

                <p>
                    Get a savings strategy based on your goals and
                    recorded financial activity.
                </p>

                {error && (
                    <div className="goals-advisor-error" role="alert">
                        <FaTriangleExclamation />
                        {error}
                    </div>
                )}

                {advisor && (
                    <div className="goals-advisor-result">

                        <div className="goals-advisor-metrics">

                            <div>
                                <span>Recorded income</span>
                                <strong>
                                    {formatCurrency(
                                        advisor.totalRecordedIncome
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Recorded expenses</span>
                                <strong>
                                    {formatCurrency(
                                        advisor.totalRecordedExpense
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Net cash flow</span>
                                <strong>
                                    {formatCurrency(
                                        advisor.netRecordedCashFlow
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Active goals</span>
                                <strong>
                                    {advisor.activeGoals ?? 0}
                                </strong>
                            </div>

                            <div>
                                <span>Goals at risk</span>
                                <strong>
                                    {advisor.goalsAtRisk ?? 0}
                                </strong>
                            </div>

                        </div>

                        {advisor.overallAssessment && (
                            <div className="goals-advisor-assessment">

                                <h3>
                                    <FaLightbulb />
                                    Overall assessment
                                </h3>

                                <p>
                                    {advisor.overallAssessment}
                                </p>

                            </div>
                        )}

                        {plans.length > 0 && (
                            <div className="goals-advisor-plans">

                                <h3>Individual goal analysis</h3>

                                {plans.map((plan) => (
                                    <article
                                        key={plan.goalId}
                                        className="goals-advisor-plan"
                                    >

                                        <div className="goals-advisor-plan-heading">
                                            <strong>
                                                {plan.goalName}
                                            </strong>

                                            <span className={`goals-feasibility ${getStatusClass(plan.feasibilityStatus)}`}>
                                                {formatLabel(plan.feasibilityStatus)}
                                            </span>
                                        </div>

                                        <div className="goals-advisor-plan-metrics">

                                            <div>
                                                <span>Progress</span>
                                                <strong>
                                                    {Number(
                                                        plan.progressPercentage || 0
                                                    ).toFixed(1)}%
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Remaining</span>
                                                <strong>
                                                    {formatCurrency(
                                                        plan.remainingAmount
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Monthly required</span>
                                                <strong>
                                                    {formatCurrency(
                                                        plan.requiredMonthlyContribution
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Days left</span>
                                                <strong>
                                                    {plan.remainingDays ?? "—"}
                                                </strong>
                                            </div>

                                        </div>

                                        {plan.advisorRecommendation && (
                                            <p>
                                                {plan.advisorRecommendation}
                                            </p>
                                        )}

                                    </article>
                                ))}

                            </div>
                        )}

                        {actions.length > 0 && (
                            <div className="goals-advisor-actions">

                                <h3>
                                    <FaFlagCheckered />
                                    Priority actions
                                </h3>

                                <ul>
                                    {actions.map((action, index) => (
                                        <li key={index}>
                                            <FaCircleCheck />
                                            <span>{action}</span>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        )}

                        {advisor.dataLimitations && (
                            <div className="goals-advisor-limitations">
                                <FaCircleInfo />

                                <p>
                                    {advisor.dataLimitations}
                                </p>
                            </div>
                        )}

                        {advisor.disclaimer && (
                            <p className="goals-advisor-disclaimer">
                                {advisor.disclaimer}
                            </p>
                        )}

                        {advisor.generatedAt && (
                            <small className="goals-advisor-generated">
                                Generated: {formatDateTime(advisor.generatedAt)}
                            </small>
                        )}

                    </div>
                )}

            </div>

            <button
                type="button"
                className="goals-advisor-button"
                onClick={onGenerate}
                disabled={loading}
            >
                <FaLightbulb />

                {loading
                    ? "Analyzing..."
                    : advisor
                        ? "Refresh advice"
                        : "Generate advice"}
            </button>

        </section>
    );
}

// ======================================================
// MAIN GOALS PAGE
// ======================================================

function GoalsPage() {

    const [goals, setGoals] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const [formOpen, setFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [formSaving, setFormSaving] = useState(false);

    const [contributionGoal, setContributionGoal] = useState(null);
    const [contributionSaving, setContributionSaving] = useState(false);

    const [historyGoal, setHistoryGoal] = useState(null);

    const [advisor, setAdvisor] = useState(null);
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [advisorError, setAdvisorError] = useState("");

    const [busyGoalId, setBusyGoalId] = useState(null);

    // ==================================================
    // LOAD GOALS
    // ==================================================

    const loadGoals = useCallback(async (showLoader = true) => {

        if (showLoader) {
            setLoading(true);
        }

        setLoadError("");

        try {

            const response = await goalService.getGoals({
                page: 0,
                size: 100,
            });

            setGoals(getGoalsFromResponse(response));

        } catch (error) {

            console.error("Goals loading failed:", error);

            setLoadError(
                getErrorMessage(
                    error,
                    "Unable to load your goals."
                )
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    }, []);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    // ==================================================
    // SUMMARY
    // ==================================================

    const summary = useMemo(() => {

        const totalTarget = goals.reduce(
            (sum, goal) =>
                sum + Number(goal.targetAmount || 0),
            0
        );

        const totalSaved = goals.reduce(
            (sum, goal) =>
                sum + Number(goal.currentAmount || 0),
            0
        );

        const activeGoals = goals.filter(
            (goal) => goal.status === "ACTIVE"
        ).length;

        const completedGoals = goals.filter(
            (goal) => goal.status === "COMPLETED"
        ).length;

        const pausedGoals = goals.filter(
            (goal) => goal.status === "PAUSED"
        ).length;

        const overallProgress = totalTarget > 0
            ? Math.min(100, (totalSaved / totalTarget) * 100)
            : 0;

        return {
            totalGoals: goals.length,
            totalTarget,
            totalSaved,
            activeGoals,
            completedGoals,
            pausedGoals,
            overallProgress,
        };

    }, [goals]);

    // ==================================================
    // FILTERING
    // ==================================================

    const filteredGoals = useMemo(() => {

        const query = search.trim().toLowerCase();

        return goals.filter((goal) => {

            const matchesSearch =
                !query ||
                String(goal.goalName || "")
                    .toLowerCase()
                    .includes(query) ||
                String(goal.description || "")
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                goal.status === statusFilter;

            const matchesCategory =
                categoryFilter === "ALL" ||
                goal.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );

        });

    }, [
        goals,
        search,
        statusFilter,
        categoryFilter,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredGoals.length / PAGE_SIZE)
    );

    const visibleGoals = filteredGoals.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        statusFilter,
        categoryFilter,
    ]);

    // ==================================================
    // REFRESH
    // ==================================================

    const handleRefresh = async () => {

        if (refreshing || loading) return;

        setRefreshing(true);

        await loadGoals(false);

    };

    // ==================================================
    // CREATE / EDIT
    // ==================================================

    const openCreateModal = () => {
        setEditingGoal(null);
        setFormOpen(true);
    };

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setFormOpen(true);
    };

    const handleSaveGoal = async (formData) => {

        if (formSaving) return;

        setFormSaving(true);

        try {

            if (editingGoal) {

                await goalService.updateGoal(
                    editingGoal.goalId,
                    formData
                );

                toast.success(
                    "Goal updated successfully."
                );

            } else {

                await goalService.createGoal(formData);

                toast.success(
                    "Your new goal has been created."
                );

            }

            setFormOpen(false);
            setEditingGoal(null);

            await loadGoals(false);

        } catch (error) {

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to save this goal."
                )
            );

        } finally {

            setFormSaving(false);

        }

    };

    // ==================================================
    // DELETE
    // ==================================================

    const handleDeleteGoal = async (goal) => {

        if (busyGoalId !== null) return;

        const confirmed = window.confirm(
            `Delete "${goal.goalName}"? Goals with contribution history may need to be cancelled instead.`
        );

        if (!confirmed) return;

        setBusyGoalId(goal.goalId);

        try {

            await goalService.deleteGoal(goal.goalId);

            toast.success(
                "Goal deleted successfully."
            );

            await loadGoals(false);

        } catch (error) {

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to delete this goal. It may have contribution history."
                )
            );

        } finally {

            setBusyGoalId(null);

        }

    };

    // ==================================================
    // CONTRIBUTION
    // ==================================================

    const handleAddContribution = async (contributionData) => {

        if (!contributionGoal || contributionSaving) {
            return;
        }

        setContributionSaving(true);

        try {

            await goalService.addContribution(
                contributionGoal.goalId,
                contributionData
            );

            toast.success(
                "Contribution added successfully."
            );

            setContributionGoal(null);

            await loadGoals(false);

        } catch (error) {

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to add contribution."
                )
            );

        } finally {

            setContributionSaving(false);

        }

    };

    // ==================================================
    // GOAL LIFECYCLE
    // ==================================================

    const handleStatusChange = async (goal, status) => {

        if (busyGoalId !== null) return;

        if (status === "CANCELLED") {

            const confirmed = window.confirm(
                `Are you sure you want to cancel "${goal.goalName}"? This action cannot be reversed.`
            );

            if (!confirmed) return;

        }

        setBusyGoalId(goal.goalId);

        try {

            await goalService.updateGoalStatus(
                goal.goalId,
                status
            );

            const messages = {
                ACTIVE: "Goal resumed successfully.",
                PAUSED: "Goal paused successfully.",
                CANCELLED: "Goal cancelled successfully.",
            };

            toast.success(
                messages[status] || "Goal status updated."
            );

            await loadGoals(false);

        } catch (error) {

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to update goal status."
                )
            );

        } finally {

            setBusyGoalId(null);

        }

    };

    // ==================================================
    // AI GOAL ADVISOR
    // ==================================================

    const loadAdvisor = async () => {

        if (advisorLoading) return;

        setAdvisorLoading(true);
        setAdvisorError("");

        try {

            const response =
                await goalService.getGoalAdvisor();

            setAdvisor(
                response?.data ?? response
            );

            toast.success(
                "AI Goal Advisor analysis generated."
            );

        } catch (error) {

            console.error(
                "AI Goal Advisor failed:",
                error
            );

            setAdvisorError(
                getErrorMessage(
                    error,
                    "The AI Goal Advisor is temporarily unavailable."
                )
            );

        } finally {

            setAdvisorLoading(false);

        }

    };

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <main className="goals-page">

            {/* PAGE HEADER */}

            <header className="goals-page-header">

                <div>

                    <div className="goals-breadcrumb">
                        WORKSPACE <FaArrowRight /> FINANCIAL PLANNING
                    </div>

                    <h1>My Financial Goals</h1>

                    <p>
                        Plan with purpose. Track your savings.
                        Make every financial milestone count.
                    </p>

                </div>

                <div className="goals-header-actions">

                    <button
                        type="button"
                        className="goals-refresh-button"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                    >
                        <FaRotateRight
                            className={
                                refreshing ? "goals-spin" : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        className="goals-primary-button"
                        onClick={openCreateModal}
                    >
                        <FaPlus /> Create goal
                    </button>

                </div>

            </header>

            {/* ERROR */}

            {loadError && (
                <section
                    className="goals-load-error"
                    role="alert"
                >

                    <div>
                        <strong>
                            We couldn't load your goals.
                        </strong>

                        <p>{loadError}</p>
                    </div>

                    <button
                        type="button"
                        className="goals-secondary-button"
                        onClick={() => loadGoals()}
                    >
                        Try again
                    </button>

                </section>
            )}

            {/* SUMMARY CARDS */}

            <section className="goals-summary-grid">

                <SummaryCard
                    icon={FaBullseye}
                    label="Total goals"
                    value={summary.totalGoals}
                    helper={`${summary.activeGoals} active`}
                    color="blue"
                />

                <SummaryCard
                    icon={FaWallet}
                    label="Total saved"
                    value={formatCurrency(summary.totalSaved)}
                    helper="Across all goals"
                    color="green"
                />

                <SummaryCard
                    icon={FaFlagCheckered}
                    label="Total target"
                    value={formatCurrency(summary.totalTarget)}
                    helper={`${summary.completedGoals} completed`}
                    color="violet"
                />

                <SummaryCard
                    icon={FaArrowTrendUp}
                    label="Overall progress"
                    value={`${summary.overallProgress.toFixed(1)}%`}
                    helper={`${summary.pausedGoals} paused`}
                    color="cyan"
                />

            </section>

            {/* OVERALL PROGRESS */}

            <section className="goals-overall-panel">

                <div className="goals-overall-copy">

                    <span className="goals-section-eyebrow">
                        YOUR SAVINGS JOURNEY
                    </span>

                    <h2>
                        Every contribution moves you forward.
                    </h2>

                    <p>
                        You have saved {formatCurrency(summary.totalSaved)}
                        {" "}of your{" "}
                        {formatCurrency(summary.totalTarget)}
                        {" "}combined goal target.
                    </p>

                </div>

                <div className="goals-overall-progress">

                    <div className="goals-overall-progress-heading">
                        <span>Combined progress</span>

                        <strong>
                            {summary.overallProgress.toFixed(1)}%
                        </strong>
                    </div>

                    <div className="goals-overall-track">

                        <span
                            style={{
                                width: `${summary.overallProgress}%`,
                            }}
                        />

                    </div>

                    <div className="goals-overall-footer">

                        <span>
                            {formatCurrency(summary.totalSaved)} saved
                        </span>

                        <span>
                            {formatCurrency(
                                Math.max(
                                    0,
                                    summary.totalTarget -
                                    summary.totalSaved
                                )
                            )} remaining
                        </span>

                    </div>

                </div>

            </section>

            {/* AI GOAL ADVISOR */}

            <GoalAdvisorPanel
                advisor={advisor}
                loading={advisorLoading}
                error={advisorError}
                onGenerate={loadAdvisor}
            />

            {/* GOAL LIST */}

            <section className="goals-list-section">

                <div className="goals-list-heading">

                    <div>

                        <span className="goals-section-eyebrow">
                            YOUR FINANCIAL PLAN
                        </span>

                        <h2>All goals</h2>

                        <p>
                            Manage your savings targets and monitor progress.
                        </p>

                    </div>

                    <span className="goals-count">
                        {filteredGoals.length}{" "}
                        {filteredGoals.length === 1 ? "goal" : "goals"}
                    </span>

                </div>

                {/* TOOLBAR */}

                <div className="goals-toolbar">

                    <div className="goals-search">

                        <FaMagnifyingGlass />

                        <input
                            type="search"
                            placeholder="Search goals..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        aria-label="Filter by status"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                        aria-label="Filter by category"
                    >
                        <option value="ALL">All categories</option>

                        {Object.entries(CATEGORY_CONFIG).map(
                            ([value, config]) => (
                                <option key={value} value={value}>
                                    {config.label}
                                </option>
                            )
                        )}

                    </select>

                </div>

                {/* GOAL CONTENT */}

                {loading ? (

                    <div
                        className="goals-loading-state"
                        role="status"
                    >
                        <span className="goals-loader" />

                        <strong>
                            Loading your financial goals...
                        </strong>

                        <p>
                            Connecting securely to NeuroWallet.
                        </p>
                    </div>

                ) : visibleGoals.length > 0 ? (

                    <>

                        <div className="goals-grid">

                            {visibleGoals.map((goal) => (

                                <GoalCard
                                    key={goal.goalId}
                                    goal={goal}
                                    busy={busyGoalId === goal.goalId}
                                    onEdit={openEditModal}
                                    onDelete={handleDeleteGoal}
                                    onContribute={setContributionGoal}
                                    onHistory={setHistoryGoal}
                                    onStatusChange={handleStatusChange}
                                />

                            ))}

                        </div>

                        {totalPages > 1 && (

                            <div className="goals-pagination">

                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>

                                <div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.max(1, page - 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        <FaChevronLeft /> Previous
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.min(
                                                    totalPages,
                                                    page + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            currentPage === totalPages
                                        }
                                    >
                                        Next <FaChevronRight />
                                    </button>

                                </div>

                            </div>

                        )}

                    </>

                ) : (

                    <div className="goals-empty-state">

                        <div className="goals-empty-icon">
                            <FaBullseye />
                        </div>

                        <h3>
                            {goals.length === 0
                                ? "Your next milestone starts here."
                                : "No matching goals found."}
                        </h3>

                        <p>
                            {goals.length === 0
                                ? "Create your first financial goal and start building a smarter savings habit."
                                : "Try changing your search or filters to find your goals."}
                        </p>

                        {goals.length === 0 ? (

                            <button
                                type="button"
                                className="goals-primary-button"
                                onClick={openCreateModal}
                            >
                                <FaPlus /> Create your first goal
                            </button>

                        ) : (

                            <button
                                type="button"
                                className="goals-secondary-button"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setCategoryFilter("ALL");
                                }}
                            >
                                Clear filters
                            </button>

                        )}

                    </div>

                )}

            </section>

            {/* CREATE / UPDATE MODAL */}

            <GoalFormModal
                open={formOpen}
                editingGoal={editingGoal}
                saving={formSaving}
                onClose={() => {
                    if (!formSaving) {
                        setFormOpen(false);
                        setEditingGoal(null);
                    }
                }}
                onSubmit={handleSaveGoal}
            />

            {/* CONTRIBUTION MODAL */}

            <ContributionModal
                goal={contributionGoal}
                saving={contributionSaving}
                onClose={() => {
                    if (!contributionSaving) {
                        setContributionGoal(null);
                    }
                }}
                onSubmit={handleAddContribution}
            />

            {/* CONTRIBUTION HISTORY */}

            <ContributionHistoryModal
                goal={historyGoal}
                onClose={() => setHistoryGoal(null)}
            />

        </main>
    );
}

export default GoalsPage;
