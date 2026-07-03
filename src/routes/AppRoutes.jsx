import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import LoginPage
from "../pages/auth/LoginPage";

import RegisterPage
from "../pages/auth/RegisterPage";

import ForgotPasswordPage
from "../pages/auth/ForgotPasswordPage";

import ResetPasswordPage
from "../pages/auth/ResetPasswordPage";

import DashboardPage
from "../pages/dashboard/DashboardPage";

import WalletPage
from "../pages/wallet/WalletPage";

import NotificationsPage
from "../pages/notifications/NotificationsPage";

import ProtectedRoute
from "../components/auth/ProtectedRoute";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ===========================
                    Authentication
                ============================ */}

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

                {/* ===========================
                    Dashboard
                ============================ */}

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