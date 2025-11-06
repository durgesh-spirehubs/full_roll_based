'use strict';
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class assignUser extends Model {
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
      this.hasOne(models.Leads,{
         foreignKey:"id",
         sourceKey:"leadId",
         as:"leadDetail"
      })
    }
  }
  assignUser.init({
    leadId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    assignStatus: DataTypes.STRING,
    note: DataTypes.STRING,
    createdBy: DataTypes.STRING,
    updatedBy: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Assignusers',
  });
  return assignUser;
};