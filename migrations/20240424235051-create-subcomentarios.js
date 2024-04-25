'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Subcomentarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ComId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Comentarios",
          key: "id"
        }
      },
      UsuarioId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Usuarios",
          key: "id"
        }
      },
      comentario:{

        type: Sequelize.STRING,

      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Subcomentarios');
  }
};