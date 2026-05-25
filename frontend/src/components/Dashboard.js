import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

const WORKFLOW_INFO = [
  { type: "Student Simple",   chain: "Student → Coordinator",                  types: "Leave, Lab Access",           color: "#16a34a" },
  { type: "Student Medium",   chain: "Student → Coordinator → HOD",            types: "Fee Concession, Certificate",  color: "#d97706" },
  { type: "Student Complex",  chain: "Student → Coordinator → HOD → Director", types: "Projects, Equipment",          color: "#dc2626" },
  { type: "Teacher (Coord)",  chain: "Coordinator → HOD → Director",           types: "Projects, Research",           color: "#7c3aed" },
  { type: "Teacher (HOD)",    chain: "HOD → Director",                         types: "All HOD requests",             color: "#0284c7" },
]

const Header = ({ onLogout }) => (
  <div className="db-header">
    <div style={{ width: "100px" }} />
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <img src="/logo.jpg" alt="SATI" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "contain", background: "white", padding: "4px" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Smart Approval Workflow Management System</div>
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Samrat Ashok Technological Institute, Vidisha M.P.</div>
      </div>
    </div>
    <div style={{ width: "100px", display: "flex", justifyContent: "flex-end" }}>
      <button className="db-logout" onClick={onLogout}>Logout</button>
    </div>
  </div>
)

const WorkflowCard = () => (
  <div className="db-workflow-card">
    <h3>Approval Workflow</h3>
    <div className="db-workflow-list">
      {WORKFLOW_INFO.map(w => (
        <div key={w.type} className="db-workflow-row">
          <span className="db-workflow-badge" style={{ background: w.color }}>{w.type}</span>
          <span className="db-workflow-chain">{w.chain}</span>
          <span className="db-workflow-types">{w.types}</span>
        </div>
      ))}
    </div>
  </div>
)

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
        if (currentUser?.role === "STUDENT") {
          const pending = reqs.filter(r => r.status === "PENDING" || r.status === "ESCALATED").length
          setStats({ total: reqs.length, pending })
        } else {
          const pending = reqs.filter(r =>
            (r.status === "PENDING" || r.status === "ESCALATED") && r.created_by !== currentUser?.id
          ).length
          setStats({ total: reqs.length, pending })
        }
      })
      .catch(() => nav("/"))
  }, [])

  const logout = async () => {
    try { await api.post("/auth/logout") } catch {}
    nav("/")
  }

  const role = user?.role
  const isApprover = role === "COORDINATOR" || role === "HOD"
  const isDirector = role === "DIRECTOR"

  if (isApprover) return (
    <div className="db-page">
      <Header onLogout={logout} />
      <div className="db-body">
        <div className="db-welcome-card">
          <div className="db-welcome-left">
            <h2>Welcome, {user.name || user.username}</h2>
            <div className="db-welcome-meta">
              <span>{user.department}</span>
              <span>{user.username}</span>
            </div>
          </div>
          <span className="db-role-pill" style={{ background: "#0284c7" }}>{role}</span>
        </div>
        <div className="db-stat-card" style={{ textAlign: "center" }}>
          <div className="db-stat-num">{stats.pending}</div>
          <div className="db-stat-label">Pending Your Approval</div>
        </div>
        <div className="db-action-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Link to="/requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue">✓</div>
            <h3>Pending Approvals</h3>
            <p>Review and act on requests waiting for your approval</p>
          </Link>
          <Link to="/class-requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue">≡</div>
            <h3>Department Requests</h3>
            <p>Monitor all requests from your department</p>
          </Link>
          <Link to="/create" className="db-action-card">
            <div className="db-action-icon db-icon-blue">+</div>
            <h3>Submit Request</h3>
            <p>Create a new administrative request</p>
          </Link>
        </div>
        <WorkflowCard />
      </div>
    </div>
  )

  if (isDirector) return (
    <div className="db-page">
      <Header onLogout={logout} />
      <div className="db-body">
        <div className="db-welcome-card">
          <div className="db-welcome-left">
            <h2>Welcome, {user.name || user.username}</h2>
            <div className="db-welcome-meta">
              <span>All Departments</span>
              <span>{user.username}</span>
            </div>
          </div>
          <span className="db-role-pill" style={{ background: "#dc2626" }}>DIRECTOR</span>
        </div>
        <div className="db-stat-card" style={{ textAlign: "center" }}>
          <div className="db-stat-num">{stats.pending}</div>
          <div className="db-stat-label">Pending Your Approval</div>
        </div>
        <div className="db-action-grid">
          <Link to="/requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue">✓</div>
            <h3>Pending Approvals</h3>
            <p>Review complex requests awaiting final approval</p>
          </Link>
          <Link to="/all-departments" className="db-action-card">
            <div className="db-action-icon db-icon-blue">⊞</div>
            <h3>All Departments</h3>
            <p>View all requests across every department</p>
          </Link>
        </div>
        <WorkflowCard />
      </div>
    </div>
  )

  return (
    <div className="db-page">
      <Header onLogout={logout} />
      <div className="db-body">
        <div className="db-welcome-card">
          <div className="db-welcome-left">
            <h2>Welcome, {user ? (user.name || user.username) : "..."}</h2>
            <div className="db-welcome-meta">
              {user && <span>{user.department}</span>}
              {user && <span>{user.username}</span>}
            </div>
          </div>
          {user && <span className="db-role-pill" style={{ background: "#4f46e5" }}>{role}</span>}
        </div>
        <div className="db-stats-grid">
          <div className="db-stat-card">
            <div className="db-stat-num">{stats.total}</div>
            <div className="db-stat-label">Total Requests</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-num">{stats.pending}</div>
            <div className="db-stat-label">Pending / In Progress</div>
          </div>
        </div>
        <div className="db-action-grid">
          <Link to="/create" className="db-action-card">
            <div className="db-action-icon db-icon-blue">+</div>
            <h3>Submit New Request</h3>
            <p>Create requests for leave, certificates, projects, and more</p>
          </Link>
          <Link to="/requests" className="db-action-card">
            <div className="db-action-icon db-icon-blue">≡</div>
            <h3>My Requests</h3>
            <p>Track the status of all your submitted requests</p>
          </Link>
        </div>
        <WorkflowCard />
      </div>
    </div>
  )
}
