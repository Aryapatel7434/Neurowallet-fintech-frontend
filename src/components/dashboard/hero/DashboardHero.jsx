
import { useContext, useEffect, useState } from "react";
import { FaRobot, FaShieldHalved } from "react-icons/fa6";
import { AuthContext } from "../../../context/AuthContext";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);

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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const displayName = getDisplayName(user);

  return (
    <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
      <div className="hero-header">
        <div className="hero-left">
          <p className="hero-eyebrow">YOUR FINANCIAL COMMAND CENTER</p>

          <h1 className="hero-title" id="dashboard-hero-title">
            {getGreeting()},{" "}
            <span className="hero-name">{displayName}</span>
            <span className="hero-wave" aria-hidden="true">
              {" "}
              👋
            </span>
          </h1>

          <p className="hero-subtitle">
            Your money, your insights, your next move. Here’s your financial
            overview.
          </p>

          <div className="hero-status-row" aria-label="Platform status">
            <span className="hero-chip backend">
              <span className="chip-dot" aria-hidden="true" />
              Dashboard
            </span>

            <span className="hero-chip wallet">
              <span className="chip-dot" aria-hidden="true" />
              Wallet
            </span>

            <span className="hero-chip ai">
              <FaRobot aria-hidden="true" />
              AI insights
            </span>

            <span className="hero-chip secure">
              <FaShieldHalved aria-hidden="true" />
              Secure access
            </span>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-time-card" aria-label="Current local date and time">
            <span className="hero-day">{now.toLocaleDateString("en-IN", {
              weekday: "long",
            })}</span>

            <time className="hero-clock" dateTime={now.toISOString()}>
              {formatTime(now)}
            </time>

            <span className="hero-date">{formatDate(now)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
