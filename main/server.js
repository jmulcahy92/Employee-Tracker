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

const addDeptQuestion = [
    {
        type: 'input',
        message: 'What is the name of the department?',
        name: 'department',
    },
]

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
        choices: [''], // dynamic list of all departments
        name: 'department'
    }
]

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

// function viewEmployees() {
//     const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,  FROM department LEFT JOIN role ON department.id = role.department_id`;
    
//     db.query(sql, (err, rows) => {
//         if (err) {
//             res.status(500).json({ error: err.message });
//             return;
//         }

//         console.table(rows);
//         init()
//     })
// }

function viewRoles() {
    const sql = `SELECT role.id, role.title, department.name AS department, role.salary FROM department LEFT JOIN role ON department.id = role.department_id`;
    
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        console.table(rows);
        init();
    })
}

function viewDepartments() {
    const sql = `SELECT id, name FROM department`;
    
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        console.table(rows);
        init();
    })
}

function init() {
    inquirer
        .prompt(starterQuestion)
        .then(function(data) {
            if (data.request === "View All Employees") {
                viewEmployees();
            } else if (data.request === "View All Roles") {
                viewRoles();
            } else if (data.request === "View All Departments") {
                viewDepartments();
            } else if (data.request === "Add Employee") {
                
            } else if (data.request === "Add Role") {
                
            } else if (data.request === "Add Department") {
                
            } else if (data.request === "Update Employee Role") {
                
            }
        })
}

init();