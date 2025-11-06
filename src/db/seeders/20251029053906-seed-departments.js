"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Departments", [
      {
        departmentName: "Human Resources",
        notes: "Handles HR-related tasks and employee management",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        departmentName: "Finance",
        notes: "Manages company budgets and financial transactions",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        departmentName: "IT",
        notes: "Responsible for technology and infrastructure",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        departmentName: "Sales",
        notes: "Handles sales and client relations",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Departments", null, {});
  },
};
