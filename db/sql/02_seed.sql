USE gclass;
-- password hash for 'password123' generated with bcrypt (10 rounds)
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES
(1, 'Swathi J.N', 'swathi@school.edu', '$2b$10$u1fV7uEwOQn6wP1kqJ9xOeKf7yZ8Yq1Q6dH2K2yZ0pQ1FhZ9QeK2a', 'teacher'),
(2, 'Aditi Perim', 'aditi@student.edu', '$2b$10$u1fV7uEwOQn6wP1kqJ9xOeKf7yZ8Yq1Q6dH2K2yZ0pQ1FhZ9QeK2a', 'student');

INSERT IGNORE INTO classes (id, title, description, code, teacher_id) VALUES
(1, 'Physics 101', 'Introductory physics', 'PHY101', 1);

INSERT IGNORE INTO class_members (class_id, user_id, role) VALUES
(1,1,'teacher'),
(1,2,'student');

INSERT IGNORE INTO assignments (id, class_id, title, description, due_date, total_points) VALUES
(1, 1, 'Homework 1', 'Chapter 1 problems', '2025-12-01 23:59:00', 100);
