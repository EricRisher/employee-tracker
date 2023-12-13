const inquirer = require("inquirer");
const db = require("./db/connection");

const viewAllEmployees = async () => {
  try {
    const query = `
      SELECT e.id, e.first_name, e.last_name, e.role_id, e.manager_id,
             r.title AS role_title, r.salary AS role_salary,
             m.first_name AS manager_first_name, m.last_name AS manager_last_name,
             d.name AS department_title
      FROM employee e
      LEFT JOIN employee m ON e.manager_id = m.id
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON r.department_id = d.id
    `;

    const employees = await db.query(query, {
      type: db.QueryTypes.SELECT,
    });

    const formattedEmployees = employees.map((employee) => {
      return {
        ID: employee.id,
        First_Name: employee.first_name,
        Last_Name: employee.last_name,
        Title: employee.role_title,
        Department: employee.department_title,
        Salary: employee.role_salary,
        Manager: `${employee.manager_first_name} ${employee.manager_last_name}`,
      };
    });

    console.table(formattedEmployees);
    start();
  } catch (error) {
    console.log(error);
    start();
  }
};

const addEmployee = async () => {
  try {
    const roles = await db.query("SELECT * FROM role");

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
          type: "list",
          name: "role_id",
          message: "What is the employee's role?",
          choices: roles[0].map((role) => {
            return {
              name: role.title,
              value: role.id,
            };
          }),
        },
        {
          type: "list",
          name: "manager_id",
          message: "Who is the employee's manager?",
          choices: async () => {
            const employees = await db.query("SELECT * FROM employee");

            return employees[0].map((employee) => {
              return {
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
              };
            });
          },
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
  } catch (error) {
    console.log(error);
    start();
  }
};


const updateEmployeeRole = async () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employee_id",
        message: "Which employee's role would you like to update?",
        choices: async () => {
          const employees = await db.query("SELECT * FROM employee");

          return employees[0].map((employee) => {
            return {
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            };
          });
        },

      },
      {
        type: "list",
        name: "role_id",
        message: "Which role do you want to assign to the selected employee?",
        choices: async () => {
          const roles = await db.query("SELECT * FROM role");

          return roles[0].map((role) => {
            return {
              name: role.title,
              value: role.id,
            };
          });
        },
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
    const query = `
      SELECT r.id AS ID, r.title AS Title, r.salary AS Salary, d.name AS Department
      FROM role r
      LEFT JOIN department d ON r.department_id = d.id
    `;

    const [roles] = await db.query(query);

    const formattedRoles = roles.map((role) => {
      return {
        ID: role.ID,
        Title: role.Title,
        Salary: role.Salary,
        Department: role.Department,
      };
    });

    console.table(formattedRoles);
    start();
  } catch (error) {
    console.log(error);
    start();
  }
};


const addRole = async () => {
  try {
    const departments = await db.query("SELECT * FROM department");

    const answers = await inquirer.prompt([
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
        type: "list",
        name: "department_id",
        message: "Which department does this role belong to? (Enter department ID):",
        choices: departments[0].map((department) => {
          return {
            name: department.name,
            value: department.id,
          };
        }),
      },
    ]);

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
};

const viewAllDepartments = async () => {
  try {
    const [departments, metadata] = await db.query("SELECT * FROM department");

    // Remove duplicates based on the 'id' field
    const uniqueDepartments = Array.from(
      new Set(departments.map((d) => d.id))
    ).map((id) => {
      return departments.find((d) => d.id === id);
    });

    console.table(uniqueDepartments);
    start();
  } catch (error) {
    console.log(error);
    start();
  }
};

const addDepartment = async () => {
  try {
    const [existingDepartments, metadata] = await db.query(
      "SELECT * FROM department"
    );

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
          // Check if the department with the same name already exists
          const departmentExists = existingDepartments.some(
            (dep) => dep.name === answers.name
          );

          if (departmentExists) {
            console.log("Department with the same name already exists");
            return start();
          }

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
  } catch (error) {
    console.log(error);
    start();
  }
};

const start = () => {
  console.log("Welcome to the Employee Tracker!");
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
