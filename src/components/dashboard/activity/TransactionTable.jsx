import {
  FaMagnifyingGlass,
  FaArrowDown,
  FaArrowUp,
  FaReceipt,
  FaShieldHalved,
  FaEllipsisVertical
} from "react-icons/fa6";

import {
    FaCircleCheck,
    FaCircleXmark
} from "react-icons/fa6";
import {

useState,

useRef

} from "react";
import "./TransactionTable.css";

function TransactionTable({
    transactions = []
})
{

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

const [sortBy, setSortBy] = useState("NEWEST");

const tableRef = useRef(null);

const user = JSON.parse(
    localStorage.getItem("user")
);
    const formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(amount);

    };

    /* ==========================================
                SUMMARY DATA
    ========================================== */

const totalReceived = transactions.reduce(

(sum,tx)=>

tx.receiverEmail===user?.email

?

sum+Number(tx.amount)

:

sum,

0

);
  const totalSent = transactions.reduce(

    (sum, tx) =>

        tx.senderEmail === user?.email

            ? sum + Number(tx.amount)

            : sum,

    0

);
const successfulTransactions =
    transactions.filter(
        tx => tx.status === "SUCCESS"
    ).length;

const successRate =
    transactions.length
        ? Math.round(
              (successfulTransactions /
                  transactions.length) *
                  100
          )
        : 0;
  

    /* ==========================================
                FILTER
    ========================================== */

    const filteredTransactions = transactions.filter((tx) => {

        const query = search.toLowerCase();

        const matchesSearch =

            tx.senderEmail.toLowerCase().includes(query) ||

            tx.receiverEmail.toLowerCase().includes(query) ||

            String(tx.transactionId).includes(query) ||

            String(tx.amount).includes(query);

        const matchesStatus =

            statusFilter === "ALL" ||

            tx.status === statusFilter;

        return matchesSearch && matchesStatus;

    });

    /* ==========================================
                SORT
    ========================================== */

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {

        switch (sortBy) {

            case "NEWEST":

                return new Date(b.timestamp) - new Date(a.timestamp);

            case "OLDEST":

                return new Date(a.timestamp) - new Date(b.timestamp);

            case "HIGH_AMOUNT":

                return b.amount - a.amount;

            case "LOW_AMOUNT":

                return a.amount - b.amount;

            default:

                return 0;

        }

    });
const exportCSV = () => {

const headers=[

"Transaction ID",

"Sender",

"Receiver",

"Amount",

"Status",

"Date"

];

const rows=

sortedTransactions.map(tx=>[

tx.transactionId,

tx.senderEmail,

tx.receiverEmail,

tx.amount,

tx.status,

new Date(tx.timestamp).toLocaleString("en-IN")

]);

const csv=[headers,...rows]

.map(e=>e.join(","))

.join("\n");

const blob=new Blob(

[csv],

{type:"text/csv;charset=utf-8;"}

);

const url=

URL.createObjectURL(blob);

const link=

document.createElement("a");

link.href=url;

const today = new Date().toISOString().split("T")[0];

link.download = `NeuroWallet_Transactions_${today}.csv`;

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

URL.revokeObjectURL(url);

};
const handleViewAll = () => {

    // Reset all filters
    setSearch("");

    setStatusFilter("ALL");

    setSortBy("NEWEST");

    // Scroll to the table
    setTimeout(() => {

        tableRef.current?.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 100);

};
    return (

        <div className="transaction-card">

            {/* ==========================================
                        HEADER
            ========================================== */}

            <div className="transaction-header">

                <div className="transaction-title">

                    <h2>

                        Recent Transactions

                    </h2>

                    <p className="transaction-subtitle">

                        Latest wallet activity

                    </p>

                </div>

                <div className="transaction-header-actions">

               <button
className="export-btn"
onClick={exportCSV}
>

Export CSV

</button>

                    <button
className="view-btn"
onClick={handleViewAll}
>

View All →

</button>
                </div>

            </div>

            {/* ==========================================
                        TOOLBAR
            ========================================== */}

            <div className="transaction-toolbar">

                <div className="toolbar-left">

                    <div className="search-wrapper">

                        <FaMagnifyingGlass className="search-icon" />

                        <input

                            type="text"

                            className="search-box"

                            placeholder="Search transactions..."

                            value={search}

                            onChange={(e) =>

                                setSearch(e.target.value)

                            }

                        />

                    </div>

                    <select

                        className="status-filter"

                        value={statusFilter}

                        onChange={(e) =>

                            setStatusFilter(e.target.value)

                        }

                    >

                        <option value="ALL">

                            All Status

                        </option>

                        <option value="SUCCESS">

                            Success

                        </option>

                        <option value="FAILED">

                            Failed

                        </option>

                        <option value="PENDING">

                            Pending

                        </option>

                    </select>

                    <select

                        className="sort-filter"

                        value={sortBy}

                        onChange={(e) =>

                            setSortBy(e.target.value)

                        }

                    >

                        <option value="NEWEST">

                            Newest

                        </option>

                        <option value="OLDEST">

                            Oldest

                        </option>

                        <option value="HIGH_AMOUNT">

                            Highest Amount

                        </option>

                        <option value="LOW_AMOUNT">

                            Lowest Amount

                        </option>

                    </select>

                </div>

                <div className="toolbar-right">

             <div className="record-count">

<span>Showing</span>

<strong>

{sortedTransactions.length}

</strong>

<span>of</span>

<strong>

{transactions.length}

</strong>

<span>Transactions</span>

</div>
                </div>

            </div>

            {/* ==========================================
                    PART 2 STARTS HERE
                    Summary Cards
            ========================================== */}
            {/* ==========================================
        SUMMARY CARDS
========================================== */}

<div className="transaction-summary">

  <div className="summary-card">

    <div className="summary-icon transactions">
      <FaReceipt />
    </div>

    <div className="summary-content">
      <span>Total Transactions</span>
      <h3>{transactions.length}</h3>
    </div>

  </div>

  <div className="summary-card">

    <div className="summary-icon received">
      <FaArrowDown />
    </div>

    <div className="summary-content">
      <span>Total Received</span>
      <h3>{formatCurrency(totalReceived)}</h3>
    </div>

  </div>

  <div className="summary-card">

    <div className="summary-icon sent">
      <FaArrowUp />
    </div>

    <div className="summary-content">
      <span>Total Sent</span>
      <h3>{formatCurrency(totalSent)}</h3>
    </div>

  </div>

  <div className="summary-card">

    <div className="summary-icon success-rate">
     <FaShieldHalved />
    </div>

    <div className="summary-content">
      <span>Success Rate</span>
      <h3>{successRate}%</h3>
    </div>

  </div>

</div>
<div
className="table-wrapper"
ref={tableRef}
>

    <table className="transaction-table">
        <thead>

            <tr>

                <th>ID</th>

                <th>Sender</th>

                <th>Receiver</th>

                <th>Amount</th>

                <th>Status</th>

                <th>Date</th>

                <th></th>

            </tr>

        </thead>
        <tbody>

            {
                sortedTransactions.length === 0 ? (

                    <tr>

                        <td colSpan="7">

                            <div className="empty-state">

                                No Transactions Found

                            </div>

                        </td>

                    </tr>

                ) : (

                    sortedTransactions.map((tx) => (

                        <tr key={tx.transactionId}>

                {/* ID */}

                <td>

                    #{tx.transactionId}

                </td>

                {/* Sender */}

                <td>

                    <div className="user-cell">

                        <div
className={`user-avatar ${
tx.senderEmail===user?.email
?
"secondary"
:
""
}`}
>

                            {tx.senderEmail
                                ?.substring(0, 2)
                                .toUpperCase()}

                        </div>

                        <div className="user-info">

                            <span className="user-name">

                             {
tx.senderEmail===user?.email

?

"You"

:

tx.senderEmail?.split("@")[0]
}

                            </span>

                            <span className="user-email">

                                {tx.senderEmail}

                            </span>

                        </div>

                    </div>

                </td>

                {/* Receiver */}

                <td>

                    <div className="user-cell">

                        <div
className={`user-avatar secondary ${
tx.receiverEmail===user?.email
?
"active-user"
:
""
}`}
>

                            {tx.receiverEmail
                                ?.substring(0, 2)
                                .toUpperCase()}

                        </div>

                        <div className="user-info">

                            <span className="user-name">

                               {
tx.receiverEmail===user?.email

?

"You"

:

tx.receiverEmail?.split("@")[0]
}

                            </span>

                            <span className="user-email">

                                {tx.receiverEmail}

                            </span>

                        </div>

                    </div>

                </td>

                {/* Amount */}

                <td>

                    <div
                        className={

tx.receiverEmail===user?.email

?

"amount-credit"

:

"amount-debit"

}
                    >

                        <span className="amount-sign">

                            {
tx.receiverEmail===user?.email

?

"+"

:

"-"

}

                        </span>

                        {formatCurrency(tx.amount)}

                    </div>

                </td>

                {/* Status */}

                <td>

                    <span
                        className={`status ${
                            tx.status === "SUCCESS"
                                ? "success"
                                : "failed"
                        }`}
                    >

                  {

tx.status==="SUCCESS"

?

<FaCircleCheck/>

:

<FaCircleXmark/>

}

{tx.status}
                    </span>

                </td>

                {/* Date */}

                <td>

                    <div className="transaction-date">

                        <span>

                            {new Date(tx.timestamp).toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                }
                            )}

                        </span>

                        <small>

                            {new Date(tx.timestamp).toLocaleTimeString(
                                "en-IN",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            )}

                        </small>

                    </div>

                </td>

                {/* Action */}

                <td>

                    <button className="action-btn">

                        <FaEllipsisVertical />

                    </button>

                </td>

            </tr>

        ))

    )

}

</tbody>
        </table>
    </div>
</div>
    );
}

export default TransactionTable;