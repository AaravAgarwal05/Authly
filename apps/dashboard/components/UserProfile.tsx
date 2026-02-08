"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, CheckCircle } from "lucide-react";

interface DeveloperInfo {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  avatarUrl: string;
  createdAt: string;
}

export default function UserProfile() {
  const router = useRouter();
  const [developer, setDeveloper] = useState<DeveloperInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDeveloper();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDeveloper = async () => {
    try {
      const res = await fetch("/api/developer");
      if (res.ok) {
        const data = await res.json();
        setDeveloper(data.developer);
      }
    } catch (error) {
      console.error("Failed to fetch developer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-800 rounded w-24 mb-2"></div>
            <div className="h-2 bg-gray-800 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!developer) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition rounded-lg group"
      >
        {/* Avatar */}
        <div className="relative">
          <img
            src={developer.avatarUrl}
            alt={developer.name}
            className="w-10 h-10 rounded-full ring-2 ring-gray-800 group-hover:ring-indigo-500 transition"
          />
          {developer.emailVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">{developer.name}</p>
          <p className="text-xs text-gray-400 truncate">{developer.email}</p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Profile Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-start gap-3">
              <img
                src={developer.avatarUrl}
                alt={developer.name}
                className="w-12 h-12 rounded-full ring-2 ring-gray-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-0.5">
                  {developer.name}
                </p>
                <p className="text-xs text-gray-400 truncate mb-1">
                  {developer.email}
                </p>
                {developer.emailVerified && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/settings");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition"
            >
              <User className="w-4 h-4" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
