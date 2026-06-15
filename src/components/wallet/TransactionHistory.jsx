import { useEffect, useState }
from "react";

import {
  getTransactions
}
from "../../services/walletService";

function TransactionHistory() {

  const [transactions,
         setTransactions] =
    useState([]);

  useEffect(() => {

    const loadTransactions =
      async () => {

        try {

          const data =
            await getTransactions();

          setTransactions(data);

        } catch (error) {

          console.error(error);

        }
      };

    loadTransactions();

  }, []);

  return (

    <div className="transaction-card">

      <h2>
        Recent Transactions
      </h2>

      <table
        className="transaction-table"
      >

        <thead>

          <tr>

            <th>Date</th>

            <th>Type</th>

            <th>Amount</th>

          </tr>

        </thead>

        <tbody>

          {transactions.map(
            (tx) => (

              <tr key={tx.id}>

                <td>

                  {
                    new Date(
                      tx.createdAt
                    ).toLocaleDateString()
                  }

                </td>

                <td>

                  <span
                    className={
                      tx.type ===
                      "CREDIT"
                        ? "credit-badge"
                        : "debit-badge"
                    }
                  >

                    {tx.type}

                  </span>

                </td>

                <td>

                  ₹{tx.amount}

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );
}

export default TransactionHistory;