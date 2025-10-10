import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ProjectTasksViewer() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [employeesMap, setEmployeesMap] = useState<{[key: string]: string}>({});
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!db) throw new Error("Firestore is not initialized");
      const snap = await getDocs(collection(db, "projects"));
      const projectData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!db) throw new Error("Firestore is not initialized");
      const snap = await getDocs(collection(db, "employees"));
        const empMap: {[key: string]: string} = {};
      snap.docs.forEach((doc) => {
          const { name } = doc.data();
          empMap[doc.id] = name;
      });
      setEmployeesMap(empMap);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchTasks = async () => {
      try {
        if (!db) throw new Error("Firestore is not initialized");
      const q = query(
        collection(db, "tasks"),
        where("project_id", "==", selectedProjectId)
      );
      const snap = await getDocs(q);
      const taskList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [selectedProjectId]);

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === "completed") return "text-emerald-600 font-semibold";
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return "text-red-600 font-semibold";
    return "text-slate-800 dark:text-slate-200";
  };

  const calculatePerformance = (createdAt: any, dueDate: string, updatedAt: any) => {
    if (!updatedAt || !createdAt || !dueDate) return "-";
    const start = new Date(createdAt.seconds * 1000);
    const end = new Date(dueDate);
    const done = new Date(updatedAt.seconds * 1000);
    const totalTime = end.getTime() - start.getTime();
    const usedTime = done.getTime() - start.getTime();
    if (totalTime <= 0 || usedTime <= 0) return "0%";
    const percent = ((1 - usedTime / totalTime) * 100).toFixed(1);
    return `${percent}%`;
  };

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-rose-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900/10 dark:to-rose-900/5 p-6 overflow-auto">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-blue-200/20 dark:from-blue-900/10 dark:to-blue-900/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-rose-200/20 to-blue-200/20 dark:from-rose-900/10 dark:to-blue-900/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-blue-200/50 dark:border-blue-500/20 p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-200">Select Project</h2>
          <div className="flex flex-wrap gap-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`px-4 py-2 rounded-xl shadow transition duration-300 ease-in-out ${
                  selectedProjectId === project.id
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white scale-105"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200/50 dark:border-blue-500/30"
                }`}
              >
                        {project.name}
              </button>
            ))}
          </div>
        </div>

          {selectedProjectId && (
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-blue-200/50 dark:border-blue-500/20 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                Tasks for:{" "}
                {projects.find((proj) => proj.id === selectedProjectId)?.name}
              </h3>
              <select
                className="border border-blue-200/50 dark:border-blue-500/30 px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
                  </div>

            <div className="overflow-x-auto rounded-lg border border-blue-200/50 dark:border-blue-500/30">
              <table className="min-w-full divide-y divide-blue-200/50 dark:divide-blue-500/30 text-sm">
                <thead className="bg-gradient-to-r from-blue-100/80 to-blue-100/80 dark:from-blue-900/50 dark:to-blue-800/50 text-[13px]">
                  <tr>
                    {[
                      "#",
                      "Title",
                      "Description",
                      "Status",
                      "Assigned To",
                      "Created By",
                      "Created At",
                      "Due Date",
                      "Progress",
                      "Progress Description",
                      "Link",
                      "Updated At",
                     
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="p-3 text-left font-bold text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-500/30"
                      >
                        {heading}
                          </th>
                    ))}
                        </tr>
                      </thead>
                <tbody className="divide-y divide-blue-100/50 dark:divide-blue-500/20 bg-white/50 dark:bg-slate-800/30">
                  {filteredTasks.map((task, idx) => (
                    <tr
                            key={task.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <td className="p-3 border border-blue-200/30 dark:border-blue-500/20 text-slate-900 dark:text-slate-200">{idx + 1}</td>
                      <td className="p-3 border border-blue-200/30 dark:border-blue-500/20 text-slate-900 dark:text-slate-200 font-medium">{task.title}</td>
                      <td className="p-3 border border-blue-200/30 dark:border-blue-500/20 text-slate-600 dark:text-slate-400">{task.description}</td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20">
                              <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            task.status === "completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                        >
                          {task.status}
                          {task.status === "completed" && (
                            <span className="ml-1 text-emerald-600 dark:text-emerald-400">✔</span>
                          )}
                              </span>
                            </td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20 text-slate-700 dark:text-slate-300">
                        {employeesMap[task.assigned_to] || task.assigned_to}
                      </td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20 text-slate-700 dark:text-slate-300">
                        {employeesMap[task.created_by] || task.created_by}
                            </td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20 text-slate-600 dark:text-slate-400">
                        {task.created_at
                          ? new Date(
                              task.created_at.seconds * 1000
                            ).toLocaleString()
                          : "-"}
                            </td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20 text-slate-600 dark:text-slate-400">{task.due_date}</td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20 min-w-[140px]">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                                      task.progress_status === "completed"
                                ? "bg-emerald-500"
                                : "bg-blue-400"
                                    }`}
                                    style={{
                                      width:
                                        task.progress_status === "completed"
                                          ? "100%"
                                          : task.progress_status === "in progress"
                                          ? "50%"
                                          : "10%",
                                    }}
                          ></div>
                                </div>
                        <div className="text-xs mt-1 text-slate-600 dark:text-slate-400">
                          {task.progress_status}
                              </div>
                            </td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20 text-slate-600 dark:text-slate-400">
                        {task.progress_description || "-"}
                      </td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20">
                        {task.progress_link ? (
                          <a
                            href={task.progress_link}
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 border border-blue-200/30 dark:border-blue-500/20 text-slate-600 dark:text-slate-400">
                        {task.progress_updated_at
                          ? new Date(
                              task.progress_updated_at.seconds * 1000
                            ).toLocaleString()
                          : "-"}
                      </td>
                     
                    </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
      </div>
    </div>
  );
}
