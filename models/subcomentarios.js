'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subcomentarios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Comentarios, { foreignKey: 'id' , as: "subcomentado"});
    }
  }
  Subcomentarios.init({
    ComId: DataTypes.INTEGER,
    UsuarioId: DataTypes.INTEGER,
    comentario: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Subcomentarios',
  });
  return Subcomentarios;
};