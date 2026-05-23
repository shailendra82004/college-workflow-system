const router = require('express').Router()
const auth = require('../middleware/auth')
const requireRole = require('../middleware/role')
const upload = require('../middleware/upload')
const { query } = require('../db')
const { WORKFLOW_MAP, COORDINATOR_WORKFLOW_MAP, HOD_WORKFLOW_MAP, getWorkflowMap } = require('../config/workflow')

// All valid types = union of all maps
const VALID_TYPES = [...new Set([
  ...Object.keys(WORKFLOW_MAP),
  ...Object.keys(COORDINATOR_WORKFLOW_MAP),
  ...Object.keys(HOD_WORKFLOW_MAP),
])]

// ─── Task 4.1: POST /api/requests (STUDENT only) ────────────────────────────

router.post(
  '/',
  auth,
  requireRole('STUDENT', 'COORDINATOR', 'HOD', 'DIRECTOR'),
  upload.single('document'),
  async (req, res) => {
    const { title, description, type } = req.body

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({ error: 'title, description, and type are required' })
    }

    // Validate type enum
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`,
      })
    }

    try {
      const document = req.file ? req.file.filename : null
      const { role, department, id: created_by } = req.user

      const map = getWorkflowMap(role)

      if (!map[type]) {
        return res.status(400).json({ error: `Request type '${type}' is not available for your role` })
      }

      const startingRole = map[type][0]

      const result = await query(
        `INSERT INTO requests (title, description, type, status, current_role, department, document, created_by)
         VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?)`,
        [title, description, type, startingRole, department, document, created_by]
      )

      const [created] = await query(
        `SELECT r.*, u.username AS created_by_username
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.id = ?`,
        [result.insertId]
      )

      res.status(201).json(created)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// ─── GET /api/requests/all-departments — DIRECTOR sees ALL requests from all depts ──

router.get('/all-departments', auth, requireRole('DIRECTOR'), async (req, res) => {
  try {
    const rows = await query(
      `SELECT r.*, u.username AS created_by_username, COALESCE(u.name, u.username) AS created_by_name
       FROM requests r
       JOIN users u ON u.id = r.created_by
       ORDER BY r.department, r.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /api/requests/department — HOD & COORDINATOR see ALL requests in their dept ──

router.get('/department', auth, requireRole('HOD', 'COORDINATOR'), async (req, res) => {
  try {
    const rows = await query(
      `SELECT r.*, u.username AS created_by_username, COALESCE(u.name, u.username) AS created_by_name
       FROM requests r
       JOIN users u ON u.id = r.created_by
       WHERE r.department = ?
       ORDER BY r.created_at DESC`,
      [req.user.department]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── Task 4.2: GET /api/requests (role-based filtering) ─────────────────────

router.get('/', auth, async (req, res) => {
  const { role, department, id: userId } = req.user

  try {
    let rows

    if (role === 'STUDENT') {
      rows = await query(
        `SELECT r.*, u.username AS created_by_username
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.created_by = ?`,
        [userId]
      )
    } else if (role === 'COORDINATOR') {
      // Pending approvals waiting for coordinator + their own submitted requests
      rows = await query(
        `SELECT r.*, u.username AS created_by_username, COALESCE(u.name, u.username) AS created_by_name
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.department = ?
           AND (
             (r.current_role = 'COORDINATOR' AND r.status IN ('PENDING', 'ESCALATED'))
             OR r.created_by = ?
           )`,
        [department, userId]
      )
    } else if (role === 'HOD') {
      // Pending approvals waiting for HOD + their own submitted requests
      rows = await query(
        `SELECT r.*, u.username AS created_by_username, COALESCE(u.name, u.username) AS created_by_name
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.department = ?
           AND (
             (r.current_role = 'HOD' AND r.status IN ('PENDING', 'ESCALATED'))
             OR r.created_by = ?
           )`,
        [department, userId]
      )
    } else if (role === 'DIRECTOR') {
      rows = await query(
        `SELECT r.*, u.username AS created_by_username, COALESCE(u.name, u.username) AS created_by_name
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.current_role = 'DIRECTOR'
           AND r.status IN ('PENDING', 'ESCALATED')`
      )
    } else {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── Task 6.1: GET /api/requests/:id ────────────────────────────────────────

router.get('/:id', auth, async (req, res) => {
  try {
    const [request] = await query(
      `SELECT r.*,
        u.username AS created_by_username,
        u.role AS created_by_role
       FROM requests r
       JOIN users u ON u.id = r.created_by
       WHERE r.id = ?`,
      [req.params.id]
    )

    if (!request) {
      return res.status(404).json({ error: 'Not found' })
    }

    // Visibility rules
    const { role, department, id: userId } = req.user
    if (role === 'STUDENT' && request.created_by !== userId) {
      return res.status(404).json({ error: 'Not found' })
    }
    if ((role === 'COORDINATOR' || role === 'HOD') && request.department !== department) {
      return res.status(404).json({ error: 'Not found' })
    }
    // DIRECTOR can see any request

    const history = await query(
      `SELECT ah.*, COALESCE(u.name, u.username) AS actor_name
       FROM approval_history ah
       JOIN users u ON u.id = ah.actor_id
       WHERE ah.request_id = ?
       ORDER BY ah.created_at ASC`,
      [request.id]
    )

    res.json({ ...request, approval_history: history })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── Task 6.2: POST /api/requests/:id/approve ───────────────────────────────

router.post(
  '/:id/approve',
  auth,
  requireRole('COORDINATOR', 'HOD', 'DIRECTOR'),
  async (req, res) => {
    try {
      const [request] = await query(
        `SELECT r.*, u.role AS created_by_role
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.id = ?`,
        [req.params.id]
      )

      if (!request) {
        return res.status(404).json({ error: 'Not found' })
      }

      // Department check inline (mirrors department middleware)
      req.requestDept = request.department
      const { role, department } = req.user
      if ((role === 'COORDINATOR' || role === 'HOD') && request.department !== department) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      if (request.status === 'APPROVED' || request.status === 'REJECTED') {
        return res.status(400).json({ error: 'Request is already finalised' })
      }

      // Cannot approve your own request
      if (request.created_by === req.user.id) {
        return res.status(403).json({ error: 'You cannot approve your own request' })
      }

      // Turn check
      if (req.user.role !== request.current_role) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      // Pick the correct workflow map based on who submitted the request
      const chain = getWorkflowMap(request.created_by_role)[request.type]
      const currentIndex = chain.indexOf(request.current_role)
      const nextRole = chain[currentIndex + 1] || null
      const { comment } = req.body

      if (nextRole) {
        await query(
          `UPDATE requests SET current_role = ?, status = 'ESCALATED' WHERE id = ?`,
          [nextRole, request.id]
        )
        await query(
          `INSERT INTO approval_history (request_id, actor_id, actor_role, action, comment)
           VALUES (?, ?, ?, 'ESCALATED', ?)`,
          [request.id, req.user.id, req.user.role, comment || null]
        )
      } else {
        await query(
          `UPDATE requests SET status = 'APPROVED' WHERE id = ?`,
          [request.id]
        )
        await query(
          `INSERT INTO approval_history (request_id, actor_id, actor_role, action, comment)
           VALUES (?, ?, ?, 'APPROVED', ?)`,
          [request.id, req.user.id, req.user.role, comment || null]
        )
      }

      const [updated] = await query(
        `SELECT r.*, u.username AS created_by_username, COALESCE(u.name, u.username) AS created_by_name
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.id = ?`,
        [request.id]
      )

      res.json(updated)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

//  POST /api/requests/:id/reject 

router.post(
  '/:id/reject',
  auth,
  requireRole('COORDINATOR', 'HOD', 'DIRECTOR'),
  async (req, res) => {
    try {
      const [request] = await query('SELECT * FROM requests WHERE id = ?', [req.params.id])

      if (!request) {
        return res.status(404).json({ error: 'Not found' })
      }

      // Department check inline
      const { role, department } = req.user
      if ((role === 'COORDINATOR' || role === 'HOD') && request.department !== department) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      if (request.status === 'APPROVED' || request.status === 'REJECTED') {
        return res.status(400).json({ error: 'Request is already finalised' })
      }

      // Turn check
      if (req.user.role !== request.current_role) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      await query(
        `UPDATE requests SET status = 'REJECTED' WHERE id = ?`,
        [request.id]
      )
      await query(
        `INSERT INTO approval_history (request_id, actor_id, actor_role, action, comment)
         VALUES (?, ?, ?, 'REJECTED', ?)`,
        [request.id, req.user.id, req.user.role, req.body.comment || null]
      )

      const [updated] = await query(
        `SELECT r.*, u.username AS created_by_username, COALESCE(u.name, u.username) AS created_by_name
         FROM requests r
         JOIN users u ON u.id = r.created_by
         WHERE r.id = ?`,
        [request.id]
      )

      res.json(updated)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

module.exports = router
