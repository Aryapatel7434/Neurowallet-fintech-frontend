import "../../styles/wallet.css";

import { useEffect, useState } from "react";

import TransactionHistory
from "../../components/wallet/TransactionHistory";

import WalletAnalytics
from "../../components/wallet/WalletAnalytics";
import TransferInsights
from "../../components/wallet/TransferInsights";
import TransferActivity
from "../../components/wallet/TransferActivity";
import {
  transferMoney
} from "../../services/transferService";
import {
  getMyWallet,
  getTransactions,
  addMoney,
  withdrawMoney
}
from "../../services/walletService";

function WalletPage() {

  const [wallet, setWallet] =
    useState(null);

  const [transactions,
    setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [amount, setAmount] =
    useState("");
const [receiverEmail,
  setReceiverEmail] =
  useState("");

const [transferAmount,
  setTransferAmount] =
  useState("");
  useEffect(() => {

    const loadWallet =
      async () => {

        try {

          const walletData =
            await getMyWallet();

          const txData =
            await getTransactions();

          console.log(
            "Wallet Data:",
            walletData
          );

          console.log(
            "Transactions:",
            txData
          );

          setWallet(
            walletData
          );

          setTransactions(
            txData
          );

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);

        }
      };

    loadWallet();

  }, []);

  const handleAddMoney =
    async () => {

      try {

        const updatedWallet =
          await addMoney(
            Number(amount)
          );

        const txData =
          await getTransactions();

        setWallet(
          updatedWallet
        );

        setTransactions(
          txData
        );

        setAmount("");

        alert(
          "Money Added Successfully"
        );

      } catch (error) {

        console.error(error);

        alert(
          "Add Money Failed"
        );
      }
    };

  const handleWithdraw =
    async () => {

      try {

        const updatedWallet =
          await withdrawMoney(
            Number(amount)
          );

        const txData =
          await getTransactions();

        setWallet(
          updatedWallet
        );

        setTransactions(
          txData
        );

        setAmount("");

        alert(
          "Money Withdrawn Successfully"
        );

      } catch (error) {

        console.error(error);

        alert(
          "Withdraw Failed"
        );
      }
    };
    const handleTransfer =
  async () => {

    try {

      const response =
        await transferMoney(
          receiverEmail,
          Number(
            transferAmount
          )
        );

      alert(response);

      const walletData =
        await getMyWallet();

      const txData =
        await getTransactions();

      setWallet(walletData);

      setTransactions(txData);

      setReceiverEmail("");

      setTransferAmount("");

    } catch (error) {

      console.error(error);

      alert(
        "Transfer Failed"
      );
    }
};

  if (loading) {

    return (
      <h2>
        Loading Wallet...
      </h2>
    );
  }

  return (

    <div className="wallet-container">

      <div className="wallet-header">

        <h1>
          💰 My Wallet
        </h1>

        <p>
          Manage your wallet balance
        </p>

      </div>

      <div className="wallet-card">

        <h2>
          Available Balance
        </h2>

        <div className="wallet-balance">

          ₹{wallet.balance}

        </div>

        <div className="wallet-info">

          Wallet ID :
          {wallet.walletId}

          <br />

          Currency :
          {wallet.currency}

          <br />

          Status :
          {wallet.status}

        </div>

      </div>

      <WalletAnalytics
        wallet={wallet}
        transactions={transactions}
      />
      <TransferInsights
  transactions={
    transactions
  }
/>
<TransferActivity
  transactions={
    transactions
  }
/>
     <div className="wallet-actions">

  <div>

    <input
      type="number"
      placeholder="Enter Amount"
      value={amount}
      onChange={(e) =>
        setAmount(
          e.target.value
        )
      }
    />

    <br />
    <br />

    <button
      className="wallet-btn"
      onClick={handleAddMoney}
    >
      Add Money
    </button>

  </div>

  <button
    className="wallet-btn"
    onClick={handleWithdraw}
  >
    Withdraw
  </button>

</div>

{/* Transfer Money Section */}

<div className="wallet-transfer">

  <h3>
    Transfer Money
  </h3>

  <input
    type="email"
    placeholder="Receiver Email"
    value={receiverEmail}
    onChange={(e) =>
      setReceiverEmail(
        e.target.value
      )
    }
  />

  <br />
  <br />

  <input
    type="number"
    placeholder="Amount"
    value={transferAmount}
    onChange={(e) =>
      setTransferAmount(
        e.target.value
      )
    }
  />

  <br />
  <br />

  <button
    className="wallet-btn"
    onClick={handleTransfer}
  >
    Transfer Money
  </button>

</div>

<TransactionHistory />

    </div>

  );
}

export default WalletPage;