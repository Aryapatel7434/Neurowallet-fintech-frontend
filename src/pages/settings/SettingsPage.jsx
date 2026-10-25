
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    FaUser,
    FaEnvelope,
    FaShieldAlt,
    FaSave,
    FaSyncAlt,
    FaCheckCircle,
    FaSlidersH,
    FaPalette,
    FaCoins,
    FaGlobe,
    FaBell,
    FaExchangeAlt,
    FaDownload,
    FaDatabase,
} from "react-icons/fa";

import api from "../../api/axiosConfig";
import "../../styles/settings.css";

const DEFAULT_PREFERENCES = {
    theme: "DARK",
    preferredCurrency: "INR",
    language: "EN",
};

const DEFAULT_NOTIFICATION_PREFERENCES = {
    emailNotifications: true,
    transactionAlerts: true,
    securityAlerts: true,
};

function SettingsPage() {
    // --------------------------------------------------
    // Profile state
    // --------------------------------------------------
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // General preferences state
    // --------------------------------------------------
    const [preferences, setPreferences] = useState(
        DEFAULT_PREFERENCES
    );
    const [savedPreferences, setSavedPreferences] = useState(
        DEFAULT_PREFERENCES
    );
    const [preferencesLoaded, setPreferencesLoaded] = useState(false);
    const [loadingPreferences, setLoadingPreferences] = useState(true);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [preferencesError, setPreferencesError] = useState("");

    // --------------------------------------------------
    // Notification preferences state
    // --------------------------------------------------
    const [notificationPreferences, setNotificationPreferences] =
        useState(DEFAULT_NOTIFICATION_PREFERENCES);

    const [savedNotificationPreferences, setSavedNotificationPreferences] =
        useState(DEFAULT_NOTIFICATION_PREFERENCES);

    const [notificationPreferencesLoaded, setNotificationPreferencesLoaded] =
        useState(false);

    const [loadingNotificationPreferences, setLoadingNotificationPreferences] =
        useState(true);

    const [savingNotificationPreferences, setSavingNotificationPreferences] =
        useState(false);

    const [notificationPreferencesError, setNotificationPreferencesError] =
        useState("");

    // --------------------------------------------------
    // Account data export state
    // --------------------------------------------------
    const [exportingData, setExportingData] = useState(false);

    // --------------------------------------------------
    // Load authenticated user's profile
    // --------------------------------------------------
    const loadProfile = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/users/me");

            setProfile(response.data);
            setName(response.data.name || "");
        } catch (err) {
            console.error(
                "Unable to load profile:",
                err.response?.status || err.message
            );

            setError(
                err.response?.status === 401 ||
                err.response?.status === 403
                    ? "Your session may have expired. Please log in again."
                    : "Unable to load your profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // Load general preferences
    // --------------------------------------------------
    const loadPreferences = async () => {
        setLoadingPreferences(true);
        setPreferencesError("");

        try {
            const response = await api.get("/users/me/preferences");

            const loadedPreferences = {
                theme: response.data.theme === "LIGHT" ? "LIGHT" : "DARK",
                preferredCurrency: response.data.preferredCurrency,
                language: response.data.language,
            };

            // Apply the saved theme across the document.
            document.documentElement.dataset.theme =
                loadedPreferences.theme === "LIGHT" ? "light" : "dark";

            setPreferences(loadedPreferences);
            setSavedPreferences(loadedPreferences);
            setPreferencesLoaded(true);
        } catch (err) {
            console.error(
                "Unable to load preferences:",
                err.response?.status || err.message
            );

            setPreferencesError(
                err.response?.status === 401 ||
                err.response?.status === 403
                    ? "Your session may have expired. Please log in again."
                    : "Unable to load your preferences. Please try again."
            );
        } finally {
            setLoadingPreferences(false);
        }
    };

    // --------------------------------------------------
    // Load notification preferences
    // --------------------------------------------------
    const loadNotificationPreferences = async () => {
        setLoadingNotificationPreferences(true);
        setNotificationPreferencesError("");

        try {
            const response = await api.get(
                "/users/me/notification-preferences"
            );

            const loadedPreferences = {
                emailNotifications: response.data.emailNotifications,
                transactionAlerts: response.data.transactionAlerts,
                securityAlerts: response.data.securityAlerts,
            };

            setNotificationPreferences(loadedPreferences);
            setSavedNotificationPreferences(loadedPreferences);
            setNotificationPreferencesLoaded(true);
        } catch (err) {
            console.error(
                "Unable to load notification preferences:",
                err.response?.status || err.message
            );

            setNotificationPreferencesError(
                err.response?.status === 401 ||
                err.response?.status === 403
                    ? "Your session may have expired. Please log in again."
                    : "Unable to load notification preferences. Please try again."
            );
        } finally {
            setLoadingNotificationPreferences(false);
        }
    };

    // --------------------------------------------------
    // Initial data loading
    // --------------------------------------------------
    useEffect(() => {
        loadProfile();
        loadPreferences();
        loadNotificationPreferences();
    }, []);

    // --------------------------------------------------
    // Save profile changes
    // --------------------------------------------------
    const handleSave = async (event) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 100) {
            toast.error(
                "Name must contain between 2 and 100 characters."
            );
            return;
        }

        if (trimmedName === profile?.name) {
            toast.info("There are no changes to save.");
            return;
        }

        setSaving(true);

        try {
            const response = await api.put("/users/me", {
                name: trimmedName,
            });

            setProfile(response.data);
            setName(response.data.name || trimmedName);

            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(
                "Unable to update profile:",
                err.response?.status || err.message
            );

            const message =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Unable to update your profile. Please try again.";

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // General preferences handlers
    // --------------------------------------------------
    const handlePreferenceChange = (event) => {
        const { name, value } = event.target;

        setPreferences((current) => ({
            ...current,
            [name]: value,
        }));

        // Apply the selected theme immediately in the UI.
        if (name === "theme") {
            document.documentElement.dataset.theme =
                value === "LIGHT" ? "light" : "dark";
        }
    };

    const preferencesChanged =
        preferences.theme !== savedPreferences.theme ||
        preferences.preferredCurrency !==
            savedPreferences.preferredCurrency ||
        preferences.language !== savedPreferences.language;

    const handleSavePreferences = async (event) => {
        event.preventDefault();

        if (
            !preferencesLoaded ||
            !preferencesChanged ||
            savingPreferences
        ) {
            return;
        }

        setSavingPreferences(true);
        setPreferencesError("");

        try {
            const response = await api.put(
                "/users/me/preferences",
                preferences
            );

            const persistedPreferences = {
                theme: response.data.theme,
                preferredCurrency: response.data.preferredCurrency,
                language: response.data.language,
            };

            setPreferences(persistedPreferences);
            setSavedPreferences(persistedPreferences);
            setPreferencesLoaded(true);

            toast.success("Preferences saved successfully!");
        } catch (err) {
            console.error(
                "Unable to save preferences:",
                err.response?.status || err.message
            );

            const message =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Unable to save preferences. Please try again.";

            // Restore the last saved theme if saving preferences fails.
            document.documentElement.dataset.theme =
                savedPreferences.theme === "LIGHT" ? "light" : "dark";

            setPreferences((current) => ({
                ...current,
                theme: savedPreferences.theme,
            }));

            setPreferencesError(message);
            toast.error(message);
        } finally {
            setSavingPreferences(false);
        }
    };

    // --------------------------------------------------
    // Notification preferences handlers
    // --------------------------------------------------
    const handleNotificationPreferenceChange = (event) => {
        const { name, checked } = event.target;

        setNotificationPreferences((current) => ({
            ...current,
            [name]: checked,
        }));
    };

    const notificationPreferencesChanged =
        notificationPreferences.emailNotifications !==
            savedNotificationPreferences.emailNotifications ||
        notificationPreferences.transactionAlerts !==
            savedNotificationPreferences.transactionAlerts ||
        notificationPreferences.securityAlerts !==
            savedNotificationPreferences.securityAlerts;

    const handleSaveNotificationPreferences = async (event) => {
        event.preventDefault();

        if (
            !notificationPreferencesLoaded ||
            !notificationPreferencesChanged ||
            savingNotificationPreferences
        ) {
            return;
        }

        setSavingNotificationPreferences(true);
        setNotificationPreferencesError("");

        try {
            const response = await api.put(
                "/users/me/notification-preferences",
                notificationPreferences
            );

            const persistedPreferences = {
                emailNotifications: response.data.emailNotifications,
                transactionAlerts: response.data.transactionAlerts,
                securityAlerts: response.data.securityAlerts,
            };

            setNotificationPreferences(persistedPreferences);
            setSavedNotificationPreferences(persistedPreferences);
            setNotificationPreferencesLoaded(true);

            toast.success("Notification preferences saved successfully!");
        } catch (err) {
            console.error(
                "Unable to save notification preferences:",
                err.response?.status || err.message
            );

            const message =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Unable to save notification preferences. Please try again.";

            setNotificationPreferencesError(message);
            toast.error(message);
        } finally {
            setSavingNotificationPreferences(false);
        }
    };

    // --------------------------------------------------
    // Export authenticated user's account data
    // --------------------------------------------------
    const handleExportMyData = async () => {
        if (exportingData) {
            return;
        }

        setExportingData(true);

        try {
            const response = await api.get("/users/me/data-export", {
                headers: {
                    Accept: "application/json",
                },
            });

            const json = JSON.stringify(response.data, null, 2);
            const blob = new Blob([json], {
                type: "application/json;charset=utf-8",
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = "neurowallet-account-data.json";
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            link.remove();

            // Revoke the object URL after the download is initiated.
            window.setTimeout(() => {
                window.URL.revokeObjectURL(downloadUrl);
            }, 1000);

            toast.success("Your account data export was downloaded.");
        } catch (err) {
            console.error(
                "Unable to export account data:",
                err.response?.status || err.message
            );

            const message =
                err.response?.status === 401 ||
                err.response?.status === 403
                    ? "Your session may have expired. Please log in again."
                    : err.response?.data?.message ||
                      err.response?.data?.detail ||
                      "Unable to export your account data. Please try again.";

            toast.error(message);
        } finally {
            setExportingData(false);
        }
    };

    // --------------------------------------------------
    // Initial profile loading state
    // --------------------------------------------------
    if (loading) {
        return (
            <section className="settings-page">
                <div className="settings-state">
                    <div className="settings-spinner" />
                    <h2>Loading your profile</h2>
                    <p>
                        Retrieving your account information securely.
                    </p>
                </div>
            </section>
        );
    }

    // --------------------------------------------------
    // Profile loading failure
    // --------------------------------------------------
    if (error && !profile) {
        return (
            <section className="settings-page">
                <div className="settings-state settings-error">
                    <FaShieldAlt />

                    <h2>Profile unavailable</h2>
                    <p>{error}</p>

                    <button
                        type="button"
                        className="settings-primary-btn"
                        onClick={loadProfile}
                    >
                        <FaSyncAlt />
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="settings-page">
            {/* Page header */}
            <header className="settings-page-header">
                <div>
                    <span className="settings-eyebrow">
                        ACCOUNT MANAGEMENT
                    </span>

                    <h1>Settings</h1>

                    <p>
                        Manage your profile, preferences, notifications
                        and account information.
                    </p>
                </div>

                <div className="settings-secure-badge">
                    <FaShieldAlt />
                    Secure Account
                </div>
            </header>

            <div className="settings-content-grid">
                {/* Profile summary */}
                <aside className="settings-profile-summary">
                    <div className="settings-avatar">
                        {(
                            profile?.name?.trim()?.charAt(0) || "U"
                        ).toUpperCase()}
                    </div>

                    <h2>{profile?.name || "User"}</h2>

                    <p className="settings-summary-email">
                        {profile?.email}
                    </p>

                    <span className="settings-role-badge">
                        <FaCheckCircle />
                        {profile?.role || "ROLE_USER"}
                    </span>

                    <div className="settings-summary-divider" />

                    <div className="settings-summary-row">
                        <span>Account ID</span>
                        <strong>{profile?.userId ?? "—"}</strong>
                    </div>

                    <div className="settings-summary-row">
                        <span>Account status</span>
                        <strong className="settings-active-status">
                            Active
                        </strong>
                    </div>

                    <p className="settings-security-note">
                        <FaShieldAlt />
                        Your profile is protected by your authenticated
                        session.
                    </p>
                </aside>

                {/* Main settings column */}
                <div className="settings-main-column">
                    {/* Personal Information */}
                    <div className="settings-form-card">
                        <div className="settings-card-heading">
                            <div className="settings-heading-icon">
                                <FaUser />
                            </div>

                            <div>
                                <h2>Personal Information</h2>
                                <p>
                                    Update your display name and review
                                    your account details.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSave}>
                            {/* Full name */}
                            <div className="settings-field">
                                <label htmlFor="profile-name">
                                    Full Name
                                </label>

                                <div className="settings-input-wrapper">
                                    <FaUser className="settings-input-icon" />

                                    <input
                                        id="profile-name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        minLength={2}
                                        maxLength={100}
                                        required
                                        autoComplete="name"
                                        placeholder="Enter your full name"
                                        disabled={saving}
                                    />
                                </div>

                                <small>
                                    Between 2 and 100 characters.
                                </small>
                            </div>

                            {/* Email address */}
                            <div className="settings-field">
                                <label htmlFor="profile-email">
                                    Email Address
                                </label>

                                <div className="settings-input-wrapper settings-input-readonly">
                                    <FaEnvelope className="settings-input-icon" />

                                    <input
                                        id="profile-email"
                                        type="email"
                                        value={profile?.email || ""}
                                        readOnly
                                        aria-readonly="true"
                                    />

                                    <span className="settings-readonly-label">
                                        Read only
                                    </span>
                                </div>

                                <small>
                                    Your email cannot be changed from this
                                    form.
                                </small>
                            </div>

                            {/* Account role */}
                            <div className="settings-field">
                                <label htmlFor="profile-role">
                                    Account Role
                                </label>

                                <div className="settings-input-wrapper settings-input-readonly">
                                    <FaShieldAlt className="settings-input-icon" />

                                    <input
                                        id="profile-role"
                                        type="text"
                                        value={profile?.role || ""}
                                        readOnly
                                        aria-readonly="true"
                                    />
                                </div>

                                <small>
                                    Your account permissions are managed
                                    securely by the backend.
                                </small>
                            </div>

                            {/* Profile save button */}
                            <div className="settings-form-footer">
                                <p>
                                    Changes are saved to your NeuroWallet
                                    account.
                                </p>

                                <button
                                    type="submit"
                                    className="settings-primary-btn"
                                    disabled={
                                        saving ||
                                        !name.trim() ||
                                        name.trim() === profile?.name
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <span className="settings-button-spinner" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* General Preferences */}
                    <div className="settings-form-card settings-preferences-card">
                        <div className="settings-card-heading">
                            <div className="settings-heading-icon">
                                <FaSlidersH />
                            </div>

                            <div>
                                <h2>Preferences</h2>
                                <p>
                                    Customize your preferred appearance,
                                    currency and language.
                                </p>
                            </div>
                        </div>

                        {loadingPreferences ? (
                            <div className="settings-inline-state">
                                <span className="settings-spinner" />
                                <p>
                                    Loading your saved preferences...
                                </p>
                            </div>
                        ) : !preferencesLoaded ? (
                            <div className="settings-inline-error">
                                <p>{preferencesError}</p>

                                <button
                                    type="button"
                                    className="settings-secondary-btn"
                                    onClick={loadPreferences}
                                >
                                    <FaSyncAlt />
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSavePreferences}>
                                {preferencesError && (
                                    <div
                                        className="settings-preference-error"
                                        role="alert"
                                    >
                                        {preferencesError}
                                    </div>
                                )}

                                {/* Appearance */}
                                <div className="settings-field">
                                    <label htmlFor="preference-theme">
                                        <FaPalette className="settings-label-icon" />
                                        Appearance
                                    </label>

                                    <div className="settings-select-wrapper">
                                        <select
                                            id="preference-theme"
                                            name="theme"
                                            value={preferences.theme}
                                            onChange={handlePreferenceChange}
                                            disabled={savingPreferences}
                                        >
                                            <option value="DARK">Dark</option>
                                            <option value="LIGHT">Light</option>
                                        </select>
                                    </div>

                                    <small>
                                        Preview your selected theme immediately.
                                        Save Preferences to persist your choice
                                        to your NeuroWallet account.
                                    </small>
                                </div>

                                {/* Preferred currency */}
                                <div className="settings-field">
                                    <label htmlFor="preference-currency">
                                        <FaCoins className="settings-label-icon" />
                                        Preferred Currency
                                    </label>

                                    <div className="settings-select-wrapper">
                                        <select
                                            id="preference-currency"
                                            name="preferredCurrency"
                                            value={preferences.preferredCurrency}
                                            onChange={handlePreferenceChange}
                                            disabled={savingPreferences}
                                        >
                                            <option value="INR">
                                                INR — Indian Rupee
                                            </option>
                                            <option value="USD">
                                                USD — US Dollar
                                            </option>
                                            <option value="EUR">
                                                EUR — Euro
                                            </option>
                                            <option value="GBP">
                                                GBP — British Pound
                                            </option>
                                        </select>
                                    </div>

                                    <small>
                                        Stores your preferred display
                                        currency. This setting does not
                                        convert wallet balances or
                                        transaction amounts.
                                    </small>
                                </div>

                                {/* Language */}
                                <div className="settings-field">
                                    <label htmlFor="preference-language">
                                        <FaGlobe className="settings-label-icon" />
                                        Language
                                    </label>

                                    <div className="settings-select-wrapper">
                                        <select
                                            id="preference-language"
                                            name="language"
                                            value={preferences.language}
                                            onChange={handlePreferenceChange}
                                            disabled={savingPreferences}
                                        >
                                            <option value="EN">English</option>
                                        </select>
                                    </div>

                                    <small>
                                        English is currently the supported
                                        language.
                                    </small>
                                </div>

                                <div className="settings-form-footer">
                                    <p>
                                        {preferencesChanged
                                            ? "You have unsaved preference changes."
                                            : "Your preferences are up to date."}
                                    </p>

                                    <button
                                        type="submit"
                                        className="settings-primary-btn"
                                        disabled={
                                            !preferencesLoaded ||
                                            savingPreferences ||
                                            loadingPreferences ||
                                            !preferencesChanged
                                        }
                                    >
                                        {savingPreferences ? (
                                            <>
                                                <span className="settings-button-spinner" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                Save Preferences
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Notification Preferences */}
                    <div className="settings-form-card settings-notifications-card">
                        <div className="settings-card-heading">
                            <div className="settings-heading-icon">
                                <FaBell />
                            </div>

                            <div>
                                <h2>Notification Preferences</h2>
                                <p>
                                    Manage your email, transaction and
                                    security notification preferences.
                                </p>
                            </div>
                        </div>

                        {loadingNotificationPreferences ? (
                            <div className="settings-inline-state">
                                <span className="settings-spinner" />
                                <p>
                                    Loading your notification preferences...
                                </p>
                            </div>
                        ) : !notificationPreferencesLoaded ? (
                            <div className="settings-inline-error">
                                <p>{notificationPreferencesError}</p>

                                <button
                                    type="button"
                                    className="settings-secondary-btn"
                                    onClick={loadNotificationPreferences}
                                >
                                    <FaSyncAlt />
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSaveNotificationPreferences}
                            >
                                {notificationPreferencesError && (
                                    <div
                                        className="settings-preference-error"
                                        role="alert"
                                    >
                                        {notificationPreferencesError}
                                    </div>
                                )}

                                {/* Email notifications */}
                                <div className="settings-notification-row">
                                    <div className="settings-notification-icon">
                                        <FaEnvelope />
                                    </div>

                                    <div className="settings-notification-copy">
                                        <label htmlFor="notification-email">
                                            Email Notifications
                                        </label>
                                        <p>
                                            Enable or disable optional email
                                            notifications for your account.
                                        </p>
                                    </div>

                                    <label className="settings-toggle">
                                        <input
                                            id="notification-email"
                                            name="emailNotifications"
                                            type="checkbox"
                                            checked={
                                                notificationPreferences.emailNotifications
                                            }
                                            onChange={
                                                handleNotificationPreferenceChange
                                            }
                                            disabled={
                                                savingNotificationPreferences
                                            }
                                        />
                                        <span className="settings-toggle-track" />
                                        <span className="settings-toggle-label">
                                            {notificationPreferences.emailNotifications
                                                ? "On"
                                                : "Off"}
                                        </span>
                                    </label>
                                </div>

                                {/* Transaction alerts */}
                                <div className="settings-notification-row">
                                    <div className="settings-notification-icon">
                                        <FaExchangeAlt />
                                    </div>

                                    <div className="settings-notification-copy">
                                        <label htmlFor="notification-transactions">
                                            Transaction Alerts
                                        </label>
                                        <p>
                                            Choose whether to receive alerts
                                            about wallet transactions.
                                        </p>
                                    </div>

                                    <label className="settings-toggle">
                                        <input
                                            id="notification-transactions"
                                            name="transactionAlerts"
                                            type="checkbox"
                                            checked={
                                                notificationPreferences.transactionAlerts
                                            }
                                            onChange={
                                                handleNotificationPreferenceChange
                                            }
                                            disabled={
                                                savingNotificationPreferences
                                            }
                                        />
                                        <span className="settings-toggle-track" />
                                        <span className="settings-toggle-label">
                                            {notificationPreferences.transactionAlerts
                                                ? "On"
                                                : "Off"}
                                        </span>
                                    </label>
                                </div>

                                {/* Security alerts */}
                                <div className="settings-notification-row">
                                    <div className="settings-notification-icon">
                                        <FaShieldAlt />
                                    </div>

                                    <div className="settings-notification-copy">
                                        <label htmlFor="notification-security">
                                            Security Alerts
                                        </label>
                                        <p>
                                            Set your preference for account
                                            security notifications. Critical
                                            security protections remain active.
                                        </p>
                                    </div>

                                    <label className="settings-toggle">
                                        <input
                                            id="notification-security"
                                            name="securityAlerts"
                                            type="checkbox"
                                            checked={
                                                notificationPreferences.securityAlerts
                                            }
                                            onChange={
                                                handleNotificationPreferenceChange
                                            }
                                            disabled={
                                                savingNotificationPreferences
                                            }
                                        />
                                        <span className="settings-toggle-track" />
                                        <span className="settings-toggle-label">
                                            {notificationPreferences.securityAlerts
                                                ? "On"
                                                : "Off"}
                                        </span>
                                    </label>
                                </div>

                                <div className="settings-form-footer">
                                    <p>
                                        {notificationPreferencesChanged
                                            ? "You have unsaved notification changes."
                                            : "Your notification preferences are up to date."}
                                    </p>

                                    <button
                                        type="submit"
                                        className="settings-primary-btn"
                                        disabled={
                                            !notificationPreferencesLoaded ||
                                            loadingNotificationPreferences ||
                                            savingNotificationPreferences ||
                                            !notificationPreferencesChanged
                                        }
                                    >
                                        {savingNotificationPreferences ? (
                                            <>
                                                <span className="settings-button-spinner" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                Save Notifications
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Account & Data */}
                    <div className="settings-form-card settings-account-data-card">
                        <div className="settings-card-heading">
                            <div className="settings-heading-icon">
                                <FaDatabase />
                            </div>

                            <div>
                                <h2>Account &amp; Data</h2>
                                <p>
                                    Access a copy of the personal and
                                    financial information associated with
                                    your account.
                                </p>
                            </div>
                        </div>

                        <div className="settings-data-export-content">
                            <div>
                                <h3>Export My Data</h3>

                                <p>
                                    Download your available profile, wallet,
                                    transaction history and saved preferences
                                    as a JSON file.
                                </p>

                                <small>
                                    Keep the downloaded file secure because
                                    it contains sensitive financial information.
                                </small>
                            </div>

                            <button
                                type="button"
                                className="settings-primary-btn"
                                onClick={handleExportMyData}
                                disabled={exportingData}
                            >
                                {exportingData ? (
                                    <>
                                        <span className="settings-button-spinner" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <FaDownload />
                                        Export My Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SettingsPage;
