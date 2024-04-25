'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Historials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      VideoId: {

        type: Sequelize.INTEGER,
        references:{

          model: "Videos",
          key: "id"

        }
      },

      UsuarioId: {

        type: Sequelize.INTEGER,
        references:{

          model: "Usuarios",
          key: "id"

        }


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
    await queryInterface.dropTable('Historials');
  }
};