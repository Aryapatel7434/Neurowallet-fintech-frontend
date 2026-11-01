
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FaArrowDown,
    FaArrowUp,
    FaMagnifyingGlass,
    FaRotateRight,
    FaSliders,
    FaXmark,
} from "react-icons/fa6";
import { toast } from "react-toastify";

import TransactionDetailsDrawer from "../../components/wallet/TransactionDetailsDrawer";
import { getFilteredTransactionHistory } from "../../services/transactionService";
import "../../styles/transactionsPage.css";

const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
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

function formatCurrency(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "—";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(timestamp) {
    if (!timestamp) {
        return "—";
    }

    const date = new Date(timestamp);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
}

function normalizeStatus(status) {
    const value = String(status || "PENDING").toUpperCase();

    if (value === "SUCCESS") return "SUCCESS";

    if (value === "FAILED" || value === "FAILD") {
        return "FAILED";
    }

    return value;
}

function TransactionsPage() {
    // Pagination
    const [page, setPage] = useState(0);
    const [pageData, setPageData] = useState(null);

    // API states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    // Date filters
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Sorting
    const [sortBy, setSortBy] = useState("timestamp");
    const [direction, setDirection] = useState("DESC");

    // Other states
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Prevent outdated API responses from overwriting newer results
    const requestIdRef = useRef(0);

    // Search debounce
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [search]);

    // Reset pagination whenever filters change
    useEffect(() => {
        setPage(0);
    }, [
        debouncedSearch,
        statusFilter,
        typeFilter,
        categoryFilter,
        fromDate,
        toDate,
        sortBy,
        direction,
    ]);

    // Date validation
    const dateRangeError = Boolean(
        fromDate && toDate && fromDate > toDate
    );

    // Fetch transaction history
    const loadTransactions = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        setLoading(true);
        setError("");

        if (dateRangeError) {
            setPageData({
                content: [],
                totalPages: 0,
                totalElements: 0,
            });

            setError("Start date cannot be later than end date.");
            setLoading(false);

            return;
        }

        try {
            const data = await getFilteredTransactionHistory({
                page,
                size: PAGE_SIZE,
                keyword: debouncedSearch,
                status: statusFilter,
                type: typeFilter,
                category: categoryFilter,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                sortBy,
                direction,
            });

            if (!data || !Array.isArray(data.content)) {
                throw new Error(
                    "The transaction API returned an unexpected response."
                );
            }

            // Ignore outdated responses
            if (requestId !== requestIdRef.current) {
                return;
            }

            setPageData(data);
        } catch (err) {
            if (requestId !== requestIdRef.current) {
                return;
            }

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Unable to load transactions. Please try again.";

            setError(message);
            setPageData(null);

            toast.error(message);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [
        page,
        debouncedSearch,
        statusFilter,
        typeFilter,
        categoryFilter,
        fromDate,
        toDate,
        sortBy,
        direction,
        refreshKey,
        dateRangeError,
    ]);

    // Trigger API request
    useEffect(() => {
        loadTransactions();

        return () => {
            requestIdRef.current += 1;
        };
    }, [loadTransactions]);

    // API response data
    const transactions = useMemo(
        () => pageData?.content ?? [],
        [pageData]
    );

    const totalPages = pageData?.totalPages ?? 0;
    const totalElements = pageData?.totalElements ?? 0;

    // Pagination information
    const startRecord =
        totalElements === 0 ? 0 : page * PAGE_SIZE + 1;

    const endRecord = Math.min(
        (page + 1) * PAGE_SIZE,
        totalElements
    );

    // Check whether any filters are active
    const hasActiveFilters = Boolean(
        search.trim() ||
        statusFilter !== "ALL" ||
        typeFilter !== "ALL" ||
        categoryFilter !== "ALL" ||
        fromDate ||
        toDate
    );

    // Clear filters
    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");

        setStatusFilter("ALL");
        setTypeFilter("ALL");
        setCategoryFilter("ALL");

        setFromDate("");
        setToDate("");

        setSortBy("timestamp");
        setDirection("DESC");

        setPage(0);
    };

    return (
        <div className="transactions-layout">
            <section className="transactions-page">

                {/* Page Header */}
                <header className="transactions-heading">
                    <div>
                        <p className="transactions-eyebrow">
                            ACCOUNT ACTIVITY
                        </p>

                        <h1>Transactions</h1>

                        <p>
                            Monitor, search and review your wallet activity.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="transactions-refresh"
                        onClick={() =>
                            setRefreshKey((value) => value + 1)
                        }
                        disabled={loading}
                    >
                        <FaRotateRight
                            className={
                                loading ? "transactions-spin" : ""
                            }
                        />
                        Refresh
                    </button>
                </header>

                {/* Transaction Summary */}
                <section
                    className="transactions-summary"
                    aria-label="Transaction results summary"
                >
                    <div className="transactions-summary-card">
                        <span>
                            {hasActiveFilters
                                ? "Matching transactions"
                                : "Transactions in history"}
                        </span>

                        <strong>
                            {loading && pageData === null
                                ? "—"
                                : totalElements.toLocaleString("en-IN")}
                        </strong>

                        <small>
                            Matching records reported by the backend
                        </small>
                    </div>

                    <div className="transactions-summary-card">
                        <span>Current page</span>

                        <strong>
                            {totalPages === 0 ? 0 : page + 1}
                            {" / "}
                            {totalPages}
                        </strong>

                        <small>Server-side pagination</small>
                    </div>

                    <div className="transactions-summary-card">
                        <span>Records on this page</span>

                        <strong>{transactions.length}</strong>

                        <small>
                            Maximum {PAGE_SIZE} per page
                        </small>
                    </div>
                </section>

                {/* Transactions Panel */}
                <section className="transactions-panel">

                    {/* Search and Basic Filters */}
                    <div className="transactions-toolbar">

                        <label className="transactions-search">
                            <FaMagnifyingGlass aria-hidden="true" />

                            <input
                                type="search"
                                value={search}
                                placeholder="Search transaction ID, email, amount, category..."
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search transaction history"
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="transactions-search-clear"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <FaXmark />
                                </button>
                            )}
                        </label>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            aria-label="Filter by status"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="PENDING">Pending</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(event.target.value)
                            }
                            aria-label="Filter by transaction type"
                        >
                            <option value="ALL">All types</option>
                            <option value="CREDIT">Credit</option>
                            <option value="DEBIT">Debit</option>
                            <option value="TRANSFER">Transfer</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(event.target.value)
                            }
                            aria-label="Filter by category"
                        >
                            <option value="ALL">All categories</option>

                            {CATEGORY_OPTIONS.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category.charAt(0) +
                                        category.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Advanced Filters */}
                    <div className="transactions-advanced-filters">

                        {/* Date Range */}
                        <div className="transactions-date-filter">

                            <label>
                                <span>From date</span>

                                <input
                                    type="date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={(event) =>
                                        setFromDate(event.target.value)
                                    }
                                />
                            </label>

                            <label>
                                <span>To date</span>

                                <input
                                    type="date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(event) =>
                                        setToDate(event.target.value)
                                    }
                                />
                            </label>
                        </div>

                        {/* Sorting */}
                        <div className="transactions-sort-filter">

                            <label>
                                <span>Sort by</span>

                                <select
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(event.target.value)
                                    }
                                >
                                    <option value="timestamp">
                                        Transaction date
                                    </option>

                                    <option value="amount">
                                        Amount
                                    </option>
                                </select>
                            </label>

                            <label>
                                <span>Order</span>

                                <select
                                    value={direction}
                                    onChange={(event) =>
                                        setDirection(event.target.value)
                                    }
                                >
                                    <option value="DESC">
                                        Newest / highest first
                                    </option>

                                    <option value="ASC">
                                        Oldest / lowest first
                                    </option>
                                </select>
                            </label>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="transactions-clear-filters"
                                onClick={clearFilters}
                            >
                                <FaSliders aria-hidden="true" />
                                Clear all filters
                            </button>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div
                            className="transactions-feedback"
                            role="status"
                            aria-live="polite"
                        >
                            <span className="transactions-loading-indicator" />

                            Loading your transactions...
                        </div>
                    ) : error ? (

                        /* Error State */
                        <div
                            className="transactions-feedback transactions-error"
                            role="alert"
                        >
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() =>
                                    setRefreshKey((value) => value + 1)
                                }
                            >
                                Try again
                            </button>
                        </div>
                    ) : transactions.length === 0 ? (

                        /* Empty State */
                        <div className="transactions-feedback">
                            <strong>No transactions found</strong>

                            <span>
                                Try changing your search or filters.
                            </span>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (

                        /* Transactions Table */
                        <div className="transactions-table-wrapper">
                            <table className="transactions-page-table">

                                <thead>
                                    <tr>
                                        <th>Reference</th>
                                        <th>Transaction</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map((tx) => {
                                        const status = normalizeStatus(
                                            tx.status
                                        );

                                        const currentEmail = (
                                            localStorage.getItem("email") || ""
                                        ).toLowerCase();

                                        const isIncoming = Boolean(
                                            currentEmail &&
                                            tx.receiverEmail?.toLowerCase() ===
                                                currentEmail
                                        );

                                        const isOutgoing = Boolean(
                                            currentEmail &&
                                            tx.senderEmail?.toLowerCase() ===
                                                currentEmail
                                        );

                                        const directionLabel = isIncoming
                                            ? "Received from"
                                            : isOutgoing
                                            ? "Sent to"
                                            : "Transaction with";

                                        const counterparty = isIncoming
                                            ? tx.senderEmail
                                            : tx.receiverEmail;

                                        return (
                                            <tr key={tx.transactionId}>

                                                {/* Reference */}
                                                <td>
                                                    <span className="transaction-reference">
                                                        TXN-{tx.transactionId}
                                                    </span>
                                                </td>

                                                {/* Transaction Type */}
                                                <td>
                                                    <div className="transaction-party">

                                                        <span
                                                            className={`transaction-direction ${
                                                                isIncoming
                                                                    ? "incoming"
                                                                    : "outgoing"
                                                            }`}
                                                        >
                                                            {isIncoming
                                                                ? <FaArrowDown />
                                                                : <FaArrowUp />}
                                                        </span>

                                                        <div>
                                                            <strong>
                                                                {tx.type ||
                                                                    "TRANSACTION"}
                                                            </strong>

                                                            <small>
                                                                {directionLabel}{" "}
                                                                {counterparty ||
                                                                    "Unavailable"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td>
                                                    {tx.category || "—"}
                                                </td>

                                                {/* Amount */}
                                                <td className="transaction-amount">
                                                    {formatCurrency(tx.amount)}
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span
                                                        className={`transaction-status status-${status.toLowerCase()}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td>
                                                    {formatDate(tx.timestamp)}
                                                </td>

                                                {/* Details */}
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="transaction-details-button"
                                                        onClick={() =>
                                                            setSelectedTransaction(tx)
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && (
                        <footer className="transactions-pagination">

                            <span>
                                Showing {startRecord}–{endRecord} of{" "}
                                {totalElements.toLocaleString("en-IN")}
                            </span>

                            <div>
                                <button
                                    type="button"
                                    disabled={page <= 0}
                                    onClick={() =>
                                        setPage((current) =>
                                            Math.max(0, current - 1)
                                        )
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {totalPages === 0 ? 0 : page + 1} of{" "}
                                    {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        totalPages === 0 ||
                                        page >= totalPages - 1
                                    }
                                    onClick={() =>
                                        setPage((current) => current + 1)
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </footer>
                    )}
                </section>
            </section>

            {/* Transaction Details Drawer */}
            <TransactionDetailsDrawer
                transaction={selectedTransaction}
                open={Boolean(selectedTransaction)}
                onClose={() => setSelectedTransaction(null)}
            />
        </div>
    );
}

export default TransactionsPage;
