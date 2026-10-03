import AppRoutes from "./routes/AppRoutes";

import NetworkStatusBanner
    from "./components/common/NetworkStatusBanner";

function App() {

    return (
        <>
            <NetworkStatusBanner />

            <AppRoutes />
        </>
    );
}

export default App;