"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function ConfigurePage() {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-800 p-4 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Find..."
              className="pl-10 bg-gray-900 border-gray-800 text-white text-sm"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Configure
            </p>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/50 text-white text-sm font-medium">
              User & authentication
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm">
              SSO connections
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm">
              Web3
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm">
              Multi-factor
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm">
              Restrictions
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm">
              Attack protection
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm">
              Waitlist
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/30 text-sm">
              Legal
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                  User & authentication
                </h1>
                <button className="px-4 py-2 text-sm rounded-lg border border-gray-800 hover:border-gray-700 text-gray-300">
                  Preview
                </button>
              </div>

              <Tabs defaultValue="email" className="w-full">
                <TabsList className="bg-transparent border-b border-gray-800 rounded-none w-full justify-start">
                  <TabsTrigger
                    value="email"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
                  >
                    Email
                  </TabsTrigger>
                  <TabsTrigger
                    value="phone"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
                  >
                    Phone
                  </TabsTrigger>
                  <TabsTrigger
                    value="username"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
                  >
                    Username
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
                  >
                    Password
                  </TabsTrigger>
                  <TabsTrigger
                    value="passkeys"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
                  >
                    Passkeys
                  </TabsTrigger>
                  <TabsTrigger
                    value="usermodel"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none text-sm"
                  >
                    User model
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-8 space-y-6">
                  {/* Sign-up with email */}
                  <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Switch
                          id="signup-email"
                          defaultChecked
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor="signup-email"
                            className="text-white font-medium"
                          >
                            Sign-up with email
                          </Label>
                          <p className="text-sm text-gray-400 mt-1">
                            Allow users to sign up with their email address
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Require email address */}
                  <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Switch
                          id="require-email"
                          defaultChecked
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="require-email"
                            className="text-white font-medium"
                          >
                            Require email address
                          </Label>
                          <p className="text-sm text-gray-400 mt-1">
                            Users must provide an email address to sign up and
                            must maintain one on their account at all times
                          </p>
                          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm text-blue-300">
                              Email is the only enabled sign-up option and is
                              therefore required.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verify at sign-up */}
                  <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Switch
                          id="verify-signup"
                          defaultChecked
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="verify-signup"
                            className="text-white font-medium flex items-center gap-2"
                          >
                            Verify at sign-up
                            <Badge
                              variant="secondary"
                              className="bg-purple-600/20 text-purple-300 text-xs"
                            >
                              recommended
                            </Badge>
                          </Label>
                          <p className="text-sm text-gray-400 mt-1">
                            Require users to verify their email addresses before
                            they can sign-up
                          </p>

                          <div className="mt-6">
                            <h4 className="text-sm font-semibold text-white mb-3">
                              Verification methods
                            </h4>
                            <p className="text-xs text-gray-400 mb-3">
                              Select how users can verify an email address
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <input
                                  title="Email Verification"
                                  type="checkbox"
                                  id="email-code"
                                  defaultChecked
                                  className="mt-1 rounded border-gray-700"
                                />
                                <div>
                                  <Label
                                    htmlFor="email-code"
                                    className="text-sm text-white"
                                  >
                                    Email verification code
                                  </Label>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Verify by entering a one-time passcode sent
                                    to the email address
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <input
                                  title="Email Link Verification"
                                  type="checkbox"
                                  id="email-link"
                                  className="mt-1 rounded border-gray-700"
                                />
                                <div>
                                  <Label
                                    htmlFor="email-link"
                                    className="text-sm text-white"
                                  >
                                    Email verification link
                                  </Label>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Verify by clicking a link sent to the email
                                    address
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sign-in with email */}
                  <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Switch
                          id="signin-email"
                          defaultChecked
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor="signin-email"
                            className="text-white font-medium"
                          >
                            Sign-in with email
                          </Label>
                          <p className="text-sm text-gray-400 mt-1">
                            Allow users to sign in with their email address
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email verification code */}
                  <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Switch
                          id="signin-code"
                          defaultChecked
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor="signin-code"
                            className="text-white font-medium"
                          >
                            Email verification code
                          </Label>
                          <p className="text-sm text-gray-400 mt-1">
                            Users can sign-in with an email verification code
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email verification link */}
                  <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Switch id="signin-link" className="mt-1" />
                        <div>
                          <Label
                            htmlFor="signin-link"
                            className="text-white font-medium"
                          >
                            Email verification link
                          </Label>
                          <p className="text-sm text-gray-400 mt-1">
                            Users can sign-in with an email verification link
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="password" className="mt-8">
                  <p className="text-gray-400">
                    Password settings coming soon...
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
