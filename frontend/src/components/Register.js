import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

const DEPARTMENTS = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"]

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    department: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const nav = useNavigate()

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (error) setError("")
  }

  const register = async () => {
    const { username, name, password, confirmPassword, department } = form

    if (!username || !name || !password || !department) {
      setError("All fields are required.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.")
      return
    }

    setLoading(true)
    try {
      const res = await api.post("/auth/register", { username, name, password, department })
      if (res.data.success) {
        nav("/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") register()
  }

  return (
    <div className="app-container">
      <div className="card">

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <img src="/logo.jpg" alt="SATI Logo" style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "contain", marginBottom: "10px", background: "white", padding: "6px" }} />
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "6px" }}>Register as a student</p>
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={set("name")}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Choose a username (e.g. enrollment number)"
            value={form.username}
            onChange={set("username")}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <select
            value={form.department}
            onChange={set("department")}
            disabled={loading}
            style={{
              width: "100%", padding: "13px 16px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px", fontSize: "15px",
              color: form.department ? "white" : "rgba(255,255,255,0.35)",
              fontFamily: "inherit",
            }}
          >
            <option value="" disabled>Select your department</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d} style={{ background: "#1a1a3e", color: "white" }}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Choose a password"
            value={form.password}
            onChange={set("password")}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <button className="btn" onClick={register} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        {error && <p className="error-message">{error}</p>}

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}
