
import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "react-icons/fa6";
import { toast } from "react-toastify";

import goalService from "../../services/goalService";
import "./GoalsPage.css";

const INITIAL_FORM = {
    goalName: "",
    description: "",
    category: "OTHER",
    targetAmount: "",
    targetDate: "",
    priority: "MEDIUM",
};

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

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const formatDate = (value) => {
    if (!value) return "No date set";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
};

const getProgress = (goal) => {
    const supplied = Number(goal.progressPercentage);

    if (Number.isFinite(supplied)) {
        return Math.min(100, Math.max(0, supplied));
    }

    const target = Number(goal.targetAmount);
    const saved = Number(goal.currentAmount);

    if (!target) return 0;

    return Math.min(100, Math.max(0, (saved / target) * 100));
};

const getGoalsFromResponse = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    return [];
};

const getErrorMessage = (error, fallback) =>
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback;

function SummaryCard({ icon: Icon, label, value, helper, color }) {
    return (
        <article className={`goals-summary-card ${color}`}>
            <div className="goals-summary-top">
                <span className="goals-summary-icon">
                    <Icon />
                </span>
                <span className="goals-summary-helper">{helper}</span>
            </div>

            <p>{label}</p>
            <h2>{value}</h2>
        </article>
    );
}

function GoalCard({ goal, onEdit, onDelete, onContribute }) {
    const category =
        CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.OTHER;

    const CategoryIcon = category.icon;
    const progress = getProgress(goal);
    const completed = goal.status === "COMPLETED";
    const active = goal.status === "ACTIVE";

    return (
        <article className="goals-card">
            <div className="goals-card-heading">
                <div className={`goals-category-icon ${category.color}`}>
                    <CategoryIcon />
                </div>

                <div className="goals-card-menu">
                    <span className={`goals-status ${String(goal.status || "ACTIVE").toLowerCase()}`}>
                        {goal.status || "ACTIVE"}
                    </span>

                    {active && (
                        <button
                            type="button"
                            className="goals-icon-button"
                            onClick={() => onEdit(goal)}
                            aria-label={`Edit ${goal.goalName}`}
                            title="Edit goal"
                        >
                            <FaPen />
                        </button>
                    )}

                    <button
                        type="button"
                        className="goals-icon-button danger"
                        onClick={() => onDelete(goal)}
                        aria-label={`Delete ${goal.goalName}`}
                        title="Delete goal"
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

                <span className={`goals-priority ${String(goal.priority || "MEDIUM").toLowerCase()}`}>
                    {goal.priority || "MEDIUM"}
                </span>
            </div>

            {goal.description && (
                <p className="goals-card-description">
                    {goal.description}
                </p>
            )}

            <div className="goals-progress-info">
                <span>Saved so far</span>
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
                    <strong>{formatCurrency(goal.currentAmount)}</strong>
                    <span>Saved</span>
                </div>

                <div className="goals-target-amount">
                    <strong>{formatCurrency(goal.targetAmount)}</strong>
                    <span>Target</span>
                </div>
            </div>

            <div className="goals-card-footer">
                <div className="goals-deadline">
                    <FaCalendarDays />
                    <span>
                        {completed
                            ? "Goal achieved"
                            : goal.remainingDays < 0
                                ? "Past deadline"
                                : `${goal.remainingDays ?? "—"} days left`}
                    </span>
                </div>

                {active && (
                    <button
                        type="button"
                        className="goals-contribute-button"
                        onClick={() => onContribute(goal)}
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
        </article>
    );
}

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
            toast.error("Goal name must contain at least 3 characters.");
            return;
        }

        if (!Number.isFinite(Number(form.targetAmount)) ||
            Number(form.targetAmount) < 1) {
            toast.error("Enter a valid target amount.");
            return;
        }

        if (!form.targetDate ||
            form.targetDate <= new Date().toISOString().slice(0, 10)) {
            toast.error("Please select a future target date.");
            return;
        }

        onSubmit({
            ...form,
            goalName: form.goalName.trim(),
            description: form.description.trim(),
            targetAmount: Number(form.targetAmount),
        });
    };

    return (
        <div className="goals-modal-backdrop" onMouseDown={onClose}>
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
                            {editingGoal ? "Update your goal" : "Create a new goal"}
                        </h2>
                        <p>
                            Turn your next milestone into a structured savings plan.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="goals-icon-button"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <FaXmark />
                    </button>
                </div>

                <form onSubmit={submit} className="goals-form">
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
                                min="1"
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
                                min={new Date(Date.now() + 86400000)
                                    .toISOString()
                                    .slice(0, 10)}
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Description <span className="goals-optional">(optional)</span>
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

function ContributionModal({ goal, saving, onClose, onSubmit }) {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        setAmount("");
        setNote("");
    }, [goal?.goalId]);

    if (!goal) return null;

    const remaining = Math.max(
        0,
        Number(goal.targetAmount) - Number(goal.currentAmount)
    );

    const submit = (event) => {
        event.preventDefault();

        const value = Number(amount);

        if (!Number.isFinite(value) || value <= 0) {
            toast.error("Enter a valid contribution amount.");
            return;
        }

        if (value > remaining) {
            toast.error("Contribution cannot exceed the remaining amount.");
            return;
        }

        onSubmit({
            amount: value,
            note: note.trim(),
        });
    };

    return (
        <div className="goals-modal-backdrop" onMouseDown={onClose}>
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
                        <h2 id="contribution-title">Add to your goal</h2>
                        <p>{goal.goalName}</p>
                    </div>

                    <button
                        type="button"
                        className="goals-icon-button"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <FaXmark />
                    </button>
                </div>

                <div className="goals-contribution-summary">
                    <span>Remaining amount</span>
                    <strong>{formatCurrency(remaining)}</strong>
                </div>

                <form onSubmit={submit} className="goals-form">
                    <label>
                        Contribution amount (₹)
                        <input
                            type="number"
                            min="0.01"
                            max={remaining}
                            step="0.01"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            placeholder="Enter amount"
                            required
                        />
                    </label>

                    <label>
                        Note <span className="goals-optional">(optional)</span>
                        <textarea
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
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
                            disabled={saving}
                        >
                            {saving ? "Adding..." : "Confirm contribution"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

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

    const [advisor, setAdvisor] = useState(null);
    const [advisorLoading, setAdvisorLoading] = useState(false);
    const [advisorError, setAdvisorError] = useState("");

    const PAGE_SIZE = 6;

    const loadGoals = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);

        setLoadError("");

        try {
            const response = await goalService.getGoals({
                page: 0,
                size: 100,
                sort: "createdAt,desc",
            });

            setGoals(getGoalsFromResponse(response));
        } catch (error) {
            console.error("Goals loading failed:", error);
            setLoadError(
                getErrorMessage(error, "Unable to load your goals.")
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadGoals();

        return () => {};
    }, [loadGoals]);

    const summary = useMemo(() => {
        const totalTarget = goals.reduce(
            (sum, goal) => sum + Number(goal.targetAmount || 0),
            0
        );

        const totalSaved = goals.reduce(
            (sum, goal) => sum + Number(goal.currentAmount || 0),
            0
        );

        const activeGoals = goals.filter(
            (goal) => goal.status === "ACTIVE"
        ).length;

        const completedGoals = goals.filter(
            (goal) => goal.status === "COMPLETED"
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
            overallProgress,
        };
    }, [goals]);

    const filteredGoals = useMemo(() => {
        const query = search.trim().toLowerCase();

        return goals.filter((goal) => {
            const matchesSearch =
                !query ||
                String(goal.goalName || "").toLowerCase().includes(query) ||
                String(goal.description || "").toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" || goal.status === statusFilter;

            const matchesCategory =
                categoryFilter === "ALL" ||
                goal.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [goals, search, statusFilter, categoryFilter]);

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
    }, [search, statusFilter, categoryFilter]);

    const handleRefresh = async () => {
        if (refreshing) return;

        setRefreshing(true);
        await loadGoals(false);
    };

    const openCreateModal = () => {
        setEditingGoal(null);
        setFormOpen(true);
    };

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setFormOpen(true);
    };

    const handleSaveGoal = async (formData) => {
        setFormSaving(true);

        try {
            if (editingGoal) {
                await goalService.updateGoal(
                    editingGoal.goalId,
                    formData
                );
                toast.success("Goal updated successfully.");
            } else {
                await goalService.createGoal(formData);
                toast.success("Your new goal has been created.");
            }

            setFormOpen(false);
            setEditingGoal(null);
            await loadGoals(false);
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Unable to save this goal.")
            );
        } finally {
            setFormSaving(false);
        }
    };

    const handleDeleteGoal = async (goal) => {
        const confirmed = window.confirm(
            `Delete "${goal.goalName}"? Goals with contribution history may need to be cancelled instead.`
        );

        if (!confirmed) return;

        try {
            await goalService.deleteGoal(goal.goalId);
            toast.success("Goal deleted successfully.");
            await loadGoals(false);
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Unable to delete this goal. It may have contribution history."
                )
            );
        }
    };

    const handleAddContribution = async (contributionData) => {
        if (!contributionGoal) return;

        setContributionSaving(true);

        try {
            await goalService.addContribution(
                contributionGoal.goalId,
                contributionData
            );

            toast.success("Contribution added successfully.");
            setContributionGoal(null);
            await loadGoals(false);
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Unable to add contribution.")
            );
        } finally {
            setContributionSaving(false);
        }
    };

    const loadAdvisor = async () => {
        if (advisorLoading) return;

        setAdvisorLoading(true);
        setAdvisorError("");

        try {
            const response = await goalService.getGoalAdvisor();
            setAdvisor(response?.data ?? response);
        } catch (error) {
            console.error("AI Goal Advisor failed:", error);
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

    const advisorEntries = useMemo(() => {
        if (!advisor || typeof advisor !== "object") return [];

        return Object.entries(advisor).filter(
            ([, value]) =>
                value !== null &&
                value !== undefined &&
                typeof value !== "object"
        );
    }, [advisor]);

    return (
        <main className="goals-page">
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
                        <FaRotateRight className={refreshing ? "goals-spin" : ""} />
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

            {loadError && (
                <section className="goals-load-error" role="alert">
                    <div>
                        <strong>We couldn't load your goals.</strong>
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
                    helper="Saved vs target"
                    color="cyan"
                />
            </section>

            <section className="goals-overall-panel">
                <div className="goals-overall-copy">
                    <span className="goals-section-eyebrow">
                        YOUR SAVINGS JOURNEY
                    </span>
                    <h2>Every contribution moves you forward.</h2>
                    <p>
                        You have saved {formatCurrency(summary.totalSaved)} of
                        your {formatCurrency(summary.totalTarget)} combined
                        goal target.
                    </p>
                </div>

                <div className="goals-overall-progress">
                    <div className="goals-overall-progress-heading">
                        <span>Combined progress</span>
                        <strong>{summary.overallProgress.toFixed(1)}%</strong>
                    </div>

                    <div className="goals-overall-track">
                        <span
                            style={{
                                width: `${summary.overallProgress}%`,
                            }}
                        />
                    </div>

                    <div className="goals-overall-footer">
                        <span>{formatCurrency(summary.totalSaved)} saved</span>
                        <span>
                            {formatCurrency(
                                Math.max(0, summary.totalTarget - summary.totalSaved)
                            )} remaining
                        </span>
                    </div>
                </div>
            </section>

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
                        available financial activity.
                    </p>

                    {advisorError && (
                        <p className="goals-advisor-error">{advisorError}</p>
                    )}

                    {advisorEntries.length > 0 && (
                        <div className="goals-advisor-result">
                            {advisorEntries.map(([key, value]) => (
                                <div key={key}>
                                    <span>
                                        {key.replace(/([A-Z])/g, " $1")}
                                    </span>
                                    <strong>{String(value)}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="goals-advisor-button"
                    onClick={loadAdvisor}
                    disabled={advisorLoading}
                >
                    <FaLightbulb />
                    {advisorLoading
                        ? "Analyzing..."
                        : advisor
                            ? "Refresh advice"
                            : "Generate advice"}
                </button>
            </section>

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

                <div className="goals-toolbar">
                    <div className="goals-search">
                        <FaMagnifyingGlass />
                        <input
                            type="search"
                            placeholder="Search goals..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
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
                        onChange={(event) => setCategoryFilter(event.target.value)}
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

                {loading ? (
                    <div className="goals-loading-state" role="status">
                        <span className="goals-loader" />
                        <strong>Loading your financial goals...</strong>
                        <p>Connecting securely to NeuroWallet.</p>
                    </div>
                ) : visibleGoals.length > 0 ? (
                    <>
                        <div className="goals-grid">
                            {visibleGoals.map((goal) => (
                                <GoalCard
                                    key={goal.goalId}
                                    goal={goal}
                                    onEdit={openEditModal}
                                    onDelete={handleDeleteGoal}
                                    onContribute={setContributionGoal}
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
                                        onClick={() => setCurrentPage((page) => page - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => page + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
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

            <ContributionModal
                goal={contributionGoal}
                saving={contributionSaving}
                onClose={() => {
                    if (!contributionSaving) setContributionGoal(null);
                }}
                onSubmit={handleAddContribution}
            />
        </main>
    );
}

export default GoalsPage;
