import "./AIAssistantHeader.css";
import { FaRobot } from "react-icons/fa6";

function AIAssistantHeader() {

    return (

        <div className="ai-header">

            <div className="ai-header-left">

                <div className="ai-header-icon">

                    <FaRobot />

                </div>

                <div>

                    <h2>
                        AI Assistant
                    </h2>

                    <p>
                        Smart financial recommendations powered by NeuroWallet AI
                    </p>

                </div>

            </div>

            <div className="ai-header-right">

                <span className="ai-live">

                    <span className="ai-live-dot"></span>

                    LIVE

                </span>

                <button className="ai-refresh">

                    ↻

                </button>

            </div>

        </div>

    );

}

export default AIAssistantHeader;