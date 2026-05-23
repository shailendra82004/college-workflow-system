import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

const WORKFLOW_INFO = [
  { type: "Student Simple",   chain: "Student → Coordinator",                  types: "Leave, Lab Access",           color: "#28a745" },
  { type: "Student Medium",   chain: "Student → Coordinator → HOD",            types: "Fee Concession, Certificate",  color: "#fd7e14" },
  { type: "Student Complex",  chain: "Student → Coordinator → HOD → Director", types: "Projects, Equipment",          color: "#dc3545" },
  { type: "Teacher (Coord)",  chain: "Coordinator → HOD → Director",           types: "Projects, Research",           color: "#6f42c1" },
  { type: "Teacher (HOD)",    chain: "HOD → Director",                         types: "All HOD requests",             color: "#0dcaf0" },
]

export default function Dashboard() {

  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0 })
  const nav = useNavigate()

  useEffect(() => {
    let currentUser = null
    api.get("/auth/me")
      .then(res => {
        currentUser = res.data
        setUser(res.data)
        return api.get("/requests")
      })
      .then(res => {
        const reqs = res.data
        // Only count requests pending FOR this user, not their own submitted ones
        const pending = reqs.filter(r =>
          (r.status === "PENDING" || r.status === "ESCALATED") &&
          r.created_by !== currentUser?.id
        ).length
        setStats({ total: reqs.length, pending })
      })
      .catch(() => nav("/"))
  }, [nav])

  const logout = async () => {
    try { await api.post("/auth/logout") } catch {}
    nav("/")
  }

  const role = user?.role
  const isApprover = role === "COORDINATOR" || role === "HOD"
  const isDirector = role === "DIRECTOR"
  const isStudent  = role === "STUDENT"

  /* ── COORDINATOR / HOD layout ── */
  if (isApprover) return (
    <div className="db-page">

      <div className="db-header">
        <button className="db-logout" onClick={logout}>↪ Logout</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
          <img src="/logo.jpg" alt="SATI Logo" style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "contain", background: "white", padding: "4px" }} />
          <div>
            <div className="db-header-title">🎓 Smart Approval Workflow Management System</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", textAlign: "center" }}>Samrat Ashok Technological Institute, Vidisha M.P.</div>
          </div>
        </div>
        <p className="db-header-sub">✨ Streamlined Request Management for Academic Excellence ✨</p>
      </div>

      <div className="db-body">

        {/* Welcome */}
        <div className="db-welcome-card">
          <div className="db-welcome-left">
            <h2>🎉 Welcome, Prof. {user.name || user.username}</h2>
            <div className="db-welcome-meta">
              <span>🏫 {user.department}</span>
              <span>👤 {user.username}</span>
            </div>
          </div>
          <span className="db-role-pill" style={{ background: "linear-gradient(135deg,#11998e,#38ef7d)" }}>★ {role}</span>
        </div>

        {/* Pending stat */}
        <div className="db-stat-card" style={{ textAlign: "center" }}>
          <div className="db-stat-num">{stats.pending}</div>
          <div className="db-stat-label">⚡ Pending Your Approval</div>
        </div>

        {/* 3 action cards */}
        <div className="db-action-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>

          <Link to="/requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue" style={{ fontSize: "20px" }}>✔</div>
            <h3>⚡ Pending Approvals</h3>
            <p>Review student requests as class {role.toLowerCase()} with quick approval tools</p>
          </Link>

          <Link to="/class-requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue" style={{ fontSize: "20px" }}>👥</div>
            <h3>👥 Class Requests</h3>
            <p>Monitor and coordinate requests from your class students</p>
          </Link>

          <Link to="/create" className="db-action-card">
            <div className="db-action-icon db-icon-blue">+</div>
            <h3>📝 Submit Request</h3>
            <p>Create coordination and administrative requests</p>
          </Link>

        </div>

        {/* Approval Workflow info */}
        <div className="db-workflow-card">
          <h3>🔀 Approval Workflow</h3>
          <div className="db-workflow-list">
            {WORKFLOW_INFO.map(w => (
              <div key={w.type} className="db-workflow-row">
                <span className="db-workflow-badge" style={{ background: w.color }}>{w.type}</span>
                <span className="db-workflow-chain">👤 {w.chain}</span>
                <span className="db-workflow-types">📋 {w.types}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )

  /* ── DIRECTOR layout ── */
  if (isDirector) return (
    <div className="db-page">

      <div className="db-header">
        <button className="db-logout" onClick={logout}>↪ Logout</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
          <img src="/logo.jpg" alt="SATI Logo" style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "contain", background: "white", padding: "4px" }} />
          <div>
            <div className="db-header-title">🎓 Smart Approval Workflow Management System</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", textAlign: "center" }}>Samrat Ashok Technological Institute, Vidisha M.P.</div>
          </div>
        </div>
        <p className="db-header-sub">✨ Streamlined Request Management for Academic Excellence ✨</p>
      </div>

      <div className="db-body">

        <div className="db-welcome-card">
          <div className="db-welcome-left">
            <h2>🎉 Welcome, {user.name || user.username}</h2>
            <div className="db-welcome-meta">
              <span>🏫 All Departments</span>
              <span>👤 {user.username}</span>
            </div>
          </div>
          <span className="db-role-pill" style={{ background: "linear-gradient(135deg,#f5576c,#f093fb)" }}>★ DIRECTOR</span>
        </div>

        <div className="db-stat-card" style={{ textAlign: "center" }}>
          <div className="db-stat-num">{stats.pending}</div>
          <div className="db-stat-label">⚡ Pending Your Approval</div>
        </div>

        <div className="db-action-grid">
          <Link to="/requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue" style={{ fontSize: "20px" }}>✔</div>
            <h3>⚡ Pending Approvals</h3>
            <p>Review complex requests from all departments awaiting final approval</p>
          </Link>
          <Link to="/all-departments" className="db-action-card">
            <div className="db-action-icon db-icon-blue" style={{ fontSize: "20px" }}>🏛️</div>
            <h3>🏛️ All Departments</h3>
            <p>View all requests from every department across the institution</p>
          </Link>
        </div>

        <div className="db-workflow-card">
          <h3>🔀 Approval Workflow</h3>
          <div className="db-workflow-list">
            {WORKFLOW_INFO.map(w => (
              <div key={w.type} className="db-workflow-row">
                <span className="db-workflow-badge" style={{ background: w.color }}>{w.type}</span>
                <span className="db-workflow-chain">👤 {w.chain}</span>
                <span className="db-workflow-types">📋 {w.types}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )

  /* ── STUDENT layout (default) ── */
  return (
    <div className="db-page">

      <div className="db-header">
        <button className="db-logout" onClick={logout}>↪ Logout</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
          <img src="/logo.jpg" alt="SATI Logo" style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "contain", background: "white", padding: "4px" }} />
          <div>
            <div className="db-header-title">🎓 Smart Approval Workflow Management System</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", textAlign: "center" }}>Samrat Ashok Technological Institute, Vidisha M.P.</div>
          </div>
        </div>
        <p className="db-header-sub">✨ Streamlined Request Management for Academic Excellence ✨</p>
      </div>

      <div className="db-body">

        <div className="db-welcome-card">
          <div className="db-welcome-left">
            <h2>🎉 Welcome, {user ? (user.name || user.username) : "..."}</h2>
            <div className="db-welcome-meta">
              {user && <span>🏫 {user.department}</span>}
              {user && <span>👤 {user.username}</span>}
            </div>
          </div>
          {user && <span className="db-role-pill">★ {role}</span>}
        </div>

        <div className="db-stats-grid">
          <div className="db-stat-card">
            <div className="db-stat-num">{stats.total}</div>
            <div className="db-stat-label">📋 Total Requests</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-num">{stats.pending}</div>
            <div className="db-stat-label">⏳ Pending/In Progress</div>
          </div>
        </div>

        <div className="db-action-grid">
          <Link to="/create" className="db-action-card">
            <div className="db-action-icon db-icon-blue">+</div>
            <h3>🚀 Submit New Request</h3>
            <p>Create requests for leave, certificates, projects, and more with our smart workflow system</p>
          </Link>
          <Link to="/requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue">☰</div>
            <h3>📋 My Requests</h3>
            <p>Track status and progress of all your submitted requests in real-time</p>
          </Link>
        </div>

        {/* Approval Workflow */}
        <div className="db-workflow-card">
          <h3>🔀 Approval Workflow</h3>
          <div className="db-workflow-list">
            {WORKFLOW_INFO.map(w => (
              <div key={w.type} className="db-workflow-row">
                <span className="db-workflow-badge" style={{ background: w.color }}>{w.type}</span>
                <span className="db-workflow-chain">👤 {w.chain}</span>
                <span className="db-workflow-types">📋 {w.types}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}



