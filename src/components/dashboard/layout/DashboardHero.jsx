
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import "./DashboardHero.css";
const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
};

const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);

const getDisplayName = (user) => {
    if (!user) return "there";

    const name =
        user.name ??
        user.fullName ??
        user.username ??
        user.firstName ??
        user.email?.split("@")[0];

    return typeof name === "string" && name.trim()
        ? name.trim().split(/\s+/)[0]
        : "there";
};

export default function DashboardHero() {
    const { user } = useContext(AuthContext);

    const displayName = getDisplayName(user);
    const today = new Date();

    return (
        <section
            className="dashboard-hero"
            aria-labelledby="dashboard-hero-title"
        >
            <div className="hero-header">
                <div className="hero-left">
                    <h1 className="hero-title" id="dashboard-hero-title">
                        {getGreeting()}, {displayName}!
                    </h1>

                    <p className="hero-subtitle">
                        Here's your financial overview for today,{" "}
                        {formatDate(today)}
                    </p>
                </div>
            </div>
        </section>
    );
}
