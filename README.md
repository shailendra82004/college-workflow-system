# Smart Approval Workflow Management System

A full-stack web application for managing student and staff requests through a role-based multi-level approval workflow, built for Samrat Ashok Technological Institute (SATI), Vidisha M.P.

**Stack:** React.js (frontend) + Node.js/Express.js (backend) + MySQL (database)

---

## Setup

### Prerequisites
- Node.js
- MySQL 8.0

### Database Setup

```bash
cmd /c ""C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p1234 college_workflow < backend/db/schema.sql"
```

Or run `backend/db/schema.sql` manually in MySQL Workbench against a fresh `college_workflow` database.

### Backend

```bash
cd backend
npm install
cp .env.example .env   # update DB credentials
npm start              # runs on port 5000
```

### Frontend

```bash
cd frontend
npm install
npm start              # runs on port 3000
```

---

## Default Login Credentials

All passwords are `123`.

### Students
| Username | Name | Department |
|---|---|---|
| 0108CS231001 | Shivam Patel | CSE |
| 0108EC231001 | Vedant Soni | ECE |
| 0108ME231001 | Shailender Rajoliya | MECH |
| 0108CE231001 | Prajjwal Mandloi | CIVIL |
| 0108EE231001 | Pranav Mahajan | EEE |
| 0108IT231001 | Toshima Rahangdale | IT |

### Coordinators
| Username | Name | Department |
|---|---|---|
| coordinator_cse | Dr. Divya Rishi Sahu | CSE |
| coordinator_ece | Asst. Prof. Satish Pawar | ECE |
| coordinator_mech | Asst. Prof. Ruchi Thakur | MECH |
| coordinator_civil | Asst. Prof. Garima Jain | CIVIL |
| coordinator_eee | Asst. Prof. Nupur Modh | EEE |
| coordinator_it | Asst. Prof. Mukesh Azad | IT |

### HODs
| Username | Name | Department |
|---|---|---|
| hod_cse | Dr. Kanak Saxena | CSE |
| hod_ece | Dr. Ashutosh Datar | ECE |
| hod_mech | Dr. Pankaj Agarwal | MECH |
| hod_civil | Dr. Rajeev Jain | CIVIL |
| hod_eee | Prof. C. S. Sharma | EEE |
| hod_it | Dr. Shailendra Kumar Shrivastava | IT |

### Director
| Username | Name |
|---|---|
| director | Dr. Y. K. Jain |

---

## Roles & Permissions

| Role | Can Submit | Can Approve | Sees |
|---|---|---|---|
| STUDENT | Yes (student request types) | No | Own requests only |
| COORDINATOR | Yes (coordinator request types) | Yes — Step 1 for student requests | Pending approvals + own submitted requests |
| HOD | Yes (HOD request types) | Yes — Step 2 for student requests, Step 1 for coordinator requests | Pending approvals + own submitted + full dept view |
| DIRECTOR | No | Yes — Final step for all complex requests | All departments, all pending requests |

---

## Approval Workflows

### Student Requests
| Type | Workflow |
|---|---|
| Leave, Lab Access, Assignment Extension, Library Extension | Coordinator only |
| Fee Concession, Certificate, Scholarship, Course Change, Exam Re-evaluation | Coordinator → HOD |
| Project, Equipment, Research, Industrial Visit, Other | Coordinator → HOD → Director |

### Coordinator Requests
| Type | Workflow |
|---|---|
| Leave, Lab Access | HOD only |
| Equipment, Course Change, Certificate, Research, Industrial Visit, Project, Other | HOD → Director |

### HOD Requests
| Type | Workflow |
|---|---|
| All types | Director only |

---

## Features

- Session-based authentication with bcrypt password hashing
- Role-aware dashboards — Student / Coordinator / HOD / Director each see a different layout
- Separate request type dropdowns for students, coordinators, and HODs
- Quick Approve / Quick Reject from pending approvals table
- Approve/Reject modal with comment input
- Approval history timeline on every request detail page
- Department Requests monitoring view for Coordinator & HOD
- All Departments view with department filter tabs for Director
- ESCALATED status displays as PENDING in UI
- File attachment support on requests
- Self-approval prevention — users cannot approve their own requests
- Department isolation — coordinators and HODs can only act on their own department

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current session user |

### Requests
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/requests | Submit a new request |
| GET | /api/requests | Get role-based request list |
| GET | /api/requests/department | All dept requests (Coordinator/HOD) |
| GET | /api/requests/all-departments | All requests (Director only) |
| GET | /api/requests/:id | Single request with approval history |
| POST | /api/requests/:id/approve | Approve a request |
| POST | /api/requests/:id/reject | Reject a request |

---

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── workflow.js        # Approval chain configuration
│   ├── db/
│   │   └── schema.sql         # Database schema + seed data
│   ├── middleware/
│   │   ├── auth.js            # Session check middleware
│   │   ├── role.js            # Role permission middleware
│   │   ├── department.js      # Department isolation middleware
│   │   └── upload.js          # File upload middleware (multer)
│   ├── routes/
│   │   ├── auth.js            # Login / logout / me
│   │   └── requests.js        # All request endpoints
│   ├── db.js                  # MySQL connection pool
│   └── server.js              # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   ├── CreateRequest.js
        │   ├── Requests.js
        │   ├── RequestDetail.js
        │   ├── ClassRequests.js
        │   └── AllDepartments.js
        ├── services/
        │   └── api.js         # Axios instance
        └── App.js             # React Router routes
```

---

## Ports

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
