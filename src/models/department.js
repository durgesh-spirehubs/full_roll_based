"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class DEPARTMENTS extends Model {
    static associate(models) {
      DEPARTMENTS.hasMany(models.Roles, {
        foreignKey: "departmentID",
        as: "roles",
      });
    }
  }
  DEPARTMENTS.init(
    {
      departmentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Departments",
      timestamps: true,
      paranoid: true,
    }
  );

  return DEPARTMENTS;
};
