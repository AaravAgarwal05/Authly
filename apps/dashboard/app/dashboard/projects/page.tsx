"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FolderKanban, Calendar, ChevronRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-2">
            Manage your authentication projects
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-12 text-center">
          <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No projects yet
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first project to start using Authly
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:shadow-lg hover:border-indigo-500 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition">
                  <FolderKanban className="w-6 h-6 text-indigo-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4">/{project.slug}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {project.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
