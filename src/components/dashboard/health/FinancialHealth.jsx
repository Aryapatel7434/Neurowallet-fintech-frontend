function FinancialHealth({
  wallet,
  transactions = [],
}) {

  const score =
    wallet?.balance > 1000
      ? 87
      : 62;

  return (

    <div className="health-card">

      <h3>
        Financial Health
      </h3>

      <div className="health-score">

        {score}

      </div>

      <span>
        Excellent
      </span>

    </div>

  );
}

export default FinancialHealth;