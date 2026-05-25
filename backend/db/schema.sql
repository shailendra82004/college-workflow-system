-- Database schema for the College Workflow Management System
-- Run this once against a fresh `college_workflow` database.

CREATE DATABASE IF NOT EXISTS college_workflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE college_workflow;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  name       VARCHAR(100),
  password   VARCHAR(255) NOT NULL,
  role       ENUM('STUDENT','COORDINATOR','HOD','DIRECTOR') NOT NULL,
  department ENUM('CSE','ECE','MECH','CIVIL','EEE','IT')    NOT NULL
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT         NOT NULL,
  type         ENUM('LEAVE','LAB_ACCESS','ASSIGNMENT_EXT','LIBRARY_EXT','FEE_CONCESSION','CERTIFICATE','SCHOLARSHIP','COURSE_CHANGE','EXAM_REEVAL','PROJECT','EQUIPMENT','RESEARCH','INDUSTRIAL_VISIT','OTHER') NOT NULL,
  status       ENUM('PENDING','ESCALATED','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  current_role ENUM('COORDINATOR','HOD','DIRECTOR')              NOT NULL DEFAULT 'COORDINATOR',
  department   ENUM('CSE','ECE','MECH','CIVIL','EEE','IT')       NOT NULL,
  document     VARCHAR(200),
  created_by   INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_user FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Approval history — immutable log of every action taken on a request
CREATE TABLE IF NOT EXISTS approval_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  actor_id   INT NOT NULL,
  actor_role ENUM('COORDINATOR','HOD','DIRECTOR') NOT NULL,
  action     ENUM('APPROVED','REJECTED','ESCALATED') NOT NULL,
  comment    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES requests(id),
  CONSTRAINT fk_history_actor   FOREIGN KEY (actor_id)   REFERENCES users(id)
);



-- All passwords are bcrypt hashes of "123"

-- Students — enrollment number as username
INSERT INTO users (username, name, password, role, department) VALUES
  ('0108CS231001', 'Shivam Patel',        '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'CSE'),
  ('0108EC231001', 'Vedant Soni',         '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'ECE'),
  ('0108ME231001', 'Shailender Rajoliya', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'MECH'),
  ('0108CE231001', 'Prajjwal Mandloi',    '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'CIVIL'),
  ('0108EE231001', 'Pranav Mahajan',      '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'EEE'),
  ('0108IT231001', 'Toshima Rahangdale',  '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'IT');

-- Coordinators
INSERT INTO users (username, name, password, role, department) VALUES
  ('coordinator_cse',   'Dr. Divya Rishi Sahu',     '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'CSE'),
  ('coordinator_ece',   'Asst. Prof. Satish Pawar', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'ECE'),
  ('coordinator_mech',  'Asst. Prof. Ruchi Thakur', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'MECH'),
  ('coordinator_civil', 'Asst. Prof. Garima Jain',  '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'CIVIL'),
  ('coordinator_eee',   'Asst. Prof. Nupur Modh',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'EEE'),
  ('coordinator_it',    'Asst. Prof. Mukesh Azad',  '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'IT');

-- HODs
INSERT INTO users (username, name, password, role, department) VALUES
  ('hod_cse',   'Dr. Kanak Saxena',                 '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'CSE'),
  ('hod_ece',   'Dr. Ashutosh Datar',                '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'ECE'),
  ('hod_mech',  'Dr. Pankaj Agarwal',                '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'MECH'),
  ('hod_civil', 'Dr. Rajeev Jain',                   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'CIVIL'),
  ('hod_eee',   'Prof. C. S. Sharma',                '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'EEE'),
  ('hod_it',    'Dr. Shailendra Kumar Shrivastava',  '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'IT');

-- Director (department field is required by schema; CSE is a placeholder)
INSERT INTO users (username, name, password, role, department) VALUES
  ('director', 'Dr. Y. K. Jain', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'DIRECTOR', 'CSE');
