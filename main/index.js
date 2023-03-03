// import dependencies
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

// create connection
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

// array of inquirer questions for home screen
const starterQuestion = [
    {
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department'],
        name: 'request',
    },
]

// view employees
function getEmployees() {
    // query to create a doubly-joined table with all the relevant information
    const sql = `SELECT tbl1.id, tbl1.first_name, tbl1.last_name, tbl1.title, tbl1.department, tbl1.salary, concat(employee.first_name, " ", employee.last_name) as manager FROM
    (SELECT employee.id as id, employee.first_name as first_name, employee.last_name as last_name, role.title as title, department.name AS department, role.salary as salary, employee.manager_id as manager_id
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id) as tbl1
    LEFT JOIN employee ON employee.id = tbl1.manager_id;`;
    
    // actual query call
    db.query(sql, (err, rows) => {
        // throw error if there is one
        if (err) {
            throw(err);
        }

        // display table and return to start menu
        console.table(rows);
        init();
    })
}

// view roles
function getRoles() {
    // query to create a joined table with relevant information
    const sql = `SELECT role.id, role.title, department.name AS department, role.salary
    FROM department
    JOIN role ON department.id = role.department_id;`;
    
    // actual query call
    db.query(sql, (err, rows) => {
        // throw error if there is one
        if (err) {
            throw(err);
        }

        // display table and return to start menu
        console.table(rows);
        init();
    })
}

// view departments
function getDepartments() {
    // query to create a table with data from department (could do SELECT *)
    const sql = `SELECT id, name
    FROM department;`;
    
    // actual query call
    db.query(sql, (err, rows) => {
        // throw error if there is one
        if (err) {
            throw(err);
        }

        // display table and return to start menu
        console.table(rows);
        init();
    })
}

// add new employee; currently bugged, needs to be made asynchronous to function properly
function addEmployee() {
    const addEmployeeQuestions = [
        {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'firstName'
        },
        {
            type: 'input',
            message: "What is the employee's last name?",
            name: 'lastName'
        },
        {
            type: 'list',
            message: "What is the employee's role?",
            choices: [],
            name: 'title'
        },
        {
            type: 'list',
            message: "Who is the employee's manager?",
            choices: [],
            name: 'manager'
        }
    ]

    db.query("SELECT id, title FROM role;", function (err, result) {
        if (err) {
            throw err;
        }
        addEmployeeQuestions[2].choices = result;
    });
    
    db.query('SELECT id, concat(employee.first_name, " ", employee.last_name) AS manager FROM employee;', function (err, result) {
        if (err) {
            throw err;
        }
        addEmployeeQuestions[3].choices= result;
    });

    // currently, function is running inquirer before questions get updated by above db queries
    inquirer
    .prompt(addEmployeeQuestions)
    .then(function(data) {
        var roleId;

        // save relevant roleId based on user's chosen role title
        for (i = 0; i < addEmployeeQuestions[2].choices.length; i++) {
            if (addEmployeeQuestions[2].choices[i].title === data.title) {
                roleId = addEmployeeQuestions[2].choices[i].id;
            }
        }

        var managerId;

        // save relevant managerId based on user's chosen manager name
        for (i = 0; i < addEmployeeQuestions[3].choices.length; i++) {
            if (addEmployeeQuestions[3].choices[i].manager === data.manager) {
                managerId = addEmployeeQuestions[3].choices[i].id;
            }
        }

        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES ("${data.firstName}", ${data.lastName}, ${roleId}, ${managerId});`

        db.query(sql, (err, result) => {
            if (err) {
                throw(err);
            }
            init();
        });
    })
}

// add new role
function addRole() {
    // inquirer questions
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
            choices: [], // dynamic list of all departments
            name: 'department'
        }
    ]

    // get departments so we can dynamically update 'choices' on the above questions array
    db.query("SELECT * FROM department", function (err, result) {
        if (err) {
            throw err;
        }
        addRoleQuestions[2].choices = result;
    });

    // inquirer!
    inquirer
    .prompt(addRoleQuestions)
    .then(function(data) {
        // initialize deptId
        var deptId;

        // save relevant deptId based on user's chosen department name
        for (i = 0; i < addRoleQuestions[2].choices.length; i++) {
            if (addRoleQuestions[2].choices[i].name === data.department) {
                deptId = addRoleQuestions[2].choices[i].id;
            }
        }

        // query to add new role based on user input; better practice would be to use `?` and pass arguments in db.query below
        const sql = `INSERT INTO role (title, salary, department_id)
        VALUES ("${data.title}", ${data.salary}, ${deptId});`

        db.query(sql, (err, result) => {
            if (err) {
                throw(err);
            }
            init();
        });
    })
}

// add new department
function addDepartment() {
    // array with single inquirer question
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

// update existing employee; same issue as addEmployee: skips ahead to inquirer before the db queries can update the questions array
function updateEmployeeRole() {
    const updateEmployeeQuestions = [
        {
            type: 'list',
            message: "Which employee's role do you want to update?",
            choices: [], //dynamic list of all employees
            name: 'employee'
        },
        {
            type: 'list',
            message: 'Which role do you want to assign the selected employee?',
            choices: [], //dynamic list of all roles
            name: 'title'
        }
    ]

    db.query('SELECT id, concat(employee.first_name, " ", employee.last_name) AS worker FROM employee;', function (err, result) {
        if (err) {
            throw err;
        }
        updateEmployeeQuestions[0].choices= result;
    });

    db.query("SELECT id, title FROM role;", function (err, result) {
        if (err) {
            throw err;
        }
        updateEmployeeQuestions[1].choices = result;
    });
    
    inquirer
    .prompt(updateEmployeeQuestions)
    .then(function(data) {
        var employeeId;

        for (i = 0; i < updateEmployeeQuestions[0].choices.length; i++) {
            if (updateEmployeeQuestions[0].choices[i].worker === data.employee) {
                employeeId = updateEmployeeQuestions[0].choices[i].id;
            }
        }

        var roleId;

        for (i = 0; i < updateEmployeeQuestions[1].choices.length; i++) {
            if (updateEmployeeQuestions[1].choices[i].title === data.title) {
                roleId = updateEmployeeQuestions[1].choices[i].id;
            }
        }

        const sql = `UPDATE employee
        SET role_id = ${roleId}
        WHERE id = ${employeeId};`

        db.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            init();
        });
    })
}

// init function; starts base level inquirer and calls one of the above functions based on user choice
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

// run init!
init();