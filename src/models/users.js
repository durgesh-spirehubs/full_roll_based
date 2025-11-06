"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.belongsTo(models.Roles, {
        foreignKey: "role_id",
        as: "role",
      });
    }
  }
  Users.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_type: {
        type: DataTypes.STRING,
        defaultValue: "Employee",
      },
      role_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "ROLES",
          key: "id",
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Active",
      },
    },
    {
      sequelize,
      modelName: "Users",
      timestamps: true,
    }
  );
  return Users;
};
