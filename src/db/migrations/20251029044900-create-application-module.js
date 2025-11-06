'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ApplicationModules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      moduleName: {
        type: Sequelize.STRING,
      },
      read: {
        type: Sequelize.STRING,
      },
      write: {
        type: Sequelize.STRING,
      },
      all: {
        type: Sequelize.STRING,
      },
      global: {
        type: Sequelize.STRING,
      },
      comment: {
        type: Sequelize.STRING,
      },
      statuses: {
        type: Sequelize.STRING,
      },
      assign: {
        type: Sequelize.STRING,
      },
      note: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      createdBy: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      updatedBy: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        defaultValue: 'Active',
        type: Sequelize.STRING,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ApplicationModules');
  },
};
