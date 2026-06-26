import {
  FaMoneyBillTrendUp,
  FaRotateRight,
  FaCircle
} from "react-icons/fa6";

import "./Analytics.css";

function PerformanceHeader({

  onRefresh = () => {}

}) {

  return (

    <div className="analytics-premium-header">

      <div className="analytics-premium-left">

        <div className="analytics-premium-icon">

          <FaMoneyBillTrendUp />

        </div>

        <div>

          <h2 className="analytics-premium-title">

            Performance Analytics

          </h2>

          <p className="analytics-premium-subtitle">

            Monitor revenue and expense trends in real time.

          </p>

        </div>

      </div>

      <div className="analytics-premium-right">

        <span className="analytics-live-badge">

          <FaCircle />

          LIVE

        </span>

        <button

          className="analytics-refresh-btn"

          onClick={onRefresh}

        >

          <FaRotateRight />

        </button>

      </div>

    </div>

  );

}

export default PerformanceHeader;