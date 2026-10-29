
import { useMemo, useRef, useState } from "react";
import {
    FaMagnifyingGlass,
    FaArrowDown,
    FaArrowUp,
    FaEllipsisVertical,
    FaDownload,
    FaArrowRight,
} from "react-icons/fa6";
import {
    FaCircleCheck,
    FaCircleXmark,
    FaClock,
} from "react-icons/fa6";

import "./TransactionTable.css";

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

    const tableRef = useRef(null);
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

    const exportCSV = () => {
        const headers = [
            "Transaction ID",
            "Sender",
            "Receiver",
            "Amount",
            "Status",
            "Date",
        ];

        const escapeCSV = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const rows = filteredTransactions.map((tx) => [
            tx.transactionId,
            tx.senderEmail,
            tx.receiverEmail,
            tx.amount,
            tx.status,
            getTimestamp(tx)
                ? new Date(getTimestamp(tx)).toLocaleString("en-IN")
                : "",
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map(escapeCSV).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `NeuroWallet_Transactions_${
            new Date().toISOString().split("T")[0]
        }.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleViewAll = () => {
        setSearch("");
        setStatusFilter("ALL");
        setSortBy("NEWEST");

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
                        <strong>{filteredTransactions.length}</strong>
                        <span>of</span>
                        <strong>{transactions.length}</strong>
                    </div>
                </div>
            </div>

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
                        {filteredTransactions.length === 0 ? (
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
                            filteredTransactions.map((tx, index) => {
                                const incoming =
                                    Boolean(user?.email) &&
                                    tx.receiverEmail === user.email;

                                const timestamp = getTimestamp(tx);
                                const status = String(
                                    tx.status || "UNKNOWN"
                                ).toUpperCase();

                                return (
                                    <tr
                                        key={
                                            tx.transactionId ??
                                            `${timestamp}-${index}`
                                        }
                                    >
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
                                                            incoming
                                                                ? tx.senderEmail
                                                                : tx.receiverEmail
                                                        )}
                                                    </span>

                                                    <span className="user-email">
                                                        {incoming
                                                            ? tx.senderEmail ||
                                                              "Sender unavailable"
                                                            : tx.receiverEmail ||
                                                              "Recipient unavailable"}
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
                                            <button
                                                type="button"
                                                className="action-btn"
                                                aria-label={`Actions for transaction ${
                                                    tx.transactionId ?? ""
                                                }`}
                                                title="Transaction actions"
                                            >
                                                <FaEllipsisVertical
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default TransactionTable;
