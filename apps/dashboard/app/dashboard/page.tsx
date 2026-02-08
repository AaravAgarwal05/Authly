"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  ChevronRight,
  Code2,
  Smartphone,
  Globe,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const frameworks = [
  {
    id: "nextjs",
    name: "Next.js",
    icon: "N",
    color: "from-black to-gray-800",
  },
  {
    id: "react",
    name: "React",
    icon: "⚛",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "tanstack",
    name: "TanStack Start",
    icon: "🔷",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "expo",
    name: "Expo",
    icon: "▲",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "ios",
    name: "iOS",
    icon: "",
    color: "from-gray-400 to-gray-600",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "JS",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    id: "astro",
    name: "Astro",
    icon: "A",
    color: "from-purple-600 to-orange-500",
  },
];

export default function OverviewPage() {
  const [copied, setCopied] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("nextjs");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInstallCommand = (framework: string) => {
    switch (framework) {
      case "nextjs":
        return `npm create next-app@latest authly-app -- --yes
cd authly-app
npm install`;
      case "react":
        return `npm create vite@latest authly-app -- --template react-ts
cd authly-app
npm install`;
      default:
        return `npm install @authly/sdk`;
    }
  };

  const getSDKInstall = (framework: string) => {
    switch (framework) {
      case "nextjs":
      case "react":
        return `npm install @authly/${framework}`;
      case "javascript":
        return `npm install @authly/sdk`;
      default:
        return `npm install @authly/${framework}`;
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent p-8"
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Watching for users
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Sign up as your first user
                </h1>
                <p className="text-gray-400 max-w-2xl">
                  Install the SDK, run your dev server, and sign yourself up.
                  The moment we detect that first account, installation is
                  complete.
                </p>
              </div>
              <button className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition">
                Copy prompt
              </button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Framework Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {frameworks.map((framework, index) => (
              <motion.button
                key={framework.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => setSelectedFramework(framework.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition min-w-[120px] ${
                  selectedFramework === framework.id
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-gray-800 bg-gray-900/30 hover:border-gray-700"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${framework.color} flex items-center justify-center text-white font-bold text-lg`}
                >
                  {framework.icon}
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {framework.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Installation Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Step 1 */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Create a new{" "}
                  {frameworks.find((f) => f.id === selectedFramework)?.name} app
                </h3>
              </div>
              <p className="text-sm text-gray-400 mt-2 ml-9">
                Run the following commands to create a new{" "}
                {frameworks.find((f) => f.id === selectedFramework)?.name} app:
              </p>
            </div>
            <div className="p-4">
              <Tabs defaultValue="npm" className="w-full">
                <TabsList className="bg-gray-800/50 border border-gray-700">
                  <TabsTrigger
                    value="npm"
                    className="data-[state=active]:bg-gray-700"
                  >
                    npm
                  </TabsTrigger>
                  <TabsTrigger
                    value="pnpm"
                    className="data-[state=active]:bg-gray-700"
                  >
                    pnpm
                  </TabsTrigger>
                  <TabsTrigger
                    value="yarn"
                    className="data-[state=active]:bg-gray-700"
                  >
                    yarn
                  </TabsTrigger>
                  <TabsTrigger
                    value="bun"
                    className="data-[state=active]:bg-gray-700"
                  >
                    bun
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="npm" className="mt-4">
                  <div className="relative">
                    <pre className="rounded-lg bg-black/50 p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-gray-800">
                      <code>{getInstallCommand(selectedFramework)}</code>
                    </pre>
                    <button
                      onClick={() =>
                        copyToClipboard(getInstallCommand(selectedFramework))
                      }
                      className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </TabsContent>
                <TabsContent value="pnpm" className="mt-4">
                  <div className="relative">
                    <pre className="rounded-lg bg-black/50 p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-gray-800">
                      <code>
                        {getInstallCommand(selectedFramework).replace(
                          /npm/g,
                          "pnpm",
                        )}
                      </code>
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="yarn" className="mt-4">
                  <div className="relative">
                    <pre className="rounded-lg bg-black/50 p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-gray-800">
                      <code>
                        {getInstallCommand(selectedFramework).replace(
                          /npm/g,
                          "yarn",
                        )}
                      </code>
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="bun" className="mt-4">
                  <div className="relative">
                    <pre className="rounded-lg bg-black/50 p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-gray-800">
                      <code>
                        {getInstallCommand(selectedFramework).replace(
                          /npm/g,
                          "bun",
                        )}
                      </code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Install @authly/{selectedFramework}
                </h3>
              </div>
              <p className="text-sm text-gray-400 mt-2 ml-9">
                The Authly{" "}
                {frameworks.find((f) => f.id === selectedFramework)?.name} SDK
                gives you access to prebuilt components, hooks, and helpers to
                make user authentication easier.
              </p>
            </div>
            <div className="p-4">
              <div className="relative">
                <pre className="rounded-lg bg-black/50 p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-gray-800">
                  <code>{getSDKInstall(selectedFramework)}</code>
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(getSDKInstall(selectedFramework))
                  }
                  className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Set environment variables
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="relative">
                <pre className="rounded-lg bg-black/50 p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-gray-800">
                  <code>{`NEXT_PUBLIC_AUTHLY_PUBLISHABLE_KEY=pk_test_***
AUTHLY_SECRET_KEY=sk_test_***`}</code>
                </pre>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-400">Go to</span>
                <button className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                  API keys
                  <ChevronRight className="h-3 w-3" />
                </button>
                <span className="text-gray-400">to get your keys</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 hover:border-gray-700 transition cursor-pointer">
            <Code2 className="h-8 w-8 text-purple-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Documentation</h4>
            <p className="text-sm text-gray-400">
              Explore our comprehensive guides and API reference
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 hover:border-gray-700 transition cursor-pointer">
            <Smartphone className="h-8 w-8 text-blue-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Templates</h4>
            <p className="text-sm text-gray-400">
              Start with pre-built templates for popular frameworks
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 hover:border-gray-700 transition cursor-pointer">
            <Globe className="h-8 w-8 text-green-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Community</h4>
            <p className="text-sm text-gray-400">
              Join our Discord community for support and discussions
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
