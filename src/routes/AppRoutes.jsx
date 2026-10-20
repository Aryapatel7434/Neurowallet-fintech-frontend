
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import DashboardPage from "../pages/dashboard/DashboardPage";
import WalletPage from "../pages/wallet/WalletPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";

import ProtectedRoute from "../components/auth/ProtectedRoute";

function ComingSoonPage({ title }) {
    return (
        <main
            style={{
                padding: "40px 24px",
                textAlign: "center",
            }}
        >
            <h1>{title}</h1>
            <p>
                This page is not implemented yet.
                It will be connected to the NeuroWallet backend
                when its feature is developed.
            </p>
        </main>
    );
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public authentication routes */}
                <Route path="/" element={<LoginPage />} />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                />

                {/* Protected application routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/wallet"
                    element={
                        <ProtectedRoute>
                            <WalletPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <NotificationsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Feature routes — implementation pending */}
                <Route
    path="/transactions"
    element={
        <ProtectedRoute>
            <TransactionsPage />
        </ProtectedRoute>
    }
/>

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <ComingSoonPage title="Analytics" />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ai-insights"
                    element={
                        <ProtectedRoute>
                            <ComingSoonPage title="AI Insights" />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <ComingSoonPage title="Settings" />
                        </ProtectedRoute>
                    }
                />

                {/* Unknown URLs */}
                <Route
                    path="*"
                    element={
                        <Navigate to="/dashboard" replace />
                    }
                />
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="dark"
            />
        </BrowserRouter>
    );
}

export default AppRoutes;
