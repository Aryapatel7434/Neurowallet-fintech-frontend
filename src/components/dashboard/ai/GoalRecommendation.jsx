import { FaBullseye } from "react-icons/fa6";
function GoalRecommendation({ wallet }) {

  const balance = wallet?.balance || 0;

  let goal = "";
  let target = "";

  if (balance < 5000) {
    goal = "Emergency Fund";
    target = "₹10,000";
  }

  else if (balance < 20000) {
    goal = "Savings Goal";
    target = "₹50,000";
  }

  else if (balance < 50000) {
    goal = "Investment Goal";
    target = "₹1,00,000";
  }

  else {
    goal = "Wealth Growth";
    target = "₹5,00,000";
  }

  return (

    <div className="goal-card">

        <h2>
  <FaBullseye />
  Goal Recommendation
</h2>

      <h1>{goal}</h1>

      <p>
        Suggested Target:
        {target}
      </p>

    </div>

  );

}

export default GoalRecommendation;