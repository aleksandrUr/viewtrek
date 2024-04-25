'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      this.hasMany(models.Video, { foreignKey: 'id_usuario' , as: "video"});
      Usuario.belongsToMany(models.Video, { through: {model:'Historials',  unique: false},foreignKey: "UsuarioId",as:"vistos" });
      Usuario.belongsToMany(models.Video, { through: {model:'Likes',  unique: false},foreignKey: "UsuarioId",as:"likeados" });
      Usuario.belongsToMany(models.Video, { through: {model:'Comentarios',  unique: false},foreignKey: "UsuarioId",as:"comentarios" });
      Usuario.hasMany(models.Comentarios, {foreignKey: "UsuarioId", as: "subcomentarios"} );
    
    }
  }
  Usuario.init({
    nombre: DataTypes.STRING,
    contrasena: DataTypes.STRING,
    email: DataTypes.STRING,
    foto: DataTypes.STRING,
    banner: DataTypes.STRING
    
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};