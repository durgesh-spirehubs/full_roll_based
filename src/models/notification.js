'use strict';
import { Model } from "sequelize";
export default  (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notification.init({
    title: DataTypes.STRING,
    subtitle: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    path: DataTypes.TEXT,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Notifications',
    timestamps:true,
    paranoid:false
  });
  return Notification;
};