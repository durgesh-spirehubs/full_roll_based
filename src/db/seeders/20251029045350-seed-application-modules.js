'use strict';
const modules = require("../config/modules");


module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('ApplicationModules', modules, {});
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ApplicationModules', null, {});
  }
};
