"use client";

import { useState } from "react";
import styles from "../dashboard.module.css";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Conozca",
    siteDescription: "A modern editorial platform",
    contactEmail: "editorial@conozca.com",
    language: "es",
  });

  const [userSettings, setUserSettings] = useState({
    name: "Studio Norte",
    email: "admin@conozca.com",
    role: "ADMIN",
  });

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save general settings:", generalSettings);
    // TODO: Connect to API
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save user settings:", userSettings);
    // TODO: Connect to API
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Settings</h1>
          <p className={styles.subtitle}>Configure your editorial platform</p>
        </div>
      </div>

      <div className={styles.settingsTabs}>
        <button
          className={activeTab === "general" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
        <button
          className={activeTab === "user" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("user")}
        >
          User Profile
        </button>
        <button
          className={activeTab === "security" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
        <button
          className={activeTab === "notifications" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
      </div>

      <div className={styles.settingsContent}>
        {activeTab === "general" && (
          <form onSubmit={handleGeneralSubmit} className={styles.settingsForm}>
            <h2>General Settings</h2>
            <div className={styles.formGroup}>
              <label htmlFor="siteName">Site Name</label>
              <input
                id="siteName"
                type="text"
                value={generalSettings.siteName}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                }
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="siteDescription">Site Description</label>
              <textarea
                id="siteDescription"
                value={generalSettings.siteDescription}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                }
                rows={3}
                className={styles.textarea}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                id="contactEmail"
                type="email"
                value={generalSettings.contactEmail}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })
                }
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={generalSettings.language}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, language: e.target.value })
                }
                className={styles.select}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <button type="submit" className={styles.primaryButton}>
              Save Changes
            </button>
          </form>
        )}

        {activeTab === "user" && (
          <form onSubmit={handleUserSubmit} className={styles.settingsForm}>
            <h2>User Profile</h2>
            <div className={styles.formGroup}>
              <label htmlFor="userName">Name</label>
              <input
                id="userName"
                type="text"
                value={userSettings.name}
                onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="userEmail">Email</label>
              <input
                id="userEmail"
                type="email"
                value={userSettings.email}
                onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="userRole">Role</label>
              <input
                id="userRole"
                type="text"
                value={userSettings.role}
                disabled
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.primaryButton}>
              Update Profile
            </button>
          </form>
        )}

        {activeTab === "security" && (
          <div className={styles.settingsForm}>
            <h2>Security Settings</h2>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input id="currentPassword" type="password" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input id="newPassword" type="password" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input id="confirmPassword" type="password" className={styles.input} />
            </div>
            <button type="button" className={styles.primaryButton}>
              Change Password
            </button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className={styles.settingsForm}>
            <h2>Notification Preferences</h2>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>Email notifications for new comments</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>Email digest of new articles</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" />
                <span>Push notifications for analytics milestones</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                <span>Weekly performance reports</span>
              </label>
            </div>
            <button type="button" className={styles.primaryButton}>
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
