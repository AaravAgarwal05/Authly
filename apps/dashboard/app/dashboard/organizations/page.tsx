"use client";

import { motion } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrganizationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Create organization
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="all" className="text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm">
                Pending invitations
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-gray-900 border-gray-800 text-white w-64 text-sm"
                />
              </div>
              <Button
                variant="outline"
                className="border-gray-800 text-gray-300 gap-2 text-sm"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No organizations yet
                </h3>
                <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
                  Organizations allow you to group users together and manage
                  permissions at the organization level.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Create organization
                </Button>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">
                Showing 0 of 0 organizations
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="border-gray-800 text-gray-500 text-sm"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="border-gray-800 text-gray-500 text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No pending invitations
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-md">
                  When you invite users to organizations, they'll appear here.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
