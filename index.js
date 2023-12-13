const inquirer = require("inquirer");
const db = require("./db/connection");

const viewAllEmployees = async () => {
  try {
    const employees = await db.query("SELECT * FROM employee", {
      type: db.QueryTypes.SELECT,
    });

    const formattedEmployees = employees.map((employee) => {
      return {
        ID: employee.id,
        First_Name: employee.first_name,
        Last_Name: employee.last_name,
        Role_ID: employee.role_id,
        Manager_ID: employee.manager_id,
      };
    });

    console.table(formattedEmployees);
    start();
  } catch (error) {
    console.log(error);
    start();
  }
};

const addEmployee = () => {
  inquirer
    .prompt([
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
    ])
    .then(async (answers) => {
      try {
        await db.query(
          "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
          {
            replacements: [
              answers.first_name,
              answers.last_name,
              answers.role_id,
              answers.manager_id,
            ],
            type: db.QueryTypes.INSERT, 
          }
        );
        console.log("Employee added!");
        start();
      } catch (error) {
        console.log(error);
        start();
      }
    });
};

const updateEmployeeRole = async () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "employee_id",
        message: "Enter employee's ID:",
      },
      {
        type: "input",
        name: "role_id",
        message: "Enter employee's new role ID:",
      },
    ])
    .then(async (answers) => {
      try {
        const [employee] = await db.query(
          "SELECT last_name FROM employee WHERE id = ?",
          {
            replacements: [answers.employee_id],
            type: db.QueryTypes.SELECT,
          }
        );

        if (!employee) {
          console.log("Employee not found");
          return start();
        }

        await db.query("UPDATE employee SET role_id = ? WHERE id = ?", {
          replacements: [answers.role_id, answers.employee_id],
          type: db.QueryTypes.UPDATE,
        });

        console.log(`${employee.last_name}'s role updated!`);
        start();
      } catch (error) {
        console.log(error);
        start();
      }
    });
};

const viewAllRoles = async () => {
  try {
    const roles = await db.query("SELECT * FROM role");
    console.table(roles);
    start();
  } catch (error) {
    console.log(error);
    start();
  }
};

const addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "title",
        message: "Enter role title:",
      },
      {
        type: "input",
        name: "salary",
        message: "Enter role salary:",
      },
      {
        type: "input",
        name: "department_id",
        message: "Enter role department ID:",
      },
    ])
    .then(async (answers) => {
      try {
        await db.query(
          "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
          {
            replacements: [answers.title, answers.salary, answers.department_id],
            type: db.QueryTypes.INSERT,
          }
        );
        console.log("Role added!");
        start();
      } catch (error) {
        console.log(error);
        start();
      }
    });
};

const viewAllDepartments = async () => {
  try {
    const departments = await db.query("SELECT * FROM department");
    console.table(departments);
    start();
  } catch (error) {
    console.log(error);
    start();
  }
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Enter department name:",
      },
    ])
    .then(async (answers) => {
      try {
        await db.query("INSERT INTO department (name) VALUES (?)", {
          replacements: [answers.name],
          type: db.QueryTypes.INSERT,
        });
        console.log("Department added!");
        start();
      } catch (error) {
        console.log(error);
        start();
      }
    });
};

const start = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          "Quit",
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case "View All Employees":
          viewAllEmployees();
          break;
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
