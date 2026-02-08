"use client";

import { ReactNode, useEffect, useState } from "react";
import { ClerkLayout } from "@/components/clerk-layout";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeveloper();
  }, []);

  const fetchDeveloper = async () => {
    try {
      const res = await fetch("/api/developer");
      if (res.ok) {
        const data = await res.json();
        setDeveloper(data.developer);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch developer:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return <ClerkLayout developer={developer}>{children}</ClerkLayout>;
}
