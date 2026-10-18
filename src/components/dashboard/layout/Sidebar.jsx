
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { AuthContext } from "../../../context/AuthContext";

function Sidebar() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const menuItems = [
        {
            label: "🏠 Dashboard",
            path: "/dashboard",
            end: true,
        },
        {
            label: "💰 Wallet",
            path: "/wallet",
        },
        {
            label: "💳 Transactions",
            path: "/transactions",
        },
        {
            label: "📊 Analytics",
            path: "/analytics",
        },
        {
            label: "🤖 AI Insights",
            path: "/ai-insights",
        },
        {
            label: "⚙️ Settings",
            path: "/settings",
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">NW</div>

            <h2>NeuroWallet</h2>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                isActive ? "active" : ""
                            }
                        >
                            {item.label}
                        </NavLink>
                    </li>
                ))}

                <li>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="sidebar-logout"
                    >
                        🚪 Logout
                    </button>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
