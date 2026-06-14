"use client";

import React from "react";
import { Container, Box, Paper, Typography } from "@mui/material";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";

export default function AuthShell({ children, mode }) {
  return (
    <Box
      className="min-h-screen flex items-center justify-center p-4"
      sx={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #fdfcff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Circles */}
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)",
          top: "-50px",
          right: "-50px",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0) 70%)",
          bottom: "-100px",
          left: "-100px",
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ zIndex: 1, position: "relative" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 6,
            border: "1px solid #e2d9f3",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 24px 48px -12px rgba(109, 69, 202, 0.08)",
            textAlign: "center",
          }}
        >
          {/* Logo / Brand */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "16px",
              bgcolor: "primary.light",
              color: "primary.main",
              mb: 3,
              boxShadow: "0 8px 16px -4px rgba(139, 92, 246, 0.2)",
            }}
          >
            <PlaylistAddCheckRoundedIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              color: "#241c35",
              letterSpacing: "-0.5px",
            }}
          >
            Lavender Todo
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 360, mx: "auto" }}
          >
            {mode === "login"
              ? "Simplify your life. Log in to organize your tasks beautifully."
              : "Start planning today. Create an account to stay organized."}
          </Typography>

          {children}
        </Paper>
      </Container>
    </Box>
  );
}
