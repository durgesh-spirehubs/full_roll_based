'use strict';
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.Users,{
        foreignKey:"id",
        sourceKey:"authorId",
        as:"authorDetail"
      })
    }
  }
  Message.init({
    authorId: DataTypes.STRING,
    roomId: DataTypes.STRING,
    text: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};