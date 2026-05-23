import React, { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"

const WORKFLOW_MAP = {
  LEAVE:            ['COORDINATOR'],
  LAB_ACCESS:       ['COORDINATOR'],
  ASSIGNMENT_EXT:   ['COORDINATOR'],
  LIBRARY_EXT:      ['COORDINATOR'],
  FEE_CONCESSION:   ['COORDINATOR', 'HOD'],
  CERTIFICATE:      ['COORDINATOR', 'HOD'],
  SCHOLARSHIP:      ['COORDINATOR', 'HOD'],
  COURSE_CHANGE:    ['COORDINATOR', 'HOD'],
  EXAM_REEVAL:      ['COORDINATOR', 'HOD'],
  PROJECT:          ['COORDINATOR', 'HOD', 'DIRECTOR'],
  EQUIPMENT:        ['COORDINATOR', 'HOD', 'DIRECTOR'],
  RESEARCH:         ['COORDINATOR', 'HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['COORDINATOR', 'HOD', 'DIRECTOR'],
  OTHER:            ['COORDINATOR', 'HOD', 'DIRECTOR'],
}

const COORDINATOR_WORKFLOW_MAP = {
  LEAVE:            ['HOD'],
  LAB_ACCESS:       ['HOD'],
  EQUIPMENT:        ['HOD', 'DIRECTOR'],
  COURSE_CHANGE:    ['HOD', 'DIRECTOR'],
  CERTIFICATE:      ['HOD', 'DIRECTOR'],
  RESEARCH:         ['HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['HOD', 'DIRECTOR'],
  PROJECT:          ['HOD', 'DIRECTOR'],
  OTHER:            ['HOD', 'DIRECTOR'],
}

const HOD_WORKFLOW_MAP = {
  LEAVE:            ['DIRECTOR'],
  LAB_ACCESS:       ['DIRECTOR'],
  EQUIPMENT:        ['DIRECTOR'],
  COURSE_CHANGE:    ['DIRECTOR'],
  CERTIFICATE:      ['DIRECTOR'],
  RESEARCH:         ['DIRECTOR'],
  INDUSTRIAL_VISIT: ['DIRECTOR'],
  PROJECT:          ['DIRECTOR'],
  OTHER:            ['DIRECTOR'],
}

// Pick the right map based on who submitted the request
function getChain(request) {
  if (request.created_by_role === 'COORDINATOR') return COORDINATOR_WORKFLOW_MAP[request.type] || []
  if (request.created_by_role === 'HOD')         return HOD_WORKFLOW_MAP[request.type] || []
  return WORKFLOW_MAP[request.type] || []
}

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

function formatDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false
  })
}

function CommentModal({ title, subtitle, confirmLabel, confirmClass, onConfirm, onCancel }) {
  const [comment, setComment] = useState("")
  return (
    <div className="rd-modal-overlay">
      <div className="rd-modal">
        <h3 className="rd-modal-title">{title}</h3>
        <p className="rd-modal-sub">{subtitle}</p>
        <textarea
          className="rd-modal-textarea"
          placeholder="Enter your reason / comment here..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          autoFocus
        />
        <div className="rd-modal-actions">
          <button className="rd-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className={`rd-modal-confirm ${confirmClass}`} onClick={() => onConfirm(comment)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function displayStatus(status) {
  return status === "ESCALATED" ? "PENDING" : status
}

function displayStatusClass(status) {
  return status === "ESCALATED" ? "pending" : status?.toLowerCase()
}

export default function RequestDetail() {
  const { id } = useParams()
  const nav    = useNavigate()

  const [request, setRequest]             = useState(null)
  const [user, setUser]                   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState("")
  const [modal, setModal]                 = useState(null) // { type: 'approve'|'reject' }

  const fetchRequest = useCallback(() =>
    api.get(`/requests/${id}`).then(res => setRequest(res.data))
  , [id])

  useEffect(() => {
    Promise.all([
      api.get("/auth/me").then(res => setUser(res.data)).catch(() => nav("/")),
      fetchRequest(),
    ]).finally(() => setLoading(false))
  }, [fetchRequest, nav])

  const handleApprove = async (comment) => {
    setModal(null)
    setActionLoading(true)
    try { await api.post(`/requests/${id}/approve`, { comment }); await fetchRequest() }
    catch (err) { setError(err.response?.data?.error || "Failed to approve.") }
    finally { setActionLoading(false) }
  }

  const handleReject = async (comment) => {
    if (!comment?.trim()) { setError("A rejection reason is required."); return }
    setModal(null)
    setActionLoading(true)
    try { await api.post(`/requests/${id}/reject`, { comment }); await fetchRequest() }
    catch (err) { setError(err.response?.data?.error || "Failed to reject.") }
    finally { setActionLoading(false) }
  }

  const canAct = () => {
    if (!user || !request) return false
    if (!["COORDINATOR","HOD","DIRECTOR"].includes(user.role)) return false
    if (!["PENDING","ESCALATED"].includes(request.status)) return false
    // Cannot approve your own request
    if (request.created_by === user.id) return false
    return request.current_role === user.role
  }

  if (loading) return <div className="rd-page"><div className="rd-loading">Loading...</div></div>

  if (!request) return (
    <div className="rd-page">
      <div className="rd-loading">{error || "Request not found."}</div>
    </div>
  )

  const history = request.approval_history || []

  return (
    <div className="rd-page">

      {/* Top bar */}
      <div className="rd-topbar">
        <div className="rd-topbar-title">📄 Request Details</div>
        <button className="rd-back-btn" onClick={() => nav(-1)}>← Back</button>
      </div>

      <div className="rd-content">

        {/* Request title */}
        <div className="rd-title-row">
          <h2>{TYPE_LABELS[request.type] || request.type}</h2>
          <span className="rd-id">#{request.id}</span>
        </div>

        {error && <div className="rd-error">{error}</div>}

        {/* Two info cards */}
        <div className="rd-info-grid">

          {/* Request Information */}
          <div className="rd-info-card">
            <div className="rd-card-heading">📋 Request Information</div>
            <div className="rd-info-row">
              <span>Type</span>
              <span>{TYPE_LABELS[request.type] || request.type}</span>
            </div>
            <div className="rd-info-row">
              <span>Department</span>
              <span>{request.department}</span>
            </div>
            <div className="rd-info-row">
              <span>Priority</span>
              <span className={`rd-badge rd-priority-${request.priority?.toLowerCase()}`}>
                {request.priority || "MEDIUM"}
              </span>
            </div>
            <div className="rd-info-row">
              <span>Status</span>
              <span className={`rd-badge rd-status-${displayStatusClass(request.status)}`}>
                {displayStatus(request.status)}
              </span>
            </div>
          </div>

          {/* Workflow Information */}
          <div className="rd-info-card">
            <div className="rd-card-heading">📊 Workflow Information</div>
            <div className="rd-info-row">
              <span>Submitted By</span>
              <span>{request.created_by_name || request.created_by_username}</span>
            </div>
            <div className="rd-info-row">
              <span>Current Approver</span>
              <span>{request.current_role?.toLowerCase().replace("_"," ") || "—"}</span>
            </div>
            <div className="rd-info-row">
              <span>Final Approver</span>
              <span><strong>{getChain(request).slice(-1)[0] || "—"}</strong></span>
            </div>
            <div className="rd-info-row">
              <span>Workflow</span>
              <span className="rd-workflow-chain">
                {getChain(request).map((role, i) => (
                  <span
                    key={role}
                    className={`rd-chain-step ${role === request.current_role && request.status !== 'APPROVED' && request.status !== 'REJECTED' ? 'rd-chain-active' : ''}`}
                  >
                    {i > 0 && <span className="rd-chain-arrow">→</span>}
                    {role}
                  </span>
                ))}
              </span>
            </div>
            <div className="rd-info-row">
              <span>Created</span>
              <span>{formatDate(request.created_at)}</span>
            </div>
          </div>

        </div>

        {/* Request Details */}
        <div className="rd-info-card" style={{marginTop:"16px"}}>
          <div className="rd-card-heading">📄 Request Details</div>
          <p className="rd-description">{request.description}</p>
          {request.document && (
            <a
              href={`http://localhost:5000/uploads/${request.document}`}
              className="rd-doc-link"
              target="_blank" rel="noopener noreferrer"
            >
              📎 Download Attached Document
            </a>
          )}
        </div>

        {/* Approve / Reject */}
        {canAct() && (
          <div className="rd-actions">
            <button className="rd-btn-approve" onClick={() => setModal("approve")} disabled={actionLoading}>
              ✅ Approve Request
            </button>
            <button className="rd-btn-reject" onClick={() => setModal("reject")} disabled={actionLoading}>
              ❌ Reject Request
            </button>
          </div>
        )}

        {modal === "approve" && (
          <CommentModal
            title="✅ Approve Request"
            subtitle="You can add a comment explaining why you are approving this request."
            confirmLabel="Confirm Approve"
            confirmClass="rd-modal-approve"
            onConfirm={handleApprove}
            onCancel={() => setModal(null)}
          />
        )}

        {modal === "reject" && (
          <CommentModal
            title="❌ Reject Request"
            subtitle="Please provide a reason for rejecting this request."
            confirmLabel="Confirm Reject"
            confirmClass="rd-modal-reject"
            onConfirm={handleReject}
            onCancel={() => setModal(null)}
          />
        )}

        {/* Approval History Timeline */}
        <div className="rd-info-card" style={{marginTop:"16px"}}>
          <div className="rd-card-heading">📋 Approval History</div>
          {history.length === 0 ? (
            <p className="rd-no-history">No actions taken yet.</p>
          ) : (
            <div className="rd-timeline">
              {history.map((entry, i) => (
                <div key={i} className="rd-timeline-item">
                  <div className={`rd-timeline-dot rd-dot-${entry.action?.toLowerCase()}`} />
                  <div className="rd-timeline-body">
                    <div className="rd-timeline-top">
                      <strong>{entry.actor_name}</strong>
                      <span className="rd-timeline-role">{entry.actor_role}</span>
                      <span className={`rd-badge rd-action-${entry.action?.toLowerCase()}`}>
                        {entry.action}
                      </span>
                    </div>
                    {entry.comment && <p className="rd-timeline-comment">"{entry.comment}"</p>}
                    <p className="rd-timeline-time">{formatDate(entry.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
