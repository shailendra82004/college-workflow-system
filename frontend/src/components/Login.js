import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const nav = useNavigate()

  const clearError = () => { if (error) setError("") }

  const login = async () => {
    if (!username || !password) {
      setError("Invalid username or password. Please try again.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/login", { username, password })
      if (res.data.success) nav("/dashboard")
    } catch {
      setError("Invalid username or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") login()
  }

  return (
    <div className="app-container">
      <div className="card">

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <img src="/logo.jpg" alt="SATI Logo" style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "contain", marginBottom: "10px", background: "white", padding: "4px" }} />
          <div style={{ fontSize: "13px", color: "#334155", fontWeight: 600 }}>Samrat Ashok Technological Institute</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>Vidisha, M.P.</div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>Smart Approval Workflow</h2>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>Sign in to your account</p>
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => { setUsername(e.target.value); clearError() }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => { setPassword(e.target.value); clearError() }}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
        </div>

        <button className="btn" onClick={login} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {error && <p className="error-message">{error}</p>}

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
          New student?{" "}
          <Link to="/register" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Create an account</Link>
        </p>

      </div>
    </div>
  )
}
