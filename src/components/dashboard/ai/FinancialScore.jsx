import { FaShieldAlt } from "react-icons/fa";
function FinancialScore({ wallet }) {

  const balance = wallet?.balance || 0;

  let score = 50;

  if (balance > 1000)
    score += 10;

  if (balance > 5000)
    score += 10;

  if (balance > 10000)
    score += 10;

  if (balance > 25000)
    score += 10;

  if (balance > 50000)
    score += 10;

  let status = "Needs Improvement";

  if (score >= 90)
    status = "Excellent";

  else if (score >= 75)
    status = "Good";

  else if (score >= 60)
    status = "Healthy";

  return (

    <div className="ai-card">

     <h2>
  <FaShieldAlt />
  Financial Score
</h2>

      <h1>{score}/100</h1>

      <p>{status}</p>

    </div>

  );

}

export default FinancialScore;