'use strict';
import { Model } from "sequelize";
export default  (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.Users,{
        foreignKey:"id",
        sourceKey:"userId",
        as:"userDetail"
      })
    }
  }
  Attendance.init({
    userId: DataTypes.INTEGER,
    clockIn: DataTypes.TIME,
    clockOut: DataTypes.TIME,
    date:DataTypes.DATEONLY,
    createdBy: DataTypes.STRING,
    updatedBy: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    timestamps:true,
    modelName: 'Attendances',
    paranoid:true
  });
  return Attendance;
};