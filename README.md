# Smart Approval Workflow Management System

A full-stack web application for managing student and staff requests through a role-based multi-level approval workflow, built for Samrat Ashok Technological Institute (SATI), Vidisha M.P.

**Stack:** React.js · Node.js / Express.js · MySQL

---

## Project Structure

```
college-workflow-system/
├── backend/
│   ├── config/
│   │   └── workflow.js        # approval chain definitions per role
│   ├── db/
│   │   └── schema.sql         # database schema + seed data
│   ├── middleware/
│   │   ├── auth.js            # session check
│   │   ├── role.js            # role-based access control
│   │   └── upload.js          # file upload (multer)
│   ├── routes/
│   │   ├── auth.js            # login / logout / register / me
│   │   └── requests.js        # all request endpoints
│   ├── db.js                  # MySQL connection pool
│   ├── server.js              # Express entry point
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── CreateRequest.js
        │   ├── Requests.js
        │   ├── RequestDetail.js
        │   ├── ClassRequests.js
        │   └── AllDepartments.js
        ├── services/
        │   └── api.js         # Axios instance (baseURL: localhost:5000/api)
        ├── App.js             # React Router routes
        └── App.css            # global styles
```

---

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0

### 1. Database

Run the schema file against a fresh MySQL instance:

```bash
mysql -u root -p college_workflow < backend/db/schema.sql
```

Or open `backend/db/schema.sql` in MySQL Workbench and execute it.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your database credentials:

```
PORT=5000
SESSION_SECRET=your-secret-key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=college_workflow
NODE_ENV=development
```

Then start the server:

```bash
npm start        # production
npm run dev      # development with nodemon
```

Runs on `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`

---

## Authentication

- Session-based authentication using `express-session`
- Passwords hashed with `bcrypt`
- Session expires after 30 minutes of inactivity

### Student Self-Registration

New students can create their own account from the login page via **Create an account**. They choose a username, full name, department, and password. All self-registered accounts are assigned the `STUDENT` role.

Coordinator, HOD, and Director accounts must be added directly to the database.

---

## Roles & Permissions

| Role | Can Submit | Can Approve | Visible Requests |
|---|---|---|---|
| STUDENT | Yes | No | Own requests only |
| COORDINATOR | Yes | Yes — step 1 for student requests | Pending approvals + own submitted (tabbed view) |
| HOD | Yes | Yes — step 2 for student requests, step 1 for coordinator requests | Pending approvals + own submitted (tabbed view) |
| DIRECTOR | Yes | Yes — final step for all complex requests | All departments, all pending requests |

---

## Approval Workflows

### Student requests

| Request Type | Approval Chain |
|---|---|
| Leave, Lab Access, Assignment Extension, Library Extension | Coordinator |
| Fee Concession, Certificate, Scholarship, Course Change, Exam Re-evaluation | Coordinator → HOD |
| Project, Equipment, Research, Industrial Visit, Other | Coordinator → HOD → Director |

### Coordinator requests

| Request Type | Approval Chain |
|---|---|
| Leave, Lab Access | HOD |
| Equipment, Course Change, Certificate, Research, Industrial Visit, Project, Other | HOD → Director |

### HOD requests

| Request Type | Approval Chain |
|---|---|
| All types | Director |

---

## Features

- Role-aware dashboards — each role sees a different layout and action set
- Tabbed view for approvers — switch between **Pending Approvals** and **My Requests**
- Quick Approve / Quick Reject buttons directly from the approvals table
- Approve / Reject modal with optional comment
- Full approval history timeline on every request detail page
- Department Requests view for Coordinator and HOD
- All Departments view with department filter tabs for Director
- File attachment support on requests
- Self-approval and self-rejection prevention
- Department isolation — coordinators and HODs can only act on their own department
- `ESCALATED` status displays as `PENDING` in the UI

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new student account |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current session user |

### Requests

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/requests | All roles | Submit a new request |
| GET | /api/requests | All roles | Role-filtered request list |
| GET | /api/requests/department | Coordinator, HOD | All requests in own department |
| GET | /api/requests/all-departments | Director | All requests across all departments |
| GET | /api/requests/:id | All roles | Single request with approval history |
| POST | /api/requests/:id/approve | Coordinator, HOD, Director | Approve a request |
| POST | /api/requests/:id/reject | Coordinator, HOD, Director | Reject a request |

---

## Default Accounts

All passwords are `123`.

### Students

| Username | Name | Department |
|---|---|---|
| 0108CS231001 | Shivam Patel | CSE |
| 0108EC231001 | Vedant Soni | ECE |
| 0108ME231001 | Shailender Rajoliya | MECH |
| 0108CE231001 | Prajjwal Mandloi | CIVIL |
| 0108EE231001 | Pranav Mahajan | EE |
| 0108IT231001 | Toshima Rahangdale | IT |

### Coordinators

| Username | Name | Department |
|---|---|---|
| coordinator_cse | Dr. Divya Rishi Sahu | CSE |
| coordinator_ece | Asst. Prof. Satish Pawar | ECE |
| coordinator_mech | Asst. Prof. Ruchi Thakur | MECH |
| coordinator_civil | Asst. Prof. Garima Jain | CIVIL |
| coordinator_eee | Asst. Prof. Nupur Modh | EE |
| coordinator_it | Asst. Prof. Mukesh Azad | IT |

### HODs

| Username | Name | Department |
|---|---|---|
| hod_cse | Dr. Kanak Saxena | CSE |
| hod_ece | Dr. Ashutosh Datar | ECE |
| hod_mech | Dr. Pankaj Agarwal | MECH |
| hod_civil | Dr. Rajeev Jain | CIVIL |
| hod_eee | Prof. C. S. Sharma | EE |
| hod_it | Dr. Shailendra Kumar Shrivastava | IT |

### Director

| Username | Name |
|---|---|
| director | Dr. Y. K. Jain |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8, mysql2 |
| Auth | express-session, bcrypt |
| File Upload | multer |
| Dev tooling | nodemon |
