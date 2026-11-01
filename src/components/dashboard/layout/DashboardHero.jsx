
import { useContext } from "react";
import { FaRobot, FaShieldHalved } from "react-icons/fa6";
import { AuthContext } from "../../../context/AuthContext";
import "./DashboardHero.css";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getDisplayName = (user) => {
  if (!user) return "there";

  const name =
    user.name ??
    user.fullName ??
    user.username ??
    user.firstName ??
    user.email?.split("@")[0];

  if (typeof name !== "string" || !name.trim()) {
    return "there";
  }

  return name.trim().split(/\s+/)[0];
};

export default function DashboardHero() {
  const { user } = useContext(AuthContext);
  const displayName = getDisplayName(user);

  return (
    <section
      className="dashboard-hero"
      aria-labelledby="dashboard-hero-title"
    >
      <div className="hero-header">
        {/* LEFT: Dashboard introduction */}
        <div className="hero-left">
          <p className="hero-eyebrow">
            YOUR FINANCIAL COMMAND CENTER
          </p>

          <h1 className="hero-title" id="dashboard-hero-title">
            {getGreeting()}, <span className="hero-name">{displayName}</span>
          </h1>

          <p className="hero-subtitle">
            Your money, your insights, your next move.
          </p>

          <div className="hero-status-row" aria-label="Platform features">
            <span className="hero-chip">
              <span className="chip-dot" />
              Dashboard
            </span>

            <span className="hero-chip">
              <span className="chip-dot" />
              Wallet
            </span>

            <span className="hero-chip">
              <FaRobot aria-hidden="true" />
              AI insights
            </span>

            <span className="hero-chip">
              <FaShieldHalved aria-hidden="true" />
              Secure access
            </span>
          </div>
        </div>

        {/* RIGHT: Personal philosophy */}
        <div className="hero-branding">
          <span className="hero-branding-label">
            PERSONAL PHILOSOPHY
          </span>

          <p className="hero-personal-tagline">
            Built to endure.
            <span>Driven to rise.</span>
          </p>

          <span className="hero-branding-line" />
        </div>
      </div>
    </section>
  );
}
