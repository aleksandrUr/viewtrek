'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comentarios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Subcomentarios, { foreignKey: 'ComId' , as: "subcomentados"});
    }
  }
  Comentarios.init({
    VideoId: DataTypes.INTEGER,
    UsuarioId: DataTypes.INTEGER,
    comentario: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Comentarios',
  });
  return Comentarios;
};