'use strict';
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class lead extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.Users, {
        foreignKey: "id",
        sourceKey: "userId",
        as: "userDetail",
      });
      this.hasMany(models.Assignusers, {
        foreignKey: "leadId",
        as: "assignUserList",
      });
    }
  }
  lead.init({
    userId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    companyname: DataTypes.STRING,
    entrydate: DataTypes.DATE,
    description: DataTypes.TEXT,
    type:DataTypes.STRING,
    createdBy: DataTypes.STRING,
    updateBy: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Leads',
  });
  return lead;
};