
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// Authentication Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// Dashboard Pages
import DashboardPage from "../pages/dashboard/DashboardPage";
import WalletPage from "../pages/wallet/WalletPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import AIInsightsPage from "../pages/ai/AIInsightsPage";
import GoalsPage from "../pages/goals/GoalsPage";
import BudgetsPage from "../pages/budgets/BudgetsPage";

// Other Pages
import SettingsPage from "../pages/settings/SettingsPage";
import ScheduledTransactionsPage
    from "../pages/scheduled/ScheduledTransactionsPage";

// Authentication & Layout
import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Protected Application Layout
function ProtectedLayout({ children }) {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}

// Application Routes
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ==============================
                    PUBLIC AUTHENTICATION ROUTES
                ============================== */}

                <Route
                    path="/"
                    element={<LoginPage />}
                />

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

                {/* ==============================
                    PROTECTED APPLICATION ROUTES
                ============================== */}

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedLayout>
                            <DashboardPage />
                        </ProtectedLayout>
                    }
                />

                {/* Wallet */}
                <Route
                    path="/wallet"
                    element={
                        <ProtectedLayout>
                            <WalletPage />
                        </ProtectedLayout>
                    }
                />

                {/* Transactions */}
                <Route
                    path="/transactions"
                    element={
                        <ProtectedLayout>
                            <TransactionsPage />
                        </ProtectedLayout>
                    }
                />

                {/* Scheduled Transactions */}
                <Route
                    path="/scheduled"
                    element={
                        <ProtectedLayout>
                            <ScheduledTransactionsPage />
                        </ProtectedLayout>
                    }
                />

                {/* Analytics */}
                <Route
                    path="/analytics"
                    element={
                        <ProtectedLayout>
                            <AnalyticsPage />
                        </ProtectedLayout>
                    }
                />

                {/* Goals Module */}
                <Route
                    path="/goals"
                    element={
                        <ProtectedLayout>
                            <GoalsPage />
                        </ProtectedLayout>
                    }
                />

                {/* Budgets Module */}
                <Route
                    path="/budgets"
                    element={
                        <ProtectedLayout>
                            <BudgetsPage />
                        </ProtectedLayout>
                    }
                />

                {/* AI Insights */}
                <Route
                    path="/ai-insights"
                    element={
                        <ProtectedLayout>
                            <AIInsightsPage />
                        </ProtectedLayout>
                    }
                />

                {/* Notifications */}
                <Route
                    path="/notifications"
                    element={
                        <ProtectedLayout>
                            <NotificationsPage />
                        </ProtectedLayout>
                    }
                />

                {/* Settings */}
                <Route
                    path="/settings"
                    element={
                        <ProtectedLayout>
                            <SettingsPage />
                        </ProtectedLayout>
                    }
                />

                {/* ==============================
                    FALLBACK ROUTE
                ============================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

            {/* Global Toast Notifications */}
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
