function AIAdvisor({
  transactions
}) {

  const totalSpent =
    transactions
      .filter(
        tx =>
          tx.type === "DEBIT" ||
          tx.type === "TRANSFER"
      )
      .reduce(
        (sum, tx) =>
          sum +
          Number(tx.amount || 0),
        0
      );

  return (

    <div className="advisor-card">

      <h2>
        💡 AI Advisor
      </h2>

      <h1>
        ₹{totalSpent}
      </h1>

      <p>
        Total Spending
      </p>

      <div
        className="advisor-message"
      >

        {totalSpent < 5000
          ? "Excellent spending habits."
          : totalSpent < 10000
          ? "Spending is under control."
          : "Reduce expenses this month."}

      </div>

    </div>

  );

}

export default AIAdvisor;