"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Box, Typography, Paper, Button, IconButton, Checkbox, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Grid, Card, CardContent, LinearProgress,
  Snackbar, Alert, Avatar, InputAdornment, Tooltip, Drawer, useTheme, useMediaQuery,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import LogoIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import PendingIcon from "@mui/icons-material/AccessTime";
import UrgentIcon from "@mui/icons-material/PriorityHigh";
import AllTasksIcon from "@mui/icons-material/FormatListBulleted";
import MenuIcon from "@mui/icons-material/Menu";
import RocketIcon from "@mui/icons-material/RocketLaunch";
import SendIcon from "@mui/icons-material/Send";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GroupIcon from "@mui/icons-material/Group";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { api } from "../../../lib/api";
import Sidebar from "./Sidebar";

export default function TodoDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Authentication & User state
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar & Layout states
  const [activeSidebarView, setActiveSidebarView] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Dialog & Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodoId, setCurrentTodoId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formCategory, setFormCategory] = useState("Personal");
  const [formDueDate, setFormDueDate] = useState("");

  // Feedback states
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Collaboration states
  const [pendingInvites, setPendingInvites] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    loadTodos();
    loadPendingInvites();
  }, []);

  const loadPendingInvites = async () => {
    try {
      const data = await api.getMyInvitations();
      setPendingInvites(data.count || 0);
    } catch (_) {}
  };

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await api.getTodos();
      setTodos(data);
    } catch (err) {
      showSnackbar("Failed to fetch todos from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Dialog controllers
  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setCurrentTodoId(null);
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormCategory(
      ["Work", "Personal", "Shopping", "Health", "Other"].includes(activeSidebarView)
        ? activeSidebarView
        : "Personal"
    );
    setFormDueDate("");
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (todo) => {
    setIsEditing(true);
    setCurrentTodoId(todo._id);
    setFormTitle(todo.title);
    setFormDescription(todo.description || "");
    setFormPriority(todo.priority || "medium");
    setFormCategory(todo.category || "Personal");
    setFormDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // CRUD handlers
  const handleSaveTodo = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showSnackbar("Title is required", "error");
      return;
    }

    const todoPayload = {
      title: formTitle,
      description: formDescription,
      priority: formPriority,
      category: formCategory,
      dueDate: formDueDate ? new Date(formDueDate) : null,
    };

    try {
      if (isEditing) {
        await api.updateTodo(currentTodoId, todoPayload);
        showSnackbar("Todo updated successfully!");
      } else {
        await api.createTodo(todoPayload);
        showSnackbar("Todo created successfully!");
      }
      handleCloseDialog();
      loadTodos();
    } catch (err) {
      showSnackbar(err.message || "Failed to save todo", "error");
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const updated = await api.updateTodo(todo._id, { completed: !todo.completed });
      setTodos(todos.map(t => t._id === todo._id ? updated : t));
      showSnackbar(updated.completed ? "Task marked completed!" : "Task marked active.");
    } catch (err) {
      showSnackbar("Failed to update status.", "error");
    }
  };

  const handleDeleteTodo = async (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await api.deleteTodo(id);
        setTodos(todos.filter(t => t._id !== id));
        showSnackbar("Todo deleted successfully!");
      } catch (err) {
        showSnackbar("Failed to delete todo.", "error");
      }
    }
  };

  // Stats calculation
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const urgentTasks = todos.filter((t) => !t.completed && t.priority === "high").length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter and Sort execution
  const filteredAndSortedTodos = todos
    .filter((todo) => {
      // Search Title/Desc
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      // Sidebar view filter
      let matchesView = true;
      if (activeSidebarView === "pending") {
        matchesView = !todo.completed;
      } else if (activeSidebarView === "completed") {
        matchesView = todo.completed;
      } else if (activeSidebarView === "high") {
        matchesView = todo.priority === "high";
      } else if (["Work", "Personal", "Shopping", "Health", "Other"].includes(activeSidebarView)) {
        matchesView = todo.category === activeSidebarView;
      }

      return matchesSearch && matchesView;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "priority") {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      return 0;
    });

  // UI Helpers
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444"; // red
      case "medium":
        return "#f97316"; // orange
      case "low":
        return "#8b5cf6"; // lavender/purple
      default:
        return "#6b7280";
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case "high":
        return "#fee2e2";
      case "medium":
        return "#ffedd5";
      case "low":
        return "#f5f3ff";
      default:
        return "#f3f4f6";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Work":
        return "primary";
      case "Personal":
        return "secondary";
      case "Shopping":
        return "warning";
      case "Health":
        return "success";
      default:
        return "default";
    }
  };

  const getCategoryDotColor = (category) => {
    switch (category) {
      case "Work":
        return "#3b82f6"; // blue
      case "Personal":
        return "#a855f7"; // purple
      case "Shopping":
        return "#f97316"; // orange
      case "Health":
        return "#10b981"; // green
      case "Other":
      default:
        return "#94a3b8"; // slate
    }
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date().setHours(0, 0, 0, 0);
  };

  const TASK_VIEWS = ["all", "pending", "completed", "high", "Work", "Personal", "Shopping", "Health", "Other"];
  const isTaskView = TASK_VIEWS.includes(activeSidebarView);

  const VIEW_LABELS = {
    all: "All Tasks", pending: "Pending", completed: "Completed", high: "Important",
    dashboard: "Dashboard", team: "Team & Collaboration",
    profile: "Profile",
  };

  const getViewTitle = () => VIEW_LABELS[activeSidebarView] || `${activeSidebarView} Tasks`;

  const getSidebarCount = (view) => {
    if (view === "all") return todos.length;
    if (view === "pending") return todos.filter(t => !t.completed).length;
    if (view === "high") return todos.filter(t => !t.completed && t.priority === "high").length;
    return 0;
  };

  const sidebarCounts = {
    all: todos.length,
    pending: todos.filter(t => !t.completed).length,
    high: todos.filter(t => !t.completed && t.priority === "high").length,
  };

  // Sidebar rendered via <Sidebar> component

  const sidebarEl = (
    <Sidebar
      active={activeSidebarView}
      onNavigate={(key) => { setActiveSidebarView(key); if (isMobile) setMobileOpen(false); }}
      onLogout={handleLogout}
      user={user}
      counts={sidebarCounts}
      isMobile={isMobile}
      pendingInvites={pendingInvites}
    />
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f3ff", display: "flex" }}>
      {/* SideBar - Desktop */}
      {!isMobile && (
        <Box component="nav" sx={{
          width: 260, flexShrink: 0, height: "100vh",
          position: "fixed", left: 0, top: 0, zIndex: 10, overflow: "hidden",
        }}>
          {sidebarEl}
        </Box>
      )}

      {/* SideBar Drawer - Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: 260, boxSizing: "border-box", bgcolor: "#12101c" } }}
        >
          {sidebarEl}
        </Drawer>
      )}

      {/* Main Content Panel */}
      <Box component="main" sx={{
        flexGrow: 1,
        width: isMobile ? "100%" : "calc(100% - 260px)",
        ml: isMobile ? 0 : "260px",
        minHeight: "100vh",
        bgcolor: "#f5f3ff",
      }}>
        {/* Top Header Bar */}
        <Box sx={{
            py: 2, px: { xs: 2, md: 4 },
            borderBottom: "1px solid #ede8fb",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0,
            bgcolor: "rgba(245,243,255,0.92)",
            backdropFilter: "blur(12px)", zIndex: 5,
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 1, color: "primary.main" }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#241c35" }}>
              {getViewTitle()}
            </Typography>
          </Box>

          {isTaskView && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "50%", sm: "40%", md: "35%" } }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#9e94b0" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  bgcolor: "#fcfcff",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    borderColor: "#eee7fb",
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
                sx={{
                  py: 1,
                  px: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  boxShadow: "0 6px 16px -4px rgba(139, 92, 246, 0.3)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    boxShadow: "0 10px 20px -4px rgba(139, 92, 246, 0.4)",
                  },
                }}
              >
                Add Task
              </Button>
            </Box>
          )}
        </Box>

        {/* Content Area */}
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
          {activeSidebarView === "profile" ? (
            <ProfileView
              user={user}
              onProfileUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }}
              showSnackbar={showSnackbar}
            />
          ) : activeSidebarView === "team" ? (
            <TeamView
              user={user}
              showSnackbar={showSnackbar}
              onInvitesSynced={(count) => setPendingInvites(count)}
            />
          ) : activeSidebarView === "dashboard" ? (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#241c35", mb: 4 }}>
                Welcome back, {user?.name || "there"} 👋
              </Typography>

              {/* ── Stats Row ──────────────────────────────────────────── */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="All Tasks" value={totalTasks}
                    icon={<LogoIcon sx={{ fontSize: 24, color: "#8b5cf6" }} />} bg="rgba(139,92,246,0.08)" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="Completed" value={completedTasks}
                    icon={<CheckIcon sx={{ fontSize: 24, color: "#14b8a6" }} />} bg="rgba(20,184,166,0.08)" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="Active Tasks" value={pendingTasks}
                    icon={<PendingIcon sx={{ fontSize: 24, color: "#f97316" }} />} bg="rgba(249,115,22,0.08)" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="Important" value={urgentTasks}
                    icon={<UrgentIcon sx={{ fontSize: 24, color: "#ef4444" }} />} bg="rgba(239,68,68,0.08)" />
                </Grid>
              </Grid>

              {/* ── Progress bar ───────────────────────────────────────── */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white", mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#241c35" }}>
                    Overall Completion
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#14b8a6" }}>
                    {completionPercentage}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={completionPercentage} sx={{
                  height: 10, borderRadius: 5, bgcolor: "#f1f0f4",
                  "& .MuiLinearProgress-bar": { bgcolor: "#14b8a6", borderRadius: 5 },
                }} />
              </Paper>

              {/* ── Charts Row ─────────────────────────────────────────── */}
              <Grid container spacing={3}>
                {/* Donut chart — Status breakdown */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white", height: 310 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#241c35", mb: 2 }}>
                      Task Status
                    </Typography>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Completed", value: completedTasks || 0 },
                            { name: "Active", value: pendingTasks || 0 },
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={90}
                          paddingAngle={4} dataKey="value"
                        >
                          <Cell fill="#14b8a6" />
                          <Cell fill="#8b5cf6" />
                        </Pie>
                        <ReTooltip formatter={(v, n) => [`${v} tasks`, n]} />
                        <Legend iconType="circle" iconSize={10} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Bar chart — Tasks by Priority */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white", height: 310 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#241c35", mb: 2 }}>
                      Tasks by Priority
                    </Typography>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart
                        data={[
                          { name: "High", total: todos.filter(t => t.priority === "high").length, done: todos.filter(t => t.priority === "high" && t.completed).length },
                          { name: "Medium", total: todos.filter(t => t.priority === "medium").length, done: todos.filter(t => t.priority === "medium" && t.completed).length },
                          { name: "Low", total: todos.filter(t => t.priority === "low").length, done: todos.filter(t => t.priority === "low" && t.completed).length },
                        ]}
                        barGap={6} barCategoryGap="35%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6e6380" }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6e6380" }} axisLine={false} tickLine={false} />
                        <ReTooltip formatter={(v, n) => [`${v}`, n === "total" ? "Total" : "Done"]} />
                        <Bar dataKey="total" name="Total" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="done" name="Done" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Bar chart — Tasks by Category */}
                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white", height: 290 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#241c35", mb: 2 }}>
                      Tasks by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart
                        data={["Work","Personal","Shopping","Health","Other"].map(cat => ({
                          name: cat,
                          total: todos.filter(t => t.category === cat).length,
                          done: todos.filter(t => t.category === cat && t.completed).length,
                        }))}
                        barGap={4} barCategoryGap="40%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0ecfb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6e6380" }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6e6380" }} axisLine={false} tickLine={false} />
                        <ReTooltip />
                        <Legend iconType="circle" iconSize={10} />
                        <Bar dataKey="total" name="Total" fill="#e9d5ff" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="done" name="Done" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          ) : (

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#6e6380" }}>
                  Showing {filteredAndSortedTodos.length} task{filteredAndSortedTodos.length !== 1 ? "s" : ""}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="sort-label">Sort By</InputLabel>
                  <Select labelId="sort-label" value={sortBy} label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)} sx={{ borderRadius: 2.5, bgcolor: "white" }}>
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="dueDate">Due Date</MenuItem>
                    <MenuItem value="priority">Priority Weight</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <LinearProgress sx={{ width: "200px", borderRadius: 3, height: 6 }} />
                </Box>
              ) : filteredAndSortedTodos.length === 0 ? (
                <EmptyState activeView={activeSidebarView} />
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{
                  borderRadius: 4, border: "1px solid #eee7fb", overflow: "hidden",
                }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8f6ff" }}>
                        <TableCell padding="checkbox" sx={{ pl: 2.5 }} />
                        <TableCell sx={{ fontWeight: 800, color: "#4c3d6a", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #eee7fb" }}>
                          Task
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#4c3d6a", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #eee7fb", width: 110 }}>
                          Priority
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#4c3d6a", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #eee7fb", width: 120 }}>
                          Category
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#4c3d6a", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #eee7fb", width: 130 }}>
                          Due Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#4c3d6a", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #eee7fb", width: 90 }}>
                          Status
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: "#4c3d6a", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "2px solid #eee7fb", width: 100, pr: 2.5 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAndSortedTodos.map((todo, idx) => {
                        const overdue = isOverdue(todo);
                        return (
                          <TableRow
                            key={todo._id}
                            sx={{
                              bgcolor: todo.completed ? "rgba(250,248,255,0.6)" : idx % 2 === 0 ? "#ffffff" : "#fdfcff",
                              borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
                              transition: "background 0.15s",
                              "&:hover": { bgcolor: "rgba(139,92,246,0.04)" },
                              "&:last-child td": { border: 0 },
                            }}
                          >
                            {/* Checkbox */}
                            <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                              <Checkbox
                                checked={todo.completed}
                                onChange={() => handleToggleComplete(todo)}
                                sx={{ color: "#8b5cf6", "&.Mui-checked": { color: "#14b8a6" } }}
                              />
                            </TableCell>

                            {/* Task title + description + owner badge */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                {todo.user && typeof todo.user === "object" && todo.user.name && (
                                  <Tooltip title={`By: ${todo.user.name}`} arrow>
                                    <Avatar sx={{
                                      width: 22, height: 22, fontSize: "0.6rem", fontWeight: 800,
                                      bgcolor: "#7c3aed", mt: 0.2, flexShrink: 0,
                                    }}>
                                      {todo.user.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </Tooltip>
                                )}
                                <Box sx={{ overflow: "hidden" }}>
                                  <Typography sx={{
                                    fontWeight: 700, fontSize: "0.95rem",
                                    color: todo.completed ? "text.secondary" : "#241c35",
                                    textDecoration: todo.completed ? "line-through" : "none",
                                    lineHeight: 1.3,
                                  }}>
                                    {todo.title}
                                  </Typography>
                                  {todo.description && (
                                    <Typography variant="caption" color="text.secondary" sx={{
                                      display: "block", mt: 0.3,
                                      textDecoration: todo.completed ? "line-through" : "none",
                                      overflow: "hidden", textOverflow: "ellipsis",
                                      whiteSpace: "nowrap", maxWidth: 320,
                                    }}>
                                      {todo.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Priority */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Chip
                                icon={<FlagIcon sx={{ fontSize: "11px !important", color: getPriorityColor(todo.priority) }} />}
                                label={todo.priority ? todo.priority.toUpperCase() : "MEDIUM"}
                                size="small"
                                sx={{
                                  fontSize: "0.68rem", fontWeight: 800,
                                  color: getPriorityColor(todo.priority),
                                  bgcolor: getPriorityBgColor(todo.priority),
                                  border: "none",
                                }}
                              />
                            </TableCell>

                            {/* Category */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Chip
                                label={todo.category || "Personal"}
                                size="small"
                                color={getCategoryColor(todo.category)}
                                variant="outlined"
                                sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22 }}
                              />
                            </TableCell>

                            {/* Due Date */}
                            <TableCell sx={{ py: 1.5 }}>
                              {todo.dueDate ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <CalendarIcon sx={{ fontSize: 14, color: overdue ? "#ef4444" : "#9e94b0" }} />
                                  <Typography variant="caption" sx={{
                                    fontWeight: overdue ? 700 : 500,
                                    color: overdue ? "#ef4444" : "text.secondary",
                                    fontSize: "0.78rem",
                                  }}>
                                    {overdue ? "Overdue" : ""} {new Date(todo.dueDate).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.disabled">—</Typography>
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell sx={{ py: 1.5 }}>
                              <Chip
                                label={todo.completed ? "Done" : "Active"}
                                size="small"
                                sx={{
                                  fontSize: "0.68rem", fontWeight: 700, height: 22,
                                  bgcolor: todo.completed ? "#ecfdf5" : "#f5f3ff",
                                  color: todo.completed ? "#10b981" : "#7c3aed",
                                  border: `1px solid ${todo.completed ? "#a7f3d0" : "#ddd6fe"}`,
                                }}
                              />
                            </TableCell>

                            {/* Actions */}
                            <TableCell align="right" sx={{ py: 1.5, pr: 2 }}>
                              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75 }}>
                                <Tooltip title="Edit Task">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditDialog(todo)}
                                    sx={{
                                      color: "text.secondary", bgcolor: "#fcfcff",
                                      border: "1px solid #eee7fb",
                                      "&:hover": { bgcolor: "#ede8fb", color: "#7c3aed" },
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Task">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteTodo(todo._id)}
                                    sx={{
                                      color: "text.secondary", bgcolor: "#fcfcff",
                                      border: "1px solid #eee7fb",
                                      "&:hover": { bgcolor: "#fee2e2", color: "#ef4444", borderColor: "#fecaca" },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Container>
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveTodo}>
          <DialogTitle sx={{ fontWeight: 800, color: "#241c35", pb: 1 }}>
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1.5 }}>
            <TextField
              label="Task Title"
              fullWidth
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Design app UI dashboard"
              variant="outlined"
            />
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Add details about this task..."
              variant="outlined"
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="dialog-priority-label">Priority</InputLabel>
                  <Select
                     labelId="dialog-priority-label"
                     value={formPriority}
                     label="Priority"
                     onChange={(e) => setFormPriority(e.target.value)}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="dialog-category-label">Category</InputLabel>
                  <Select
                    labelId="dialog-category-label"
                    value={formCategory}
                    label="Category"
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <MenuItem value="Personal">Personal</MenuItem>
                    <MenuItem value="Work">Work</MenuItem>
                    <MenuItem value="Shopping">Shopping</MenuItem>
                    <MenuItem value="Health">Health</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button onClick={handleCloseDialog} sx={{ color: "text.secondary", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 3,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
                "&:hover": { boxShadow: "0 6px 16px rgba(139, 92, 246, 0.3)" },
              }}
            >
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar alerts */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%", borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Subcomponents

function StatCard({ title, value, icon, bg }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #eee7fb", height: "100%", bgcolor: "#ffffff" }}>
      <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyBox: "center", width: 38, height: 38, borderRadius: "10px", bgcolor: bg, justifyContent: "center" }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#241c35" }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function EmptyState({ activeView }) {
  const getEmptyMessage = () => {
    switch (activeView) {
      case "completed":
        return "No completed tasks yet. Finish a task to see it here!";
      case "pending":
        return "All caught up! You have no pending tasks.";
      case "high":
        return "No high priority tasks. Everything is running smoothly!";
      default:
        return "This list is empty. Add a task to start organizing!";
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        py: 8,
        px: 4,
        textAlign: "center",
        borderRadius: 4,
        border: "1px dashed #d1c5e7",
        bgcolor: "rgba(255, 255, 255, 0.4)",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "primary.light",
          color: "primary.main",
          mb: 2,
        }}
      >
        <AllTasksIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, color: "#241c35", mb: 1 }}>
        Nothing to show
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 350, mx: "auto" }}>
        {getEmptyMessage()}
      </Typography>
    </Paper>
  );
}

// ── ProfileView Subcomponent ──────────────────────────────────────────────────
function ProfileView({ user, onProfileUpdate, showSnackbar }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setAadhar(user.aadhar || "");
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showSnackbar("Name is required", "error");
      return;
    }
    if (aadhar.trim() && !/^\d{12}$/.test(aadhar.trim())) {
      showSnackbar("Aadhaar must be exactly 12 digits", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.updateProfile({
        name,
        phone,
        bio,
        aadhar: aadhar.trim(),
      });
      onProfileUpdate(res.user);
      showSnackbar("Profile updated successfully!");
    } catch (err) {
      showSnackbar(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAadhar = async () => {
    if (confirm("Are you sure you want to delete your Aadhaar details?")) {
      setLoading(true);
      try {
        const res = await api.updateProfile({ aadhar: "" });
        setAadhar("");
        onProfileUpdate(res.user);
        showSnackbar("Aadhaar details deleted successfully!");
      } catch (err) {
        showSnackbar(err.message || "Failed to delete Aadhaar", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Grid container spacing={4}>
      {/* Left side card - Summary */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white", textAlign: "center" }}>
          <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
            <Avatar
              sx={{
                width: 100, height: 100, mx: "auto",
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                boxShadow: "0 8px 24px rgba(124,58,237,0.25)",
                fontSize: "2.5rem", fontWeight: 800
              }}
            >
              {name ? name.charAt(0).toUpperCase() : "U"}
            </Avatar>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#241c35", mb: 0.5 }}>
            {name || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {user?.email}
          </Typography>

          {user?.aadhar ? (
            <Chip
              label="Aadhaar Linked"
              color="success"
              size="small"
              sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0" }}
            />
          ) : (
            <Chip
              label="No Aadhaar Linked"
              color="warning"
              size="small"
              sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: "#fffbeb", color: "#f59e0b", border: "1px solid #fef3c7" }}
            />
          )}

          {bio && (
            <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #f3f0f9" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#241c35", mb: 1, textAlign: "left" }}>
                Bio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left", fontStyle: "italic", lineHeight: 1.5 }}>
                "{bio}"
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Right side form */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#241c35", mb: 3 }}>
            Update Profile Information
          </Typography>
          
          <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              label="Email Address"
              fullWidth
              value={user?.email || ""}
              disabled
              helperText="Email address cannot be changed."
            />

            <TextField
              label="Phone Number"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
            />

            <TextField
              label="Bio"
              fullWidth
              multiline
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              slotProps={{ htmlInput: { maxLength: 300 } }}
            />

            <Box sx={{ pt: 1, borderTop: "1px solid #f3f0f9", display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#241c35" }}>
                Aadhaar Verification
              </Typography>
              
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                <TextField
                  label="Aadhaar Card Number"
                  fullWidth
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="12-digit Aadhaar number"
                  helperText="Aadhaar is a 12-digit unique identity number."
                  error={aadhar.length > 0 && aadhar.length !== 12}
                />
                
                {user?.aadhar && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteAadhar}
                    disabled={loading}
                    sx={{
                      py: 1.8, px: 3, minWidth: 160, borderRadius: 2.5, fontWeight: 700, borderStyle: "dashed",
                      "&:hover": { bgcolor: "#fee2e2", borderColor: "#ef4444" }
                    }}
                  >
                    Delete Aadhaar
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.2, px: 4, borderRadius: 2.5, fontWeight: 700,
                  boxShadow: "0 6px 16px rgba(139, 92, 246, 0.25)",
                  "&:hover": { boxShadow: "0 10px 24px rgba(139, 92, 246, 0.35)" }
                }}
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ── TeamView Subcomponent ─────────────────────────────────────────────────────
function TeamView({ user, showSnackbar, onInvitesSynced }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviting, setInviting] = useState(false);

  const [members, setMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [membersData, invitationsData, sentData] = await Promise.all([
        api.getCollaborators(),
        api.getMyInvitations(),
        api.getSentInvitations(),
      ]);
      setMembers(membersData.members || []);
      setPendingInvitations(invitationsData.invitations || []);
      setSentInvitations(sentData.invitations || []);
      onInvitesSynced(invitationsData.count || 0);
    } catch (err) {
      showSnackbar("Failed to load team data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.inviteCollaborator(inviteEmail.trim(), inviteMessage.trim());
      showSnackbar(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      setInviteMessage("");
      loadAll();
    } catch (err) {
      showSnackbar(err.message || "Failed to send invitation", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await api.respondToInvitation(id, action);
      showSnackbar(action === "accept" ? "Invitation accepted! You can now collaborate." : "Invitation rejected.");
      loadAll();
    } catch (err) {
      showSnackbar(err.message || "Failed to respond", "error");
    }
  };

  const handleRemove = async (collaborationId) => {
    if (confirm("Remove this collaborator?")) {
      try {
        await api.removeCollaboration(collaborationId);
        showSnackbar("Collaborator removed.");
        loadAll();
      } catch (err) {
        showSnackbar(err.message || "Failed to remove", "error");
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === "accepted") return { bg: "#ecfdf5", color: "#10b981", border: "#a7f3d0" };
    if (status === "rejected") return { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" };
    return { bg: "#fffbeb", color: "#f59e0b", border: "#fef3c7" };
  };

  return (
    <Grid container spacing={3}>
      {/* Left column */}
      <Grid size={{ xs: 12, md: 5 }}>
        {/* Invite Form */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: "10px",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PersonAddIcon sx={{ fontSize: 20, color: "white" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#241c35" }}>
              Invite a Collaborator
            </Typography>
          </Box>
          <Divider sx={{ mb: 2.5, borderColor: "#f3f0f9" }} />
          <Box component="form" onSubmit={handleInvite} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email Address"
              fullWidth
              size="small"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@example.com"
              required
            />
            <TextField
              label="Message (optional)"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Hey, let's collaborate on our tasks!"
              slotProps={{ htmlInput: { maxLength: 300 } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={inviting || !inviteEmail.trim()}
              startIcon={<SendIcon />}
              sx={{ borderRadius: 2.5, fontWeight: 700, py: 1.1, boxShadow: "0 4px 14px rgba(124,58,237,0.25)" }}
            >
              {inviting ? "Sending..." : "Send Invitation"}
            </Button>
          </Box>
        </Paper>

        {/* Pending Invitations TO ME */}
        {pendingInvitations.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "2px solid #f59e0b", bgcolor: "#fffbeb" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#92400e", mb: 2 }}>
              📬 Pending Invitations ({pendingInvitations.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {pendingInvitations.map((inv) => (
                <Box key={inv._id} sx={{
                  p: 2, borderRadius: 3, bgcolor: "white",
                  border: "1px solid #fef3c7", display: "flex", flexDirection: "column", gap: 1,
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: "#7c3aed", fontSize: "0.9rem", fontWeight: 800 }}>
                      {inv.inviter?.name?.charAt(0)?.toUpperCase() || "?"}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#241c35" }}>
                        {inv.inviter?.name || "Unknown"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inv.inviter?.email}
                      </Typography>
                    </Box>
                  </Box>
                  {inv.message && (
                    <Typography variant="caption" sx={{ color: "#6e6380", fontStyle: "italic", px: 0.5 }}>
                      "{inv.message}"
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    <Button
                      size="small" variant="contained" color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleRespond(inv._id, "accept")}
                      sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small" variant="outlined" color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleRespond(inv._id, "reject")}
                      sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Grid>

      {/* Right column */}
      <Grid size={{ xs: 12, md: 7 }}>
        {/* Active Collaborators */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <GroupIcon sx={{ color: "#7c3aed", fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#241c35" }}>
              Active Collaborators
            </Typography>
            <Chip label={members.length} size="small" sx={{ ml: "auto", bgcolor: "#f5f3ff", color: "#7c3aed", fontWeight: 800 }} />
          </Box>
          <Divider sx={{ mb: 2, borderColor: "#f3f0f9" }} />
          {loading ? (
            <LinearProgress sx={{ borderRadius: 3, height: 5 }} />
          ) : members.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <GroupIcon sx={{ fontSize: 48, color: "#d8d0ea", mb: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                No collaborators yet. Invite your teammates to get started!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {members.map((m) => (
                <Box key={m.collaborationId} sx={{
                  display: "flex", alignItems: "center", gap: 2,
                  p: 1.75, borderRadius: 3, bgcolor: "#fdfcff",
                  border: "1px solid #eee7fb",
                  transition: "background 0.15s",
                  "&:hover": { bgcolor: "#f5f3ff" },
                }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: "#7c3aed", fontWeight: 800 }}>
                    {m.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </Avatar>
                  <Box sx={{ flex: 1, overflow: "hidden" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#241c35" }}>
                      {m.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.user?.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={m.role === "invited" ? "You invited" : "Invited you"}
                    size="small"
                    sx={{ fontSize: "0.68rem", fontWeight: 700, bgcolor: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}
                  />
                  <Tooltip title="Remove collaborator">
                    <IconButton size="small" onClick={() => handleRemove(m.collaborationId)}
                      sx={{ color: "#b0a3c0", "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" } }}>
                      <CancelIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Sent Invitations */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #eee7fb", bgcolor: "white" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#241c35", mb: 2 }}>
            Sent Invitations
          </Typography>
          <Divider sx={{ mb: 2, borderColor: "#f3f0f9" }} />
          {sentInvitations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              No invitations sent yet.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#6e6380", fontSize: "0.75rem", textTransform: "uppercase" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#6e6380", fontSize: "0.75rem", textTransform: "uppercase" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#6e6380", fontSize: "0.75rem", textTransform: "uppercase" }}>Sent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sentInvitations.map((inv) => {
                    const sc = getStatusColor(inv.status);
                    return (
                      <TableRow key={inv._id} sx={{ "&:last-child td": { border: 0 } }}>
                        <TableCell sx={{ fontSize: "0.85rem", color: "#241c35" }}>{inv.inviteeEmail}</TableCell>
                        <TableCell>
                          <Chip label={inv.status} size="small" sx={{
                            fontSize: "0.68rem", fontWeight: 700,
                            bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                          }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}