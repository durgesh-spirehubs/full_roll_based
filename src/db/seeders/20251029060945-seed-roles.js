"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("ROLES", [
      {
        departmentID: 1,
        roleName: "Manager",
        accessID: "Role-read,Role-write,Role-all,Department-read,Department-write,Lead-read,Lead-write,Staff-write,Inquiry-read,Inquiry-write,Inquiry-all",
        note: "System administrator with full access",
        status: "Active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        departmentID:1,
        roleName:"Team lead",
        accessID:"Role-read,Role-write,Role-all",
        note:"customer only read the the data",
        status:"Active",
        createdAt:new Date(),
        updatedAt:new Date()
      },
      {
        departmentID:2,
        roleName:"Intern",
        accessID:"Role-read",
        status:"Active",
        createdAt:new Date(),
        updatedAt:new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("ROLES", null, {});
  },
};
