USE gclass;
CREATE OR REPLACE VIEW vw_classes AS
SELECT c.*, u.name as teacher_name, u.email as teacher_email,
  (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id) as member_count
FROM classes c
JOIN users u ON u.id = c.teacher_id;
CREATE OR REPLACE VIEW vw_assignments AS
SELECT a.*, c.title as class_title, c.code as class_code
FROM assignments a
JOIN classes c ON c.id = a.class_id;
CREATE OR REPLACE VIEW vw_submissions AS
SELECT s.*, u.name as student_name, u.email as student_email, c.teacher_id
FROM submissions s
JOIN users u ON u.id = s.student_id
JOIN assignments a ON a.id = s.assignment_id
JOIN classes c ON c.id = a.class_id;
