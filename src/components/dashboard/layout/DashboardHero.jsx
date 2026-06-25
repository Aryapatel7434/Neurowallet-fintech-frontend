import { useContext, useEffect, useState } from "react";

import {
  FaRobot,
  FaShieldHalved
} from "react-icons/fa6";

import { AuthContext } from "../../../context/AuthContext";

function DashboardHero() {

  const { user } = useContext(AuthContext);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentTime(new Date());

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const hour = currentTime.getHours();

  let greeting = "Good Evening";

  if (hour < 12) {

    greeting = "Good Morning";

  } else if (hour < 18) {

    greeting = "Good Afternoon";

  }

  const dayName = currentTime.toLocaleDateString(
    "en-IN",
    {
      weekday: "long"
    }
  );

  const formattedDate = currentTime.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

  const formattedTime = currentTime.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

  return (

    <section className="dashboard-hero">

      <div className="hero-header">

        {/* LEFT */}

        <div className="hero-left">

          <h1 className="hero-title">

    {greeting},

    <span className="hero-name">

        {user?.name || "Arya"}

    </span>

    <span className="hero-wave">

        👋

    </span>

</h1>
          <p className="hero-subtitle">

            Welcome back. Everything looks healthy today.

          </p>

          <div className="hero-status-row">

            <div className="hero-chip backend">

              <span className="chip-dot"></span>

              Backend Connected

            </div>

            <div className="hero-chip wallet">

              💳 Wallet Active

            </div>

            <div className="hero-chip ai">

              <FaRobot />

              AI Ready

            </div>

            <div className="hero-chip secure">

              <FaShieldHalved />

              Secure Session

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="hero-right">

          <div className="hero-time-card">

            <span className="hero-day">

              {dayName}

            </span>

            <span className="hero-date">

              {formattedDate}

            </span>

            <h2 className="hero-clock">

              {formattedTime}

            </h2>

          </div>

        </div>

      </div>

    </section>

  );

}

export default DashboardHero;