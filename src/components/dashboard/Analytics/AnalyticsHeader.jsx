import {
  FaChartLine,
  FaRotateRight,
  FaCircle
} from "react-icons/fa6";

import "./Analytics.css";

function AnalyticsHeader({

  onRefresh = () => {}

}) {

  return (

    <div className="analytics-premium-header">

      <div className="analytics-premium-left">

        <div className="analytics-premium-icon">

          <FaChartLine />

        </div>

        <div>

          <h2 className="analytics-premium-title">

            Analytics

          </h2>

          <p className="analytics-premium-subtitle">

            Financial performance overview

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

export default AnalyticsHeader;