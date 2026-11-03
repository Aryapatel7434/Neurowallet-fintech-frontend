
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaWallet,
    FaArrowTrendUp,
    FaArrowTrendDown,
    FaPiggyBank,
    FaChartPie,
    FaLightbulb,
    FaRotate,
    FaCircleCheck,
    FaShieldHalved,
    FaSackDollar,
    FaRobot,
    FaGaugeHigh,
    FaCircleExclamation,
    FaPlus,
    FaPen,
    FaTrash,
    FaPause,
    FaPlay,
    FaXmark,
    FaCalendarDays,
    FaCoins,
} from "react-icons/fa6";

import { toast } from "react-toastify";

import {
    getBudgetDashboardData,
    createBudget,
    updateBudget,
    deleteBudget,
    updateBudgetStatus,
} from "../../services/budgetService";

import "./BudgetsPage.css";

// =========================================================
// CONSTANTS
// =========================================================

const BUDGET_CATEGORIES = [
    "FOOD",
    "SHOPPING",
    "BILLS",
    "TRAVEL",
    "HEALTH",
    "ENTERTAINMENT",
    "EDUCATION",
    "INVESTMENT",
    "RENT",
    "EMI",
    "TRANSFER",
    "OTHER",
];

const initialBudgetForm = {
    budgetName: "",
    category: "FOOD",
    limitAmount: "",
    alertThreshold: 80,
    periodStart: "",
    periodEnd: "",
};

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value) => {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
};

const getPercentage = (value, total) => {
    const amount = Number(value ?? 0);
    const base = Number(total ?? 0);

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(base) ||
        base <= 0
    ) {
        return 0;
    }

    return Math.min(
        Math.max((amount / base) * 100, 0),
        100
    );
};

const getStatusClass = (status) => {
    const normalized = String(status ?? "").toLowerCase();

    if (
        normalized.includes("excellent") ||
        normalized.includes("healthy") ||
        normalized.includes("good") ||
        normalized.includes("active")
    ) {
        return "healthy";
    }

    if (
        normalized.includes("warning") ||
        normalized.includes("moderate") ||
        normalized.includes("average") ||
        normalized.includes("paused")
    ) {
        return "warning";
    }

    if (
        normalized.includes("poor") ||
        normalized.includes("critical") ||
        normalized.includes("risk") ||
        normalized.includes("cancelled") ||
        normalized.includes("exceeded")
    ) {
        return "critical";
    }

    return "neutral";
};

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

const extractBudgetList = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
};

const getCurrentMonthDates = () => {
    const now = new Date();

    const firstDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const lastDay = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    );

    const toDateInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    return {
        periodStart: toDateInput(firstDay),
        periodEnd: toDateInput(lastDay),
    };
};

// =========================================================
// KPI CARD
// =========================================================

function BudgetMetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    variant,
}) {
    return (
        <article className={`budget-metric-card ${variant || ""}`}>
            <div className="budget-metric-top">
                <span className="budget-metric-label">
                    {title}
                </span>

                <span className="budget-metric-icon">
                    <Icon />
                </span>
            </div>

            <h2 className="budget-metric-value">
                {value}
            </h2>

            <p className="budget-metric-subtitle">
                {subtitle}
            </p>
        </article>
    );
}

// =========================================================
// BUDGET HEALTH PANEL
// =========================================================

function BudgetHealthPanel({ health }) {
    const percentage = Math.min(
        Math.max(Number(health?.healthPercentage ?? 0), 0),
        100
    );

    const status = health?.status || "Not available";

    return (
        <section className="budget-panel budget-health-panel">
            <div className="budget-panel-heading">
                <div>
                    <span className="budget-section-eyebrow">
                        FINANCIAL WELLNESS
                    </span>

                    <h3>Budget Health</h3>

                    <p>
                        Your overall spending and savings position.
                    </p>
                </div>

                <span className="budget-panel-icon">
                    <FaGaugeHigh />
                </span>
            </div>

            <div className="budget-health-content">
                <div
                    className="budget-health-ring"
                    style={{
                        "--health-progress": `${percentage}%`,
                    }}
                    role="img"
                    aria-label={`Budget health ${percentage}%`}
                >
                    <div className="budget-health-ring-inner">
                        <strong>{percentage}%</strong>
                        <span>Health score</span>
                    </div>
                </div>

                <div className="budget-health-details">
                    <span className="budget-detail-label">
                        Current status
                    </span>

                    <span
                        className={`budget-status-pill ${getStatusClass(status)}`}
                    >
                        {status}
                    </span>

                    <div className="budget-health-stat">
                        <span>Total income</span>
                        <strong>
                            {formatCurrency(health?.totalIncome)}
                        </strong>
                    </div>

                    <div className="budget-health-stat">
                        <span>Total expenses</span>
                        <strong>
                            {formatCurrency(health?.totalExpense)}
                        </strong>
                    </div>

                    <div className="budget-health-stat">
                        <span>Remaining balance</span>
                        <strong className="budget-positive-value">
                            {formatCurrency(health?.remainingBudget)}
                        </strong>
                    </div>
                </div>
            </div>
        </section>
    );
}

// =========================================================
// BUDGET ALLOCATION PANEL
// =========================================================

function BudgetAllocationPanel({ advisor }) {
    const essentialBudget = Number(
        advisor?.essentialBudget ?? 0
    );

    const discretionaryBudget = Number(
        advisor?.discretionaryBudget ?? 0
    );

    const essentialExpense = Number(
        advisor?.essentialExpense ?? 0
    );

    const discretionaryExpense = Number(
        advisor?.discretionaryExpense ?? 0
    );

    const totalAllocation =
        essentialBudget + discretionaryBudget;

    const essentialWidth = getPercentage(
        essentialBudget,
        totalAllocation
    );

    const discretionaryWidth = getPercentage(
        discretionaryBudget,
        totalAllocation
    );

    const essentialUsage = getPercentage(
        essentialExpense,
        essentialBudget
    );

    const discretionaryUsage = getPercentage(
        discretionaryExpense,
        discretionaryBudget
    );

    return (
        <section className="budget-panel budget-allocation-panel">
            <div className="budget-panel-heading">
                <div>
                    <span className="budget-section-eyebrow">
                        SMART ALLOCATION
                    </span>

                    <h3>Budget Distribution</h3>

                    <p>
                        Recommended allocation compared with actual spending.
                    </p>
                </div>

                <span className="budget-panel-icon purple">
                    <FaChartPie />
                </span>
            </div>

            <div className="budget-allocation-bar">
                <div
                    className="budget-allocation-essential"
                    style={{ width: `${essentialWidth}%` }}
                />

                <div
                    className="budget-allocation-discretionary"
                    style={{ width: `${discretionaryWidth}%` }}
                />
            </div>

            <div className="budget-allocation-legend">
                <div>
                    <span className="budget-legend-dot essential" />
                    <span>Essential</span>
                </div>

                <div>
                    <span className="budget-legend-dot discretionary" />
                    <span>Discretionary</span>
                </div>
            </div>

            <div className="budget-allocation-item">
                <div className="budget-allocation-item-header">
                    <div>
                        <span className="budget-allocation-name">
                            Essential expenses
                        </span>
                        <small>Recommended allocation</small>
                    </div>

                    <strong>
                        {formatCurrency(essentialBudget)}
                    </strong>
                </div>

                <div className="budget-usage-track">
                    <div
                        className="budget-usage-fill essential"
                        style={{
                            width: `${essentialUsage}%`,
                        }}
                    />
                </div>

                <div className="budget-usage-footer">
                    <span>
                        Spent: {formatCurrency(essentialExpense)}
                    </span>
                    <span>
                        {Math.round(essentialUsage)}% used
                    </span>
                </div>
            </div>

            <div className="budget-allocation-item">
                <div className="budget-allocation-item-header">
                    <div>
                        <span className="budget-allocation-name">
                            Discretionary expenses
                        </span>
                        <small>Recommended allocation</small>
                    </div>

                    <strong>
                        {formatCurrency(discretionaryBudget)}
                    </strong>
                </div>

                <div className="budget-usage-track">
                    <div
                        className="budget-usage-fill discretionary"
                        style={{
                            width: `${discretionaryUsage}%`,
                        }}
                    />
                </div>

                <div className="budget-usage-footer">
                    <span>
                        Spent: {formatCurrency(discretionaryExpense)}
                    </span>
                    <span>
                        {Math.round(discretionaryUsage)}% used
                    </span>
                </div>
            </div>
        </section>
    );
}

// =========================================================
// AI BUDGET ADVISOR
// =========================================================

function BudgetAdvisorPanel({ advisor }) {
    const recommendations = Array.isArray(
        advisor?.recommendations
    )
        ? advisor.recommendations
        : [];

    const priority = advisor?.priority || "Not available";

    return (
        <section className="budget-panel budget-advisor-panel">
            <div className="budget-advisor-heading">
                <div className="budget-advisor-title">
                    <span className="budget-ai-icon">
                        <FaRobot />
                    </span>

                    <div>
                        <span className="budget-section-eyebrow">
                            NEUROWALLET INTELLIGENCE
                        </span>

                        <h3>AI Budget Advisor</h3>
                    </div>
                </div>

                <span
                    className={`budget-priority-pill ${getStatusClass(priority)}`}
                >
                    {priority}
                </span>
            </div>

            <p className="budget-advisor-summary">
                {advisor?.summary ||
                    "Your personalized budget analysis will appear here when available."}
            </p>

            <div className="budget-savings-highlight">
                <div className="budget-savings-icon">
                    <FaPiggyBank />
                </div>

                <div>
                    <span>Recommended monthly savings</span>
                    <strong>
                        {formatCurrency(advisor?.recommendedSavings)}
                    </strong>
                </div>
            </div>

            <div className="budget-recommendation-heading">
                <FaLightbulb />
                <h4>Personalized recommendations</h4>
            </div>

            {recommendations.length > 0 ? (
                <ul className="budget-recommendation-list">
                    {recommendations.map((recommendation, index) => (
                        <li key={`${index}-${recommendation}`}>
                            <span className="budget-recommendation-check">
                                <FaCircleCheck />
                            </span>

                            <span>{recommendation}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="budget-empty-recommendations">
                    No recommendations are available right now.
                </div>
            )}
        </section>
    );
}

// =========================================================
// BUDGET FORM
// =========================================================

function BudgetForm({
    initialData,
    saving,
    onSubmit,
    onClose,
}) {
    const [form, setForm] = useState(() => ({
        ...initialBudgetForm,
        ...getCurrentMonthDates(),
        ...(initialData || {}),
        limitAmount: initialData?.limitAmount ?? "",
        alertThreshold: initialData?.alertThreshold ?? 80,
    }));

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (
            !form.budgetName.trim() ||
            !form.category ||
            Number(form.limitAmount) <= 0 ||
            Number(form.alertThreshold) < 1 ||
            Number(form.alertThreshold) > 100 ||
            !form.periodStart ||
            !form.periodEnd
        ) {
            toast.error("Please enter valid budget details.");
            return;
        }

        if (form.periodEnd < form.periodStart) {
            toast.error("End date cannot be before start date.");
            return;
        }

        onSubmit({
            budgetName: form.budgetName.trim(),
            category: form.category,
            limitAmount: Number(form.limitAmount),
            alertThreshold: Number(form.alertThreshold),
            periodStart: form.periodStart,
            periodEnd: form.periodEnd,
        });
    };

    return (
        <div className="budget-modal-backdrop">
            <section
                className="budget-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="budget-modal-title"
            >
                <div className="budget-modal-header">
                    <div>
                        <span className="budget-section-eyebrow">
                            BUDGET MANAGEMENT
                        </span>

                        <h3 id="budget-modal-title">
                            {initialData ? "Edit Budget" : "Create Budget"}
                        </h3>
                    </div>

                    <button
                        type="button"
                        className="budget-icon-button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close budget form"
                    >
                        <FaXmark />
                    </button>
                </div>

                <form
                    className="budget-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Budget name
                        <input
                            name="budgetName"
                            value={form.budgetName}
                            onChange={handleChange}
                            placeholder="e.g. Monthly groceries"
                            maxLength={100}
                            required
                        />
                    </label>

                    <label>
                        Category
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            {BUDGET_CATEGORIES.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category.replaceAll("_", " ")}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Budget limit (INR)
                        <input
                            type="number"
                            name="limitAmount"
                            value={form.limitAmount}
                            onChange={handleChange}
                            placeholder="Enter budget limit"
                            min="0.01"
                            step="0.01"
                            required
                        />
                    </label>

                    <label>
                        Alert threshold (%)
                        <input
                            type="number"
                            name="alertThreshold"
                            value={form.alertThreshold}
                            onChange={handleChange}
                            min="1"
                            max="100"
                            required
                        />
                    </label>

                    <div className="budget-form-date-grid">
                        <label>
                            Period start
                            <input
                                type="date"
                                name="periodStart"
                                value={form.periodStart}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Period end
                            <input
                                type="date"
                                name="periodEnd"
                                value={form.periodEnd}
                                onChange={handleChange}
                                min={form.periodStart}
                                required
                            />
                        </label>
                    </div>

                    <div className="budget-form-actions">
                        <button
                            type="button"
                            className="budget-secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="budget-primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : initialData
                                    ? "Save Changes"
                                    : "Create Budget"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

// =========================================================
// BUDGET MANAGEMENT PANEL
// =========================================================

function BudgetManagementPanel({
    budgets,
    summary,
    loading,
    onCreate,
    onEdit,
    onDelete,
    onToggleStatus,
}) {
    return (
        <section className="budget-panel budget-management-panel">
            <div className="budget-panel-heading">
                <div>
                    <span className="budget-section-eyebrow">
                        PERSONAL FINANCIAL CONTROL
                    </span>

                    <h3>My Budgets</h3>

                    <p>
                        Manage spending limits and monitor category-wise expenses.
                    </p>
                </div>

                <button
                    type="button"
                    className="budget-primary-button"
                    onClick={onCreate}
                >
                    <FaPlus />
                    Create Budget
                </button>
            </div>

            {summary && (
                <div className="budget-summary-strip">
                    <div>
                        <span>Total allocated</span>
                        <strong>
                            {formatCurrency(summary.totalAllocated)}
                        </strong>
                    </div>

                    <div>
                        <span>Budget spent</span>
                        <strong>
                            {formatCurrency(summary.totalSpent)}
                        </strong>
                    </div>

                    <div>
                        <span>Remaining</span>
                        <strong>
                            {formatCurrency(summary.totalRemaining)}
                        </strong>
                    </div>

                    <div>
                        <span>Exceeded budgets</span>
                        <strong>
                            {summary.exceededBudgets ?? 0}
                        </strong>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="budget-list-loading">
                    Loading your budgets...
                </div>
            ) : budgets.length === 0 ? (
                <div className="budget-management-empty">
                    <FaCoins />
                    <h4>No budgets created yet</h4>
                    <p>
                        Create your first category budget to start tracking
                        your spending against a defined limit.
                    </p>

                    <button
                        type="button"
                        className="budget-primary-button"
                        onClick={onCreate}
                    >
                        <FaPlus />
                        Create Your First Budget
                    </button>
                </div>
            ) : (
                <div className="budget-table-wrapper">
                    <table className="budget-management-table">
                        <thead>
                            <tr>
                                <th>Budget</th>
                                <th>Limit</th>
                                <th>Spent</th>
                                <th>Remaining</th>
                                <th>Usage</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {budgets.map((budget) => {
                                const usage = Math.max(
                                    0,
                                    Number(budget.usagePercentage ?? 0)
                                );

                                const isActive =
                                    budget.status === "ACTIVE";

                                return (
                                    <tr key={budget.budgetId}>
                                        <td>
                                            <div className="budget-table-name">
                                                <strong>
                                                    {budget.budgetName}
                                                </strong>
                                                <span>
                                                    {budget.category}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                budget.limitAmount
                                            )}
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                budget.spentAmount
                                            )}
                                        </td>

                                        <td>
                                            {formatCurrency(
                                                budget.remainingAmount
                                            )}
                                        </td>

                                        <td>
                                            <div className="budget-table-usage">
                                                <strong>
                                                    {usage.toFixed(1)}%
                                                </strong>

                                                <div className="budget-usage-track">
                                                    <div
                                                        className={`budget-usage-fill ${
                                                            usage >= 100
                                                                ? "discretionary"
                                                                : "essential"
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(
                                                                usage,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`budget-status-pill ${getStatusClass(
                                                    budget.status
                                                )}`}
                                            >
                                                {budget.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="budget-row-actions">
                                                <button
                                                    type="button"
                                                    className="budget-icon-button"
                                                    title="Edit budget"
                                                    onClick={() =>
                                                        onEdit(budget)
                                                    }
                                                >
                                                    <FaPen />
                                                </button>

                                                {isActive ? (
                                                    <button
                                                        type="button"
                                                        className="budget-icon-button"
                                                        title="Pause budget"
                                                        onClick={() =>
                                                            onToggleStatus(
                                                                budget
                                                            )
                                                        }
                                                    >
                                                        <FaPause />
                                                    </button>
                                                ) : budget.status === "PAUSED" ? (
                                                    <button
                                                        type="button"
                                                        className="budget-icon-button"
                                                        title="Activate budget"
                                                        onClick={() =>
                                                            onToggleStatus(
                                                                budget
                                                            )
                                                        }
                                                    >
                                                        <FaPlay />
                                                    </button>
                                                ) : null}

                                                <button
                                                    type="button"
                                                    className="budget-icon-button danger"
                                                    title="Delete budget"
                                                    onClick={() =>
                                                        onDelete(budget)
                                                    }
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

// =========================================================
// MAIN BUDGET PAGE
// =========================================================

function BudgetsPage() {
    const [budgetData, setBudgetData] = useState({
        health: null,
        advisor: null,
        summary: null,
        budgets: [],
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [budgetsLoading, setBudgetsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const [loadErrors, setLoadErrors] = useState({
        health: null,
        advisor: null,
        summary: null,
        budgets: null,
    });

    const loadBudgetData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setBudgetsLoading(true);

        try {
            const result = await getBudgetDashboardData();

            setBudgetData({
                health: result.health,
                advisor: result.advisor,
                summary: result.summary,
                budgets: extractBudgetList(result.budgets),
            });

            setLoadErrors(result.errors || {});

            if (
                !result.health &&
                !result.advisor &&
                !result.summary &&
                !result.budgets
            ) {
                toast.error(
                    "Unable to load budget information. Please try again."
                );
            } else if (isRefresh) {
                toast.success("Budget information refreshed.");
            }
        } catch (error) {
            console.error("Budget dashboard error:", error);

            setLoadErrors({
                health: error,
                advisor: error,
                summary: error,
                budgets: error,
            });

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to load budget information."
                )
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
            setBudgetsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBudgetData();
    }, [loadBudgetData]);

    // -----------------------------------------------------
    // CREATE / UPDATE
    // -----------------------------------------------------

    const handleSaveBudget = async (budgetPayload) => {
        setSaving(true);

        try {
            if (editingBudget) {
                await updateBudget(
                    editingBudget.budgetId,
                    budgetPayload
                );

                toast.success("Budget updated successfully.");
            } else {
                await createBudget(budgetPayload);

                toast.success("Budget created successfully.");
            }

            setModalOpen(false);
            setEditingBudget(null);

            await loadBudgetData(true);
        } catch (error) {
            console.error("Budget save error:", error);

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to save budget."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    const handleDeleteBudget = async (budget) => {
        const confirmed = window.confirm(
            `Delete "${budget.budgetName}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteBudget(budget.budgetId);

            toast.success("Budget deleted successfully.");

            await loadBudgetData(true);
        } catch (error) {
            console.error("Budget delete error:", error);

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to delete budget."
                )
            );
        }
    };

    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    const handleToggleStatus = async (budget) => {
        const nextStatus =
            budget.status === "ACTIVE"
                ? "PAUSED"
                : "ACTIVE";

        try {
            await updateBudgetStatus(
                budget.budgetId,
                nextStatus
            );

            toast.success(
                nextStatus === "ACTIVE"
                    ? "Budget activated."
                    : "Budget paused."
            );

            await loadBudgetData(true);
        } catch (error) {
            console.error("Budget status error:", error);

            toast.error(
                getErrorMessage(
                    error,
                    "Unable to update budget status."
                )
            );
        }
    };

    const openCreateModal = () => {
        setEditingBudget(null);
        setModalOpen(true);
    };

    const openEditModal = (budget) => {
        setEditingBudget({
            ...budget,
            periodStart: String(budget.periodStart || "").slice(0, 10),
            periodEnd: String(budget.periodEnd || "").slice(0, 10),
        });

        setModalOpen(true);
    };

    // -----------------------------------------------------
    // DERIVED DATA
    // -----------------------------------------------------

    const { health, advisor, summary, budgets } = budgetData;

    const savingsRate = useMemo(() => {
        const income = Number(advisor?.monthlyIncome ?? 0);
        const savings = Number(advisor?.currentSavings ?? 0);

        if (income <= 0) return 0;

        return Math.round((savings / income) * 100);
    }, [advisor]);

    const hasAnyData = Boolean(
        health ||
        advisor ||
        summary ||
        budgets.length > 0
    );

    if (loading) {
        return (
            <main className="budgets-page">
                <div className="budget-loading-state">
                    <div className="budget-loader" />
                    <h3>Analyzing your financial data</h3>
                    <p>
                        Preparing your budget health and AI recommendations...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="budgets-page">
            {/* PAGE HEADER */}

            <header className="budgets-page-header">
                <div>
                    <span className="budget-page-eyebrow">
                        FINANCIAL MANAGEMENT
                    </span>

                    <h1>Budget Overview</h1>

                    <p>
                        Understand your spending, improve savings and make
                        smarter financial decisions.
                    </p>
                </div>

                <button
                    type="button"
                    className="budget-refresh-button"
                    onClick={() => loadBudgetData(true)}
                    disabled={refreshing}
                >
                    <FaRotate
                        className={
                            refreshing ? "budget-spinning" : ""
                        }
                    />

                    {refreshing ? "Refreshing..." : "Refresh data"}
                </button>
            </header>

            {!hasAnyData && (
                <div className="budget-page-error">
                    <FaCircleExclamation />

                    <div>
                        <strong>Budget data is unavailable</strong>
                        <p>
                            Check your connection and backend services,
                            then refresh this page.
                        </p>
                    </div>
                </div>
            )}

            {/* KPI CARDS */}

            <section className="budget-metrics-grid">
                <BudgetMetricCard
                    title="Monthly Income"
                    value={formatCurrency(
                        advisor?.monthlyIncome ?? health?.totalIncome
                    )}
                    subtitle="Income from your financial activity"
                    icon={FaArrowTrendUp}
                    variant="income"
                />

                <BudgetMetricCard
                    title="Monthly Expenses"
                    value={formatCurrency(
                        advisor?.monthlyExpense ?? health?.totalExpense
                    )}
                    subtitle="Recorded spending activity"
                    icon={FaArrowTrendDown}
                    variant="expense"
                />

                <BudgetMetricCard
                    title="Current Savings"
                    value={formatCurrency(
                        advisor?.currentSavings ??
                        health?.remainingBudget
                    )}
                    subtitle={`${savingsRate}% of monthly income`}
                    icon={FaPiggyBank}
                    variant="savings"
                />

                <BudgetMetricCard
                    title="Recommended Savings"
                    value={formatCurrency(
                        advisor?.recommendedSavings
                    )}
                    subtitle="Personalized savings target"
                    icon={FaSackDollar}
                    variant="recommended"
                />
            </section>

            {/* MAIN ANALYTICS */}

            <section className="budget-main-grid">
                {health ? (
                    <BudgetHealthPanel health={health} />
                ) : (
                    <section className="budget-panel budget-unavailable-panel">
                        <FaShieldHalved />
                        <h3>Budget health unavailable</h3>
                        <p>
                            The budget health service did not return data.
                        </p>
                    </section>
                )}

                {advisor ? (
                    <BudgetAllocationPanel advisor={advisor} />
                ) : (
                    <section className="budget-panel budget-unavailable-panel">
                        <FaChartPie />
                        <h3>Allocation unavailable</h3>
                        <p>
                            The budget advisor service did not return data.
                        </p>
                    </section>
                )}
            </section>

            {/* PERSISTENT BUDGET MANAGEMENT */}

            <BudgetManagementPanel
                budgets={budgets}
                summary={summary}
                loading={budgetsLoading}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDeleteBudget}
                onToggleStatus={handleToggleStatus}
            />

            {/* AI ADVISOR */}

            {advisor ? (
                <BudgetAdvisorPanel advisor={advisor} />
            ) : (
                <section className="budget-panel budget-unavailable-panel">
                    <FaRobot />
                    <h3>AI Budget Advisor unavailable</h3>
                    <p>
                        Recommendations will appear when the advisor
                        service becomes available.
                    </p>
                </section>
            )}

            {/* FOOTNOTE */}

            <footer className="budget-page-footer">
                <FaShieldHalved />

                <span>
                    Budget insights are calculated from your available
                    financial activity. Recommendations are informational
                    and should be reviewed before making financial decisions.
                </span>
            </footer>

            {/* CREATE / EDIT MODAL */}

            {modalOpen && (
                <BudgetForm
                    initialData={editingBudget}
                    saving={saving}
                    onSubmit={handleSaveBudget}
                    onClose={() => {
                        if (!saving) {
                            setModalOpen(false);
                            setEditingBudget(null);
                        }
                    }}
                />
            )}
        </main>
    );
}

export default BudgetsPage;
