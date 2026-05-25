import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
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

const DEPARTMENTS = ["CSE", "ECE", "MECH", "CIVIL", "EE", "IT"]

function displayStatus(s) { return s === "ESCALATED" ? "PENDING" : s }
function displayStatusClass(s) { return s === "ESCALATED" ? "pending" : s?.toLowerCase() }

function formatDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default function AllDepartments() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeDept, setActiveDept] = useState("ALL")

  useEffect(() => {
    api.get("/requests/all-departments")
      .then(res => { setRequests(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = activeDept === "ALL"
    ? requests
    : requests.filter(r => r.department === activeDept)

  return (
    <div className="pa-page">

      {/* Back button */}
      <div className="pa-topbar">
        <Link to="/dashboard" className="pa-back-btn">Back to Dashboard</Link>
      </div>

      {/* Header card */}
      <div className="pa-header">
        <div>
          <h1>Department Requests</h1>
          <p>All requests across all departments</p>
        </div>
        <Link to="/dashboard" className="pa-dash-btn">Dashboard</Link>
      </div>

      {/* Department filter tabs */}
      <div className="ad-tabs">
        {["ALL", ...DEPARTMENTS].map(dept => (
          <button
            key={dept}
            onClick={() => setActiveDept(dept)}
            className={`ad-tab ${activeDept === dept ? "ad-tab-active" : ""}`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="pa-body">
        {loading ? (
          <div className="pa-empty">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="pa-empty">No requests found.</div>
        ) : (
          <div className="pa-table-wrap">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TYPE</th>
                  <th>DEPT</th>
                  <th>SUBMITTED BY</th>
                  <th>STATUS</th>
                  <th>CURRENT APPROVER</th>
                  <th>CREATED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{TYPE_LABELS[r.type] || r.type}</td>
                    <td>
                      <span className="ad-dept-badge">{r.department}</span>
                    </td>
                    <td>{r.created_by_name || r.created_by_username}</td>
                    .
                      


                    <td>
                      <span className={`pa-status pa-status-${displayStatusClass(r.status)}`}>
                        {displayStatus(r.status)}
                      </span>
                    </td>
                    <td style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                      {r.current_role?.toLowerCase().replace("_", " ") || "—"}
                    </td>
                    <td>{formatDate(r.created_at)}</td>
                    <td>
                      <Link to={`/requests/${r.id}`} className="pa-btn-view">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
