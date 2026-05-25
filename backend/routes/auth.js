const router = require("express").Router()
const bcrypt = require("bcrypt")
const { query } = require("../db")

router.post("/register", async (req, res) => {
  const { username, name, password, department } = req.body

  if (!username || !name || !password || !department) {
    return res.status(400).json({ error: "All fields are required" })
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" })
  }

  try {
    // check if username already taken
    const existing = await query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    )
    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already taken" })
    }

    const hashed = await bcrypt.hash(password, 10)

    const result = await query(
      "INSERT INTO users (username, name, password, role, department) VALUES (?, ?, ?, 'STUDENT', ?)",
      [username, name, hashed, department]
    )

    req.session.user = {
      id: result.insertId,
      username,
      name,
      role: "STUDENT",
      department,
    }

    return res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Registration failed" })
  }
})

router.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    const rows = await query(
      "SELECT id, username, name, password, role, department FROM users WHERE username = ?",
      [username]
    )

    const user = rows[0]

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
    }

    return res.json({ success: true })
  } catch (err) {
    return res.status(401).json({ error: "Invalid credentials" })
  }
})

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid")
    return res.json({ success: true })
  })
})

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" })
  }
  return res.json(req.session.user)
})

module.exports = router
