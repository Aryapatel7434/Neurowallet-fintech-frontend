import "./DashboardSkeleton.css";

function DashboardSkeleton() {

    return (

        <div className="dashboard-skeleton">

            {/* ================= Hero ================= */}

            <div className="skeleton hero-skeleton"></div>

            {/* ================= Financial Overview ================= */}

            <div className="skeleton-overview">

                <div className="skeleton overview-card"></div>

                <div className="skeleton overview-card"></div>

                <div className="skeleton overview-card"></div>

                <div className="skeleton overview-card"></div>

            </div>

            {/* ================= Command Center ================= */}

            <div className="skeleton-two-column">

                <div className="skeleton command-card"></div>

                <div className="skeleton command-card"></div>

            </div>

            {/* ================= Transactions ================= */}

            <div className="skeleton table-card"></div>

            {/* ================= Analytics ================= */}

            <div className="skeleton-two-column">

                <div className="skeleton analytics-card-skeleton"></div>

                <div className="skeleton analytics-card-skeleton"></div>

            </div>

            {/* ================= Performance ================= */}

            <div className="skeleton-two-column">

                <div className="skeleton analytics-card-skeleton"></div>

                <div className="skeleton analytics-card-skeleton"></div>

            </div>

            {/* ================= Insights ================= */}

            <div className="skeleton-two-column">

                <div className="skeleton analytics-card-skeleton"></div>

                <div className="skeleton analytics-card-skeleton"></div>

            </div>

            {/* ================= AI ================= */}

            <div className="skeleton-ai-grid">

                <div className="skeleton ai-card"></div>

                <div className="skeleton ai-card"></div>

                <div className="skeleton ai-card"></div>

                <div className="skeleton ai-card"></div>

                <div className="skeleton ai-card"></div>

                <div className="skeleton ai-card"></div>

            </div>

        </div>

    );

}

export default DashboardSkeleton;