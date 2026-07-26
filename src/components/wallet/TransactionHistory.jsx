import { HiMiniChartBar } from "react-icons/hi2";
import {
  FaArrowTrendUp,
  FaArrowTrendDown
} from "react-icons/fa6";
import {
  MdSwapHoriz
} from "react-icons/md";

import { useState } from "react";

function TransactionHistory({
  transactions = [],
  onSelectTransaction
}) {

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const [currentPage,
    setCurrentPage] =
    useState(1);
const recordsPerPage = 10;

const loggedInUser =
  localStorage.getItem("email");

const filteredTransactions =
  transactions.filter((tx) => {

 const type = tx.type;

    const matchesSearch =
      type
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchesFilter =
      filter === "ALL"
        ? true
        : type === filter;

    return (
      matchesSearch &&
      matchesFilter
    );

  });
  const lastIndex =
    currentPage *
    recordsPerPage;

  const firstIndex =
    lastIndex -
    recordsPerPage;

  const currentTransactions =
    filteredTransactions.slice(
      firstIndex,
      lastIndex
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredTransactions.length /
        recordsPerPage
      )
    );

  const getBadgeClass = (type) => {

    switch (type) {

      case "CREDIT":
        return "credit-badge";

      case "DEBIT":
        return "debit-badge";

      case "TRANSFER":
        return "transfer-badge";

      default:
        return "transfer-badge";

    }

  };

  const getIcon = (type) => {

    switch (type) {

      case "CREDIT":
        return <FaArrowTrendUp />;

      case "DEBIT":
        return <FaArrowTrendDown />;

      case "TRANSFER":
        return <MdSwapHoriz />;

      default:
        return <MdSwapHoriz />;

    }

  };

  return (

    <div className="transaction-card">

      <h2>
        Recent Transactions
      </h2>

      <div className="transaction-toolbar">

        <div className="transaction-filters">

          <button
            className={
              filter === "ALL"
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("ALL")
            }
          >
            All
          </button>

          <button
            className={
              filter === "CREDIT"
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("CREDIT")
            }
          >
            Credit
          </button>

          <button
            className={
              filter === "DEBIT"
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("DEBIT")
            }
          >
            Debit
          </button>

          <button
            className={
              filter === "TRANSFER"
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() =>
              setFilter("TRANSFER")
            }
          >
            Transfer
          </button>

        </div>

        <div className="transaction-count">

          <HiMiniChartBar />

          <span>
            {filteredTransactions.length}
          </span>

        </div>

      </div>

      <input
        type="text"
        placeholder="Search Credit, Debit, Transfer..."
        className="transaction-search"
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <table className="transaction-table">

        <thead>

          <tr>

            <th>Date</th>

            <th>Type</th>

            <th>Amount</th>

            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {
            currentTransactions.length === 0 ? (

              <tr>

                <td
                  colSpan="4"
                  className="empty-state"
                >
                  No Transactions Found
                </td>

              </tr>

            ) : (

              currentTransactions.map((tx) => (

                <tr
                  key={
                    tx.id ||
                    tx.transactionId
                  }
                  onClick={() =>
                    onSelectTransaction(tx)
                  }
                  style={{
                    cursor: "pointer"
                  }}
                >

                  <td>

                    {
                      tx.timestamp
                        ? new Date(
                            tx.timestamp
                          ).toLocaleDateString()
                        : tx.createdAt
                        ? new Date(
                            tx.createdAt
                          ).toLocaleDateString()
                        : "-"
                    }

                  </td>

                  <td>

                    <span
                    className={
    getBadgeClass(tx.type)
}
                    >

                      {
    getIcon(tx.type)
}

                      {" "}

                     {
    tx.type
}

                    </span>

                  </td>

                  <td>

                    ₹
                    {Number(
                      tx.amount || 0
                    ).toLocaleString()}

                  </td>

                  <td>

                    <span
                      className={
                        tx.status === "SUCCESS"
                          ? "status-success"
                          : tx.status === "FAILED"
                          ? "status-failed"
                          : "status-pending"
                      }
                    >

                      {
                        tx.status ||
                        "SUCCESS"
                      }

                    </span>

                  </td>

                </tr>

              ))

            )
          }

        </tbody>

      </table>

      <div className="pagination">

        <button
          disabled={
            currentPage === 1
          }
          onClick={() =>
            setCurrentPage(
              currentPage - 1
            )
          }
        >
          Previous
        </button>

        <span>

          Page {currentPage}
          {" "}of{" "}
          {totalPages}

        </span>

        <button
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            setCurrentPage(
              currentPage + 1
            )
          }
        >
          Next
        </button>

      </div>

    </div>

  );

}

export default TransactionHistory;