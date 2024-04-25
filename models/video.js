'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Usuario, { foreignKey: 'id' , as: "usuario"});
      Video.belongsToMany(models.Categoria, { through: 'Video_Categoria',foreignKey: "VideoId",as:"categoria" });
      Video.belongsToMany(models.Usuario, { through:{model:'Historials',  unique: false},foreignKey: "VideoId",as:"view" });
      Video.belongsToMany(models.Usuario, { through:{model:'Likes',  unique: false},foreignKey: "VideoId",as:"likeos" });
      Video.belongsToMany(models.Usuario, { through:{model:'Comentarios',  unique: false},foreignKey: "VideoId",as:"comentados" });


    }
  }
  Video.init({
    titulo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    fecha: DataTypes.DATE,
    videoUrl: DataTypes.STRING,
    id_usuario: DataTypes.INTEGER,
    portada: DataTypes.STRING,
    vistas: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Video',
  });
  return Video;
};