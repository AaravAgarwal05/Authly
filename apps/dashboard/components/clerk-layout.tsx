"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  Key,
  Bell,
  ChevronDown,
  Plus,
  LogOut,
  User,
  CreditCard,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ClerkLayoutProps {
  children: React.ReactNode;
  developer: {
    name: string;
    email: string;
    avatarUrl: string;
    emailVerified: boolean;
  } | null;
}

export function ClerkLayout({ children, developer }: ClerkLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [instance, setInstance] = useState("Development");

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/users", icon: Users },
    {
      name: "Organizations",
      href: "/dashboard/organizations",
      icon: Building2,
    },
    { name: "Configure", href: "/dashboard/configure", icon: Settings },
  ];

  const instanceNavigation = [
    { name: "API keys", href: "/dashboard/api-keys", icon: Key },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-gray-800/50 bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <span className="text-sm font-bold">A</span>
              </div>
              <span className="text-lg font-semibold">Authly</span>
            </Link>

            {/* Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-1.5 text-sm hover:border-gray-700 transition">
                <span className="text-gray-300">e3crethox</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-gray-900 border-gray-800"
              >
                <DropdownMenuItem className="focus:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-gradient-to-br from-purple-500 to-blue-500" />
                    <span>e3crethox</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="focus:bg-gray-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Create application
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Instance Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900/50 p-0.5">
              <button
                onClick={() => setInstance("Development")}
                className={`rounded px-3 py-1 text-xs font-medium transition ${
                  instance === "Development"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Development
              </button>
              <button
                onClick={() => setInstance("Production")}
                className={`rounded px-3 py-1 text-xs font-medium transition ${
                  instance === "Production"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                + Create production instance
              </button>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="flex h-9 items-center gap-2 rounded-lg border border-purple-600 bg-purple-600/10 px-4 text-sm font-medium text-purple-400 hover:bg-purple-600/20 transition">
              <Plus className="h-4 w-4" />
              Invite
            </button>

            <button
              title="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 hover:border-gray-700 transition"
            >
              <Bell className="h-4 w-4 text-gray-400" />
            </button>

            {/* User Menu */}
            {developer && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg hover:bg-gray-900/50 px-2 py-1 transition">
                  <Avatar className="h-8 w-8 ring-2 ring-gray-800">
                    <AvatarImage
                      src={developer.avatarUrl}
                      alt={developer.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                      {developer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-gray-900 border-gray-800"
                >
                  <div className="p-3 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={developer.avatarUrl}
                          alt={developer.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                          {developer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {developer.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {developer.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                    className="focus:bg-gray-800 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Manage account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem className="focus:bg-gray-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="focus:bg-gray-800 cursor-pointer text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <div className="p-2 text-xs text-gray-500 text-center">
                    Secured by{" "}
                    <span className="font-semibold text-gray-400">Authly</span>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 w-64 border-r border-gray-800/50 bg-[#0A0A0B]">
        <div className="flex flex-col h-full p-3">
          {/* Configure section */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Configure
            </p>
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.name} href={item.href} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-gray-800/50"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <div
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/30"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="my-4 border-t border-gray-800/50" />

          {/* Instance section */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Instance
            </p>
            {instanceNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-gray-800/50"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <div
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/30"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64 pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
