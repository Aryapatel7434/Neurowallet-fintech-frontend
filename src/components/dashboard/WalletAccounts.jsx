function WalletAccounts() {
  const accounts = [
    {
      bank: "HDFC Bank",
      number: "**** 4587",
      balance: "₹52,400"
    },
    {
      bank: "ICICI Bank",
      number: "**** 2241",
      balance: "₹28,900"
    },
    {
      bank: "SBI",
      number: "**** 9921",
      balance: "₹43,700"
    }
  ];

  return (
    <div className="wallet-accounts-card">

      <h3>Linked Accounts</h3>

      {accounts.map((account, index) => (
        <div
          key={index}
          className="account-item"
        >
          <div>
            <h4>{account.bank}</h4>
            <p>{account.number}</p>
          </div>

          <h3>{account.balance}</h3>
        </div>
      ))}

    </div>
  );
}

export default WalletAccounts;