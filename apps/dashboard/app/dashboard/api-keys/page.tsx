"use client";

import { motion } from "framer-motion";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function APIKeysPage() {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const publishableKey =
    "pk_test_Y2xpbWJpbmctc3dhbi02Ni5jbGVyay5hY2NvdW50cy5kZXYk";
  const secretKey = "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">API keys</h1>
          <p className="text-gray-400 text-sm">
            Use your API keys to authenticate requests to the Authly API
          </p>
        </div>

        <div className="space-y-6">
          {/* Publishable Key */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">Publishable key</h3>
                  <Badge
                    variant="secondary"
                    className="bg-green-600/20 text-green-300 text-xs"
                  >
                    Client-side
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  Safe to use in your frontend code
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 font-mono text-sm text-gray-300">
                {publishableKey}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-800 text-gray-300 hover:text-white"
                onClick={() => copyToClipboard(publishableKey, "publishable")}
              >
                {copied === "publishable" ? (
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Secret Key */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">Secret key</h3>
                  <Badge
                    variant="secondary"
                    className="bg-red-600/20 text-red-300 text-xs"
                  >
                    Server-side
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  Keep this key secure and never expose it in your frontend code
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-800 text-gray-300 hover:text-white gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 font-mono text-sm text-gray-300 flex items-center">
                {showSecret ? secretKey : "•".repeat(secretKey.length)}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-800 text-gray-300 hover:text-white"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-800 text-gray-300 hover:text-white"
                onClick={() => copyToClipboard(secretKey, "secret")}
              >
                {copied === "secret" ? (
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-300">
                <span className="font-semibold">Warning:</span> Never share your
                secret key or commit it to version control. Anyone with this key
                can access your Authly data.
              </p>
            </div>
          </div>

          {/* API Documentation */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
            <h3 className="text-white font-semibold mb-2">
              Using your API keys
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Include your API key in the Authorization header of your requests:
            </p>

            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                <code>{`curl https://api.authly.dev/v1/users \\
  -H "Authorization: Bearer YOUR_SECRET_KEY"`}</code>
              </pre>
            </div>

            <div className="mt-4">
              <Button
                variant="link"
                className="text-purple-400 hover:text-purple-300 p-0 h-auto text-sm"
              >
                View API documentation →
              </Button>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
            <h3 className="text-white font-semibold mb-2">
              Environment variables
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Store your keys securely in environment variables:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm text-purple-400 font-mono">
                    NEXT_PUBLIC_AUTHLY_PUBLISHABLE_KEY
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white h-7 text-xs"
                    onClick={() =>
                      copyToClipboard(
                        `NEXT_PUBLIC_AUTHLY_PUBLISHABLE_KEY=${publishableKey}`,
                        "env1",
                      )
                    }
                  >
                    {copied === "env1" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {publishableKey}
                </p>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm text-purple-400 font-mono">
                    AUTHLY_SECRET_KEY
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white h-7 text-xs"
                    onClick={() =>
                      copyToClipboard(`AUTHLY_SECRET_KEY=${secretKey}`, "env2")
                    }
                  >
                    {copied === "env2" ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {showSecret ? secretKey : "•".repeat(secretKey.length)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
