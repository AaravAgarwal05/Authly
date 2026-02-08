"use client";

import { motion } from "framer-motion";
import { Search, Filter, Plus, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-800 bg-gray-900"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create user
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-b border-gray-800 mb-6"
        >
          <div className="flex gap-6">
            <button className="pb-3 px-1 border-b-2 border-purple-500 text-white font-medium">
              All
            </button>
            <button className="pb-3 px-1 border-b-2 border-transparent text-gray-400 hover:text-gray-300">
              Invitations
            </button>
          </div>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-gray-800 bg-gray-900/30 p-12"
        >
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <UsersIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No users yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create a new user or learn how to{" "}
              <button className="text-purple-400 hover:text-purple-300">
                migrate existing users
              </button>
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create user
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center justify-between text-sm text-gray-400"
        >
          <span>0-0 of 0</span>
          <div className="flex items-center gap-2">
            <span>Results per page:</span>
            <select title="size" className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-white">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <div className="flex gap-1 ml-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800"
                disabled
              >
                &lt;
              </Button>
              <span className="px-3 py-1">1/1</span>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800"
                disabled
              >
                &gt;
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
