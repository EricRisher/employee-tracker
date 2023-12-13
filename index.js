const inquirer = require("inquirer");
const db = require("./db/connection");


const addEmployee = () => {
    inquirer.prompt([
        {
        type: "input",
        name: "first_name",
        message: "Enter employee's first name:",
        },
        {
        type: "input",
        name: "last_name",
        message: "Enter employee's last name:",
        },
        {
        type: "input",
        name: "role_id",
        message: "Enter employee's role ID:",
        },
        {
        type: "input",
        name: "manager_id",
        message: "Enter employee's manager ID:",
        },
    ]).then((answers) => {
        db.query("INSERT INTO employee SET ?", answers, (err, res) => {
        if (err) throw err;
        console.log("Employee added!");
        start();
        });
    });
};

const start = () => {
  inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
        "Quit",
      ],
    },
  ]).then((answer) => {
    switch (answer.action) {
      case "Add Employee":
        addEmployee();
        break;
      case "Update Employee Role":
        updateEmployeeRole();
        break;
      case "View All Roles":
        viewAllRoles();
        break;
      case "Add Role":
        addRole();
        break;
      case "View All Departments":
        viewAllDepartments();
        break;
      case "Add Department":
        addDepartment();
        break;
      default:
        process.exit();
    }
  });

};

start();