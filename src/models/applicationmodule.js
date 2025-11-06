'use strict';
import { Model } from "sequelize";

export  default (sequelize, DataTypes) => {
  class ApplicationModule extends Model {
    static associate(models) {
      // associations can be defined here if needed later
      this.hasMany(models.Roles,{
        foreignKey:"accessId",
        as:"access"
      })
    }
  }
  ApplicationModule.init(
    {
      moduleName: DataTypes.STRING,
      read: DataTypes.STRING,
      write: DataTypes.STRING,
      all: DataTypes.STRING,
      global: DataTypes.STRING,
      comment: DataTypes.STRING,
      statuses: DataTypes.STRING,
      assign: DataTypes.STRING,
      note: DataTypes.STRING,
      createdBy: DataTypes.STRING,
      updatedBy: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        defaultValue: 'Active',
      },
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'ApplicationModules',
      paranoid: true,
    }
  );
  return ApplicationModule;
};
