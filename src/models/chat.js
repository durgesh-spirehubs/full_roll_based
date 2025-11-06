'use strict';
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Chat.init({
    to: DataTypes.STRING,
    from: DataTypes.STRING,
    chat: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Chat',
    timestamps:true
  });
  return Chat;
};