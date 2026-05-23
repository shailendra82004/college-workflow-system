import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

const TYPE_LABELS = {
  LEAVE:            "Leave Request",
  LAB_ACCESS:       "Lab Access Request",
  ASSIGNMENT_EXT:   "Assignment Extension",
  LIBRARY_EXT:      "Library Book Extension",
  FEE_CONCESSION:   "Fee Concession",
  CERTIFICATE:      "Transfer Certificate",
  SCHOLARSHIP:      "Scholarship Application",
  COURSE_CHANGE:    "Course Change Request",
  EXAM_REEVAL:      "Exam Re-evaluation",
  PROJECT:          "Project Approval",
  EQUIPMENT:        "Equipment Purchase",
  RESEARCH:         "Research Proposal",
  INDUSTRIAL_VISIT: "Industrial Visit",
  OTHER:            "Other",
}


function displayStatus(s) { return s === "ESCALATED" ? "PENDING" : s }
function displayStatusClass(s) { return s === "ESCALATED" ? "pending" : s?.toLowerCase() }

function formatDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default function Requests() {
  const [user, setUser]               = useState(null)
  const [requests, setRequests]       = useState([])
  const [myRequests, setMyRequests]   = useState([])
  const [loading, setLoading]         = useState(true)
  const nav = useNavigate()

  const load = (currentUser) => {
    api.get("/requests")
      .then(res => {
        const all = res.data
        // For approvers: split into pending-for-them vs their own submitted
        if (currentUser && ["COORDINATOR","HOD","DIRECTOR"].includes(currentUser.role)) {
          const pendingForMe = all.filter(r =>
            r.current_role === currentUser.role &&
            (r.status === "PENDING" || r.status === "ESCALATED") &&
            r.created_by !== currentUser.id
          )
          const mine = all.filter(r => r.created_by === currentUser.id)
          setRequests(pendingForMe)
          setMyRequests(mine)
        } else {
          setRequests(all)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    api.get("/auth/me")
      .then(res => { setUser(res.data); load(res.data) })
      .catch(() => nav("/"))
  }, [])

  const quickApprove = async (id) => {
    try {
      await api.post(`/requests/${id}/approve`, { comment: "Quick approved" })
      load(user)
    } catch (err) {
      alert(err.response?.data?.error || "Error")
    }
  }

  const quickReject = async (id) => {
    const comment = window.prompt("Reason for rejection (optional):") ?? ""
    try {
      await api.post(`/requests/${id}/reject`, { comment })
      load(user)
    } catch (err) {
      alert(err.response?.data?.error || "Error")
    }
  }

  const isApprover = user && ["COORDINATOR", "HOD", "DIRECTOR"].includes(user.role)

  /* ── APPROVER TABLE VIEW ─────────────────────────────── */
  if (isApprover) {
    return (
      <div className="pa-page">
        <div className="pa-topbar">
          <Link to="/dashboard" className="pa-back-btn">Back to Dashboard</Link>
        </div>
        <div className="pa-header">
          <div>
            <h1>Pending Approvals</h1>
            <p>Approver: <strong>{user.name || user.username}</strong> ({user.role} - {user.department})</p>
          </div>
          <Link to="/dashboard" className="pa-dash-btn">Dashboard</Link>
        </div>

        <div className="pa-body">
          {loading ? (
            <div className="pa-empty">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="pa-empty">No pending approvals right now.</div>
          ) : (
            <div className="pa-table-wrap">
              <table className="pa-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>TYPE</th>
                    <th>DEPARTMENT</th>
                    <th>SUBMITTED BY</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{TYPE_LABELS[r.type] || r.type}</td>
                      <td>{r.department}</td>
                      <td>{r.created_by_name || r.created_by_username}</td>
                      <td>
                        <span className={`pa-status pa-status-${displayStatusClass(r.status)}`}>{displayStatus(r.status)}</span>
                      </td>
                      <td>{formatDate(r.created_at)}</td>
                      <td>
                        <div className="pa-actions">
                          <div className="pa-row1">
                            <Link to={`/requests/${r.id}`} className="pa-btn-view">View</Link>
                            <button className="pa-btn-approve" onClick={() => quickApprove(r.id)}>Quick Approve</button>
                          </div>
                          <button className="pa-btn-reject" onClick={() => quickReject(r.id)}>Quick Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* My submitted requests section */}
          {myRequests.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <div className="rh-section-title">My Submitted Requests</div>
              {myRequests.map(r => (
                <div key={r.id} className="rh-card">
                  <div className="rh-card-top">
                    <div>
                      <div className="rh-card-title">{r.title || TYPE_LABELS[r.type] || r.type}</div>
                      <div className="rh-card-id">ID: #{r.id}</div>
                    </div>
                    <span className={`rh-status rh-status-${displayStatusClass(r.status)}`}>{displayStatus(r.status)}</span>
                  </div>
                  <div className="rh-meta-row">
                    <div className="rh-meta-item">Department: {r.department}</div>
                    <div className="rh-meta-item">Submitted: {formatDate(r.created_at)}</div>
                    <div className="rh-meta-item">Current Approver: {r.current_role || "—"}</div>
                  </div>
                  <div className="rh-card-footer">
                    <Link to={`/requests/${r.id}`} className="rh-view-btn">View Details</Link>
                    <span className="rh-awaiting">
                      {r.status === "APPROVED" ? "Approved" :
                       r.status === "REJECTED" ? "Rejected" :
                       `Awaiting ${r.current_role || "approval"}...`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── STUDENT CARD VIEW ───────────────────────────────── */
  return (
    <div className="rh-page">
      <div className="rh-header">
        <h1>Request History</h1>
        <p>Track the status and progress of all your submitted requests</p>
        <Link to="/dashboard" className="rh-back-btn">Dashboard</Link>
      </div>

      <div className="rh-body">
        <div className="rh-section-title">All Requests</div>

        {loading ? (
          <div className="rh-empty">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="rh-empty">
            <p>No requests found.</p>
            <Link to="/create" className="rh-create-btn">+ Submit New Request</Link>
          </div>
        ) : (
          requests.map(r => (
            <div key={r.id} className="rh-card">
              <div className="rh-card-top">
                <div>
                  <div className="rh-card-title">{r.title || TYPE_LABELS[r.type] || r.type}</div>
                  <div className="rh-card-id">ID: #{r.id}</div>
                </div>
                <span className={`rh-status rh-status-${displayStatusClass(r.status)}`}>{displayStatus(r.status)}</span>
              </div>
              <div className="rh-meta-row">
                <div className="rh-meta-item">Department: {r.department}</div>
                <div className="rh-meta-item">Submitted: {formatDate(r.created_at)}</div>
                <div className="rh-meta-item">Current Approver: {r.current_role || "—"}</div>
              </div>
              {r.description && (
                <div className="rh-desc"><strong>Details:</strong> {r.description}</div>
              )}
              <div className="rh-card-footer">
                <Link to={`/requests/${r.id}`} className="rh-view-btn">View Details</Link>
                <span className="rh-awaiting">
                  {r.status === "APPROVED" ? "Approved" :
                   r.status === "REJECTED" ? "Rejected" :
                   `Awaiting ${r.current_role || "approval"}...`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
