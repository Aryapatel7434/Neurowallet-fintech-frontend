
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import TransactionsPage from "../pages/transactions/TransactionsPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import AIInsightsPage from "../pages/ai/AIInsightsPage";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import SettingsPage from "../pages/settings/SettingsPage";
function ComingSoonPage({ title }) {
    return (
        <main className="dashboard-page-content-inner">
            <h1>{title}</h1>
            <p>
                This page is not implemented yet.
                It will be connected to the NeuroWallet backend
                when its feature is developed.
            </p>
        </main>
    );
}

function ProtectedLayout({ children }) {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
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
                        <ProtectedLayout>
                            <DashboardPage />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/wallet"
                    element={
                        <ProtectedLayout>
                            <WalletPage />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/transactions"
                    element={
                        <ProtectedLayout>
                            <TransactionsPage />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <ProtectedLayout>
                            <AnalyticsPage />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/ai-insights"
                    element={
                        <ProtectedLayout>
                            <AIInsightsPage />
                        </ProtectedLayout>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedLayout>
                            <NotificationsPage />
                        </ProtectedLayout>
                    }
                />

               <Route
    path="/settings"
    element={
        <ProtectedRoute>
            <DashboardLayout>
                <SettingsPage />
            </DashboardLayout>
        </ProtectedRoute>
    }
/>

                {/* Redirect unknown URLs */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
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
