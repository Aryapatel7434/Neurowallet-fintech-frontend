import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

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