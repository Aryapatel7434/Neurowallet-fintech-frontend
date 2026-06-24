import { FaBullseye } from "react-icons/fa6";
function SmartGoals({ wallet }) {

  const current =
    wallet?.balance || 0;

  const target = 50000;

  const percentage =
    Math.min(
      (current / target) * 100,
      100
    );

  return (

    <div className="goal-card">

        <h2>
  <FaBullseye />
  Smart Goal
</h2>

      <h1>
        ₹{current}
      </h1>

      <p>
        Goal ₹50,000
      </p>

      <div className="goal-progress">

        <div
          className="goal-fill"
          style={{
            width:
              `${percentage}%`
          }}
        />

      </div>

      <h3>
        {percentage.toFixed(1)}%
      </h3>

    </div>

  );

}

export default SmartGoals;