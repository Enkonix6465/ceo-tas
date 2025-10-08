import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Search,
  Bell,
  Plus,
  Star,
  MoreHorizontal,
  ChevronRight,
  Folder,
  FileText,
  UserPlus,
  Shield,
  BarChart3,
  Clock,
  Filter,
  ArrowUpDown,
  Grid3X3,
  TrendingUp,
  Target,
  Activity,
  MessageSquare,
  Ticket,
  FolderPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import FirebaseConnectionStatus from "./FirebaseConnectionStatus";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConnected } from "../lib/firebase";

function Layout() {
  const { signOut, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Add state for projects and tickets
  const [projects, setProjects] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Add state for project creation modal (similar to ProjectDashboard)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    deadline: '',
    teamId: ''
  });
  const [error, setError] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    projects: false,
    tickets: false,
    administration: false,
  });

  // Fetch projects, tickets, and teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProjects(true);
        setLoadingTickets(true);
        
        if (db) {
          const projSnap = await getDocs(collection(db, "projects"));
          const ticketSnap = await getDocs(collection(db, "raiseTickets"));
          const teamSnap = await getDocs(collection(db, "teams"));
          
          setProjects(projSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          setTickets(ticketSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          setTeams(teamSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingProjects(false);
        setLoadingTickets(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Handle create new project - open modal (similar to ProjectDashboard)
  const handleCreateNewProject = () => {
    closeSidebar();
    setShowNewProjectModal(true);
  };

  // Handle project creation (same logic as ProjectDashboard)
  const handleCreateProject = async () => {
    if (!isFirebaseConnected()) {
      setError("Cannot create project - Firebase connection unavailable");
      return;
    }

    try {
      const newProjectData = {
        ...newProject,
        created_by: user?.uid || 'admin',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "projects"), newProjectData);
      setProjects(prev => [...prev, { id: docRef.id, ...newProjectData }]);
      setShowNewProjectModal(false);
      setNewProject({
        name: '',
        description: '',
        startDate: '',
        deadline: '',
        teamId: ''
      });
      setError(null);
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-violet-900/20 dark:to-indigo-900/10 flex overflow-hidden">
      <FirebaseConnectionStatus />
      
      {/* Project Creation Modal (same as ProjectDashboard) */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Create New Project</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Team
                </label>
                <select
                  value={newProject.teamId}
                  onChange={(e) => setNewProject({...newProject, teamId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.teamName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setError(null);
                  setNewProject({
                    name: '',
                    description: '',
                    startDate: '',
                    deadline: '',
                    teamId: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Sidebar */}
      <div className={`${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-[220px] lg:w-[240px] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-violet-200/50 dark:border-violet-500/20 transition-all duration-300 ease-in-out flex flex-col shadow-xl`}>

        {/* Enhanced Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-200/50 dark:border-violet-500/20 bg-gradient-to-r from-violet-50/80 via-purple-50/80 to-indigo-50/80 dark:from-slate-800/80 dark:to-violet-900/80 backdrop-blur-sm">
          <div className="relative workspace-dropdown">
            <button
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="flex items-center gap-3 hover:bg-violet-100/60 dark:hover:bg-violet-700/30 rounded-xl px-4 py-3 transition-all duration-200 group"
            >
              <div className="text-left">
                <span className="text-base font-bold text-slate-800 dark:text-white block">TAS ENKONIX</span>
              </div>
              <Link
                to="/settings"
                className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 text-violet-600 dark:text-violet-300 hover:bg-violet-100/60 dark:hover:bg-violet-700/40 border border-violet-200/50 dark:border-violet-500/30 shadow-md transition-all duration-200 backdrop-blur-sm"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 text-violet-600 dark:text-violet-300 hover:bg-violet-100/60 dark:hover:bg-violet-700/40 border border-violet-200/50 dark:border-violet-500/30 shadow-md transition-all duration-200 backdrop-blur-sm"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </button>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-700/30 transition-colors"
          >
            <X className="h-4 w-4 text-violet-600 dark:text-violet-300" />
          </button>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          <nav className="space-y-3">
            {/* Dashboard Section */}
            <div>
              <button
                onClick={() => toggleSection('dashboard')}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-slate-700 dark:text-violet-200 hover:bg-violet-100/60 dark:hover:bg-violet-700/30 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>Dashboard</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.dashboard ? 'rotate-0' : '-rotate-90'} text-violet-500`} />
              </button>
              {expandedSections.dashboard && (
                <div className="ml-6 mt-3 space-y-2">
                  <Link
                    to="/"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 group ${
                      isActive("/")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span>Overview</span>
                  </Link>
                  
                  <Link
                    to="/PerformMatrix"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/PerformMatrix")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Performance</span>
                  </Link>
                  <Link
                    to="/KanbanPage"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/KanbanPage")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Kanban Board</span>
                  </Link>
                  <Link
                    to="/Analytics"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/Analytics")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    to="/Reports"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/Reports")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Reports</span>
                  </Link>
                  <Link
                    to="/calendar"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/calendar")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Calendar</span>
                  </Link>
                  <Link
                    to="/AllTasks"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/AllTasks")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>All Tasks</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Enhanced Projects Section with Plus Icon and ALL Projects Dropdown */}
            <div>
              <button
                onClick={() => toggleSection('projects')}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-slate-700 dark:text-violet-200 hover:bg-violet-100/60 dark:hover:bg-violet-700/30 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>Projects</span>
                  <div className="flex items-center gap-1">
                    <Plus className="w-4 h-4 text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-colors" />
                    <span className="text-xs text-violet-500 font-medium">({projects.length})</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.projects ? 'rotate-90' : 'rotate-0'} text-violet-500`} />
              </button>
              {expandedSections.projects && (
                <div className="ml-6 mt-3 space-y-2">
                  {/* Quick Create Project Button - Opens Modal */}
                  <button
                    onClick={handleCreateNewProject}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Create New Project</span>
                    <Plus className="w-3 h-3" />
                  </button>

                  {/* ALL Projects Dropdown - Shows ALL projects */}
                  {projects.length > 0 && (
                    <div className="ml-4 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                      <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2 px-2">
                        All Projects ({projects.length})
                      </div>
                      {projects.map((project) => (
                        <Link
                          key={project.id}
                          to={`/project/${project.id}`}
                          onClick={closeSidebar}
                          className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-violet-50 dark:hover:bg-violet-800/30 transition-colors group"
                        >
                          <Folder className="w-3 h-3 text-violet-500" />
                          <span className="truncate text-slate-600 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-200">
                            {project.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Other Project Links */}
                  <Link
                    to="/ProjectTasksViewer"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/ProjectTasksViewer")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <Folder className="w-4 h-4" />
                    <span>Project Tasks</span>
                  </Link>
                  <Link
                    to="/ProjectDocCreator"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/ProjectDocCreator")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Documentation</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Enhanced Tickets Section with Plus Icon and ALL Tickets Dropdown */}
            <div>
              <button
                onClick={() => toggleSection('tickets')}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-slate-700 dark:text-violet-200 hover:bg-violet-100/60 dark:hover:bg-violet-700/30 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>Tickets</span>
                  <div className="flex items-center gap-1">
                    <Plus className="w-4 h-4 text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-colors" />
                    <span className="text-xs text-violet-500 font-medium">({tickets.length})</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.tickets ? 'rotate-90' : 'rotate-0'} text-violet-500`} />
              </button>
              {expandedSections.tickets && (
                <div className="ml-6 mt-3 space-y-2">
                  {/* Quick Create Ticket Button */}
                  <Link
                    to="/RaiseProjectTicket"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/RaiseProjectTicket")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Ticket</span>
                  </Link>

                  {/* ALL Tickets Dropdown - Shows ALL tickets */}
                  {tickets.length > 0 && (
                    <div className="ml-4 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                      <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2 px-2">
                        All Tickets ({tickets.length})
                      </div>
                      {tickets.map((ticket) => (
                        <Link
                          key={ticket.id}
                          to="/ViewTickets"
                          onClick={closeSidebar}
                          className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-violet-50 dark:hover:bg-violet-800/30 transition-colors group"
                        >
                          <Ticket className="w-3 h-3 text-violet-500" />
                          <span className="truncate text-slate-600 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-200">
                            {ticket.title || ticket.projectTicketId}
                          </span>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                            ticket.status === 'Pending' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            ticket.status === 'Done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {ticket.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* View All Tickets */}
                  <Link
                    to="/ViewTickets"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/ViewTickets")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>View All Tickets</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Administration Section */}
            <div>
              <button
                onClick={() => toggleSection('administration')}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold text-slate-700 dark:text-violet-200 hover:bg-violet-100/60 dark:hover:bg-violet-700/30 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>Administration</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSections.administration ? 'rotate-90' : 'rotate-0'} text-violet-500`} />
              </button>
              {expandedSections.administration && (
                <div className="ml-6 mt-3 space-y-2">
                  <Link
                    to="/AddUsers"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/AddUsers")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Users</span>
                  </Link>
                  <Link
                    to="/Makeleader"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/Makeleader")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Team Lead Assignment</span>
                  </Link>
                  
                  <Link
                    to="/FeedbackPage"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 hover:shadow-md ${
                      isActive("/FeedbackPage")
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:bg-gradient-to-r dark:from-violet-800/40 dark:to-purple-800/40 text-violet-700 dark:text-violet-200 font-semibold shadow-lg border border-violet-200 dark:border-violet-600/40"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:bg-gradient-to-r dark:hover:from-violet-800/20 dark:hover:to-purple-800/20 hover:text-violet-700 dark:hover:text-violet-200"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>HR Feedback</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        

        {/* Enhanced User Profile */}
        <div className="border-t border-violet-200/50 dark:border-violet-500/20 px-6 py-4 bg-gradient-to-r from-violet-50/60 to-purple-50/60 dark:from-slate-800/60 dark:to-violet-900/60 backdrop-blur-sm">
          <div className="flex items-center gap-4 bg-gradient-to-r from-violet-100/80 to-purple-100/80 dark:from-slate-700/80 dark:to-violet-800/80 rounded-xl px-4 py-3 shadow-lg border border-violet-200/50 dark:border-violet-600/30">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Admin
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-300 truncate">
                Project Manager
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-violet-200/60 dark:hover:bg-violet-700/40 transition-colors group"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-violet-600 dark:text-violet-300 group-hover:text-violet-700 dark:group-hover:text-violet-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
