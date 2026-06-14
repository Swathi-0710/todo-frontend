"use client";
import React from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Badge } from "@mui/material";
import LogoIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import DashboardIcon from "@mui/icons-material/GridView";
import AllTasksIcon from "@mui/icons-material/FormatListBulleted";
import ProfileIcon from "@mui/icons-material/AccountCircle";
import TeamIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";

const NAV = [
  {
    label: "Main",
    items: [
      { key: "dashboard", label: "Dashboard", icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
      { key: "all", label: "Tasks", icon: <AllTasksIcon sx={{ fontSize: 18 }} />, countKey: "all" },
      { key: "team", label: "Team", icon: <TeamIcon sx={{ fontSize: 18 }} />, inviteKey: true },
      { key: "profile", label: "Profile", icon: <ProfileIcon sx={{ fontSize: 18 }} /> },
    ],
  },
];

export default function Sidebar({ active, onNavigate, onLogout, user, counts = {}, isMobile, pendingInvites = 0 }) {
  const go = (key) => { onNavigate(key); if (isMobile) onNavigate(key); };

  const NavItem = ({ item }) => {
    const isActive = active === item.key;
    const count = item.countKey ? counts[item.countKey] : 0;
    const inviteBadge = item.inviteKey && pendingInvites > 0;
    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => go(item.key)}
          sx={{
            borderRadius: 2.5, py: 0.9, px: 1.5,
            bgcolor: isActive ? "rgba(139,92,246,0.2)" : "transparent",
            color: isActive ? "#c4b5fd" : "#7c6fa0",
            transition: "all 0.15s",
            "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#c4b5fd" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: isActive ? "#a78bfa" : "#4a3d6a" }}>
            {inviteBadge ? (
              <Badge badgeContent={pendingInvites} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                {item.icon}
              </Badge>
            ) : item.icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: "0.875rem", fontWeight: isActive ? 700 : 500, lineHeight: 1.4 }}>
                {item.label}
              </Typography>
            }
          />
          {count > 0 && (
            <Box sx={{
              bgcolor: isActive ? "#7c3aed" : "#2d2050",
              color: isActive ? "white" : "#8878a8",
              fontSize: "0.68rem", fontWeight: 800,
              px: 0.9, py: 0.15, borderRadius: 10, minWidth: 20, textAlign: "center",
            }}>
              {count}
            </Box>
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#12101c", overflow: "hidden" }}>
      {/* Brand */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: "11px",
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(124,58,237,0.45)",
          }}>
            <LogoIcon sx={{ fontSize: 22, color: "white" }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>
            Lavender
          </Typography>
        </Box>
      </Box>

      {/* Scrollable nav area */}
      <Box sx={{
        flex: 1, overflowY: "auto", overflowX: "hidden", px: 2,
        "&::-webkit-scrollbar": { width: 3 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#2d2050", borderRadius: 2 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
      }}>
        {NAV.map((section) => (
          <Box key={section.label} sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{
              fontWeight: 800, color: "#3d3060", textTransform: "uppercase",
              letterSpacing: "0.08em", px: 1.5, display: "block", mb: 0.75,
            }}>
              {section.label}
            </Typography>
            <List sx={{ p: 0 }}>
              {section.items.map((item) => <NavItem key={item.key} item={item} />)}
            </List>
          </Box>
        ))}
      </Box>

      {/* Bottom: profile card + logout */}
      <Box sx={{ flexShrink: 0, borderTop: "1px solid #1e1a30", px: 2, pt: 1.5, pb: 2 }}>
        {/* User card */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          px: 1.5, py: 1, borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.04)", mb: 1.5,
        }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#7c3aed", fontSize: "0.82rem", fontWeight: 800 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <Box sx={{ overflow: "hidden", flex: 1 }}>
            <Typography variant="body2" sx={{
              fontWeight: 700, color: "#e2d9f3", fontSize: "0.8rem",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.name || "User"}
            </Typography>
            <Typography variant="caption" sx={{
              color: "#4a3d6a", fontSize: "0.68rem", display: "block",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.email || "user@example.com"}
            </Typography>
          </Box>
        </Box>

        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2.5, py: 0.9, px: 1.5, color: "#7c6fa0",
            "&:hover": { bgcolor: "rgba(239,68,68,0.12)", color: "#f87171" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Logout
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
