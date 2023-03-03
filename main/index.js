const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
  );

const starterQuestion = [
    {
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department'],
        name: 'request',
    },
]

function getEmployees() {
    const sql = `SELECT tbl1.id, tbl1.first_name, tbl1.last_name, tbl1.title, tbl1.department, tbl1.salary, concat(employee.first_name, " ", employee.last_name) as manager FROM
    (SELECT employee.id as id, employee.first_name as first_name, employee.last_name as last_name, role.title as title, department.name AS department, role.salary as salary, employee.manager_id as manager_id
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id) as tbl1
    LEFT JOIN employee ON employee.id = tbl1.manager_id;`;
    
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        console.table(rows);
        init();
    })
}

function getRoles() {
    const sql = `SELECT role.id, role.title, department.name AS department, role.salary
    FROM department
    JOIN role ON department.id = role.department_id;`;
    
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        console.table(rows);
        init();
    })
}

function getDepartments() {
    const sql = `SELECT id, name
    FROM department;`;
    
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        console.table(rows);
        init();
    })
}

function addEmployee() {
    const addEmployeeQuestions = [
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'first_name'
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: 'last_name'
        },
        {
            type: 'list',
            message: "What is the employee's role?",
            choices: [''], // dynamic list of all roles
            name: 'title'
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            choices: [''], // dynamic list of all employees; includes a 'None' option
            name: 'manager'
        }
    ]


}

function addRole() {
    const departments = db.query(`SELECT id, name FROM department;`)
    console.log(departments);

    const addRoleQuestions = [
        {
            type: 'input',
            message: 'What is the name of the role?',
            name: 'title'
        },
        {
            type: 'input',
            message: 'What is the salary of the role?',
            name: 'salary'
        },
        {
            type: 'list',
            message: 'Which department does the role belong to?',
            choices: departments, // dynamic list of all departments
            name: 'department'
        }
    ]

    // inquirer
    // .prompt(addRoleQuestions)
    // .then(function(data) {
    //     const sql = `INSERT INTO role (title, salary, department_id) VALUES ("${data.title}", ${data.salary})`

    //     db.query(sql, (err, result) => {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }
    //         init();
    //     });
    // })
}

function addDepartment() {
    const addDepartmentQuestion = [
        {
            type: 'input',
            message: 'What is the name of the department?',
            name: 'department',
        },
    ]

    inquirer
        .prompt(addDepartmentQuestion)
        .then(function(data) {
            const sql = `INSERT INTO department (name) VALUES ("${data.department}");`

            db.query(sql, (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                init();
            });
        })
}

function updateEmployeeRole() {
    const updateEmployeeQuestions = [
        {
            type: 'list',
            message: "Which employee's role do you want to update?",
            choices: [''], //dynamic list of all employees
            name: 'employee'
        },
        {
            type: 'list',
            message: 'Which role do you want to assign the selected employee?',
            choices: [''], //dynamic list of all roles
            name: 'title'
        }
    ]


}

function init() {
    inquirer
        .prompt(starterQuestion)
        .then(function(data) {
            if (data.request === "View All Employees") {
                getEmployees();
            } else if (data.request === "View All Roles") {
                getRoles();
            } else if (data.request === "View All Departments") {
                getDepartments();
            } else if (data.request === "Add Employee") {
                addEmployee();
            } else if (data.request === "Add Role") {
                addRole();
            } else if (data.request === "Add Department") {
                addDepartment();
            } else if (data.request === "Update Employee Role") {
                updateEmployeeRole();
            }
        })
}

init();