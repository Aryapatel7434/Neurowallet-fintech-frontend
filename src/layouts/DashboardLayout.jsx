import Navbar from "../components/dashboard/layout/Sidebar";
import Navbar from "../components/dashboard/layout/Navbar";

function DashboardLayout({ children }) {

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="main-content">

                <Navbar />

                {children}

            </div>

        </div>

    );
}

export default DashboardLayout;