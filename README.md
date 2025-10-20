GClass Fullstack v5 - Full project

Quickstart:
1. docker-compose up --build

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

Notes:
- MySQL initializes using SQL files in ./db/sql (only on first run)
- Seed users: alice@school.edu (teacher), bob@student.edu (student) with password 'password123'
- Update backend/.env if you want different DB credentials

 - ALTER TABLE class_members ADD UNIQUE KEY uniq_class_user (class_id, user_id); (For assigning students to class)
