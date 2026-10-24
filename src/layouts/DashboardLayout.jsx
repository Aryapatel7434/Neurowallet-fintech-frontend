
import { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/layout/Sidebar";
import Navbar from "../components/dashboard/layout/Navbar";
import api from "../api/axiosConfig";

function DashboardLayout({ children }) {
    const [theme, setTheme] = useState("DARK");

    useEffect(() => {
        let active = true;

        const loadTheme = async () => {
            try {
                const response = await api.get(
                    "/users/me/preferences"
                );

                if (active) {
                    const savedTheme =
                        response.data?.theme === "LIGHT"
                            ? "LIGHT"
                            : "DARK";

                    setTheme(savedTheme);
                    document.documentElement.dataset.theme =
                        savedTheme.toLowerCase();
                }
            } catch (error) {
                if (active) {
                    setTheme("DARK");
                    document.documentElement.dataset.theme = "dark";
                }
            }
        };

        loadTheme();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div
            className="dashboard-layout"
            data-theme={theme.toLowerCase()}
        >
            <Sidebar />

            <div className="dashboard-content">
                <Navbar />

                <main className="dashboard-page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
