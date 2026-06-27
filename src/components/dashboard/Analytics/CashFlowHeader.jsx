import {
    FaChartPie,
    FaRotateRight,
    FaCircle,
    FaDownload
} from "react-icons/fa6";

import "./Analytics.css";

function CashFlowHeader({

    onRefresh = () => {},

    onExport = () => {}

}) {

    return (

        <div className="analytics-premium-header">

            <div className="analytics-premium-left">

                <div className="analytics-premium-icon">

                    <FaChartPie />

                </div>

                <div>

                    <h2 className="analytics-premium-title">

                        Cash Flow & Spending

                    </h2>

                    <p className="analytics-premium-subtitle">

                        Monitor income, expenses and spending distribution.

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

                <button

                    className="analytics-refresh-btn"

                    onClick={onExport}

                >

                    <FaDownload />

                </button>

            </div>

        </div>

    );

}

export default CashFlowHeader;