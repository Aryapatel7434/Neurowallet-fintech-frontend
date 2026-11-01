
import { useMemo, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaArrowsLeftRight,
  FaMagnifyingGlass,
  FaReceipt,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUpWideShort,
  FaArrowDownShortWide,
} from "react-icons/fa6";

const PAGE_SIZE = 8;

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getDate = (transaction) => {
  const value =
    transaction?.timestamp ??
    transaction?.createdAt ??
    transaction?.transactionDate ??
    transaction?.date;

  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getReference = (transaction) =>
  transaction?.transactionId ??
  transaction?.referenceId ??
  transaction?.id ??
  "Unavailable";

const getType = (transaction) => {
  const type = String(transaction?.type ?? "").toUpperCase();
  const category = String(transaction?.category ?? "").toUpperCase();

  if (type === "TRANSFER" || category === "TRANSFER") {
    return {
      label: "Transfer",
      icon: FaArrowsLeftRight,
      className: "transfer",
    };
  }

  if (type === "CREDIT") {
    return {
      label: "Credit",
      icon: FaArrowDown,
      className: "credit",
    };
  }

  if (type === "DEBIT") {
    return {
      label: "Debit",
      icon: FaArrowUp,
      className: "debit",
    };
  }

  return {
    label: type || "Other",
    icon: FaReceipt,
    className: "neutral",
  };
};

const getStatus = (status) => {
  const normalized = String(status ?? "UNKNOWN").toUpperCase();

  if (["SUCCESS", "SUCCESSFUL", "COMPLETED"].includes(normalized)) {
    return { label: "Success", className: "success" };
  }

  if (["PENDING", "PROCESSING", "IN_PROGRESS"].includes(normalized)) {
    return { label: "Pending", className: "pending" };
  }

  if (["FAILED", "FAILURE", "REJECTED"].includes(normalized)) {
    return { label: "Failed", className: "failed" };
  }

  return { label: normalized, className: "unknown" };
};

function TransactionHistory({
  transactions = [],
  onSelectTransaction,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    const keyword = search.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const type = String(transaction?.type ?? "").toUpperCase();
        const category = String(
          transaction?.category ?? ""
        ).toUpperCase();
        const status = String(
          transaction?.status ?? ""
        ).toUpperCase();

        const searchableText = [
          transaction?.transactionId,
          transaction?.referenceId,
          transaction?.id,
          transaction?.description,
          transaction?.type,
          transaction?.category,
          transaction?.status,
          transaction?.senderEmail,
          transaction?.receiverEmail,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !keyword || searchableText.includes(keyword);

        const matchesType =
          typeFilter === "ALL" ||
          type === typeFilter ||
          (typeFilter === "TRANSFER" && category === "TRANSFER");

        const matchesStatus =
          statusFilter === "ALL" ||
          status === statusFilter ||
          (statusFilter === "SUCCESS" && status === "SUCCESSFUL") ||
          (statusFilter === "SUCCESS" && status === "COMPLETED") ||
          (statusFilter === "FAILED" && status === "FAILURE");

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === "AMOUNT_HIGH") {
          return Number(b?.amount ?? 0) - Number(a?.amount ?? 0);
        }

        if (sortOrder === "AMOUNT_LOW") {
          return Number(a?.amount ?? 0) - Number(b?.amount ?? 0);
        }

        const dateA = getDate(a)?.getTime() ?? 0;
        const dateB = getDate(b)?.getTime() ?? 0;

        return sortOrder === "OLDEST"
          ? dateA - dateB
          : dateB - dateA;
      });
  }, [transactions, search, typeFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleTransactions = filteredTransactions.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const updateFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <article className="wallet-history-card">
      <div className="wallet-history-header">
        <div>
          <span className="wallet-page-eyebrow">
            ACCOUNT RECORDS
          </span>
          <h2>Transaction History</h2>
          <p>Search and inspect your wallet transactions.</p>
        </div>

        <span className="wallet-history-count">
          {filteredTransactions.length} records
        </span>
      </div>

      <div className="wallet-history-controls">
        <div className="wallet-history-search">
          <FaMagnifyingGlass />

          <input
            type="search"
            placeholder="Search reference, category, type or status..."
            value={search}
            onChange={(event) =>
              updateFilter(setSearch, event.target.value)
            }
            aria-label="Search transactions"
          />
        </div>

        <div className="wallet-history-filter-row">
          <select
            value={typeFilter}
            onChange={(event) =>
              updateFilter(setTypeFilter, event.target.value)
            }
            aria-label="Filter by transaction type"
          >
            <option value="ALL">All types</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              updateFilter(setStatusFilter, event.target.value)
            }
            aria-label="Filter by transaction status"
          >
            <option value="ALL">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={sortOrder}
            onChange={(event) =>
              updateFilter(setSortOrder, event.target.value)
            }
            aria-label="Sort transactions"
          >
            <option value="NEWEST">Newest first</option>
            <option value="OLDEST">Oldest first</option>
            <option value="AMOUNT_HIGH">Highest amount</option>
            <option value="AMOUNT_LOW">Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="wallet-history-table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Reference</th>
              <th>Category</th>
              <th>Date &amp; Time</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {visibleTransactions.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="wallet-history-empty">
                    <FaReceipt />
                    <strong>No transactions found</strong>
                    <span>
                      Try adjusting your search or filters.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleTransactions.map((transaction, index) => {
                const type = getType(transaction);
                const status = getStatus(transaction?.status);
                const Icon = type.icon;
                const date = getDate(transaction);

                const key =
                  transaction?.transactionId ??
                  transaction?.referenceId ??
                  transaction?.id ??
                  `${date?.getTime() ?? "unknown"}-${index}`;

                return (
                  <tr key={key}>
                    <td>
                      <span
                        className={`wallet-history-type ${type.className}`}
                      >
                        <Icon />
                        {type.label}
                      </span>
                    </td>

                    <td>
                      <span className="wallet-history-reference">
                        {getReference(transaction)}
                      </span>
                    </td>

                    <td>
                      {transaction?.category || "Uncategorized"}
                    </td>

                    <td>{formatDate(date)}</td>

                    <td className="wallet-history-amount">
                      {formatCurrency(transaction?.amount)}
                    </td>

                    <td>
                      <span
                        className={`wallet-history-status ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="wallet-history-view"
                        onClick={() =>
                          onSelectTransaction?.(transaction)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="wallet-history-footer">
        <span>
          Showing{" "}
          {filteredTransactions.length === 0
            ? 0
            : (safePage - 1) * PAGE_SIZE + 1}
          {" "}–{" "}
          {Math.min(safePage * PAGE_SIZE, filteredTransactions.length)}
          {" "}of {filteredTransactions.length}
        </span>

        <div className="wallet-history-pagination">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage <= 1}
            aria-label="Previous page"
          >
            <FaChevronLeft />
          </button>

          <span>
            {safePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1)
              )
            }
            disabled={safePage >= totalPages}
            aria-label="Next page"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </article>
  );
}

export default TransactionHistory;
