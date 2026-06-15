"use client";

import { useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://todo-backend-1-eqy9.onrender.com";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {
    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        setName("");
        setEmail("");
        setPassword("");

        setIsLogin(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

const loginUser = async () => {
  if (!email || !password) {
    alert("Email and Password are required");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(data.message);

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user details if needed
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(data);

      setEmail("");
      setPassword("");
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      loginUser();
    } else {
      registerUser();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <section
        className="auth-card"
        style={{
          width: "400px",
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div className="auth-heading">
          <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>

          <p>
            {isLogin
              ? "Login to manage your todos."
              : "Sign up and start planning your day."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: "15px" }}>
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>

            {isLogin && (
              <button
                type="button"
                style={{
                  border: "none",
                  background: "none",
                  color: "blue",
                  cursor: "pointer",
                }}
              >
                Forgot?
              </button>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          {isLogin
            ? "New here?"
            : "Already have an account?"}

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              marginLeft: "10px",
              border: "none",
              background: "none",
              color: "blue",
              cursor: "pointer",
            }}
          >
            {isLogin ? "Create Account" : "Login"}
          </button>
        </p>
      </section>
    </div>
  );
}