USE gclass;
DROP PROCEDURE IF EXISTS sp_create_class;
DELIMITER $$
CREATE PROCEDURE sp_create_class(IN p_title VARCHAR(255), IN p_desc TEXT, IN p_code VARCHAR(10), IN p_teacher INT, OUT p_class_id INT)
BEGIN
  INSERT INTO classes (title, description, code, teacher_id) VALUES (p_title, p_desc, p_code, p_teacher);
  SET p_class_id = LAST_INSERT_ID();
  INSERT INTO class_members (class_id, user_id, role) VALUES (p_class_id, p_teacher, 'teacher');
END$$
DELIMITER ;
DROP PROCEDURE IF EXISTS sp_join_class_by_code;
DELIMITER $$
CREATE PROCEDURE sp_join_class_by_code(IN p_code VARCHAR(10), IN p_user INT, OUT p_class_id INT)
BEGIN
  SELECT id INTO p_class_id FROM classes WHERE code = p_code LIMIT 1;
  IF p_class_id IS NULL THEN
    SET p_class_id = 0;
  ELSE
    INSERT IGNORE INTO class_members (class_id, user_id, role) VALUES (p_class_id, p_user, 'student');
  END IF;
END$$
DELIMITER ;
