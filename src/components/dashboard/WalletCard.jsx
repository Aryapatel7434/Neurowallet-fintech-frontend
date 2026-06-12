function WalletCard({
  title,
  amount,
  growth
}) {
  return (
    <div className="wallet-card">

      <h4>{title}</h4>

      <h2>{amount}</h2>

      <p className="growth">
        ↑ {growth}
      </p>

    </div>
  );
}

export default WalletCard;