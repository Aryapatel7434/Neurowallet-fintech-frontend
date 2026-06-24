import {
  FaWallet,
  FaPaperPlane,
  FaChartLine,
  FaBullseye
} from "react-icons/fa";

import { FaBolt } from "react-icons/fa";

function QuickActions() {

  const actions = [

    {
      icon: <FaWallet />,
      title: "Add Money"
    },

    {
      icon: <FaPaperPlane />,
      title: "Transfer"
    },

    {
      icon: <FaChartLine />,
      title: "Analytics"
    },

    {
      icon: <FaBullseye />,
      title: "Goals"
    }

  ];

  return (

    <div className="quick-card">

      <h2>
        <FaBolt />
        Quick Actions
      </h2>

      <div className="quick-grid">

        {actions.map((action, index) => (

          <div
            key={index}
            className="action-box"
          >

            {action.icon}

            <span>
              {action.title}
            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default QuickActions;