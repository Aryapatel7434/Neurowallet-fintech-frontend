import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaCalendarCheck,
    FaClock,
    FaCircleCheck,
    FaCircleExclamation,
    FaBan,
    FaPlus,
    FaRotate,
    FaMagnifyingGlass,
    FaXmark,
    FaArrowLeft,
    FaArrowRight,
    FaEye,
    FaPaperPlane,
    FaWallet,
} from "react-icons/fa6";
import { toast } from "react-toastify";

import {
    createScheduledTransaction,
    getScheduledTransactions,
    getScheduledTransactionById,
    cancelScheduledTransaction,
    getScheduledTransactionAnalytics,
} from "../../services/scheduledTransactionService";

import "../../styles/scheduledTransactionsPage.css";

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
    "ALL",
    "PENDING",
    "SUCCESS",
    "FAILED",
    "CANCELLED",
];

function formatCurrency(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) return "₹0.00";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatus(status) {
    const value = String(status || "PENDING").toUpperCase();

    const config = {
        PENDING: {
            label: "Pending",
            className: "pending",
            icon: FaClock,
        },

        SUCCESS: {
            label: "Completed",
            className: "success",
            icon: FaCircleCheck,
        },

        FAILED: {
            label: "Failed",
            className: "failed",
            icon: FaCircleExclamation,
        },

        CANCELLED: {
            label: "Cancelled",
            className: "cancelled",
            icon: FaBan,
        },
    };

    return config[value] || config.PENDING;
}

function getErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong. Please try again."
    );
}

function getLocalDateTimeMinimum() {
    const now = new Date();

    const local = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
}

function ScheduledTransactionsPage() {
    const [pageData, setPageData] = useState(null);
    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // Account-wide analytics state
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [receiverEmail, setReceiverEmail] = useState("");
    const [amount, setAmount] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    const [selectedTransaction, setSelectedTransaction] =
        useState(null);

    const [detailsLoading, setDetailsLoading] = useState(false);

    const [cancellingId, setCancellingId] = useState(null);
    const [transactionToCancel, setTransactionToCancel] = useState(null);

    const transactions = pageData?.content || [];
    const totalPages = pageData?.totalPages || 0;
    const totalElements = pageData?.totalElements || 0;

    // =========================================================
    // LOAD SCHEDULED TRANSACTIONS
    // =========================================================

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getScheduledTransactions({
                page,
                size: PAGE_SIZE,
            });

            if (!data || !Array.isArray(data.content)) {
                throw new Error(
                    "Unexpected scheduled transaction API response."
                );
            }

            setPageData(data);
        } catch (err) {
            const message = getErrorMessage(err);

            setError(message);
            setPageData(null);
        } finally {
            setLoading(false);
        }
    }, [page]);

    // =========================================================
    // LOAD ACCOUNT-WIDE ANALYTICS
    // =========================================================

    const loadAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        setAnalyticsError("");

        try {
            const data = await getScheduledTransactionAnalytics();

            if (!data || typeof data !== "object") {
                throw new Error(
                    "Unexpected scheduled analytics API response."
                );
            }

            setAnalytics(data);
        } catch (err) {
            setAnalyticsError(getErrorMessage(err));
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    // Initial transaction loading
    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    // Initial analytics loading
    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // =========================================================
    // ESCAPE KEY HANDLING
    // =========================================================

    useEffect(() => {
        const hasOpenDialog =
            showCreateModal ||
            detailsLoading ||
            selectedTransaction ||
            transactionToCancel;

        if (!hasOpenDialog) return undefined;

        const handleEscape = (event) => {
            if (event.key !== "Escape") return;

            if (transactionToCancel && cancellingId === null) {
                setTransactionToCancel(null);
            } else if (showCreateModal && !creating) {
                setShowCreateModal(false);
            } else if (!detailsLoading && cancellingId === null) {
                setSelectedTransaction(null);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [
        showCreateModal,
        creating,
        detailsLoading,
        selectedTransaction,
        transactionToCancel,
        cancellingId,
    ]);

    // =========================================================
    // REFRESH TRANSACTIONS AND ANALYTICS
    // =========================================================

    const refreshTransactions = async () => {
        if (refreshing || loading) return;

        setRefreshing(true);

        try {
            const data = await getScheduledTransactions({
                page,
                size: PAGE_SIZE,
            });

            if (!data || !Array.isArray(data.content)) {
                throw new Error("Unexpected API response.");
            }

            setPageData(data);
            setError("");

            await loadAnalytics();

            toast.success("Scheduled payments refreshed.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setRefreshing(false);
        }
    };

    // =========================================================
    // SEARCH AND STATUS FILTERING
    // =========================================================

    const filteredTransactions = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return transactions.filter((transaction) => {
            const matchesStatus =
                statusFilter === "ALL" ||
                String(transaction.status || "").toUpperCase() ===
                    statusFilter;

            const matchesSearch =
                !keyword ||
                String(
                    transaction.scheduledTransactionId ?? ""
                ).toLowerCase().includes(keyword) ||
                String(transaction.receiverEmail || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(transaction.amount ?? "").includes(keyword);

            return matchesStatus && matchesSearch;
        });
    }, [transactions, search, statusFilter]);

    // =========================================================
    // CREATE FORM RESET
    // =========================================================

    const resetCreateForm = () => {
        setReceiverEmail("");
        setAmount("");
        setScheduledTime("");
    };

    // =========================================================
    // CREATE SCHEDULED PAYMENT
    // =========================================================

    const handleCreate = async (event) => {
        event.preventDefault();

        if (creating) return;

        const cleanEmail = receiverEmail.trim().toLowerCase();
        const cleanAmount = amount.trim();

        if (!cleanEmail) {
            toast.error("Please enter the receiver email.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            toast.error("Enter a valid receiver email.");
            return;
        }

        if (
            !/^\d+(\.\d{1,2})?$/.test(cleanAmount) ||
            !Number.isFinite(Number(cleanAmount)) ||
            Number(cleanAmount) <= 0
        ) {
            toast.error(
                "Enter a valid amount greater than zero with up to two decimal places."
            );
            return;
        }

        if (!scheduledTime) {
            toast.error("Please select a scheduled date and time.");
            return;
        }

        const selectedDate = new Date(scheduledTime);
        const now = new Date();

        if (
            Number.isNaN(selectedDate.getTime()) ||
            selectedDate <= now
        ) {
            toast.error("Scheduled time must be in the future.");
            return;
        }

        setCreating(true);

        try {
            // datetime-local gives local time without a timezone.
            // Keep this as local date-time for the backend LocalDateTime.
            await createScheduledTransaction({
                receiverEmail: cleanEmail,
               amount: cleanAmount,
                scheduledTime:
                    scheduledTime.length === 16
                        ? `${scheduledTime}:00`
                        : scheduledTime,
            });

            toast.success("Scheduled payment created successfully.");

            resetCreateForm();
            setShowCreateModal(false);

            if (page !== 0) {
                setPage(0);
            } else {
                await loadTransactions();
            }

            await loadAnalytics();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    };

    // =========================================================
    // VIEW PAYMENT DETAILS
    // =========================================================

    const handleViewDetails = async (id) => {
        setDetailsLoading(true);
        setSelectedTransaction(null);

        try {
            const data = await getScheduledTransactionById(id);

            setSelectedTransaction(data);
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDetailsLoading(false);
        }
    };

    // =========================================================
    // OPEN CANCELLATION CONFIRMATION
    // =========================================================

    const handleCancel = (transaction) => {
        const id = transaction?.scheduledTransactionId;

        if (!id) {
            toast.error("Unable to identify this scheduled payment.");
            return;
        }

        if (
            String(transaction.status || "").toUpperCase() !== "PENDING"
        ) {
            toast.info("Only pending payments can be cancelled.");
            return;
        }

        setTransactionToCancel(transaction);
    };

    // =========================================================
    // CONFIRM PAYMENT CANCELLATION
    // =========================================================

    const confirmCancellation = async () => {
        const id = transactionToCancel?.scheduledTransactionId;

        if (!id || cancellingId !== null) return;

        setCancellingId(id);

        try {
            await cancelScheduledTransaction(id);

            toast.success("Scheduled payment cancelled.");

            setTransactionToCancel(null);

            setSelectedTransaction((current) =>
                current?.scheduledTransactionId === id ? null : current
            );

            await Promise.all([
                loadTransactions(),
                loadAnalytics(),
            ]);
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setCancellingId(null);
        }
    };

    // =========================================================
    // FILTER HELPERS
    // =========================================================

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
    };

    const hasFilters =
        search.trim() !== "" || statusFilter !== "ALL";

    const firstRecord =
        totalElements === 0 ? 0 : page * PAGE_SIZE + 1;

    const lastRecord = Math.min(
        (page + 1) * PAGE_SIZE,
        totalElements
    );

    // =========================================================
    // PAGE UI
    // =========================================================

    return (
        <div className="nw-scheduled-page">
            <div className="nw-scheduled-container">

                {/* PAGE HEADER */}

                <header className="nw-scheduled-header">
                    <div className="nw-scheduled-heading-copy">
                        <div className="nw-scheduled-eyebrow">
                            <FaCalendarCheck />
                            PAYMENT MANAGEMENT
                        </div>

                        <h1>Scheduled Payments</h1>

                        <p>
                            Plan upcoming transfers, manage payment
                            schedules and monitor execution status.
                        </p>
                    </div>

                    <div className="nw-scheduled-header-actions">
                        <button
                            type="button"
                            className="nw-scheduled-secondary-btn"
                            onClick={refreshTransactions}
                            disabled={loading || refreshing}
                        >
                            <FaRotate
                                className={
                                    refreshing
                                        ? "nw-scheduled-spin"
                                        : ""
                                }
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            className="nw-scheduled-primary-btn"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FaPlus />
                            Schedule Payment
                        </button>
                    </div>
                </header>

                {/* ACCOUNT-WIDE ANALYTICS */}

                <section
                    className="nw-scheduled-stats"
                    aria-label="Account-wide scheduled payment analytics"
                >
                    {/* TOTAL PAYMENTS */}

                    <article className="nw-scheduled-stat-card">
                        <div className="nw-scheduled-stat-top">
                            <span className="nw-scheduled-stat-icon blue">
                                <FaCalendarCheck />
                            </span>

                            <span className="nw-scheduled-stat-caption">
                                Across your account
                            </span>
                        </div>

                        <strong>
                            {analyticsLoading
                                ? "—"
                                : (analytics?.totalScheduledPayments ?? 0)}
                        </strong>

                        <span className="nw-scheduled-stat-label">
                            Total scheduled payments
                        </span>
                    </article>

                    {/* PENDING PAYMENTS */}

                    <article className="nw-scheduled-stat-card">
                        <div className="nw-scheduled-stat-top">
                            <span className="nw-scheduled-stat-icon amber">
                                <FaClock />
                            </span>

                            <span className="nw-scheduled-stat-caption">
                                Awaiting execution
                            </span>
                        </div>

                        <strong>
                            {analyticsLoading
                                ? "—"
                                : (analytics?.pendingPayments ?? 0)}
                        </strong>

                        <span className="nw-scheduled-stat-label">
                            Pending payments
                        </span>
                    </article>

                    {/* SUCCESSFUL PAYMENTS */}

                    <article className="nw-scheduled-stat-card">
                        <div className="nw-scheduled-stat-top">
                            <span className="nw-scheduled-stat-icon green">
                                <FaCircleCheck />
                            </span>

                            <span className="nw-scheduled-stat-caption">
                                Successfully processed
                            </span>
                        </div>

                        <strong>
                            {analyticsLoading
                                ? "—"
                                : (analytics?.successfulPayments ?? 0)}
                        </strong>

                        <span className="nw-scheduled-stat-label">
                            Completed payments
                        </span>
                    </article>

                    {/* FAILED PAYMENTS */}

                    <article className="nw-scheduled-stat-card">
                        <div className="nw-scheduled-stat-top">
                            <span className="nw-scheduled-stat-icon red">
                                <FaCircleExclamation />
                            </span>

                            <span className="nw-scheduled-stat-caption">
                                Needs attention
                            </span>
                        </div>

                        <strong>
                            {analyticsLoading
                                ? "—"
                                : (analytics?.failedPayments ?? 0)}
                        </strong>

                        <span className="nw-scheduled-stat-label">
                            Failed payments
                        </span>
                    </article>
                </section>

                {/* FINANCIAL ANALYTICS */}

                <section
                    className="nw-scheduled-stats"
                    aria-label="Scheduled payment financial summary"
                >
                    {/* TOTAL SCHEDULED AMOUNT */}

                    <article className="nw-scheduled-stat-card">
                        <div className="nw-scheduled-stat-top">
                            <span className="nw-scheduled-stat-icon blue">
                                <FaWallet />
                            </span>

                            <span className="nw-scheduled-stat-caption">
                                All statuses
                            </span>
                        </div>

                        <strong>
                            {analyticsLoading
                                ? "—"
                                : formatCurrency(
                                    analytics?.totalScheduledAmount
                                )}
                        </strong>

                        <span className="nw-scheduled-stat-label">
                            Total scheduled amount
                        </span>
                    </article>

                    {/* SUCCESSFUL AMOUNT */}

                    <article className="nw-scheduled-stat-card">
                        <div className="nw-scheduled-stat-top">
                            <span className="nw-scheduled-stat-icon green">
                                <FaCircleCheck />
                            </span>

                            <span className="nw-scheduled-stat-caption">
                                Successfully processed
                            </span>
                        </div>

                        <strong>
                            {analyticsLoading
                                ? "—"
                                : formatCurrency(
                                    analytics?.totalSuccessfulAmount
                                )}
                        </strong>

                        <span className="nw-scheduled-stat-label">
                            Successful payment amount
                        </span>
                    </article>

                    {/* CANCELLED PAYMENTS */}

                    <article className="nw-scheduled-stat-card">
                        <div className="nw-scheduled-stat-top">
                            <span className="nw-scheduled-stat-icon red">
                                <FaBan />
                            </span>

                            <span className="nw-scheduled-stat-caption">
                                Stopped by user
                            </span>
                        </div>

                        <strong>
                            {analyticsLoading
                                ? "—"
                                : (analytics?.cancelledPayments ?? 0)}
                        </strong>

                        <span className="nw-scheduled-stat-label">
                            Cancelled payments
                        </span>
                    </article>
                </section>

                {/* ANALYTICS ERROR */}

                {analyticsError && (
                    <div
                        className="nw-scheduled-feedback nw-scheduled-error"
                        role="alert"
                    >
                        <FaCircleExclamation />

                        <span>
                            Analytics unavailable: {analyticsError}
                        </span>

                        <button
                            type="button"
                            onClick={loadAnalytics}
                        >
                            Retry analytics
                        </button>
                    </div>
                )}

                {/* MAIN TABLE PANEL */}

                <section className="nw-scheduled-panel">

                    {/* PANEL HEADING */}

                    <div className="nw-scheduled-panel-heading">
                        <div>
                            <h2>Payment schedule</h2>

                            <p>
                                Review and manage your scheduled transfers.
                            </p>
                        </div>

                        <span className="nw-scheduled-total">
                            {totalElements.toLocaleString("en-IN")} records
                        </span>
                    </div>

                    {/* TOOLBAR */}

                    <div className="nw-scheduled-toolbar">
                        <label className="nw-scheduled-search">
                            <FaMagnifyingGlass />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search this page by receiver, payment ID or amount..."
                                aria-label="Search scheduled payments"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <FaXmark />
                                </button>
                            )}
                        </label>

                        <label className="nw-scheduled-status-filter">
                            <span>Status</span>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {status === "ALL"
                                            ? "All statuses"
                                            : status.charAt(0) +
                                              status.slice(1).toLowerCase()}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {hasFilters && (
                            <button
                                type="button"
                                className="nw-scheduled-clear-btn"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* TABLE FEEDBACK */}

                    {loading ? (
                        <div className="nw-scheduled-feedback">
                            <span className="nw-scheduled-loader" />
                            Loading scheduled payments...
                        </div>
                    ) : error ? (
                        <div
                            className="nw-scheduled-feedback nw-scheduled-error"
                            role="alert"
                        >
                            <FaCircleExclamation />

                            <strong>{error}</strong>

                            <button
                                type="button"
                                onClick={loadTransactions}
                            >
                                Try again
                            </button>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="nw-scheduled-empty">
                            <span>
                                <FaCalendarCheck />
                            </span>

                            <h3>
                                {hasFilters
                                    ? "No matching payments"
                                    : "No scheduled payments yet"}
                            </h3>

                            <p>
                                {hasFilters
                                    ? "Try changing your search or status filter."
                                    : "Create a scheduled payment to plan a transfer for a future date."}
                            </p>

                            {hasFilters ? (
                                <button
                                    type="button"
                                    className="nw-scheduled-secondary-btn"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="nw-scheduled-primary-btn"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <FaPlus />
                                    Schedule your first payment
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="nw-scheduled-table-wrap">
                            <table className="nw-scheduled-table">
                                <thead>
                                    <tr>
                                        <th>Payment</th>
                                        <th>Receiver</th>
                                        <th>Amount</th>
                                        <th>Scheduled date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTransactions.map((item) => {
                                        const status = getStatus(item.status);
                                        const StatusIcon = status.icon;
                                        const id = item.scheduledTransactionId;

                                        return (
                                            <tr key={id}>
                                                <td>
                                                    <div className="nw-scheduled-payment-id">
                                                        <span className="nw-scheduled-payment-icon">
                                                            <FaPaperPlane />
                                                        </span>

                                                        <span>
                                                            <strong>
                                                                Payment #{id}
                                                            </strong>

                                                            <small>
                                                                Created{" "}
                                                                {formatDate(item.createdAt)}
                                                            </small>
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="nw-scheduled-email">
                                                        {item.receiverEmail || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="nw-scheduled-amount">
                                                        {formatCurrency(item.amount)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="nw-scheduled-date">
                                                        {formatDate(item.scheduledTime)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`nw-scheduled-status ${status.className}`}
                                                    >
                                                        <StatusIcon />
                                                        {status.label}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="nw-scheduled-row-actions">
                                                        <button
                                                            type="button"
                                                            className="nw-scheduled-icon-btn"
                                                            title="View details"
                                                            aria-label={`View payment ${id}`}
                                                            onClick={() =>
                                                                handleViewDetails(id)
                                                            }
                                                        >
                                                            <FaEye />
                                                        </button>

                                                        {String(item.status).toUpperCase() ===
                                                            "PENDING" && (
                                                            <button
                                                                type="button"
                                                                className="nw-scheduled-cancel-btn"
                                                                disabled={cancellingId === id}
                                                                onClick={() =>
                                                                    handleCancel(item)
                                                                }
                                                            >
                                                                {cancellingId === id
                                                                    ? "Cancelling..."
                                                                    : "Cancel"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}

                    {!loading && !error && totalElements > 0 && (
                        <footer className="nw-scheduled-pagination">
                            <span>
                                Showing {firstRecord}–{lastRecord} of{" "}
                                {totalElements} payments
                            </span>

                            <div className="nw-scheduled-pagination-actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(0, current - 1)
                                        )
                                    }
                                    disabled={page === 0 || loading}
                                    aria-label="Previous page"
                                >
                                    <FaArrowLeft />
                                    Previous
                                </button>

                                <span>
                                    Page {totalPages === 0 ? 0 : page + 1} of{" "}
                                    {totalPages}
                                </span>

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
                                        page + 1 >= totalPages || loading
                                    }
                                    aria-label="Next page"
                                >
                                    Next
                                    <FaArrowRight />
                                </button>
                            </div>
                        </footer>
                    )}
                </section>

                {/* FOOTNOTE */}

                <p className="nw-scheduled-footnote">
                    <FaWallet />
                    Scheduled payments are processed automatically by
                    NeuroWallet when their scheduled execution time arrives.
                </p>
            </div>

            {/* CREATE PAYMENT MODAL */}

            {showCreateModal && (
                <div
                    className="nw-scheduled-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !creating
                        ) {
                            setShowCreateModal(false);
                        }
                    }}
                >
                    <section
                        className="nw-scheduled-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="nw-scheduled-create-title"
                    >
                        <header className="nw-scheduled-modal-header">
                            <div>
                                <span className="nw-scheduled-modal-icon">
                                    <FaCalendarCheck />
                                </span>

                                <div>
                                    <h2 id="nw-scheduled-create-title">
                                        Schedule a payment
                                    </h2>

                                    <p>
                                        Set up a future wallet transfer.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                disabled={creating}
                                aria-label="Close modal"
                            >
                                <FaXmark />
                            </button>
                        </header>

                        <form
                            className="nw-scheduled-form"
                            onSubmit={handleCreate}
                        >
                            <label>
                                <span>Receiver email</span>

                                <input
                                    type="email"
                                    value={receiverEmail}
                                    onChange={(event) =>
                                        setReceiverEmail(event.target.value)
                                    }
                                    placeholder="receiver@example.com"
                                    autoComplete="email"
                                    required
                                />

                                <small>
                                    Enter the email address of a registered
                                    NeuroWallet user.
                                </small>
                            </label>

                            <label>
                                <span>Payment amount (INR)</span>

                                <div className="nw-scheduled-amount-input">
                                    <span>₹</span>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={amount}
                                        onChange={(event) =>
                                            setAmount(event.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </label>

                            <label>
                                <span>Scheduled date and time</span>

                                <input
                                    type="datetime-local"
                                    value={scheduledTime}
                                    min={getLocalDateTimeMinimum()}
                                    onChange={(event) =>
                                        setScheduledTime(event.target.value)
                                    }
                                    required
                                />

                                <small>
                                    Choose a future date and time in your
                                    local timezone.
                                </small>
                            </label>

                            <div className="nw-scheduled-form-note">
                                <FaCircleExclamation />
                                Ensure your wallet has sufficient funds when
                                the payment is due.
                            </div>

                            <footer className="nw-scheduled-form-actions">
                                <button
                                    type="button"
                                    className="nw-scheduled-secondary-btn"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="nw-scheduled-primary-btn"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Scheduling..."
                                        : "Confirm schedule"}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {/* DETAILS MODAL */}

            {(detailsLoading || selectedTransaction) && (
                <div
                    className="nw-scheduled-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedTransaction(null);
                        }
                    }}
                >
                    <section
                        className="nw-scheduled-modal nw-scheduled-details-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="nw-scheduled-details-title"
                    >
                        <header className="nw-scheduled-modal-header">
                            <div>
                                <span className="nw-scheduled-modal-icon">
                                    <FaEye />
                                </span>

                                <div>
                                    <h2 id="nw-scheduled-details-title">
                                        Payment details
                                    </h2>

                                    <p>
                                        Scheduled transaction information.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedTransaction(null)}
                                aria-label="Close details"
                            >
                                <FaXmark />
                            </button>
                        </header>

                        {detailsLoading ? (
                            <div className="nw-scheduled-feedback">
                                <span className="nw-scheduled-loader" />
                                Loading payment details...
                            </div>
                        ) : (
                            selectedTransaction && (
                                <div className="nw-scheduled-detail-content">
                                    <div className="nw-scheduled-detail-amount">
                                        <span>Payment amount</span>

                                        <strong>
                                            {formatCurrency(
                                                selectedTransaction.amount
                                            )}
                                        </strong>

                                        <span>
                                            Payment #
                                            {selectedTransaction.scheduledTransactionId}
                                        </span>
                                    </div>

                                    {[
                                        [
                                            "Receiver",
                                            selectedTransaction.receiverEmail,
                                        ],
                                        [
                                            "Status",
                                            selectedTransaction.status,
                                        ],
                                        [
                                            "Scheduled time",
                                            formatDate(
                                                selectedTransaction.scheduledTime
                                            ),
                                        ],
                                        [
                                            "Created at",
                                            formatDate(
                                                selectedTransaction.createdAt
                                            ),
                                        ],
                                        [
                                            "Executed at",
                                            formatDate(
                                                selectedTransaction.executedAt
                                            ),
                                        ],
                                        [
                                            "Failure reason",
                                            selectedTransaction.failureReason || "—",
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            className="nw-scheduled-detail-row"
                                            key={label}
                                        >
                                            <span>{label}</span>
                                            <strong>{value || "—"}</strong>
                                        </div>
                                    ))}

                                    {String(
                                        selectedTransaction.status
                                    ).toUpperCase() === "PENDING" && (
                                        <button
                                            type="button"
                                            className="nw-scheduled-danger-wide"
                                            onClick={() =>
                                                handleCancel(selectedTransaction)
                                            }
                                            disabled={
                                                cancellingId ===
                                                selectedTransaction.scheduledTransactionId
                                            }
                                        >
                                            {cancellingId
                                                ? "Cancelling..."
                                                : "Cancel scheduled payment"}
                                        </button>
                                    )}
                                </div>
                            )
                        )}
                    </section>
                </div>
            )}

            {/* CANCELLATION CONFIRMATION */}

            {transactionToCancel && (
                <div
                    className="nw-scheduled-modal-backdrop nw-scheduled-confirm-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            cancellingId === null
                        ) {
                            setTransactionToCancel(null);
                        }
                    }}
                >
                    <section
                        className="nw-scheduled-modal nw-scheduled-confirm-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="nw-scheduled-cancel-title"
                        aria-describedby="nw-scheduled-cancel-description"
                    >
                        <div className="nw-scheduled-confirm-icon">
                            <FaBan />
                        </div>

                        <h2 id="nw-scheduled-cancel-title">
                            Cancel scheduled payment?
                        </h2>

                        <p id="nw-scheduled-cancel-description">
                            You are about to cancel payment #
                            {transactionToCancel.scheduledTransactionId} of{" "}
                            <strong>
                                {formatCurrency(transactionToCancel.amount)}
                            </strong>{" "}
                            to{" "}
                            <strong>
                                {transactionToCancel.receiverEmail ||
                                    "the selected receiver"}
                            </strong>
                            . This action cannot be undone.
                        </p>

                        <div className="nw-scheduled-confirm-note">
                            <FaCircleExclamation />
                            The payment will not be executed once cancellation
                            is confirmed.
                        </div>

                        <footer className="nw-scheduled-confirm-actions">
                            <button
                                type="button"
                                className="nw-scheduled-secondary-btn"
                                onClick={() => setTransactionToCancel(null)}
                                disabled={cancellingId !== null}
                            >
                                Keep payment
                            </button>

                            <button
                                type="button"
                                className="nw-scheduled-confirm-danger"
                                onClick={confirmCancellation}
                                disabled={cancellingId !== null}
                            >
                                {cancellingId !== null
                                    ? "Cancelling..."
                                    : "Confirm cancellation"}
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </div>
    );
}

export default ScheduledTransactionsPage;