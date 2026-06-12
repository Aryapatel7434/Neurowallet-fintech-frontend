function TransactionTable() {
  return (
    <div className="transaction-card">

      <h3>Recent Transactions</h3>

      <table>

        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td>12 Jun</td>
            <td>Food</td>
            <td>₹850</td>
            <td>Completed</td>
          </tr>

          <tr>
            <td>11 Jun</td>
            <td>Fuel</td>
            <td>₹2000</td>
            <td>Completed</td>
          </tr>

          <tr>
            <td>10 Jun</td>
            <td>Shopping</td>
            <td>₹4500</td>
            <td>Completed</td>
          </tr>

        </tbody>

      </table>

    </div>
  );
}

export default TransactionTable;