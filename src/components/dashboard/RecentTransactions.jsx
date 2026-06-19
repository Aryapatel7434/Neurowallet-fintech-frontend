function RecentTransactions({
  transactions = []
}) {

  return (
    <div className="transaction-card">

      <h3>
        Recent Transactions
      </h3>

      <table>

        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>

          {transactions.length > 0 ? (

            transactions.map((tx) => (

              <tr key={tx.id}>

                <td>
                  {tx.createdAt}
                </td>

                <td>
                  ₹{tx.amount}
                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td colSpan="2">
                No Transactions Found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default RecentTransactions;