'use strict';
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class RoomMembers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
         this.belongsTo(models.Rooms, {
        foreignKey: "roomId",  
        targetKey: "id",     
        as: "roomDetail"
      });

      this.belongsTo(models.Users, {
  foreignKey: "senderId",
  as: "userDetail"
});

    }
  }
  RoomMembers.init({
    roomId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RoomMembers',
  });
  return RoomMembers;
};