import "./TransactionTable.css";

function TransactionTable({
  transactions = []
}) {

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

  return (

    <div className="transaction-card">

      <div className="transaction-header">

        <h2>
          Recent Transactions
        </h2>

        <span className="record-count">
          {transactions.length} Records
        </span>

      </div>

      <table className="transaction-table">

        <thead>

          <tr>

            <th>ID</th>

            <th>Sender</th>

            <th>Receiver</th>

            <th>Amount</th>

            <th>Status</th>

            <th>Date</th>

          </tr>

        </thead>

        <tbody>

          {transactions.map((tx) => (

            <tr
              key={tx.transactionId}
            >

              <td>
                #{tx.transactionId}
              </td>

              {/* Sender */}

              <td>

                <div className="user-cell">

                  <div className="user-avatar">

                    {
                      tx.senderEmail
                        ?.charAt(0)
                        .toUpperCase()
                    }

                  </div>

                  <span>
                    {tx.senderEmail}
                  </span>

                </div>

              </td>

              {/* Receiver */}

              <td>

                <div className="user-cell">

                  <div className="user-avatar secondary">

                    {
                      tx.receiverEmail
                        ?.charAt(0)
                        .toUpperCase()
                    }

                  </div>

                  <span>
                    {tx.receiverEmail}
                  </span>

                </div>

              </td>

              {/* Amount */}

              <td
                className={
                  tx.status === "SUCCESS"
                    ? "amount-credit"
                    : "amount-debit"
                }
              >

                {formatCurrency(
                  tx.amount
                )}

              </td>

              {/* Status */}

              <td>

                <span
                  className={`status ${
                    tx.status ===
                    "SUCCESS"
                      ? "success"
                      : "failed"
                  }`}
                >

                  {tx.status}

                </span>

              </td>

              {/* Date */}

              <td>

                {
                  new Date(
                    tx.timestamp
                  ).toLocaleDateString(
                    "en-IN"
                  )
                }

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}

export default TransactionTable;