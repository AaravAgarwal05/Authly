"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  Settings,
  Users,
  Activity,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  allowedOrigins: string[];
}

interface ApiKey {
  id: string;
  type: "publishable" | "secret";
  keyPrefix: string;
  name: string | null;
  revoked: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyType, setNewKeyType] = useState<"publishable" | "secret">(
    "publishable",
  );
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchKeys();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      const data = await res.json();
      setProject(data.project);
    } catch (err) {
      setError("Failed to load project");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/keys`);
      if (!res.ok) throw new Error("Failed to fetch keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err) {
      console.error("Failed to load keys:", err);
    }
  };

  const handleCreateKey = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newKeyType,
          name: newKeyName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create key");
      }

      const data = await res.json();
      setGeneratedKey(data.key); // The actual key value, only shown once
      setKeys([...keys, data.keyInfo]);
      setNewKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Project not found</p>
        <Link
          href="/dashboard/projects"
          className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-gray-400 mt-1">/{project.slug}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.isActive
                ? "bg-green-500/10 text-green-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {project.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">API Keys</p>
              <p className="text-2xl font-bold text-white">{keys.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Users</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">API Keys</h2>
            <p className="text-gray-400 text-sm mt-1">
              Manage your project's authentication keys
            </p>
          </div>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            <Plus className="w-4 h-4" />
            New Key
          </button>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
            <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No API keys yet</p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
            >
              Create Your First Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`p-4 bg-gray-800 border rounded-lg ${
                  key.revoked ? "bg-gray-50 border-gray-300" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          key.type === "publishable"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {key.type}
                      </span>
                      {key.name && (
                        <span className="text-sm font-medium text-gray-900">
                          {key.name}
                        </span>
                      )}
                      {key.revoked && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Revoked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                        {visibleKeys.has(key.id)
                          ? key.keyPrefix + "•".repeat(32)
                          : key.keyPrefix + "•".repeat(32)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(key.keyPrefix + "...", key.id)
                        }
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        {copiedKey === key.id ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt &&
                        ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {!generatedKey ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Create New API Key
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="keyType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Key Type
                    </label>
                    <select
                      id="keyType"
                      value={newKeyType}
                      onChange={(e) =>
                        setNewKeyType(
                          e.target.value as "publishable" | "secret",
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="publishable">
                        Publishable Key (Frontend)
                      </option>
                      <option value="secret">Secret Key (Backend)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {newKeyType === "publishable"
                        ? "Safe to use in client-side code"
                        : "Keep this secret! Only use server-side"}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="keyName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Key Name (Optional)
                    </label>
                    <input
                      id="keyName"
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Production Key"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleCreateKey}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Create Key
                    </button>
                    <button
                      onClick={() => {
                        setShowNewKeyModal(false);
                        setNewKeyName("");
                        setError("");
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  API Key Created!
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    ⚠️ Save this key now!
                  </p>
                  <p className="text-xs text-yellow-700">
                    You won't be able to see the full key again. Store it
                    securely.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <code className="text-sm font-mono break-all">
                    {generatedKey}
                  </code>
                </div>
                <button
                  onClick={() => {
                    copyToClipboard(generatedKey, "new");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition mb-3"
                >
                  <Copy className="w-4 h-4" />
                  {copiedKey === "new" ? "Copied!" : "Copy to Clipboard"}
                </button>
                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setGeneratedKey("");
                    setNewKeyName("");
                    setError("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
