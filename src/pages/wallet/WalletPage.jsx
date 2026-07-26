import {
  transferMoney
} from "../../services/transferService";
import { FaPlus } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";
import { FaPaperPlane } from "react-icons/fa";

import {
  FaArrowTrendDown
} from "react-icons/fa6";
import "../../styles/wallet.css";
import { useEffect, useState } from "react";

import TransactionHistory
from "../../components/wallet/TransactionHistory";
import TransferInsights
from "../../components/wallet/TransferInsights";
import WalletAnalytics
from "../../components/wallet/WalletAnalytics";
import TransferActivity
from "../../components/wallet/TransferActivity";
import TransactionModal
from "../../components/wallet/TransactionModal";
import WalletHeader
from "../../components/wallet/WalletHeader";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { CATEGORY_LABELS } from "../../constants/categoryLabels";
import { toast } from "react-toastify";
import {
  getMyWallet,
  getTransactions,
  addMoney,
  withdrawMoney,
  getWalletSummary
}
from "../../services/walletService";

function WalletPage() {

  const [wallet, setWallet] =
    useState(null);

  const [transactions,
    setTransactions] =
    useState([]);
const [
  selectedTransaction,
  setSelectedTransaction
] = useState(null);
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

  const [category,
  setCategory] =
  useState("OTHER");

const [walletSummary, setWalletSummary] = useState(null);
 const refreshWalletData = async () => {

    try {

       const [
    walletData,
    transactionData,
    summaryData
] = await Promise.all([
    getMyWallet(),
    getTransactions(),
    getWalletSummary()
]);

setWallet(walletData);
setTransactions(transactionData);
setWalletSummary(summaryData);

        setWallet(walletData);

        setTransactions(
            Array.isArray(transactionData)
                ? transactionData
                : []
        );

    } catch (error) {

        console.error(
            "Refresh Wallet Error:",
            error
        );

        toast.error(
            "Unable to refresh wallet."
        );

    }

};
console.log(
  "Wallet:",
  wallet
);

// console.log(
//   "Transactions:",
//   transactions
// );
console.log("Transactions API:", transactions);
console.log(
  "FIRST TRANSACTION:",
  transactions[0]
);
console.log("Current Login:", localStorage.getItem("email"));
useEffect(() => {

  const loadWallet = async () => {

    try {

      await refreshWalletData();

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

  if (!amount || Number(amount) <= 0) {

    toast.error(
      "Enter valid amount"
    );

    return;
  }

  try {

  await addMoney(Number(amount));

await refreshWalletData();
sessionStorage.setItem(
    "dashboardRefresh",
    "true"
);

    setAmount("");

    toast.success(
      `₹${amount} added successfully`
    );

  } catch (error) {

    console.error(
      "Add Money Error:",
      error.response?.data
    );

    console.error(
      "Status:",
      error.response?.status
    );

    toast.error(
      "Failed to add money"
    );

  }

};

 const handleWithdraw =
async () => {

  if (!amount || Number(amount) <= 0) {

    toast.error(
      "Enter valid amount"
    );

    return;
  }

  try {

   await withdrawMoney(Number(amount));

await refreshWalletData();
sessionStorage.setItem(
    "dashboardRefresh",
    "true"
);

    setAmount("");

    toast.success(
      `₹${amount} withdrawn successfully`
    );

  } catch (error) {

    console.error(
      "Withdraw Error:",
      error.response?.data
    );

    console.error(
      "Status:",
      error.response?.status
    );

    toast.error(
      "Withdraw failed"
    );

  }

};
const handleTransfer = async () => {

  try {

    console.log("Receiver:", receiverEmail);
    console.log("Amount:", transferAmount);

    const response =
      await transferMoney(
  receiverEmail,
  Number(transferAmount),
  category
);

    console.log(
      "Transfer Success:",
      response
    );

    await refreshWalletData();

    sessionStorage.setItem(
    "dashboardRefresh",
    "true"
);

    setReceiverEmail("");
    setTransferAmount("");
    setCategory("OTHER");

    toast.success(
      "Transfer completed successfully"
    );

  } catch (error) {

    console.log(
      "FULL ERROR:",
      error
    );

    console.log(
      "RESPONSE:",
      error.response
    );

    console.log(
      "DATA:",
      error.response?.data
    );

    console.log(
      "STATUS:",
      error.response?.status
    );

    toast.error(
      "Transfer failed"
    );
  }
};
  if (loading) {
  return (
    <div className="loading-screen">
      <div className="loader"></div>
      <h2>Loading NeuroWallet...</h2>
    </div>
  );
}
  return (

    <div className="wallet-container">

     <div className="wallet-header">

  <div className="wallet-header-top">

     <WalletHeader wallet={wallet} />


  </div>

</div>

           <div className="wallet-card">

  <div className="wallet-card-top">

     <h3 className="premium-title">
  <FaWallet />
  <span>NeuroWallet Premium</span>
</h3>

    <span
      className="status-badge"
    >
      ACTIVE
    </span>

  </div>

  <p
    className="balance-label"
  >
    Available Balance
  </p>

 <h1 className="wallet-balance">
  ₹{wallet?.balance || 0}
</h1>

  <div
    className="wallet-details"
  >

    <p>
      Currency : INR
    </p>

    <p>
      Last Updated :
      Just Now
    </p>

  </div>

</div>
{/* console.log("Analytics Transactions:", transactions); */}
<WalletAnalytics
  wallet={wallet}
  summary={walletSummary}
/>

<TransferActivity
  transactions={
    transactions
  }
/>
  <div className="wallet-actions">

    <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e)=>
            setAmount(
                e.target.value
            )
        }
    />

<button
  className="wallet-btn"
  onClick={handleAddMoney}
>
  <FaPlus />
  <span>Add Money</span>
</button>

<button
  className="wallet-btn"
  onClick={handleWithdraw}
>
  <FaArrowTrendDown />
  <span>Withdraw</span>
</button>

</div>
{/* Transfer Money Section */}

<div className="wallet-transfer">

  <h3 className="transfer-title">
  <FaPaperPlane />
  <span>Quick Transfer</span>
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
<select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  {TRANSACTION_CATEGORIES.map((category) => (
    <option
      key={category}
      value={category}
    >
      {CATEGORY_LABELS[category]}
    </option>
  ))}
</select>
<br />
<br />
  <button
    className="wallet-btn"
    onClick={handleTransfer}
  >
    Transfer Money
  </button>

</div>
<TransactionHistory
  transactions={transactions}
  onSelectTransaction={
    setSelectedTransaction
  }
/>

<TransactionModal
  transaction={
    selectedTransaction
  }
  onClose={() =>
    setSelectedTransaction(null)
  }
/>

    </div>

  );
}

export default WalletPage;