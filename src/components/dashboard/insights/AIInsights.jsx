import {
  FaRobot,
  FaArrowRight,
  FaArrowTrendUp,
  FaArrowTrendDown
} from "react-icons/fa6";

function AIInsights({

  transactions = [],

}) {

  return (

       <div className="insight-card">
    <div className="ai-header">

    <h3>
        AI Smart Insight
    </h3>

    <span className="ai-status">
        ✓ Healthy
    </span>

</div>
  
    <div className="expense-row">

        <span>🍔 Food</span>

        <strong>₹4,200</strong>

        <span className="up">↑</span>

    </div>

    <div className="expense-row">

        <span>🛍 Shopping</span>

        <strong>₹2,900</strong>

        <span className="down">↓</span>

    </div>

    <div className="expense-row">

        <span>⚡ Bills</span>

        <strong>₹1,200</strong>

        <span>-</span>

    </div>

    <div className="recommendation">

        <h4>AI Recommendation</h4>

        <p>

            Reduce dining expenses by 8%
            to save nearly ₹1,200 next month.

        </p>

    </div>

    <button className="analysis-btn">

        View Full Analysis →

    </button>

</div>

  );

}

export default AIInsights;