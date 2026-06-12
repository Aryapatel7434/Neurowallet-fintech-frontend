function GoalTracker() {
  return (
    <div className="goal-card">
      <h3>Financial Goals</h3>

      <div className="goal">
        <p>Emergency Fund</p>

        <div className="progress">
          <div
            className="progress-fill"
            style={{ width: "65%" }}
          ></div>
        </div>
      </div>

      <div className="goal">
        <p>Vacation Fund</p>

        <div className="progress">
          <div
            className="progress-fill"
            style={{ width: "40%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default GoalTracker;