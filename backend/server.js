require("dotenv").config()
const express = require("express")
const session = require("express-session")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const authRoutes = require("./routes/auth")
const requestRoutes = require("./routes/requests")

const app = express()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname,"uploads")
if(!fs.existsSync(uploadsDir)){
 fs.mkdirSync(uploadsDir,{recursive:true})
}

app.use(express.json())

app.use(cors({
 origin:"http://localhost:3000",
 credentials:true
}))

app.use(session({
 secret:process.env.SESSION_SECRET || "workflow-secret",
 resave:false,
 saveUninitialized:false,
 cookie:{
  httpOnly:true,
  sameSite:"strict",
  maxAge:1800000,
  secure:process.env.NODE_ENV === "production"
 }
}))

app.use("/uploads",express.static("uploads"))

app.use("/api/auth",      authRoutes)
app.use("/api/requests", requestRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
 console.log(`Server running on port ${PORT}`)
})