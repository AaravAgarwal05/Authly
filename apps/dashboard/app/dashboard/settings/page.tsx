"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Trash2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OAuthAccount {
  id: string;
  provider: string;
  providerEmail: string | null;
  createdAt: string;
}

interface Profile {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [oauthAccounts, setOAuthAccounts] = useState<OAuthAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Messages
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, oauthRes] = await Promise.all([
        fetch("/api/developer/profile"),
        fetch("/api/developer/oauth"),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.developer || profileData);
        const nameParts = (
          profileData.developer?.name ||
          profileData.name ||
          ""
        ).split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
      }

      if (oauthRes.ok) {
        const oauthData = await oauthRes.json();
        setOAuthAccounts(oauthData.accounts || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    const fullName = `${firstName} ${lastName}`.trim();

    if (!fullName) {
      showMessage("error", "Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/developer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.developer || data);
        showMessage("success", "Name updated successfully");
      } else {
        showMessage("error", data.error || "Failed to update name");
      }
    } catch (error) {
      showMessage("error", "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword) {
      showMessage("error", "New password is required");
      return;
    }

    if (newPassword.length < 8) {
      showMessage("error", "Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const body: any = { newPassword };

      // Only send currentPassword if developer has a password set
      if (currentPassword) {
        body.currentPassword = currentPassword;
      }

      const response = await fetch("/api/developer/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showMessage("success", "Password updated successfully");
      } else {
        showMessage("error", data.error || "Failed to update password");
      }
    } catch (error) {
      showMessage("error", "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDisconnectOAuth = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) {
      return;
    }

    try {
      const response = await fetch(`/api/developer/oauth?id=${accountId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setOAuthAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        showMessage("success", "Account disconnected successfully");
      } else {
        showMessage("error", data.error || "Failed to disconnect account");
      }
    } catch (error) {
      showMessage("error", "Failed to disconnect account");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const isOAuthConnected = (provider: string) => {
    return oauthAccounts.some((acc) => acc.provider === provider);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Personal account
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your personal account settings
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-800 rounded-none w-full justify-start mb-8">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
            >
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Name Section */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">Name</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-gray-400 text-sm mb-2 block"
                    >
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-gray-950 border-gray-800 text-white"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-gray-400 text-sm mb-2 block"
                    >
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-gray-950 border-gray-800 text-white"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {/* Email Addresses Section */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">Email addresses</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-white">{profile?.email}</div>
                      <div className="text-xs text-gray-500">Primary</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile?.emailVerified && (
                      <Badge
                        variant="secondary"
                        className="bg-green-600/20 text-green-300 text-xs"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-800 text-gray-300 gap-2"
                  disabled
                >
                  <Plus className="h-4 w-4" />
                  Add email address
                </Button>
              </div>
            </div>

            {/* Connected Accounts Section */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">Connected accounts</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Manage your connected OAuth accounts
                </p>
              </div>
              <div className="p-6 space-y-3">
                {/* Google OAuth */}
                <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#4285F4"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium">Google</div>
                      {isOAuthConnected("google") && (
                        <div className="text-xs text-gray-500">
                          {
                            oauthAccounts.find(
                              (acc) => acc.provider === "google",
                            )?.providerEmail
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  {isOAuthConnected("google") ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-800 text-red-400 hover:text-red-300 hover:border-red-800"
                      onClick={() => {
                        const account = oauthAccounts.find(
                          (acc) => acc.provider === "google",
                        );
                        if (account) handleDisconnectOAuth(account.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-800 text-gray-300"
                      onClick={() => {
                        const authServerUrl =
                          process.env.NEXT_PUBLIC_AUTH_SERVER_BASE_URL ||
                          "http://localhost:3000";
                        window.location.href = `${authServerUrl}/api/developer/oauth/google`;
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* GitHub OAuth */}
                <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium">GitHub</div>
                      {isOAuthConnected("github") && (
                        <div className="text-xs text-gray-500">
                          {
                            oauthAccounts.find(
                              (acc) => acc.provider === "github",
                            )?.providerEmail
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  {isOAuthConnected("github") ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-800 text-red-400 hover:text-red-300 hover:border-red-800"
                      onClick={() => {
                        const account = oauthAccounts.find(
                          (acc) => acc.provider === "github",
                        );
                        if (account) handleDisconnectOAuth(account.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-800 text-gray-300"
                      onClick={() => {
                        const authServerUrl =
                          process.env.NEXT_PUBLIC_AUTH_SERVER_BASE_URL ||
                          "http://localhost:3000";
                        window.location.href = `${authServerUrl}/api/developer/oauth/github`;
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Section */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold">Password</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Change your password or set one if you signed up with OAuth
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label
                    htmlFor="currentPassword"
                    className="text-gray-400 text-sm mb-2 block"
                  >
                    Current password (optional if OAuth-only)
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-gray-950 border-gray-800 text-white"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="newPassword"
                    className="text-gray-400 text-sm mb-2 block"
                  >
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-950 border-gray-800 text-white"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-400 text-sm mb-2 block"
                  >
                    Confirm new password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-950 border-gray-800 text-white"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {savingPassword ? "Saving..." : "Update password"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
