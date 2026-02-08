"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Github } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auth method configuration
  const [enableEmailPassword, setEnableEmailPassword] = useState(true);
  const [enableGoogleOAuth, setEnableGoogleOAuth] = useState(false);
  const [enableGithubOAuth, setEnableGithubOAuth] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-")) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate at least one auth method is enabled
    if (!enableEmailPassword && !enableGoogleOAuth && !enableGithubOAuth) {
      setError("Please enable at least one authentication method");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          authConfig: {
            enableEmailPassword,
            enableGoogleOAuth,
            enableGithubOAuth,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create project");
        return;
      }

      // Redirect to the new project
      router.push(`/dashboard/projects/${data.project.id}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Create New Project
        </h1>
        <p className="text-gray-400">
          Set up a new authentication project for your application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Project Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder-gray-500"
                placeholder="My Awesome App"
              />
              <p className="mt-2 text-sm text-gray-400">
                A friendly name for your project
              </p>
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Project Slug
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                pattern="[a-z0-9-]+"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder-gray-500"
                placeholder="my-awesome-app"
              />
              <p className="mt-2 text-sm text-gray-400">
                URL-friendly identifier (lowercase letters, numbers, and hyphens
                only)
              </p>
            </div>

            {/* Authentication Methods */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Authentication Methods
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Choose how users will sign in to your application
              </p>

              <div className="space-y-3">
                {/* Email/Password */}
                <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-indigo-500/50 transition">
                  <input
                    type="checkbox"
                    checked={enableEmailPassword}
                    onChange={(e) => setEnableEmailPassword(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-white">
                        Email & Password
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Traditional email and password authentication
                    </p>
                  </div>
                </label>

                {/* Google OAuth */}
                <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-indigo-500/50 transition">
                  <input
                    type="checkbox"
                    checked={enableGoogleOAuth}
                    onChange={(e) => setEnableGoogleOAuth(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fill="#EA4335"
                          d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                        />
                        <path
                          fill="#4A90E2"
                          d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                        />
                      </svg>
                      <span className="font-medium text-white">
                        Google Sign-In
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Let users sign in with their Google account
                    </p>
                  </div>
                </label>

                {/* GitHub OAuth */}
                <label className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-indigo-500/50 transition">
                  <input
                    type="checkbox"
                    checked={enableGithubOAuth}
                    onChange={(e) => setEnableGithubOAuth(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Github className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-white">
                        GitHub Sign-In
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Let users sign in with their GitHub account
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
              <Link
                href="/dashboard/projects"
                className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg font-medium text-gray-300 hover:bg-gray-750 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Live Preview</h3>
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full font-medium">
                Real-time
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              See how your login form will look to users
            </p>

            {/* Preview Card */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 min-h-[500px] flex items-center justify-center">
              {/* Browser-like mockup */}
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-indigo-600">
                    {name ? name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {name || "Your App"}
                  </h2>
                  <p className="text-indigo-100 text-sm">Sign in to continue</p>
                </div>

                {/* Login Form */}
                <div className="p-8 space-y-4">
                  {enableEmailPassword && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                          disabled
                        />
                      </div>
                      <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
                        Sign In
                      </button>
                    </>
                  )}

                  {(enableGoogleOAuth || enableGithubOAuth) &&
                    enableEmailPassword && (
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">
                            Or continue with
                          </span>
                        </div>
                      </div>
                    )}

                  {(enableGoogleOAuth || enableGithubOAuth) && (
                    <div className="space-y-3">
                      {enableGoogleOAuth && (
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium">
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              fill="#EA4335"
                              d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                            />
                            <path
                              fill="#34A853"
                              d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                            />
                            <path
                              fill="#4A90E2"
                              d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                            />
                          </svg>
                          Continue with Google
                        </button>
                      )}

                      {enableGithubOAuth && (
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium">
                          <Github className="w-5 h-5" />
                          Continue with GitHub
                        </button>
                      )}
                    </div>
                  )}

                  {!enableEmailPassword &&
                    !enableGoogleOAuth &&
                    !enableGithubOAuth && (
                      <div className="text-center py-8 text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">
                          Select at least one authentication method to see
                          preview
                        </p>
                      </div>
                    )}

                  {(enableEmailPassword ||
                    enableGoogleOAuth ||
                    enableGithubOAuth) && (
                    <div className="text-center pt-4 text-sm text-gray-600">
                      Don't have an account?{" "}
                      <a
                        href="#"
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                      >
                        Sign up
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                  Secured by <span className="font-semibold">Authly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
