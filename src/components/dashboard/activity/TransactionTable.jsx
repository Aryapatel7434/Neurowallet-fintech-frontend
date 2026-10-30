
import { useEffect, useMemo, useRef, useState } from "react";

import {
    FaMagnifyingGlass,
    FaArrowDown,
    FaArrowUp,
    FaEllipsisVertical,
    FaDownload,
    FaArrowRight,
    FaArrowLeft,
    FaCircleCheck,
    FaCircleXmark,
    FaClock,
    FaCopy,
    FaFileCsv,
} from "react-icons/fa6";

import "./TransactionTable.css";

const PAGE_SIZE = 5;

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        return {};
    }
}

function TransactionTable({ transactions = [] }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NEWEST");
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [actionMessage, setActionMessage] = useState("");

    const tableRef = useRef(null);
    const menuRef = useRef(null);
    const user = useMemo(() => getCurrentUser(), []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(amount) || 0);

    const getTimestamp = (tx) => {
        const value = tx.timestamp || tx.createdAt || tx.date;
        const timestamp = new Date(value).getTime();

        return Number.isFinite(timestamp) ? timestamp : 0;
    };

    const getTransactionKey = (tx, index) =>
        String(tx.transactionId ?? `${getTimestamp(tx)}-${index}`);

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = transactions.filter((tx) => {
            const sender = String(tx.senderEmail || "").toLowerCase();
            const receiver = String(tx.receiverEmail || "").toLowerCase();
            const id = String(tx.transactionId ?? "").toLowerCase();
            const amount = String(tx.amount ?? "");
            const status = String(tx.status || "").toUpperCase();

            const matchesSearch =
                !query ||
                sender.includes(query) ||
                receiver.includes(query) ||
                id.includes(query) ||
                amount.includes(query) ||
                status.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "ALL" || status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "OLDEST":
                    return getTimestamp(a) - getTimestamp(b);

                case "HIGH_AMOUNT":
                    return Number(b.amount || 0) - Number(a.amount || 0);

                case "LOW_AMOUNT":
                    return Number(a.amount || 0) - Number(b.amount || 0);

                case "NEWEST":
                default:
                    return getTimestamp(b) - getTimestamp(a);
            }
        });
    }, [transactions, search, statusFilter, sortBy]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTransactions.length / PAGE_SIZE)
    );

    const safePage = Math.min(currentPage, totalPages);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (safePage - 1) * PAGE_SIZE;

        return filteredTransactions.slice(
            startIndex,
            startIndex + PAGE_SIZE
        );
    }, [filteredTransactions, safePage]);

    const firstRecord =
        filteredTransactions.length === 0
            ? 0
            : (safePage - 1) * PAGE_SIZE + 1;

    const lastRecord = Math.min(
        safePage * PAGE_SIZE,
        filteredTransactions.length
    );

    useEffect(() => {
        setCurrentPage(1);
        setOpenMenuId(null);
        setActionMessage("");
    }, [search, statusFilter, sortBy]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenuId(null);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const escapeCSV = (value) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

    const downloadCSV = (rows, filename) => {
        const headers = [
            "Transaction ID",
            "Sender",
            "Receiver",
            "Amount",
            "Status",
            "Date",
        ];

        const csvRows = rows.map((tx) => [
            tx.transactionId,
            tx.senderEmail,
            tx.receiverEmail,
            tx.amount,
            tx.status,
            getTimestamp(tx)
                ? new Date(getTimestamp(tx)).toLocaleString("en-IN")
                : "",
        ]);

        const csv = [headers, ...csvRows]
            .map((row) => row.map(escapeCSV).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    const exportCSV = () => {
        downloadCSV(
            filteredTransactions,
            `NeuroWallet_Transactions_${new Date()
                .toISOString()
                .split("T")[0]}.csv`
        );

        setActionMessage("Filtered transactions exported successfully.");
    };

    const exportSingleTransaction = (tx) => {
        downloadCSV(
            [tx],
            `NeuroWallet_Transaction_${tx.transactionId ?? "Details"}.csv`
        );

        setOpenMenuId(null);
        setActionMessage("Transaction exported successfully.");
    };

    const copyText = async (value, label) => {
        if (!value) {
            setActionMessage(`${label} is not available.`);
            setOpenMenuId(null);
            return;
        }

        try {
            await navigator.clipboard.writeText(String(value));
            setActionMessage(`${label} copied successfully.`);
        } catch {
            setActionMessage(
                "Clipboard access failed. Please copy the value manually."
            );
        }

        setOpenMenuId(null);
    };

    const getCounterpartyEmail = (tx) => {
        const incoming =
            Boolean(user?.email) &&
            tx.receiverEmail === user.email;

        return incoming ? tx.senderEmail : tx.receiverEmail;
    };

    const handleViewAll = () => {
        setSearch("");
        setStatusFilter("ALL");
        setSortBy("NEWEST");
        setCurrentPage(1);
        setOpenMenuId(null);

        tableRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const getDisplayName = (email) => {
        if (!email) return "Unknown";
        if (email === user?.email) return "You";

        return email.split("@")[0];
    };

    const getInitials = (email) => {
        if (!email) return "?";
        if (email === user?.email) return "YO";

        return email.slice(0, 2).toUpperCase();
    };

    const getStatusIcon = (status) => {
        switch (String(status || "").toUpperCase()) {
            case "SUCCESS":
                return <FaCircleCheck aria-hidden="true" />;

            case "PENDING":
                return <FaClock aria-hidden="true" />;

            default:
                return <FaCircleXmark aria-hidden="true" />;
        }
    };

    const getStatusClass = (status) => {
        switch (String(status || "").toUpperCase()) {
            case "SUCCESS":
                return "success";

            case "PENDING":
                return "pending";

            default:
                return "failed";
        }
    };

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        setOpenMenuId(null);
    };

    return (
        <section className="transaction-card nw-transaction-reference">
            <header className="transaction-header">
                <div className="transaction-title">
                    <h2>Recent Transactions</h2>
                    <p className="transaction-subtitle">
                        Review your latest wallet activity
                    </p>
                </div>

                <div className="transaction-header-actions">
                    <button
                        type="button"
                        className="export-btn"
                        onClick={exportCSV}
                        disabled={filteredTransactions.length === 0}
                    >
                        <FaDownload aria-hidden="true" />
                        Export CSV
                    </button>

                    <button
                        type="button"
                        className="view-btn"
                        onClick={handleViewAll}
                    >
                        View All
                        <FaArrowRight aria-hidden="true" />
                    </button>
                </div>
            </header>

            <div className="transaction-toolbar">
                <div className="toolbar-left">
                    <div className="search-wrapper">
                        <FaMagnifyingGlass
                            className="search-icon"
                            aria-hidden="true"
                        />

                        <input
                            type="search"
                            className="search-box"
                            placeholder="Search transactions..."
                            aria-label="Search transactions"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <select
                        className="status-filter"
                        aria-label="Filter by status"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="ALL">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="PENDING">Pending</option>
                    </select>

                    <select
                        className="sort-filter"
                        aria-label="Sort transactions"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <option value="NEWEST">Newest First</option>
                        <option value="OLDEST">Oldest First</option>
                        <option value="HIGH_AMOUNT">Highest Amount</option>
                        <option value="LOW_AMOUNT">Lowest Amount</option>
                    </select>
                </div>

                <div className="toolbar-right">
                    <div className="record-count" aria-live="polite">
                        <span>Showing</span>
                        <strong>{firstRecord}-{lastRecord}</strong>
                        <span>of</span>
                        <strong>{filteredTransactions.length}</strong>
                    </div>
                </div>
            </div>

            {actionMessage && (
                <div className="transaction-feedback" role="status">
                    <span>{actionMessage}</span>
                    <button
                        type="button"
                        onClick={() => setActionMessage("")}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="table-wrapper" ref={tableRef}>
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th scope="col">Transaction</th>
                            <th scope="col">Recipient / Sender</th>
                            <th scope="col">Date</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Status</th>
                            <th scope="col">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty-state">
                                        {transactions.length === 0
                                            ? "No transactions available yet."
                                            : "No transactions match your filters."}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedTransactions.map((tx, index) => {
                                const incoming =
                                    Boolean(user?.email) &&
                                    tx.receiverEmail === user.email;

                                const timestamp = getTimestamp(tx);
                                const status = String(
                                    tx.status || "UNKNOWN"
                                ).toUpperCase();

                                const rowKey = getTransactionKey(tx, index);
                                const counterpartyEmail =
                                    getCounterpartyEmail(tx);

                                return (
                                    <tr key={rowKey}>
                                        <td>
                                            <div className="nw-tx-id">
                                                <span className="nw-tx-icon">
                                                    {incoming ? (
                                                        <FaArrowDown
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        <FaArrowUp
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </span>

                                                <div className="nw-tx-id-text">
                                                    <strong>
                                                        {tx.transactionId != null
                                                            ? `#${tx.transactionId}`
                                                            : "Transaction"}
                                                    </strong>
                                                    <span>Wallet transfer</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="user-cell">
                                                <div
                                                    className={`user-avatar ${
                                                        incoming
                                                            ? "active-user"
                                                            : "secondary"
                                                    }`}
                                                >
                                                    {getInitials(
                                                        incoming
                                                            ? tx.senderEmail
                                                            : tx.receiverEmail
                                                    )}
                                                </div>

                                                <div className="user-info">
                                                    <span className="user-name">
                                                        {getDisplayName(
                                                            counterpartyEmail
                                                        )}
                                                    </span>

                                                    <span className="user-email">
                                                        {counterpartyEmail ||
                                                            "Contact unavailable"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="transaction-date">
                                                <span>
                                                    {timestamp
                                                        ? new Date(
                                                              timestamp
                                                          ).toLocaleDateString(
                                                              "en-IN",
                                                              {
                                                                  day: "2-digit",
                                                                  month: "short",
                                                                  year: "numeric",
                                                              }
                                                          )
                                                        : "Date unavailable"}
                                                </span>

                                                <small>
                                                    {timestamp
                                                        ? new Date(
                                                              timestamp
                                                          ).toLocaleTimeString(
                                                              "en-IN",
                                                              {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )
                                                        : ""}
                                                </small>
                                            </div>
                                        </td>

                                        <td>
                                            <div
                                                className={
                                                    incoming
                                                        ? "amount-credit"
                                                        : "amount-debit"
                                                }
                                            >
                                                <span className="amount-sign">
                                                    {incoming ? "+" : "-"}
                                                </span>
                                                {formatCurrency(tx.amount)}
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`status ${getStatusClass(
                                                    status
                                                )}`}
                                            >
                                                {getStatusIcon(status)}
                                                {status}
                                            </span>
                                        </td>

                                        <td>
                                            <div
                                                className="transaction-action-menu"
                                                ref={
                                                    openMenuId === rowKey
                                                        ? menuRef
                                                        : null
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="action-btn"
                                                    aria-label={`Actions for transaction ${
                                                        tx.transactionId ?? ""
                                                    }`}
                                                    aria-expanded={
                                                        openMenuId === rowKey
                                                    }
                                                    aria-haspopup="menu"
                                                    title="Transaction actions"
                                                    onClick={() => {
                                                        setOpenMenuId(
                                                            openMenuId === rowKey
                                                                ? null
                                                                : rowKey
                                                        );
                                                    }}
                                                >
                                                    <FaEllipsisVertical aria-hidden="true" />
                                                </button>

                                                {openMenuId === rowKey && (
                                                    <div
                                                        className="transaction-action-dropdown"
                                                        role="menu"
                                                    >
                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            onClick={() =>
                                                                copyText(
                                                                    tx.transactionId,
                                                                    "Transaction ID"
                                                                )
                                                            }
                                                        >
                                                            <FaCopy />
                                                            Copy transaction ID
                                                        </button>

                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            onClick={() =>
                                                                copyText(
                                                                    counterpartyEmail,
                                                                    "Recipient / sender email"
                                                                )
                                                            }
                                                        >
                                                            <FaCopy />
                                                            Copy email
                                                        </button>

                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            onClick={() =>
                                                                exportSingleTransaction(
                                                                    tx
                                                                )
                                                            }
                                                        >
                                                            <FaFileCsv />
                                                            Export transaction
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <footer className="transaction-pagination">
                <span className="pagination-info">
                    Page <strong>{safePage}</strong> of{" "}
                    <strong>{totalPages}</strong>
                </span>

                <div className="pagination-controls">
                    <button
                        type="button"
                        className="pagination-btn"
                        disabled={safePage === 1}
                        onClick={() => goToPage(safePage - 1)}
                    >
                        <FaArrowLeft />
                        Previous
                    </button>

                    <span className="pagination-current">
                        {safePage}
                    </span>

                    <button
                        type="button"
                        className="pagination-btn"
                        disabled={safePage === totalPages}
                        onClick={() => goToPage(safePage + 1)}
                    >
                        Next
                        <FaArrowRight />
                    </button>
                </div>
            </footer>
        </section>
    );
}

export default TransactionTable;
