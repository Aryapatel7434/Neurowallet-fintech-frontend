import AppRoutes from "./routes/AppRoutes";
import NetworkStatusBanner from "./components/common/NetworkStatusBanner";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <NetworkStatusBanner />
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
