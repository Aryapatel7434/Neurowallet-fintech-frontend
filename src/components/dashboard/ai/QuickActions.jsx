import "./QuickActions.css";

import {
    FaWallet,
    FaMoneyBillTransfer,
    FaChartPie,
    FaBullseye,
    FaArrowRight
} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";

function QuickActions({ onRefresh }) {

    const navigate = useNavigate();

    const actions = [

        {
            icon: <FaWallet />,
            title: "Add Money",
            description: "Top up your wallet instantly",
            color: "blue",
            route: "/wallet/deposit"
        },

        {
            icon: <FaMoneyBillTransfer />,
            title: "Transfer",
            description: "Send money securely",
            color: "green",
            route: "/transfer"
        },

        {
            icon: <FaChartPie />,
            title: "Analytics",
            description: "View financial reports",
            color: "purple",
            route: "/analytics"
        },

        {
            icon: <FaBullseye />,
            title: "Goals",
            description: "Track savings goals",
            color: "orange",
            route: "/goals"
        }

    ];

    const handleNavigation = (route) => {

        // Replace with actual pages when implemented

        if (
            route === "/wallet/deposit" ||
            route === "/transfer" ||
            route === "/analytics" ||
            route === "/goals"
        ) {

            navigate("/dashboard");

            // Later:
            // navigate(route);

        }

    };

    return (

        <div className="quick-card">

            {/* ================= Header ================= */}

            <div className="quick-header">

                <h2>

                    Quick Actions

                </h2>

                <span>

                    {actions.length} Actions

                </span>

            </div>

            {/* ================= Action Grid ================= */}

            <div className="quick-grid">

                {

                    actions.map((action, index) => (

                        <button

                            key={index}

                            className={`quick-item ${action.color}`}

                            onClick={() =>
                                handleNavigation(action.route)
                            }

                        >

                            <div className="quick-icon">

                                {action.icon}

                            </div>

                            <div className="quick-content">

                                <h4>

                                    {action.title}

                                </h4>

                                <p>

                                    {action.description}

                                </p>

                            </div>

                            <FaArrowRight
                                className="quick-arrow"
                            />

                        </button>

                    ))

                }

            </div>

        </div>

    );

}

export default QuickActions;