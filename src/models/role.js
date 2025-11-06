"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Roles extends Model {
    static associate(models) {
      Roles.belongsTo(models.Departments, {
        foreignKey: "departmentID",
        as: "department",
      });
       Roles.belongsTo(models.ApplicationModules,{
        foreignKey:"accessId",
        as:"access"
       })
      Roles.hasMany(models.Users, {
        foreignKey: "role_id",
        as: "user",
      });
    }
  }
  Roles.init(
    {
      departmentID: DataTypes.INTEGER,
      deskID: DataTypes.INTEGER,
      roleName: DataTypes.STRING,
      accessID: DataTypes.STRING,
      reportingRoleID: DataTypes.INTEGER,
      note: DataTypes.TEXT,
      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Roles",
      timestamps: true,
      paranoid: true, 
    }
  );

  return Roles;
};
