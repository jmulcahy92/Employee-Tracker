-- View All Employees --
SELECT tbl1.id, tbl1.first_name, tbl1.last_name, tbl1.title, tbl1.department, tbl1.salary, concat(employee.first_name, " ", employee.last_name) as manager FROM
(SELECT employee.id as id, employee.first_name as first_name, employee.last_name as last_name, role.title as title, department.name AS department, role.salary as salary, employee.manager_id as manager_id
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id) as tbl1
LEFT JOIN employee ON employee.id = tbl1.manager_id;

-- View All Roles --
SELECT role.id, role.title, department.name AS department, role.salary
FROM department
JOIN role ON department.id = role.department_id;

-- View All Departments --
SELECT id, name
FROM department;

-- Add Department --
INSERT INTO department (name)
VALUES ("${data.department}");