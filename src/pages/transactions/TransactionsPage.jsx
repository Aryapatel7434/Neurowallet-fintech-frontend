
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaArrowDown,
    FaArrowUp,
    FaMagnifyingGlass,
    FaRotateRight,
} from "react-icons/fa6";
import { toast } from "react-toastify";

import TransactionDetailsDrawer from "../../components/wallet/TransactionDetailsDrawer";
import { getFilteredTransactionHistory } from "../../services/transactionService";
import "../../styles/transactionsPage.css";

const PAGE_SIZE = 10;

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
}

function formatDate(timestamp) {
    if (!timestamp) return "—";

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
    if (value === "FAILED" || value === "FAILD") return "FAILED";

    return value;
}

function TransactionsPage() {
    const [page, setPage] = useState(0);
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Debounce search input.
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Reset pagination when search or filters change.
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, statusFilter, typeFilter, categoryFilter]);

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getFilteredTransactionHistory({
                page,
                size: PAGE_SIZE,
                keyword: debouncedSearch,
                status: statusFilter,
                type: typeFilter,
                category: categoryFilter,
                sortBy: "timestamp",
                direction: "DESC",
            });

            if (!data || !Array.isArray(data.content)) {
                throw new Error(
                    "The transaction API returned an unexpected response."
                );
            }

            setPageData(data);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load transactions.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [
        page,
        debouncedSearch,
        statusFilter,
        typeFilter,
        categoryFilter,
        refreshKey,
    ]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const transactions = useMemo(
        () => pageData?.content ?? [],
        [pageData]
    );

    const totalPages = pageData?.totalPages ?? 0;
    const totalElements = pageData?.totalElements ?? 0;

    const startRecord =
        totalElements === 0 ? 0 : page * PAGE_SIZE + 1;

    const endRecord = Math.min(
        (page + 1) * PAGE_SIZE,
        totalElements
    );

    const hasActiveFilters =
        Boolean(search.trim()) ||
        statusFilter !== "ALL" ||
        typeFilter !== "ALL" ||
        categoryFilter !== "ALL";

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
        setCategoryFilter("ALL");
        setPage(0);
    };

    return (
        <div className="transactions-layout">
            <section className="transactions-page">
                <header className="transactions-heading">
                    <div>
                        <p className="transactions-eyebrow">
                            ACCOUNT ACTIVITY
                        </p>
                        <h1>Transactions</h1>
                        <p>
                            Review and search your wallet transaction history.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="transactions-refresh"
                        onClick={() => setRefreshKey((value) => value + 1)}
                        disabled={loading}
                    >
                        <FaRotateRight />
                        Refresh
                    </button>
                </header>

                <section className="transactions-summary">
                    <div className="transactions-summary-card">
                        <span>
                            {hasActiveFilters
                                ? "Matching transactions"
                                : "Transactions in history"}
                        </span>
                        <strong>{totalElements}</strong>
                        <small>Records reported by the backend</small>
                    </div>

                    <div className="transactions-summary-card">
                        <span>Current page</span>
                        <strong>
                            {totalPages === 0 ? 0 : page + 1} / {totalPages}
                        </strong>
                        <small>Server-side pagination</small>
                    </div>

                    <div className="transactions-summary-card">
                        <span>Records on this page</span>
                        <strong>{transactions.length}</strong>
                        <small>Returned by the filtered API</small>
                    </div>
                </section>

                <section className="transactions-panel">
                    <div className="transactions-toolbar">
                        <label className="transactions-search">
                            <FaMagnifyingGlass />
                            <input
                                type="search"
                                value={search}
                                placeholder="Search ID, email, category, type or status..."
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search transaction history"
                            />
                        </label>

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

                        <select
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(event.target.value)
                            }
                            aria-label="Filter by category"
                        >
                            <option value="ALL">All categories</option>
                            <option value="FOOD">Food</option>
                            <option value="SHOPPING">Shopping</option>
                            <option value="BILLS">Bills</option>
                            <option value="TRAVEL">Travel</option>
                            <option value="HEALTH">Health</option>
                            <option value="ENTERTAINMENT">Entertainment</option>
                            <option value="EDUCATION">Education</option>
                            <option value="INVESTMENT">Investment</option>
                            <option value="RENT">Rent</option>
                            <option value="EMI">EMI</option>
                            <option value="TRANSFER">Transfer</option>
                            <option value="OTHER">Other</option>
                        </select>

                        {hasActiveFilters && (
                            <button type="button" onClick={clearFilters}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div
                            className="transactions-feedback"
                            role="status"
                            aria-live="polite"
                        >
                            Loading your transactions...
                        </div>
                    ) : error ? (
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
                        <div className="transactions-feedback">
                            No transactions match your search or filters.
                            {hasActiveFilters && (
                                <button type="button" onClick={clearFilters}>
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
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
                                        const status = normalizeStatus(tx.status);
                                        const currentEmail =
                                            localStorage.getItem("email");

                                        const isIncoming =
                                            tx.receiverEmail?.toLowerCase() ===
                                            currentEmail?.toLowerCase();

                                        return (
                                            <tr key={tx.transactionId}>
                                                <td>
                                                    <span className="transaction-reference">
                                                        TXN-{tx.transactionId}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="transaction-party">
                                                        <span
                                                            className={`transaction-direction ${
                                                                isIncoming
                                                                    ? "incoming"
                                                                    : "outgoing"
                                                            }`}
                                                        >
                                                            {isIncoming ? (
                                                                <FaArrowDown />
                                                            ) : (
                                                                <FaArrowUp />
                                                            )}
                                                        </span>

                                                        <div>
                                                            <strong>
                                                                {tx.type ||
                                                                    "TRANSACTION"}
                                                            </strong>
                                                            <small>
                                                                {isIncoming
                                                                    ? "From"
                                                                    : "To"}{" "}
                                                                {isIncoming
                                                                    ? tx.senderEmail ||
                                                                      "Unknown"
                                                                    : tx.receiverEmail ||
                                                                      "Unknown"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>{tx.category || "—"}</td>

                                                <td className="transaction-amount">
                                                    {formatCurrency(tx.amount)}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`transaction-status status-${status.toLowerCase()}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>{formatDate(tx.timestamp)}</td>

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

                    {!loading && !error && (
                        <footer className="transactions-pagination">
                            <span>
                                Showing {startRecord}–{endRecord} of{" "}
                                {totalElements}
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

            <TransactionDetailsDrawer
                transaction={selectedTransaction}
                open={Boolean(selectedTransaction)}
                onClose={() => setSelectedTransaction(null)}
            />
        </div>
    );
}

export default TransactionsPage;
