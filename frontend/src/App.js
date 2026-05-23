import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./App.css"

import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import CreateRequest from "./components/CreateRequest"
import Requests from "./components/Requests"
import RequestDetail from "./components/RequestDetail"
import ClassRequests from "./components/ClassRequests"
import AllDepartments from "./components/AllDepartments"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateRequest />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/class-requests" element={<ClassRequests />} />
        <Route path="/all-departments" element={<AllDepartments />} />
      </Routes>
    </BrowserRouter>
  )

}

export default App
