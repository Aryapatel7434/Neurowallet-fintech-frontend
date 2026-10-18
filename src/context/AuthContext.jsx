
import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { STORAGE_KEYS } from "../constants/storageKeys";
import { getInitials } from "../utils/userUtils";
import { restoreSession } from "../api/axiosConfig";

export const AuthContext = createContext(null);

const clearStoredAuthentication = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.USER);
};

const buildUserData = (data) => {
    if (
        !data ||
        typeof data.name !== "string" ||
        !data.name.trim() ||
        typeof data.email !== "string" ||
        !data.email.trim()
    ) {
        return null;
    }

    return {
        name: data.name.trim(),
        email: data.email.trim(),
        initials: getInitials(data.name.trim()),
        role:
            typeof data.role === "string" && data.role.trim()
                ? data.role.trim()
                : null,
    };
};

const isTemporarySessionError = (error) => {
    const status = error?.response?.status;

    // No response usually means a network failure or timeout.
    if (!error?.response) {
        return true;
    }

    // Server-side failures may be temporary.
    return status >= 500;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [sessionRestoreError, setSessionRestoreError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const initializeSession = useCallback(async () => {
        setIsInitializing(true);
        setSessionRestoreError(false);

        try {
            const refreshToken = localStorage.getItem(
                STORAGE_KEYS.REFRESH_TOKEN
            );

            if (!refreshToken) {
                clearStoredAuthentication();
                setUser(null);
                return;
            }

            const data = await restoreSession();
            const userData = buildUserData(data);

            if (
                !data ||
                typeof data.accessToken !== "string" ||
                !data.accessToken ||
                !userData ||
                !userData.role
            ) {
                clearStoredAuthentication();
                setUser(null);
                return;
            }

            localStorage.setItem(
                STORAGE_KEYS.EMAIL,
                userData.email
            );

            localStorage.setItem(
                STORAGE_KEYS.USER,
                JSON.stringify(userData)
            );

            setUser(userData);
        } catch (error) {
            if (isTemporarySessionError(error)) {
                // Preserve stored credentials so the user can retry.
                setSessionRestoreError(true);
            } else {
                // A definitive authentication/client error requires login.
                clearStoredAuthentication();
                setUser(null);
            }
        } finally {
            setIsInitializing(false);
        }
    }, []);

    useEffect(() => {
        initializeSession();
    }, [initializeSession, retryCount]);
    
    useEffect(() => {
    const handleStorageChange = (event) => {
        const authKeys = [
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.EMAIL,
            STORAGE_KEYS.USER,
        ];

        // Ignore unrelated localStorage changes.
        if (
            event.key !== null &&
            !authKeys.includes(event.key)
        ) {
            return;
        }

        // localStorage.clear() also triggers this event.
        if (event.key === null || !localStorage.getItem(
            STORAGE_KEYS.ACCESS_TOKEN
        )) {
            setUser(null);
            setSessionRestoreError(false);
            return;
        }

        // Synchronize login or updated user data across tabs.
        const storedUser = localStorage.getItem(
            STORAGE_KEYS.USER
        );

        if (!storedUser) {
            return;
        }

        try {
            const userData = buildUserData(
                JSON.parse(storedUser)
            );

            if (userData) {
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
        window.removeEventListener(
            "storage",
            handleStorageChange
        );
    };
}, []);
    const retrySessionRestore = useCallback(() => {
        setRetryCount((count) => count + 1);
    }, []);

    const login = useCallback((data) => {
        if (
            !data ||
            typeof data.accessToken !== "string" ||
            !data.accessToken ||
            typeof data.email !== "string" ||
            !data.email.trim() ||
            typeof data.name !== "string" ||
            !data.name.trim()
        ) {
            throw new Error(
                "Login response is missing required authentication data."
            );
        }

        const userData = buildUserData(data);

        if (!userData || !userData.role) {
            throw new Error(
                "Login response is missing a valid user role."
            );
        }

        try {
            localStorage.setItem(
                STORAGE_KEYS.ACCESS_TOKEN,
                data.accessToken
            );

            if (
                typeof data.refreshToken === "string" &&
                data.refreshToken
            ) {
                localStorage.setItem(
                    STORAGE_KEYS.REFRESH_TOKEN,
                    data.refreshToken
                );
            } else {
                localStorage.removeItem(
                    STORAGE_KEYS.REFRESH_TOKEN
                );
            }

            localStorage.setItem(
                STORAGE_KEYS.EMAIL,
                userData.email
            );

            localStorage.setItem(
                STORAGE_KEYS.USER,
                JSON.stringify(userData)
            );
        } catch (error) {
            clearStoredAuthentication();
            throw error;
        }

        setSessionRestoreError(false);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        clearStoredAuthentication();
        setUser(null);
        setSessionRestoreError(false);
    }, []);

    const hasRole = useCallback(
        (requiredRole) =>
            Boolean(user?.role && user.role === requiredRole),
        [user]
    );

    const hasAnyRole = useCallback(
        (requiredRoles = []) =>
            Boolean(
                user?.role &&
                Array.isArray(requiredRoles) &&
                requiredRoles.includes(user.role)
            ),
        [user]
    );

    const isAuthenticated = Boolean(
        user && localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            isAuthenticated,
            isInitializing,
            sessionRestoreError,
            retrySessionRestore,
            hasRole,
            hasAnyRole,
        }),
        [
            user,
            login,
            logout,
            isAuthenticated,
            isInitializing,
            sessionRestoreError,
            retrySessionRestore,
            hasRole,
            hasAnyRole,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
