import {
  FaRotateRight,
  FaDownload,
} from "react-icons/fa6";

function DashboardSection({

  title,

  icon,

  badge,

  showRefresh = false,

  showExport = false,

  onRefresh,

  onExport,

  children,

}) {

  return (

    <section className="dashboard-section">

      <div className="section-header">

        <div className="section-title-wrapper">

          <span className="section-icon">
            {icon}
          </span>

          <h2 className="section-title">
            {title}
          </h2>

        </div>

        <div className="section-actions">

          {badge && (

            <span className="section-badge">
              {badge}
            </span>

          )}

          {showRefresh && (

            <button
              className="section-btn"
              onClick={onRefresh}
            >

              <FaRotateRight />

            </button>

          )}

          {showExport && (

            <button
              className="section-btn"
              onClick={onExport}
            >

              <FaDownload />

            </button>

          )}

        </div>

      </div>

      <div className="section-body">

        {children}

      </div>

    </section>

  );

}

export default DashboardSection;