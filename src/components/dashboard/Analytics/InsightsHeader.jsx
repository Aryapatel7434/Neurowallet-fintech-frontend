import "./Analytics.css";
import { FaBrain } from "react-icons/fa6";

function InsightsHeader() {

    return (

        <div className="insights-header">

            <div className="insights-left">

                <div className="insights-icon">

                    <FaBrain />

                </div>

                <div>

                    <h2>

                        Financial Insights

                    </h2>

                    <p>

                        AI Generated Analytics &
                        Monthly Performance

                    </p>

                </div>

            </div>

            <div className="insights-right">

                <span className="insights-live">

                    <span className="live-dot"></span>

                    LIVE

                </span>

            </div>

        </div>

    );

}

export default InsightsHeader;